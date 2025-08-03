# Mindigo Platform – Microservice & Schema Overview

This document provides an overview of the PostgreSQL schemas and their corresponding microservices for the **Mindigo: Mental Well-being Platform**.

---

## 🧩 Architecture Summary

- **Database**: PostgreSQL (Single instance)
- **User**: `mindigo`
- **Access**: All services share a single PostgreSQL user but operate in **isolated schemas**.
- **Initialization**: All schemas are pre-created via `dump.sql` in Docker using a volume mount.

---

## 🗂️ Microservice to Schema Mapping

| Microservice Name         | PostgreSQL Schema       | Description |
|---------------------------|--------------------------|-------------|
| **Auth Service**          | `auth_service`           | User registration, login, and role management |
| **Assessment Service**    | `assessment_service`     | Quizzes, surveys, screening tools |
| **Planning Service**      | `planning_service`       | Personalized goals and progress tracking |
| **Content Service**       | `content_service`        | Articles, videos, guided sessions, ASMR |
| **Consultation Service**  | `consultation_service`   | Booking and managing expert consultations |
| **Session Service**       | `session_service`        | Live/recorded webinars and workshops |
| **Forum Service**         | `forum_service`          | Q&A community forum (like Stack Overflow) |
| **Mood Tracker Service**  | `mood_service`           | Daily mood logs and emotional trend tracking |
| **Game Service**          | `game_service`           | Relaxation and cognitive games |
| **Hotline Info Service**  | `info_service`           | Delivery of regional or global support hotlines |
| **AI Recommendation Engine** | `ai_service`          | Personalized content, suggestions, and insights |

---

## ⚙️ Docker Compose Integration

The PostgreSQL container mounts a local `init.sql` file from `./init-sql/`:

```yaml
volumes:
  - ./init-db:/docker-entrypoint-initdb.d
```
run db

```bash
docker-compose up -d
```

access db
```bash
docker exec -it mindigo_db psql -U mindigo -d Mindigo
```