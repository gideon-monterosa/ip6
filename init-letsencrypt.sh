#!/bin/bash

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker compose -f docker-compose.yml"
elif command -v docker-compose >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker-compose -f docker-compose.yml"
else
  echo 'Error: docker compose is not installed.' >&2
  exit 1
fi

domains=(meetings.isenegger.dev)
rsa_key_size=4096
email="xeno.isenegger@students.fhnw.ch"
staging=0

# Ensure volumes exist
docker volume create certbot_conf > /dev/null
docker volume create certbot_www > /dev/null

has_cert=$(docker run --rm -v certbot_conf:/etc/letsencrypt alpine sh -c "test -d /etc/letsencrypt/live/${domains[0]} && echo 1 || echo 0")

if [ "$has_cert" = "1" ]; then
  read -p "Existing data found for ${domains[0]}. Continue and replace existing certificate? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

echo "### Downloading recommended TLS parameters ..."
docker run --rm -v certbot_conf:/etc/letsencrypt alpine sh -c "apk add --no-cache curl && \
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > /etc/letsencrypt/options-ssl-nginx.conf && \
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > /etc/letsencrypt/ssl-dhparams.pem"
echo

echo "### Creating dummy certificate for ${domains[0]} ..."
$DOCKER_COMPOSE run --rm --entrypoint "sh -c \"mkdir -p /etc/letsencrypt/live/${domains[0]} && openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 -keyout '/etc/letsencrypt/live/${domains[0]}/privkey.pem' -out '/etc/letsencrypt/live/${domains[0]}/fullchain.pem' -subj '/CN=localhost'\"" certbot
echo

echo "### Starting nginx ..."
$DOCKER_COMPOSE up --force-recreate -d proxy
echo

echo "### Waiting for Nginx to initialize..."
sleep 10

if [ "$(docker inspect -f '{{.State.Status}}' ip6-proxy)" != "running" ]; then
  echo "Error: Nginx proxy failed to start or is crashing. Logs:"
  docker logs ip6-proxy
  exit 1
fi

echo "### Deleting dummy certificate for ${domains[0]} ..."
$DOCKER_COMPOSE run --rm --entrypoint "rm -Rf /etc/letsencrypt/live/${domains[0]} /etc/letsencrypt/archive/${domains[0]} /etc/letsencrypt/renewal/${domains[0]}.conf" certbot
echo

echo "### Requesting Let's Encrypt certificate for ${domains[0]} ..."
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email $email" ;;
esac

if [ $staging != "0" ]; then staging_arg="--staging"; fi

$DOCKER_COMPOSE run --rm --entrypoint "certbot certonly --webroot -w /var/www/certbot $staging_arg $email_arg $domain_args --rsa-key-size $rsa_key_size --agree-tos --force-renewal" certbot
echo

echo "### Reloading nginx ..."
$DOCKER_COMPOSE exec proxy nginx -s reload