# Nexilum

Project Management System with Gamification - Frutiger Aero Style

## About the Project

Nexilum is an application inspired by tools like Jira and Trello, with a twist: a **complete gamification system** including points, levels, badges, ranking, and a GitHub-style activity heatmap. The frontend features an authentic **Frutiger Aero (2004-2013)** design with glass effects, glossy buttons, and vibrant gradients.

### Features

- **JWT Authentication** with roles (ADMIN/USER)
- **Project Management** - Full CRUD with members
- **Task Management** - Status (TODO, DOING, DONE), priorities, deadlines
- **Task Comments**
- **Activity History** (audit log)
- **Gamification**
  - Points system for actions
  - User levels (Beginner → Legend)
  - Unlockable Badges/Achievements
  - Global and per-project ranking
  - Contribution heatmap (GitHub style)
- **Real-time Collaboration** via WebSocket
- **Reports** exportable in PDF and CSV
- **OpenAPI/Swagger Documentation**

## Screenshots

### Login Page
![Login](/docs/screenshots/login.png)

### Dashboard
![Dashboard](/docs/screenshots/dashboard.png)

### Tasks (Kanban Board)
![Tasks](/docs/screenshots/tasks.png)

### Gamification
![Gamification](/docs/screenshots/gamification.png)

## Tech Stack

### Backend
| Technology | Version |
|------------|---------|
| Java | 17+ |
| Spring Boot | 3.4.2 |
| Spring Security | 6.x |
| Spring Data JPA | 3.x |
| PostgreSQL | 16 |
| JWT (jjwt) | 0.12.3 |
| WebSocket (STOMP) | - |
| Swagger/OpenAPI | 2.3.0 |
| Docker | - |
| JUnit 5 + Mockito | - |
| Testcontainers | 1.19.3 |

### Frontend
| Technology | Version |
|------------|---------|
| React | 19.x |
| TypeScript | 5.x |
| Vite | 7.x |
| TailwindCSS | 4.x |
| React Router | 7.x |
| SockJS + STOMP | - |
| Lucide React (icons) | - |

## Prerequisites

- Java 17 (recommended for local builds and tests)
- Docker and Docker Compose
- Maven 3.8+ (or use the wrapper `./mvnw`)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/EduardoPaim5/taskflow.git
cd taskflow
```

### 2. Start the database

```bash
docker-compose up -d postgres pgadmin
```

### 3. Run the application

```bash
./mvnw spring-boot:run
```

### 4. Access

- **API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **pgAdmin**: http://localhost:5050 (admin@nexilum.com / admin123)

## Main Endpoints

### Authentication
```
POST /api/auth/register    # Create account
POST /api/auth/login       # Login
POST /api/auth/refresh     # Refresh token
GET  /api/auth/me          # Current user
```

### Projects
```
GET    /api/projects           # List projects
POST   /api/projects           # Create project
GET    /api/projects/{id}      # Project details
PUT    /api/projects/{id}      # Update project
DELETE /api/projects/{id}      # Delete project
POST   /api/projects/{id}/members/{userId}  # Add member
```

### Tasks
```
GET    /api/tasks              # List tasks (with filters)
POST   /api/tasks              # Create task
GET    /api/tasks/{id}         # Task details
PUT    /api/tasks/{id}         # Update task
PATCH  /api/tasks/{id}/status  # Change status
DELETE /api/tasks/{id}         # Delete task
```

### Comments
```
GET    /api/tasks/{taskId}/comments     # List comments
POST   /api/tasks/{taskId}/comments     # Add comment
PUT    /api/comments/{id}               # Edit comment
DELETE /api/comments/{id}               # Delete comment
```

### Gamification
```
GET /api/gamification/profile          # Gamification profile
GET /api/gamification/badges           # User badges
GET /api/gamification/ranking          # Global ranking
GET /api/gamification/ranking/project/{id}  # Project ranking
GET /api/gamification/heatmap          # Activity heatmap
```

### Reports
```
GET /api/reports/project/{id}/pdf      # PDF report
GET /api/reports/project/{id}/csv      # CSV report
```

## Gamification System

### Points

| Action | Points |
|--------|--------|
| Create task | +5 |
| Complete task (low priority) | +10 |
| Complete task (medium priority) | +20 |
| Complete task (high priority) | +30 |
| Comment | +2 |
| Complete before deadline | +15 bonus |
| Daily streak | +5 |

### Levels

| Level | Name | Points |
|-------|------|--------|
| 1 | Beginner | 0-99 |
| 2 | Apprentice | 100-299 |
| 3 | Collaborator | 300-599 |
| 4 | Specialist | 600-999 |
| 5 | Master | 1000-1999 |
| 6 | Legend | 2000+ |

### Badges

- **First Task** - Complete your first task
- **On Fire** - 7-day streak
- **Speedster** - Complete 5 tasks in one day
- **Communicator** - Make 50 comments
- **Leader** - Be #1 in the ranking
- **Centurion** - Complete 100 tasks

## Project Structure

```
src/main/java/com/nexilum/
├── config/          # Configurations (Security, WebSocket, OpenAPI)
├── controller/      # REST Controllers
├── dto/             # Data Transfer Objects
│   ├── request/
│   └── response/
├── entity/          # JPA Entities
├── enums/           # Enumerations
├── exception/       # Exception handlers
├── repository/      # Spring Data repositories
├── security/        # JWT and filters
├── service/         # Business logic
│   └── impl/
├── websocket/       # WebSocket handlers
└── NexilumApplication.java
```

## Tests

```bash
# Run all tests
./mvnw test

# With coverage
./mvnw test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

If your default JDK is newer than 17, run tests with Java 17 explicitly:

```bash
JAVA_HOME=/usr/lib/jvm/java-17-openjdk PATH=/usr/lib/jvm/java-17-openjdk/bin:$PATH ./mvnw test
```

## Docker

### Build the image

```bash
docker build -t nexilum:latest .
```

### Run everything with Docker Compose

```bash
docker-compose up -d
```

## Deploy

### Railway (recommended)

1. Connect your GitHub repository
2. Configure environment variables:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `JWT_SECRET=your-secure-secret-key`
   - `DATABASE_URL` (provided by Railway)

### Render

1. Create a Web Service
2. Connect the repository
3. Build command: `./mvnw package -DskipTests`
4. Start command: `java -jar target/*.jar`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Active profile | `dev` |
| `JWT_SECRET` | JWT secret key | (generated) |
| `SPRING_DATASOURCE_URL` | Database URL | `jdbc:postgresql://localhost:5432/taskflow` |
| `SPRING_DATASOURCE_USERNAME` | Database user | `taskflow` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `taskflow123` |

## Roadmap

- [x] Initial project setup
- [x] JWT Authentication
- [x] Project CRUD
- [x] Task CRUD
- [x] Comments system
- [x] Activity history
- [x] Gamification system
- [x] WebSocket for real-time
- [x] PDF/CSV Reports
- [x] React + TypeScript Frontend
- [x] Frutiger Aero Design (classic 2004-2013 style)
- [x] Real-time notifications via WebSocket
- [ ] Integration tests
- [ ] Deploy

## Contributing

1. Fork the project
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is under the MIT license. See the [LICENSE](LICENSE) file for more details.
