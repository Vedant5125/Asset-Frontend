# Asset Management System — Project Report

## 1) Index
1. Introduction
2. Problem Statement
3. Objectives
4. System Overview
5. Application Flow
6. Block Diagram
7. Database Schema
8. Tech Stack and Its Usage
9. Mobile Computing Aspects Covered
10. Key Features
11. Security and Access Control
12. Limitations and Future Scope
13. Conclusion

---

## 2) Introduction
The Asset Management System is a **mobile-first** project designed to manage organizational assets, monitor lifecycle status, track assignments, and support financial decisions through portfolio and recommendation modules. It includes:
- A React Native (Expo) mobile app for end users.
- A Node.js/Express backend for core asset + auth + finance APIs.
- A FastAPI backend for processing-heavy and analytics/PDF style workflows.

---

## 3) Problem Statement
Organizations often track assets manually, which causes:
- Poor visibility of asset availability and assignments.
- Inaccurate valuation and delayed maintenance decisions.
- Weak accountability and incomplete audit trails.
- Difficulty in combining operational asset data with finance insights.

This project solves that by centralizing asset, user, and investment operations in one platform.

---

## 4) Objectives
- Build a mobile application for real-time asset management.
- Implement role-based authentication and profile management.
- Maintain a structured database schema for users, assets, logs, and investments.
- Provide dashboards, reports, and portfolio recommendations.
- Support mobile-specific workflows such as scanning, always-on connectivity, and location-aware activity logs.

---

## 5) System Overview
### 5.1 High-level Modules
- **Mobile App (React Native + Expo):** UI, navigation, auth state, screen flows, API calls.
- **Node Backend (Express + Mongoose):** Core REST APIs, JWT auth, sockets for market updates, MongoDB integration.
- **FastAPI Service (Python):** Alternative/extended API routes, stats aggregation, recommendation logic, PDF report generation.
- **MongoDB:** Primary persistent store for users, assets, transactions, logs, expenses, and investments.

### 5.2 Primary User Roles
- **Admin:** user management, full asset control, reports.
- **Staff:** asset operations and personal profile/finance interactions.

---

## 6) Application Flow

### 6.1 Authentication Flow
1. User opens app.
2. App checks stored session token from local storage.
3. If token exists, app calls profile API and refreshes user context.
4. If unauthenticated, user sees Login/Signup flow.
5. On successful login, JWT is attached to outgoing API requests.

### 6.2 Core Asset Flow
1. User goes to Assets screen.
2. App fetches asset list and dashboard statistics.
3. User can create/update/delete assets (admin-protected for destructive actions).
4. App can fetch by asset code (scan flow) or asset ID.
5. Asset lifecycle actions are logged into activity/history collections.

### 6.3 Finance Flow
1. User logs expenses and investments.
2. System computes monthly portfolio summary.
3. Recommendation engine proposes investments by risk profile.
4. PDF report endpoint compiles portfolio + recommendations + asset stats.

---

## 7) Block Diagram

```text
+---------------------------+
| Mobile App (Expo RN)      |
| - Auth UI                 |
| - Asset screens           |
| - Scanner/QR flow         |
| - Dashboard/Finance       |
+------------+--------------+
             |
             | HTTPS + JWT
             v
+---------------------------+       +---------------------------+
| Node.js Backend           |<----->| MongoDB                   |
| (Express + Mongoose)      |       | users, assets, logs,      |
| /api/auth                 |       | transactions, investments |
| /api/assets               |       | expenses, notifications   |
| /api/finance              |       +---------------------------+
| Socket.IO market updates  |
+------------+--------------+
             |
             | Optional parallel service usage
             v
+---------------------------+
| FastAPI Backend           |
| /api/auth                 |
| /api/assets               |
| /api/finance              |
| PDF report generation     |
+---------------------------+
```

---

## 8) Database Schema

> Database: **MongoDB** (document model).

### 8.1 Main Collections

#### `users`
- `_id` (ObjectId)
- `name` (String, required)
- `email` (String, unique, required)
- `password` (String, hashed)
- `role` (enum: admin/staff)
- `monthly_income` (Number)
- `risk_profile` (enum: low/medium/high)
- `createdAt`, `updatedAt`

#### `assets`
- `_id` (ObjectId)
- `assetCode` (String, unique)
- `name` (String)
- `category` (String)
- `description` (String)
- `purchaseDate` (Date)
- `purchasePrice` (Number)
- `currentValue` (Number)
- `conditionStatus` (enum: new/good/fair/poor/damaged)
- `status` (enum: available/assigned/maintenance)
- `assignedTo` (ObjectId → users)
- `owner` (ObjectId → users)
- `createdAt`, `updatedAt`

#### `asset_logs`
- `_id` (ObjectId)
- `asset` / `asset_id` (ObjectId/String ref to asset)
- `action` (create/update/delete/scan/assign)
- `message` (String)
- `user` / `user_id` (ObjectId/String ref to user)
- `latitude`, `longitude` (optional geo fields)
- `createdAt`

#### `transactions`
- `_id` (ObjectId)
- `asset` (ObjectId → assets)
- `user` (ObjectId → users)
- `issueDate`, `returnDate`
- `status` (issued/returned)
- `createdAt`, `updatedAt`

#### `investments`
- `_id` (ObjectId)
- `user` / `user_id` (ObjectId/String → users)
- `type` (Gold/Crypto/Stocks/Bonds/Real Estate)
- `amount` (Number)
- `risk_level` (Low/Medium/High)
- `date`
- `createdAt`, `updatedAt`

#### `expenses`
- `_id` (ObjectId)
- `user_id` (String → users)
- `amount`, `category`, `description`
- `date`

#### `notifications`
- `_id` (ObjectId)
- `user` (ObjectId → users)
- `title`, `message`
- `isRead` (Boolean)
- `createdAt`, `updatedAt`

### 8.2 Relationship Summary
- One user can own many assets.
- One user can be assigned many assets.
- One asset can have many logs and transactions.
- One user can have many expenses and investments.

---

## 9) Tech Stack and Where It Is Used

| Layer | Technology | Where it is used |
|---|---|---|
| Mobile frontend | React Native + Expo | UI screens, navigation, platform runtime |
| Mobile state/auth | React Context + AsyncStorage | User session persistence and auth state |
| Networking | Axios | API communication with backends |
| UI toolkit | React Native Paper + SVG + charts | Dashboard cards, charts, modern themed UI |
| Node backend | Node.js + Express | Core REST APIs and middleware pipeline |
| Realtime | Socket.IO | Market update push events to clients |
| Auth | JWT + bcryptjs | Secure login/token-based authorization |
| Database ORM/driver | Mongoose (Node), Motor (FastAPI) | MongoDB read/write and schema handling |
| Python service | FastAPI | Analytics/portfolio endpoints and PDF report endpoint |
| Reporting | PDF generation utility | Downloadable finance report |

---

## 10) Mobile Computing Aspects Covered in This Project

This project demonstrates important mobile computing concepts:

1. **Mobility + Anytime Access**
   - Asset and finance modules are available via handheld mobile device interfaces.

2. **Context-Aware Workflows**
   - Scanner-based asset retrieval (`assetCode`) and support for location fields in logs (`latitude`, `longitude`).

3. **Offline-tolerant Session Management**
   - Local user/session state with AsyncStorage allows quick app restoration and token reuse.

4. **Wireless Networked Architecture**
   - Mobile app communicates with backend APIs over HTTP(s) and receives real-time market updates via sockets.

5. **Real-time Interaction**
   - Socket-based market feed enables near-live UI updates without manual refresh.

6. **Security in Mobile-Cloud Integration**
   - Token-based auth, protected routes, role checks, and password hashing secure mobile-to-server communication.

7. **Resource-efficient UX**
   - Mobile tab navigation and modular screens keep interactions task-oriented and lightweight.

---

## 11) Key Features
- User registration/login and profile updates.
- Role-based access (admin/staff).
- Asset CRUD with status tracking.
- Dashboard stats (availability, overdue, category distribution).
- Activity logging for traceability/audit.
- Expense logging and portfolio summary.
- Risk-profile-based recommendations.
- Report generation as PDF.

---

## 12) Security and Access Control
- Passwords are hashed before storage.
- JWT tokens are used for authenticated API access.
- Protected routes enforce authentication.
- Admin checks protect sensitive operations (e.g., user list, delete operations).
- CORS + middleware stack implemented in both backend services.

---

## 13) Limitations and Future Scope

### Current Limitations
- Mixed dual-backend design can create deployment complexity.
- Hardcoded local API URL in mobile service configuration.
- Limited explicit offline data synchronization beyond auth cache.
- Mock recommendation logic can be replaced with model-backed analytics.

### Future Improvements
- Unify service contract between Node and FastAPI or introduce API gateway.
- Add push notifications for assignment/overdue events.
- Add stronger offline-first storage and conflict resolution.
- Add analytics dashboards for asset depreciation and utilization trends.
- Improve CI/CD, automated tests, and environment-based configuration.

---

## 14) Conclusion
The project is a practical mobile computing solution combining asset lifecycle management and financial insights. It applies modern cross-platform frontend development, secure API design, MongoDB-based data modeling, and real-time communication patterns suited to enterprise-ready mobile systems.
