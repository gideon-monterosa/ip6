{
  pkgs,
  config,
  ...
}: {
  env.GREET = "Meeting Feedback Platform";

  packages = with pkgs; [
    git
    curl

    jdk21
    maven

    nodejs_22
    nodePackages.npm
    nodePackages."@angular/cli"

    postgresql_16

    docker
    docker-compose
  ];

  # https://devenv.sh/scripts/
  scripts.hello.exec = ''
    echo "Welcome to the $GREET!"
    echo ""
    echo "To start use devenv up"
  '';

  languages = {
    java = {
      java.enable = true;
      java.jdk.package = pkgs.jdk21;
    };

    javascript = {
      enable = true;
      package = pkgs.nodejs_22;
    };
  };

  processes = {
    backend = {
      exec = "./mvnw spring-boot:run";
      cwd = "${config.git.root}/backend";
    };

    frontend = {
      exec = "npm start";
      cwd = "${config.git.root}/frontend";
    };
  };

  services.postgres = {
    enable = true;
    package = pkgs.postgresql_16;
    initialDatabases = [
      {name = "meetingdb";}
    ];
    listen_addresses = "127.0.0.1";
    port = 5432;
    initialScript = ''
      CREATE USER meetinguser WITH PASSWORD 'meetingpass';
      GRANT ALL PRIVILEGES ON DATABASE meetingdb TO meetinguser;
      ALTER DATABASE meetingdb OWNER TO meetinguser;
    '';
  };

  enterShell = ''
    hello
  '';

  enterTest = ''
    echo "Running tests"
  '';
}
