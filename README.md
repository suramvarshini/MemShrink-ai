# MemShrink – Smart Memory Optimization System

A full-stack web application for monitoring, analyzing, and optimizing system RAM usage.

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd memshrink-backend
npm start
```

Backend runs at **http://localhost:5000**

### 2. Start the Frontend

```bash
cd memshrink-frontend
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## 🗂️ Project Structure

```
NEBIUS X NVIDIA/
├── memshrink-frontend/          # React.js + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar, Topbar, Layout
│   │   │   └── ui/              # RadialGauge, ProgressBar, StatCard, Badge, Skeleton
│   │   ├── context/             # ThemeContext, MemoryContext, AlertContext
│   │   ├── pages/               # Dashboard, Analyzer, Optimize, History, Alerts, Settings
│   │   ├── services/            # API service layer (axios)
│   │   └── utils/               # format helpers
│   └── vite.config.js
│
└── memshrink-backend/           # Node.js + Express.js
    ├── config/                  # MongoDB connection
    ├── models/                  # Mongoose schemas
    ├── routes/                  # API route handlers
    └── server.js
```

## 🌐 Tech Stack

| Layer     | Technology                         |
|-----------|-------------------------------------|
| Frontend  | React.js, Vite, Tailwind CSS v4    |
| Charts    | Recharts                            |
| Icons     | Lucide React                        |
| HTTP      | Axios                               |
| Backend   | Node.js, Express.js v5             |
| Database  | MongoDB + Mongoose                  |
| System    | systeminformation library           |

## ✅ Features

| Feature                  | Works in Browser | Requires Backend |
|--------------------------|:----------------:|:----------------:|
| Dashboard UI             | ✅               |                  |
| Simulated Memory Data    | ✅               |                  |
| **Live RAM Stats**       |                  | ✅               |
| **Live Process List**    |                  | ✅               |
| **MongoDB History**      |                  | ✅ + MongoDB     |
| Optimization Simulation  | ✅ (fallback)    | ✅               |
| Dark/Light Mode          | ✅               |                  |
| Alert Notifications      | ✅ (local)       | ✅               |
| Settings                 | ✅               |                  |

## 🗄️ MongoDB Setup (Optional)

1. Install [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. The backend auto-connects to `mongodb://localhost:27017/memshrink`
4. If MongoDB is unavailable, the app still runs with in-memory storage

## 📡 API Endpoints

| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| GET    | `/api/health`                 | Server health check      |
| GET    | `/api/memory/stats`           | Current RAM statistics   |
| GET    | `/api/memory/processes`       | Running process list     |
| GET    | `/api/memory/history?period=` | Usage history (day/week) |
| GET    | `/api/optimize/recommendations` | Optimization tips      |
| POST   | `/api/optimize/simulate`      | Run optimization sim     |
| GET    | `/api/optimize/history`       | Past optimizations       |
| GET    | `/api/alerts`                 | All alerts               |
| POST   | `/api/alerts/check`           | Check thresholds         |
| PATCH  | `/api/alerts/:id/read`        | Mark alert read          |
| GET    | `/api/system/info`            | CPU/OS/system info       |
