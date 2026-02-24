# TaskFlow

Sistema de Gestão de Projetos com Gamificação - API REST desenvolvida com Spring Boot.

## Sobre o Projeto

TaskFlow é uma aplicação inspirada em ferramentas como Jira e Trello, com um diferencial: **sistema de gamificação completo** que inclui pontos, níveis, badges, ranking e heatmap de atividades estilo GitHub.

### Features

- **Autenticação JWT** com roles (ADMIN/USER)
- **Gestão de Projetos** - CRUD completo com membros
- **Gestão de Tarefas** - Status (TODO, DOING, DONE), prioridades, deadlines
- **Comentários** nas tarefas
- **Histórico de Atividades** (audit log)
- **Gamificação**
  - Sistema de pontos por ações
  - Níveis de usuário (Iniciante → Lenda)
  - Badges/Conquistas desbloqueáveis
  - Ranking global e por projeto
  - Heatmap de contribuições (estilo GitHub)
- **Colaboração em Tempo Real** via WebSocket
- **Relatórios** exportáveis em PDF e CSV
- **Documentação OpenAPI/Swagger**

## Tech Stack

### Backend
| Tecnologia | Versão |
|------------|--------|
| Java | 17+ |
| Spring Boot | 3.2.2 |
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
| Tecnologia | Versão |
|------------|--------|
| React | 19.x |
| TypeScript | 5.x |
| Vite | 7.x |
| TailwindCSS | 4.x |
| React Router | 7.x |
| SockJS + STOMP | - |
| Lucide React (ícones) | - |

## Pré-requisitos

- Java 17+
- Docker e Docker Compose
- Maven 3.8+ (ou use o wrapper `./mvnw`)

## Quick Start

### 1. Clone o repositório

```bash
git clone https://github.com/EduardoPaim5/taskflow.git
cd taskflow
```

### 2. Inicie o banco de dados

```bash
docker-compose up -d postgres pgadmin
```

### 3. Execute a aplicação

```bash
./mvnw spring-boot:run
```

### 4. Acesse

- **API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **pgAdmin**: http://localhost:5050 (admin@taskflow.com / admin123)

## Endpoints Principais

### Autenticação
```
POST /api/auth/register    # Criar conta
POST /api/auth/login       # Login
POST /api/auth/refresh     # Refresh token
GET  /api/auth/me          # Usuário atual
```

### Projetos
```
GET    /api/projects           # Listar projetos
POST   /api/projects           # Criar projeto
GET    /api/projects/{id}      # Detalhes do projeto
PUT    /api/projects/{id}      # Atualizar projeto
DELETE /api/projects/{id}      # Deletar projeto
POST   /api/projects/{id}/members/{userId}  # Adicionar membro
```

### Tarefas
```
GET    /api/tasks              # Listar tarefas (com filtros)
POST   /api/tasks              # Criar tarefa
GET    /api/tasks/{id}         # Detalhes da tarefa
PUT    /api/tasks/{id}         # Atualizar tarefa
PATCH  /api/tasks/{id}/status  # Mudar status
DELETE /api/tasks/{id}         # Deletar tarefa
```

### Comentários
```
GET    /api/tasks/{taskId}/comments     # Listar comentários
POST   /api/tasks/{taskId}/comments     # Adicionar comentário
PUT    /api/comments/{id}               # Editar comentário
DELETE /api/comments/{id}               # Deletar comentário
```

### Gamificação
```
GET /api/gamification/profile          # Perfil de gamificação
GET /api/gamification/badges           # Badges do usuário
GET /api/gamification/ranking          # Ranking global
GET /api/gamification/ranking/project/{id}  # Ranking por projeto
GET /api/gamification/heatmap          # Heatmap de atividades
```

### Relatórios
```
GET /api/reports/project/{id}/pdf      # Relatório PDF
GET /api/reports/project/{id}/csv      # Relatório CSV
```

## Sistema de Gamificação

### Pontuação

| Ação | Pontos |
|------|--------|
| Criar tarefa | +5 |
| Completar tarefa (baixa) | +10 |
| Completar tarefa (média) | +20 |
| Completar tarefa (alta) | +30 |
| Comentar | +2 |
| Completar antes do deadline | +15 bônus |
| Streak diário | +5 |

### Níveis

| Nível | Nome | Pontos |
|-------|------|--------|
| 1 | Iniciante | 0-99 |
| 2 | Aprendiz | 100-299 |
| 3 | Colaborador | 300-599 |
| 4 | Especialista | 600-999 |
| 5 | Mestre | 1000-1999 |
| 6 | Lenda | 2000+ |

### Badges

- **Primeira Tarefa** - Complete sua primeira tarefa
- **Em Chamas** - Streak de 7 dias
- **Velocista** - Complete 5 tarefas em um dia
- **Comunicador** - Faça 50 comentários
- **Líder** - Seja top 1 do ranking
- **Centurião** - Complete 100 tarefas

## Estrutura do Projeto

```
src/main/java/com/taskflow/
├── config/          # Configurações (Security, WebSocket, OpenAPI)
├── controller/      # REST Controllers
├── dto/             # Data Transfer Objects
│   ├── request/
│   └── response/
├── entity/          # Entidades JPA
├── enums/           # Enumerações
├── exception/       # Exception handlers
├── repository/      # Spring Data repositories
├── security/        # JWT e filtros
├── service/         # Lógica de negócio
│   └── impl/
├── websocket/       # Handlers WebSocket
└── TaskFlowApplication.java
```

## Testes

```bash
# Rodar todos os testes
./mvnw test

# Com cobertura
./mvnw test jacoco:report

# Ver relatório de cobertura
open target/site/jacoco/index.html
```

## Docker

### Build da imagem

```bash
docker build -t taskflow:latest .
```

### Rodar tudo com Docker Compose

```bash
docker-compose up -d
```

## Deploy

### Railway (recomendado)

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `JWT_SECRET=sua-chave-secreta-segura`
   - `DATABASE_URL` (fornecido pelo Railway)

### Render

1. Crie um Web Service
2. Conecte o repositório
3. Build command: `./mvnw package -DskipTests`
4. Start command: `java -jar target/*.jar`

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `SPRING_PROFILES_ACTIVE` | Perfil ativo | `dev` |
| `JWT_SECRET` | Chave secreta JWT | (gerada) |
| `SPRING_DATASOURCE_URL` | URL do banco | `jdbc:postgresql://localhost:5432/taskflow` |
| `SPRING_DATASOURCE_USERNAME` | Usuário do banco | `taskflow` |
| `SPRING_DATASOURCE_PASSWORD` | Senha do banco | `taskflow123` |

## Roadmap

- [x] Setup inicial do projeto
- [x] Autenticação JWT
- [x] CRUD de Projetos
- [x] CRUD de Tarefas
- [x] Sistema de Comentários
- [x] Histórico de Atividades
- [x] Sistema de Gamificação
- [x] WebSocket para tempo real
- [x] Relatórios PDF/CSV
- [x] Frontend React com TypeScript
- [x] Design Frutiger Aero (estilo clássico 2004-2013)
- [x] Notificações em tempo real via WebSocket
- [ ] Testes de integração
- [ ] Deploy

## Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

