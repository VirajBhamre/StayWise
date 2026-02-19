# StayWise

**A complete solution for hostel administration and student accommodation management.**

StayWise is a full-stack hostel management system that streamlines operations for administrators, wardens, and hostellers. It handles hostel registration, room allocation, complaints, maintenance requests, rent payments, events, and more—all through a modern, role-based web application.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [User Roles & Access](#user-roles--access)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Scripts](#scripts)

---

## Features

### Admin
- **Dashboard** — Overview of hostel requests, approved hostels, and system statistics
- **Hostel Approval** — Review and approve/reject warden registration requests
- **Hostel Management** — View all approved hostels across the system
- **Admin Registration** — Create new admin accounts (with OTP verification)
- **Default Seeding** — Auto-creates a default admin when no admins exist

### Warden
- **Hostel Setup** — Register hostel and define room architecture (floors, rooms, capacity)
- **Hosteller Management** — Add, update, remove hostellers; reset passwords; exchange rooms
- **Complaints** — View and respond to hosteller complaints
- **Maintenance** — Manage maintenance requests and update status
- **Events** — Create events and manage registrations
- **Payments** — Track rent status, mark payments as paid, generate receipts, view analytics
- **Dashboard** — Statistics and overview of hostel operations

### Hosteller
- **Profile** — View and update personal information
- **Complaints** — Submit and track complaints
- **Maintenance** — Request maintenance and track status
- **Rent** — Pay rent and view payment history
- **Events** — Browse and register for hostel events

### System
- **Automated Expiry** — Cron job removes expired hostellers daily at midnight
- **JWT Authentication** — Secure, role-based access control
- **Email Service** — OTP delivery for admin verification (Nodemailer)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Chakra UI, React Router, Axios, Framer Motion, Chart.js |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Cron** | node-cron |
| **Email** | Nodemailer |

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    React SPA    │────▶│  Express API    │────▶│    MongoDB      │
│  (Port 3000)   │     │  (Port 5000)    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │
        │                        ├── Auth (JWT)
        │                        ├── Role-based middleware
        │                        └── Cron (expiry check)
        │
        └── REACT_APP_API_URL
```

---

## Prerequisites

- **Node.js** — v16 or higher (LTS recommended)
- **MongoDB** — Local instance or MongoDB Atlas
- **npm** or **yarn**

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd StayWise
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## Environment Variables

Create a `.env` file in the **backend** directory:

```env
# MongoDB connection string (required)
MONGO_URI=mongodb://localhost:27017/staywise

# Server port (optional, defaults to 5000)
PORT=5000

# Frontend URL for CORS (optional, defaults to http://localhost:3000)
FRONTEND_URL=http://localhost:3000
```

Create a `.env` file in the **frontend** directory (optional):

```env
# Backend API URL (optional, defaults to http://localhost:5000/api)
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Running the Application

### Development

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Server runs at `http://localhost:5000` with nodemon for hot reload.

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```
App runs at `http://localhost:3000`.

### Production

**Backend:**
```bash
cd backend
npm start
```

**Frontend (build & serve):**
```bash
cd frontend
npm run build
# Serve the build folder with nginx, serve, or similar
```

---

## User Roles & Access

| Role | Login URL | Description |
|------|-----------|-------------|
| **Admin** | `/admin/login` | System administrators; approve hostels |
| **Warden** | `/warden/login` | Hostel managers; full hostel operations |
| **Hosteller** | `/hosteller/login` | Students; profile, complaints, rent, events |

### Default Admin (First Run)

When no admin exists in the database, the server seeds a default admin:

- **Email:** `virajbhamre55@gmail.com`
- **Password:** `admin123`

Change these in `backend/server.js` if needed, or register a new admin and remove the default.

### Warden Registration

Wardens submit an **Access Request** via `/access-request`. Admins approve or reject requests. Approved wardens receive credentials and can log in.

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Auth (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/login` | Admin login |
| POST | `/admin/register` | Admin registration |
| POST | `/warden/login` | Warden login |
| POST | `/warden/register` | Warden access request |
| POST | `/hosteller/login` | Hosteller login |

### Admin (`/api/admin`) — Requires Admin JWT

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Dashboard statistics |
| GET | `/hostel-requests` | Pending hostel requests |
| PUT | `/hostel-requests/:id/approve` | Approve hostel |
| DELETE | `/hostel-requests/:id/reject` | Reject hostel |
| GET | `/hostels` | All approved hostels |

### Warden (`/api/warden`) — Requires Warden JWT

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Warden dashboard stats |
| GET | `/hostel` | Hostel info |
| GET/POST | `/room-architecture` | Check/define room layout |
| POST | `/hostellers` | Add hosteller |
| GET | `/hostellers` | List hostellers |
| GET | `/hostellers/:id` | Hosteller details |
| PUT | `/hostellers/:id` | Update hosteller |
| DELETE | `/hostellers/:id` | Remove hosteller |
| POST | `/hostellers/:id/reset-password` | Reset hosteller password |
| POST | `/exchange-rooms` | Exchange rooms between hostellers |
| GET | `/complaints` | List complaints |
| PUT | `/complaints/:id` | Respond to complaint |
| GET | `/maintenance` | List maintenance requests |
| PUT | `/maintenance/:id` | Respond to maintenance |
| POST/GET | `/events` | Create/list events |
| GET | `/rent-status` | Rent payment status |
| GET | `/payments` | All payments |
| PUT | `/payments/:id/mark-paid` | Mark payment as paid |
| GET | `/payments/:id/receipt` | Generate receipt |
| GET | `/payment-analytics` | Payment analytics |
| GET | `/payments/history/:hostellerId` | Payment history |

### Hosteller (`/api/hosteller`) — Requires Hosteller JWT

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/profile` | Get/update profile |
| POST/GET | `/complaints` | Create/list complaints |
| POST/GET | `/maintenance` | Create/list maintenance requests |
| POST | `/pay-rent` | Pay rent |
| GET | `/rent-history` | Rent payment history |
| GET | `/events` | List events |
| POST | `/events/:id/register` | Register for event |

---

## Project Structure

```
StayWise/
├── backend/
│   ├── config/
│   │   └── dbConfig.js          # MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── hostellerController.js
│   │   └── wardenController.js
│   ├── cron/
│   │   └── expiryCheck.js       # Daily hosteller expiry job
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT & role checks
│   │   └── architectureCheckMiddleware.js
│   ├── models/
│   │   ├── adminModel.js
│   │   ├── complaintModel.js
│   │   ├── eventModel.js
│   │   ├── hostellerModel.js
│   │   ├── hostelModel.js
│   │   ├── maintenanceModel.js
│   │   ├── paymentModel.js
│   │   └── wardenModel.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── hostellerRoutes.js
│   │   └── wardenRoutes.js
│   ├── utils/
│   │   ├── emailService.js
│   │   ├── generators.js
│   │   └── logger.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js           # Axios API client
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── package.json
└── README.md
```

---

## Scripts

### Backend
| Script | Command | Description |
|--------|---------|-------------|
| Start | `npm start` | Run production server |
| Dev | `npm run dev` | Run with nodemon (hot reload) |

### Frontend
| Script | Command | Description |
|--------|---------|-------------|
| Start | `npm start` | Run development server |
| Build | `npm run build` | Production build |
| Test | `npm test` | Run tests |

---

## License

This project is private. All rights reserved.

