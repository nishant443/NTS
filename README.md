# NTS ERP — Nutan Tech Solutions

A full-stack ERP web application built on the MERN stack (MongoDB, Express, React, Node.js), themed around the NTS logo (Royal Blue #1E63E9 / Dark Gray #4A4A4A).

## What's fully built and working

**Backend (Express + MongoDB/Mongoose + JWT)**
- JWT authentication: login, auto-login (`/auth/me`), forgot/reset password, change password
- Role-based authorization middleware (`admin` / `employee`) applied per-route
- Full CRUD APIs: Users, Customers, Daily Work, Payments, Follow-ups, Quotations, Purchase Orders, Invoices, Documents (file upload via Multer), Notifications
- Payment visibility split: employees only ever receive company/invoice/balance/due-date/status fields — total revenue and other customers' full payment data are never sent to non-admin requests (enforced server-side, not just hidden in the UI)
- Dashboard aggregation endpoints (`/dashboard/admin`, `/dashboard/employee`) with real MongoDB aggregation pipelines for all the cards/graphs in your spec (monthly revenue, pending vs paid, employee activity, customer growth, recent activity)
- Security: helmet, CORS, rate limiting, mongo-sanitize, bcrypt password hashing
- Seed script (`npm run seed`) — creates a demo admin + employee + sample customers/payments/work report

**Frontend (React + Vite + Tailwind + React Query)**
- Login page with Remember Me, auto-login on refresh, protected routes, role-based route guards
- Collapsible sidebar + sticky header, role-aware navigation (admin sees everything; employee sees only their allowed modules)
- Admin Dashboard: all 8 cards + Monthly Revenue line chart, Pending vs Paid pie chart, Employee Activity bar chart, recent activity feeds — all wired to real API data via Recharts
- Employee Dashboard: scoped cards + recent activity
- Customers: searchable/paginated table, Add Customer modal, CSV export, admin-only edit/delete
- Daily Work: submission form + list, admin approve/reject actions
- Payments: role-aware table (columns differ for admin vs employee automatically, driven by what the API actually returns)
- Follow-ups, Quotations, Purchase Orders, Documents, Notifications: working list views wired to their APIs
- Reusable components: Modal, ConfirmDialog, DataTable (with loading skeletons), StatCard, StatusBadge
- Framer Motion micro-animations, Tailwind theme matching your logo colors, dark-mode-ready config (`darkMode: 'class'`)

## What's scaffolded but needs finishing (clearly marked with TODOs in code)

These were in your spec but are genuinely multi-day features on their own — the data models, routes, and list views are in place; the remaining work is:
- **PDF generation** for quotations/invoices (recommend `pdfkit` or `puppeteer` — not installed by default)
- **Email sending** (Nodemailer is installed; `sendQuotationEmail` and the forgot-password flow have TODO markers where you plug in SMTP credentials)
- **Excel import/bulk upload** (Excel *export* via CSV is done on the Customers page; full XLSX import needs `xlsx`/`multer` wiring)
- **Cloudinary** file storage (Multer currently saves to local `/uploads`; swap the storage engine in `routes/documentRoutes.js` if you want Cloudinary)
- **Audit/activity logs** as a dedicated collection (not modeled — currently `createdAt`/`updatedAt` timestamps exist on every record)
- **Settings page** (company profile, bank details) — placeholder page only; add a `Settings` model if you want it persisted
- **Customer "assignment" to employees** — the Employee Dashboard's "Assigned Customers" card currently counts all customers since there's no assignment field yet

None of this blocks running the app — it runs end-to-end today with the core ERP flows (auth, customers, daily work, payments, dashboards) fully functional.

## Getting started

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET at minimum
npm run seed            # creates demo admin/employee + sample data
npm run dev              # starts on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:5000/api
npm run dev               # starts on http://localhost:5173
```

### 3. Login
After seeding:
- **Admin:** admin@nutantechsolutions.com / Admin@123
- **Employee:** employee@nutantechsolutions.com / Employee@123

## Deployment
- **Frontend → Vercel:** set `VITE_API_URL` to your deployed backend URL in Vercel's environment variables.
- **Backend → Render:** set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL) in Render's environment variables.
- **Database → MongoDB Atlas:** create a free cluster, whitelist Render's IP (or `0.0.0.0/0` for simplicity), and use the connection string as `MONGO_URI`.

## Folder structure
```
backend/
  config/       # DB connection
  controllers/  # Route logic
  middleware/   # auth, error handling, async wrapper
  models/       # Mongoose schemas
  routes/       # Express routers
  seed/         # Demo data seeder
  server.js
frontend/
  src/
    api/          # Axios instance with JWT interceptor
    components/   # Reusable UI (Modal, DataTable, StatCard, etc.)
    context/      # AuthContext (login/logout/auto-login)
    layouts/      # DashboardLayout (sidebar + header)
    pages/        # One file per route/module
```

## Notes
- Only two roles exist (`admin`, `employee`) exactly as specified — role checks happen both in React route guards (UX) and Express middleware (actual security boundary).
- The employee payment view is restricted at the database-query level (`.select()`), not by hiding columns in the UI, so there's no way for an employee to see revenue data by inspecting API responses either.
