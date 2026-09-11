# 🍁 MapleLMS — Enterprise Learning Experience Platform (LMS / LXP)

> **Enterprise learning that goes beyond completions.**  
> A commercially deployable, production-grade SaaS LMS/LXP platform combining modern learner hubs, AI course authoring, SCORM 1.2 & 2004 runtime, skills mapping, verifiable certifications, dynamic leaderboards, and multi-tenant organization governance.

---

## 🌟 Core Platform Features

- **Enterprise LMS & LXP Core:** Multi-tenant architecture with granular Role-Based Access Control (`SUPER_ADMIN`, `ADMIN`, `COURSE_CREATOR`, `LEARNER`).
- **High-Precision AI Course Studio:** 8-step curriculum synthesis engine with pedagogical tuning (hands-on technical, case studies, frameworks), custom module count controls (2-6 modules), domain detection (Cloud, Security, AI, Finance, Healthcare, Leadership), and an interactive Blueprint Scaffold editor.
- **In-Builder AI Copilot:** Canvas assistant for real-time lesson generation, scenario quiz authoring with educational explanations, and content enhancement.
- **Visual Course Builder:** 3-column modular curriculum authoring with drag-and-and-reorder, video uploads, markdown text blocks, and quizzes.
- **SCORM 1.2 & 2004 Engine:** Standards-compliant ZIP package importer, manifest parser, package inspector, and CMI runtime tracking (`cmi.core.lesson_status`, scores, session time, suspend data).
- **Gamification & Leaderboard Hub:** Real-time XP points, active daily streaks, earned verifiable certificates, and live dynamic leaderboards.
- **Full Backend Persistence & Supabase Integration:** Powered by an integrated relational database and Supabase Cloud Auth/Storage (`https://dxgczhkmeuejwpndksav.supabase.co`).
- **Verifiable Certificates:** Cryptographically generated certificate codes with public verification portal.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Installation
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 3. Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
PORT=5000
JWT_SECRET=strata-enterprise-secret-key-2026
SUPABASE_URL=https://dxgczhkmeuejwpndksav.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Supabase Database Schema
To initialize tables in your Supabase PostgreSQL cloud database, run the SQL script located in:
```
server/db/supabase_schema.sql
```
in the **Supabase Dashboard -> SQL Editor**.

### 5. Launch Application
```bash
# Run server & client concurrently in dev mode:
npm run dev

# Or build client for production and run server on port 5000:
npm run build
npm start
```
Access the platform at: **`http://localhost:5000`**

---

## 🔐 Default Stakeholder Demo Accounts
*Password for all demo accounts:* **`password123`**

| Persona | Email | Role | Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@stratalms.com` | `SUPER_ADMIN` | Multi-tenant platform authority, tenant switcher, audit logs |
| **Operational Admin** | `admin@acmeglobal.com` | `ADMIN` | Learners directory, cohorts, categories & compliance |
| **Course Creator** | `creator@acmeglobal.com` | `COURSE_CREATOR` | AI Course Studio, visual builder, SCORM uploader, grading queue |
| **Learner** | `elena.rostova@acmeglobal.com` | `LEARNER` | Personalized learning hub, course player, quizzes, leaderboard |

*(New users can also register their own accounts directly via the Sign Up portal)*

---

## 📁 Project Architecture

```
├── client/                     # Vite + React 18 Frontend
│   ├── src/
│   │   ├── components/layout/  # PublicNavbar, Authenticated Navbar, Sidebar
│   │   ├── context/            # AuthContext (real auth, register, forgot/reset)
│   │   ├── lib/                # API client & Supabase client initialization
│   │   ├── pages/ai/           # AiCourseStudio (8-step precision authoring)
│   │   ├── pages/courses/      # CourseBuilder (canvas + AI Copilot)
│   │   ├── pages/learning/     # CoursePlayer, CourseCatalog, GamificationHub
│   │   ├── pages/dashboards/   # Learner, Creator, Admin, SuperAdmin Dashboards
│   │   └── pages/public/       # Landing, Login, Signup, ForgotPassword, ResetPassword
├── server/                     # Express 5 API Server
│   ├── db/                     # SQLite engine, Supabase client, SQL schemas, seeds
│   ├── middleware/             # JWT auth & granular RBAC permissions
│   ├── routes/                 # Auth, Courses, SCORM, AI, Users, Cohorts, Leaderboard
│   ├── services/               # AI synthesis engine & SCORM runtime processor
│   └── uploads/                # Persistent media storage (thumbnails, videos)
└── package.json                # Root package & scripts
```

---

## 📄 License
Commercial Enterprise License — MapleLMS Technologies.
