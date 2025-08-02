# CivicTrack: Full‑Stack Integrator

Empower citizens to report and track local civic issues within a 1–5 km radius through photos, filters, notifications, and moderation—built using Node.js, Next.js, PostGIS, AWS S3, and Leaflet.

---

## 🚧 Project Overview

**CivicTrack** is a full-stack civic engagement platform that enables community members to:

- Report issues like **potholes, broken lights, water leaks, garbage pickup, open manholes**, and more—all anonymously or as a verified user.
- Attach up to **35 photos** per issue using client-side uploads to **AWS S3** via presigned URLs ([AWS guide]:contentReference[oaicite:0]{index=0}).
- Visualize, filter, and interact only with issues **within 1 km, 3 km, or 5 km** of the user’s current location or chosen point (based on `ST_DWithin` + GiST index) for performant radius querying in PostGIS ([PostGIS doc]:contentReference[oaicite:1]{index=1}).
- View a detailed **status timeline** with timestamps (Status: Reported → In Progress → Resolved).
- Flag spam or invalid reports; issues hidden automatically after **≥ 3 flags**, and supported by an admin moderation panel.
- Optional **Open311 GeoReport v2** endpoints (`services.json`, `requests.json`) for interoperability with municipal systems ([Open311 spec]:contentReference[oaicite:2]{index=2}).

---

## 🎯 Features at a Glance

| Feature                                | Description                                                                                  |
|---------------------------------------|----------------------------------------------------------------------------------------------|
| **Radius-Based Visibility**           | Users can view and report only issues within 1/3/5 km of their location.                     |
| **Issue Categories**                  | `roads`, `lighting`, `water`, `cleanliness`, `safety`, `obstructions`.                      |
| **Photo Uploads (up to 35)**          | Secure uploads to S3 using presigned URLs generated server-side.                             |
| **Anonymous or Verified Reporting**   | Issues can be submitted without login or linked to a user account.                           |
| **Status Tracking & Logs**            | Tracks transitions for transparency; updates trigger email notifications.                    |
| **Flagging & Moderation**             | Auto-hide after 3 user flags; admins can review dashboards and ban accounts.                 |
| **Admin Panel and Analytics**         | Real-time counts, most-reported categories, flagged issue queue.                             |
| **Open311 GeoReport Compliance (v2)** | Allows integration with third-party government or civic systems.                             |

---

## 🧩 Tech Stack

- **Backend**: Node.js, Express, TypeORM, PostgreSQL + PostGIS
- **Frontend**: Next.js, React, TypeScript, React Leaflet
- **Storage**: AWS S3 with `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`.
- **Geospatial Queries**: `ST_DWithin` on `geography(Point, 4326)` columns with GiST indexing ([PostGIS doc]:contentReference[oaicite:3]{index=3}).
- **Notifications**: Nodemailer service for emails.
- **Standards Compliance**: Open311 (GeoReport v2) API endpoints for issue/service request submission and listing ([Open311 spec]:contentReference[oaicite:4]{index=4}).

---

## ⚙️ Quick Start: Setup & Run

1. **Install Docker & run PostGIS**  
   ```bash
   docker-compose up -d
   docker exec -it <db_container> psql -U postgres civicdb -c "CREATE EXTENSION IF NOT EXISTS postgis"
 BACKEND cd server
cp .env.sample .env && fill in AWS credentials & DATABASE_URL
npm install
npm run dev

FRONTEND
cd ../client
npm install
npm run dev

ACCESS APPLICATION

Citizen View → http://localhost:3000
API → http://localhost:4000/api/…
Admin Dashboard → /admin 




