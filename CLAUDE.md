# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IP6 Meeting is a full-stack meeting management application with Google Calendar integration. The application uses a Spring Boot backend (Java 21), Angular frontend (v20), and PostgreSQL database, all orchestrated via Docker Compose.

## Technology Stack

**Backend:**
- Spring Boot 4.0.1 with Java 21
- PostgreSQL 16 with Flyway migrations
- Spring Security with JWT authentication
- Google Calendar API integration
- Lombok for boilerplate reduction
- Maven for dependency management

**Frontend:**
- Angular 20.3 with standalone components
- TailwindCSS 4.1 for styling
- Preline UI components
- ApexCharts for data visualization
- Jasmine/Karma for testing

**Infrastructure:**
- Docker Compose for orchestration
- PostgreSQL container with health checks
- Backend on port 8080 (debugger on 5005)
- Frontend on port 4200

## Development Commands

### Using Docker (Recommended)

Start all services:
```bash
docker-compose up
```

Start specific service:
```bash
docker-compose up postgres backend
```

Rebuild after dependency changes:
```bash
docker-compose up --build
```

Stop all services:
```bash
docker-compose down
```

### Backend (from /backend directory)

Build the project:
```bash
./mvnw clean install
```

Run the application:
```bash
./mvnw spring-boot:run
```

Run tests:
```bash
./mvnw test
```

Run Flyway migrations:
```bash
./mvnw flyway:migrate
```

Debug: The application is configured for remote debugging on port 5005.

### Frontend (from /frontend directory)

Install dependencies:
```bash
npm install
```

Start development server:
```bash
npm start
# or
ng serve
```

Build:
```bash
npm run build
# or
ng build
```

Run tests:
```bash
npm test
# or
ng test
```

Watch mode for development:
```bash
npm run watch
```

Generate component:
```bash
ng generate component component-name
```

## Architecture

### Backend Structure

The backend follows a standard Spring Boot layered architecture:

- **Package**: `ch.fhnw.meeting`
- **Controllers** (`controller/`): REST API endpoints
  - `AuthController`: User authentication (register, login)
  - `CalendarAuthController`: OAuth flow for calendar providers
  - `CalendarController`: Calendar operations
- **Services** (`service/`): Business logic
  - `calendar/`: Calendar integration logic with factory pattern for different providers
- **Repositories** (`repository/`): JPA data access
  - `UserRepository`, `UserOAuthTokenRepository`
- **Security** (`security/`): JWT token handling and authentication filters
  - `JwtTokenUtil`: Token generation/validation
  - `JwtAuthenticationFilter`: Request authentication
- **Models** (`model/`): JPA entities
- **DTOs** (`dto/`): Data transfer objects for API contracts
- **Config** (`config/`): Spring configuration classes

**Database Migrations**: Located in `src/main/resources/db/migration/`, managed by Flyway. Versioned migrations follow the pattern `V{version}__{description}.sql`.

**Configuration**: `application.properties` handles database connection, JWT settings, CORS, Google/Microsoft OAuth redirect URIs. Sensitive values can be overridden via `secrets.properties` (git-ignored).

### Frontend Structure

The frontend uses Angular's modern standalone component architecture with feature-based organization:

- **App Root** (`app/`): Core routing and configuration
  - `app.routes.ts`: Route definitions with lazy loading and guards
  - `app.config.ts`: Application-level providers and HTTP interceptors
- **Core** (`core/`): Singleton services and app-wide utilities
  - `guards/`: Route guards (`authGuard`, `guestGuard`)
  - `interceptors/`: HTTP interceptors (`authInterceptor` for JWT)
  - `services/`: `auth.service.ts` for authentication
  - `models/`: TypeScript interfaces/types
- **Features** (`features/`): Feature modules with lazy-loaded components
  - `auth/`: Login and registration
  - `calendar/`: Calendar integration and callback handling
  - `dashboard/`: Main dashboard view
  - `settings/`: User settings
- **Shared** (`shared/`): Reusable components
  - `components/`: `auth-layout`, `button`, `input`
- **Layout** (`layout/`): Application layout components

**Routing**: All routes use lazy loading via `loadComponent()`. Protected routes use `authGuard`, while auth pages use `guestGuard` to prevent access when logged in.

**HTTP**: The `authInterceptor` automatically attaches JWT tokens to outgoing requests.

**Styling**: Uses TailwindCSS 4.1 with Preline components. Theme constants are defined in `theme.constants.ts`.

### Authentication Flow

1. User registers/logs in via `AuthController`
2. Backend generates JWT token using `JwtTokenUtil`
3. Frontend stores token and attaches it via `authInterceptor`
4. `JwtAuthenticationFilter` validates tokens on subsequent requests
5. Calendar OAuth tokens stored separately in `UserOAuthTokenRepository`

### Calendar Integration

The application supports multiple calendar providers (Google, Microsoft) using a factory pattern:
- Calendar-specific implementations in `service/calendar/factory/`
- OAuth flow handled through dedicated callback component
- Redirect URIs configured in `application.properties`

## Database

**Connection**: PostgreSQL on localhost:5432, database `meetingdb`, user `meetinguser`.

**Migrations**: Use Flyway for schema changes. Create new migrations in `backend/src/main/resources/db/migration/` following the naming convention `V{next_version}__{description}.sql`. Run migrations via `./mvnw flyway:migrate` or automatically on application startup.

## Important Notes

- The backend uses Spring Boot DevTools for hot reloading during development
- Frontend uses Angular's standalone components (no NgModules)
- All API calls from frontend should go through services in `core/services/`
- JWT secret is configured in `application.properties` (should be externalized for production)
- Docker volumes preserve PostgreSQL data and Maven cache between container restarts
- The application imports `secrets.properties` for sensitive configuration (not in version control)
