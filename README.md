# CivicTrack: Backend API Service

Node.js + PostgreSQL + PostGIS backend for CivicTrack — a community-powered platform to report and track local civic issues (like potholes, garbage, water leaks) within a user-defined radius. Supports photo uploads, moderation, status tracking, and Open311 compliance.

## 🛠 Tech Stack

- Node.js, Express
- PostgreSQL + PostGIS (with ST_DWithin, GiST indexes)
- TypeORM
- AWS S3 (presigned uploads)
- Nodemailer (email alerts)
- Open311 GeoReport v2 endpoints (optional)

## 🌍 Core Features

- RESTful API to report, list, update, and flag civic issues
- Location filtering using PostGIS (`ST_DWithin`)
- Admin-only routes for moderation, banning, and analytics
- Photo upload support via presigned AWS S3 URLs
- Full status timeline logging (Reported → In Progress → Resolved)
- Auto-hide reports after ≥ 3 flags
- Optional Open311-compatible endpoints for gov/civic integration

## ⚙️ Setup

### 1. Start PostGIS (Docker)

```bash
docker-compose up -d
docker exec -it civictrack-db psql -U postgres civicdb -c "CREATE EXTENSION IF NOT EXISTS postgis"
