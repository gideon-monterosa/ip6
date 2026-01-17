# Meeting Feedback Platform - Implementation Plan

## Project Overview
A platform to measure how meetings affect developer happiness and improve meeting culture through feedback, dashboards, and improvement proposals.

**Tech Stack:**
- Backend: Spring Boot 4.x (Java 21)
- Frontend: Angular 19
- Database: PostgreSQL 16
- Authentication: JWT-based
- Repository: Monorepo structure
- Development Environment: devenv.nix (Nix-based)

---

## Monorepo vs Separate Repos Decision

### ✅ Chosen Approach: MONOREPO

**Reasoning:**
- Tight coupling between frontend/backend for meeting feedback features
- Atomic commits for API contract changes
- Simpler workflow for small team (IP6 project)
- Easier coordination during rapid iteration
- Single source of truth for deployment

**Structure:**
```
ip6/
├── backend/          # Spring Boot application
├── frontend/         # Angular application
├── docker-compose.yml
├── PLAN.md
└── README.md
```

---

## Development Environment Setup

### ✅ Using devenv.nix (Nix-based Development Environment)

**What's Configured:**
- **Languages & Runtimes:** JDK 21, Node.js 22, Maven, NPM, Angular CLI
- **Database:** PostgreSQL 16 service with automatic initialization
  - Database: `meetingdb`
  - User: `meetinguser` / Password: `meetingpass`
  - Port: 5432 (localhost only)
- **Process Management:** Automatic backend/frontend servers via `devenv up`
  - Backend: `./mvnw spring-boot:run` (port 8080)
  - Frontend: `npm start` (port 4200)
- **Tools:** Docker, Docker Compose, Git, Curl

**Database Approach:**
- **Primary:** devenv PostgreSQL service (managed by devenv)
- **Alternative:** docker-compose.yml (standalone PostgreSQL container)
- **Recommendation:** Use devenv for local development, docker-compose for CI/CD or team members not using Nix

**Usage:**
```bash
devenv up      # Start all services (PostgreSQL, backend, frontend)
devenv shell   # Enter development shell with all tools
```

---

## Immediate Next Steps

**Priority tasks to complete the basic setup:**

1. **Complete Backend Dependencies** (Section 2)
   - Add Spring Data JPA, Spring Security, PostgreSQL Driver
   - Add Lombok, Validation, JWT library

2. **Configure Database Connection** (Section 2)
   - Update application.properties with PostgreSQL settings
   - Configure JPA/Hibernate

3. **Add Database Migrations** (Section 4)
   - Set up Flyway or Liquibase
   - Create initial schema migration

4. **Create Root README.md** (Section 1)
   - Project overview and setup instructions

5. **Set Up Backend Package Structure** (Section 2)
   - Create base packages (controller, service, repository, model, etc.)

---

## Implementation Steps

### 1. Repository Structure Setup
- [ ] Create root-level README.md with project overview
- [x] Create .gitignore (Java, Node, IDE files)
- [x] Create docker-compose.yml for PostgreSQL
- [x] Set up directory structure: `backend/`, `frontend/`, `docs/`
- [x] Initialize git repository

### 2. Backend Setup (Spring Boot 4.x)
- [x] Initialize Spring Boot project using Spring Initializr
  - [x] Add dependencies: Spring Web
  - [ ] Add: Spring Data JPA, Spring Security
  - [ ] Add: PostgreSQL Driver, Lombok, Validation
  - [ ] Add: JWT library (spring-security-oauth2-resource-server or jjwt)
- [ ] Configure application.properties/application.yml
  - [ ] PostgreSQL connection settings
  - [ ] JPA/Hibernate settings
  - [ ] JWT configuration
- [ ] Set up project structure
  - [ ] Create packages: controller, service, repository, model, dto, security, config
  - [ ] Add base exception handling
  - [ ] Configure CORS for Angular development

### 3. Frontend Setup (Angular 19)
- [x] Initialize Angular application with Angular CLI
- [x] Configure for standalone components
- [ ] Install UI library (Angular Material or PrimeNG)
- [ ] Install charting library (Chart.js/ngx-charts for dashboards)
- [ ] Set up project structure
  - [ ] Create core module (auth, guards, interceptors)
  - [ ] Create shared module (common components)
  - [ ] Create feature modules (meetings, feedback, dashboard)
- [ ] Configure environment files
  - [ ] Development environment (API URL)
  - [ ] Production environment
- [ ] Set up routing structure

### 4. Database Setup
- [x] Create docker-compose.yml with PostgreSQL service
- [x] Configure devenv PostgreSQL service (primary approach)
- [ ] Design database schema
  - [ ] Users table (id, username, email, password, role, created_at)
  - [ ] Meetings table (id, title, date, duration, organizer_id, participants)
  - [ ] Feedback table (id, meeting_id, user_id, rating, comments, created_at)
  - [ ] Improvement_Proposals table (id, meeting_id, proposal, status)
  - [ ] Dashboard_Metrics table (aggregated data for performance)
- [ ] Set up Flyway or Liquibase for migrations
- [ ] Create JPA entities
- [ ] Create repositories

### 5. Authentication Implementation (JWT)
- [ ] Backend: Create User entity and UserRepository
- [ ] Backend: Implement UserDetailsService
- [ ] Backend: Create JWT utility class (generate, validate, parse tokens)
- [ ] Backend: Configure Spring Security
  - [ ] JWT authentication filter
  - [ ] Security filter chain
  - [ ] Password encoder (BCrypt)
- [ ] Backend: Create auth endpoints
  - [ ] POST /api/auth/register
  - [ ] POST /api/auth/login
  - [ ] GET /api/auth/me (current user)
- [ ] Frontend: Create auth service
- [ ] Frontend: Create login/register components
- [ ] Frontend: Implement auth guard for protected routes
- [ ] Frontend: Create HTTP interceptor for JWT tokens

### 6. Core Feature: Meeting Management
- [ ] Backend: Create Meeting entity and DTOs
- [ ] Backend: Create MeetingRepository
- [ ] Backend: Create MeetingService
- [ ] Backend: Create MeetingController
  - [ ] GET /api/meetings (list all)
  - [ ] GET /api/meetings/{id}
  - [ ] POST /api/meetings (create)
  - [ ] PUT /api/meetings/{id}
  - [ ] DELETE /api/meetings/{id}
- [ ] Frontend: Create meeting service
- [ ] Frontend: Create meeting list component
- [ ] Frontend: Create meeting detail/view component
- [ ] Frontend: Create meeting form component (create/edit)

### 7. Core Feature: Feedback System
- [ ] Backend: Create Feedback entity and DTOs
- [ ] Backend: Create FeedbackRepository
- [ ] Backend: Create FeedbackService
- [ ] Backend: Create FeedbackController
  - [ ] POST /api/meetings/{id}/feedback
  - [ ] GET /api/meetings/{id}/feedback
  - [ ] GET /api/feedback/my-feedback
- [ ] Frontend: Create feedback service
- [ ] Frontend: Create feedback form component
- [ ] Frontend: Create feedback list/view component

### 8. Core Feature: Dashboard & Metrics
- [ ] Backend: Create dashboard analytics service
  - [ ] Calculate average meeting ratings
  - [ ] Calculate happiness trends over time
  - [ ] Identify problematic meeting patterns
- [ ] Backend: Create DashboardController
  - [ ] GET /api/dashboard/overview
  - [ ] GET /api/dashboard/trends
  - [ ] GET /api/dashboard/meetings-analysis
- [ ] Frontend: Create dashboard service
- [ ] Frontend: Create dashboard component with charts
  - [ ] Overall happiness score
  - [ ] Trends over time (line chart)
  - [ ] Meeting ratings breakdown (bar chart)
  - [ ] Most/least productive meeting types

### 9. Core Feature: Improvement Proposals
- [ ] Backend: Create ImprovementProposal entity
- [ ] Backend: Create proposal generation logic (AI/rule-based)
- [ ] Backend: Create ProposalController
  - [ ] GET /api/meetings/{id}/proposals
  - [ ] POST /api/proposals (manual creation)
  - [ ] PUT /api/proposals/{id}/status (accept/reject)
- [ ] Frontend: Create proposals service
- [ ] Frontend: Create proposals list component
- [ ] Frontend: Create proposal detail component

### 10. Development & Build Configuration
- [ ] Configure CORS for local development
- [ ] Set up separate dev servers
  - [ ] Spring Boot on port 8080
  - [ ] Angular on port 4200
- [ ] Optional: Configure Maven/Gradle to build Angular
- [ ] Create Dockerfiles
  - [ ] Backend Dockerfile
  - [ ] Frontend Dockerfile (nginx)
- [ ] Update docker-compose.yml for full stack

### 11. Documentation & Polish
- [ ] Add Swagger/OpenAPI documentation
- [ ] Write comprehensive README.md
  - [ ] Project description
  - [ ] Prerequisites
  - [ ] Setup instructions
  - [ ] Running the application
  - [ ] API documentation link
- [ ] Add basic unit tests
  - [ ] Backend: Service layer tests
  - [ ] Frontend: Component tests
- [ ] Add input validation
- [ ] Error handling and user-friendly messages
- [ ] Loading states and spinners

### 12. Optional Enhancements
- [ ] Email notifications for meeting feedback requests
- [ ] Export dashboard data to PDF/CSV
- [ ] Meeting calendar integration
- [ ] Role-based access control (Admin, Manager, Developer)
- [ ] Anonymized feedback option
- [ ] Meeting templates
- [ ] Recurring meetings support

---

## Current Status
**Last Updated:** 2026-01-17
**Current Step:** Basic setup complete, working on backend configuration

**Completed:**
- ✅ Repository structure (git, .gitignore, directories)
- ✅ Docker Compose configuration
- ✅ Devenv.nix development environment
- ✅ PostgreSQL database service (via devenv)
- ✅ Spring Boot 4.x project initialized with Spring Web
- ✅ Angular 19 project initialized with standalone components

**In Progress:**
- Backend dependencies (need: JPA, Security, PostgreSQL driver, Lombok, JWT)
- Database connection configuration in application.properties
- Backend package structure

**Next Up:**
- Complete backend dependencies
- Configure database connection
- Set up Flyway/Liquibase migrations
- Create root README.md

## Notes
- Using monorepo structure for easier coordination
- PostgreSQL 16 as primary database (managed by devenv)
- JWT for stateless authentication
- Spring Boot 4.x (latest stable)
- Angular 19 with standalone components
- Focus on developer happiness metrics and meeting culture improvement
