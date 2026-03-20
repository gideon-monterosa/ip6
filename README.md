# IP6 Meeting Project

This repository contains the source code for the IP6 Meeting Project, including the frontend, backend, database, and AI (Ollama) services.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Local Development Setup

The local development environment is configured using Docker Compose. We use a `docker-compose.override.yml` file specifically tailored for local development (which maps local directories, enables hot-reloading for the frontend, and runs the backend in debug mode).

By default, Docker Compose automatically picks up the `docker-compose.override.yml` file alongside the main `docker-compose.yml`.

### 1. Start the Environment

To initially start the development environment and build the images, run the following command in the root of the project:

```bash
docker compose up --build
```

*(You can add the `-d` flag to run it in detached mode: `docker compose up -d --build`)*

### 2. Access the Services

Once the containers are up and running, you can access the different services locally at the following URLs:

- **Frontend (Angular):** [http://localhost:4200](http://localhost:4200) (Hot-reloading enabled)
- **Backend (Spring Boot):** [http://localhost:8080](http://localhost:8080) (Remote debugging on port `5005`)
- **Database (PostgreSQL):** `localhost:5432`
- **Ollama AI:** `localhost:11434`

### 3. Stop the Environment

To stop the running containers, press `Ctrl+C` in the terminal where it's running, or execute the following command if running in detached mode:

```bash
docker compose down
```

## Notes

- **Hot-reloading:** Changes made to the `./frontend` and `./backend` directories will be reflected inside the containers due to volume mapping in the override file.
- **Dependencies:** The initial startup might take some time as it downloads Maven dependencies and npm packages.
