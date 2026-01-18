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
  scripts = {
    hello.exec = ''
      echo "Welcome to the $GREET!"
      echo ""
      echo "To start use devenv up"
    '';

    backend-install.exec = ''
      echo "Installing backend dependencies..."
      cd ${config.git.root}/backend
      ./mvnw install -DskipTests
    '';

    backend-clean-install.exec = ''
      echo "Clean installing backend..."
      cd ${config.git.root}/backend
      ./mvnw clean install -DskipTests
    '';

    backend-compile.exec = ''
      echo "Compiling backend..."
      cd ${config.git.root}/backend
      ./mvnw clean compile
    '';

    frontend-install.exec = ''
      echo "Installing frontend dependencies..."
      cd ${config.git.root}/frontend
      npm install
    '';
  };

  languages = {
    java = {
      enable = true;
      jdk.package = pkgs.jdk21;
    };

    javascript = {
      enable = true;
      package = pkgs.nodejs_22;
    };
  };

  # Disabled devenv processes due to task cache locking issues
  # Use the 'start-services' script instead
  # processes = {
  #   backend = {
  #     exec = "./mvnw spring-boot:run";
  #     cwd = "${config.git.root}/backend";
  #   };
  #
  #   frontend = {
  #     exec = "npm start";
  #     cwd = "${config.git.root}/frontend";
  #   };
  # };

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

  # Disable task-based hooks to avoid locking issues
  # enterShell = ''
  #   hello
  # '';
  #
  # enterTest = ''
  #   echo "Running tests"
  # '';
}
