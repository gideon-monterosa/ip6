# Build stage
FROM node:22-alpine AS build
WORKDIR /app

# Build arguments for secrets
ARG FIREBASE_API_KEY
ARG FIREBASE_AUTH_DOMAIN
ARG FIREBASE_PROJECT_ID
ARG FIREBASE_STORAGE_BUCKET
ARG FIREBASE_MESSAGING_SENDER_ID
ARG FIREBASE_APP_ID
ARG FIREBASE_MEASUREMENT_ID
ARG FIREBASE_VAPID_KEY

COPY package*.json ./
RUN npm install
COPY . .

# Inject secrets into environment.prod.ts using the new placeholders
RUN sed -i "s|__FIREBASE_API_KEY__|$FIREBASE_API_KEY|g" src/environments/environment.prod.ts && \
    sed -i "s|__FIREBASE_AUTH_DOMAIN__|$FIREBASE_AUTH_DOMAIN|g" src/environments/environment.prod.ts && \
    sed -i "s|__FIREBASE_PROJECT_ID__|$FIREBASE_PROJECT_ID|g" src/environments/environment.prod.ts && \
    sed -i "s|__FIREBASE_STORAGE_BUCKET__|$FIREBASE_STORAGE_BUCKET|g" src/environments/environment.prod.ts && \
    sed -i "s|__FIREBASE_MESSAGING_SENDER_ID__|$FIREBASE_MESSAGING_SENDER_ID|g" src/environments/environment.prod.ts && \
    sed -i "s|__FIREBASE_APP_ID__|$FIREBASE_APP_ID|g" src/environments/environment.prod.ts && \
    sed -i "s|__FIREBASE_MEASUREMENT_ID__|$FIREBASE_MEASUREMENT_ID|g" src/environments/environment.prod.ts && \
    sed -i "s|__FIREBASE_VAPID_KEY__|$FIREBASE_VAPID_KEY|g" src/environments/environment.prod.ts

RUN npm run build -- --configuration production

# Run stage
FROM nginx:stable-alpine
COPY --from=build /app/dist/meetings/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
