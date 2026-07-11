# MaintainIQ - Operations & Asset Maintenance Portal

MaintainIQ is a responsive web application designed to manage facilities, log equipment specs, generate physical QR identification tags, analyze maintenance complaints using AI Triage, and track technician workflows.

---

## Workspace Structure

- **/backend**: Node.js, Express, and MongoDB. Handles auth, database modeling, asset history tracking, and OpenAI API chat completions.
- **/frontend**: Next.js (TypeScript), Tailwind CSS, and Axios client API mappings.

---

## Deployment & Architecture

- **Frontend (Production):** Deployed on Vercel — fast global CDN, automatic Next.js optimizations, and preview deployments on pull requests. Use the Vercel dashboard or `NEXT_PUBLIC_API_URL` to point the client at the production API.
- **Backend (Production):** Deployed on Render — Node/Express API with MongoDB connectivity. The API exposes endpoints under `/api/*` and uses JWT for protected routes.
- **OpenAI / AI Integration:** The backend consumes OpenAI's API (chat/completions) for AI triage and suggestion features. Provide `OPENAI_API_KEY` in the `backend/.env` for full AI functionality. When the key is missing, the app falls back to safe diagnostics to avoid runtime failures.

These deployment choices allow the UI to scale globally (Vercel) while keeping server-side logic and secret keys on a managed provider (Render).

## Key Technologies & Integrations (What Makes This Project Stand Out)

- **Modern full-stack framework:** Next.js (app router + TypeScript) for server/client rendering, paired with an Express API for flexible server-side workflows.
- **AI-first features:** OpenAI API integration for complaint triage, title/categorization suggestions, and prioritized recommendations — improves technician workflows and reduces triage time.
- **Realtime-ready data flow:** Axios client with JWT auth + clearly separated public vs protected routes; audit/history logs for traceability and QR code generation for asset tagging.
- **Design & DX:** Tailwind CSS + components, accessible layouts, and Vercel preview deployments for fast iteration and demoing to stakeholders.
- **Deploy-ready:** Environment-driven configuration (`.env`), deployment targets (Vercel + Render), and clear separation of concerns between frontend and backend make this repo ready for production demos.


---

## Getting Started

### 1. Database Setup
Ensure you have a running MongoDB instance. By default, the application connects to:
`mongodb://localhost:27017/maintainiq`

### 2. Backend Installation & Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration:
   ```bash
   cp .env.example .env
   ```
4. Fill out the `.env` variables (e.g. `JWT_SECRET_KEY`, `OPENAI_API_KEY`, etc. See below for details).
5. Start the server:
   ```bash
   npm run dev
   ```
   *The server runs by default at `http://localhost:6500`.*

### 3. Frontend Installation & Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration:
   ```bash
   cp .env.example .env
   ```
4. Start the development client:
   ```bash
   npm run dev
   ```
   *The client runs by default at `http://localhost:3000`.*

---

## Configuration Variables

### Backend `.env`
Create a `.env` file in the `backend/` directory with:
```env
PORT=6500
MONGO_URI=mongodb://localhost:27017/maintainiq
JWT_SECRET_KEY=your_jwt_secret_key_here
PORTAL_EMAIL=your_email@example.com
PORTAL_PASSWORD=your_email_password_or_app_password
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key_here
```
*Note: If `OPENAI_API_KEY` is empty, mocked, or set to placeholder string, the system will use a graceful fallback diagnostic model automatically without throwing exceptions.*

### Frontend `.env`
Create a `.env` file in the `frontend/` directory with:
```env
NEXT_PUBLIC_API_URL=http://localhost:6500/api
```

---

## Demo Credentials & Setup

To demo the app, register roles on the `/register` page:

1. **Admin Portal User**:
   - Register an account with role set to **Administrator (Admin)**.
   - Access URL: `/dashboard` (auto-redirects to `/dashboard/assets` list page).
   - *Admins can create assets, view asset details, download/preview QR codes, inspect audit history logs, and assign/reallocate technicians.*

2. **Technician User**:
   - Register an account with role set to **Technician**.
   - Access URL: `/my-issues`.
   - *Technicians can inspect issues assigned to them, trigger allowed workflow state changes (e.g. "Start Inspection", "Start Maintenance"), and submit expense/resolution reports.*

---

## Seed Data Suggestions

To test the application quickly, create the following seed records via the **Admin Portal** (`/dashboard/assets/new`):

### Sample Assets
1. **Asset Code**: `ELEC-GEN-01`
   - **Name**: Emergency Diesel Generator 750kVA
   - **Category**: Electrical
   - **Location**: Building A Basement Generator Room
   - **Condition**: Good
   - **Status**: Operational
2. **Asset Code**: `HVAC-CHILL-04`
   - **Name**: Central Chilled Water Compressor
   - **Category**: HVAC
   - **Location**: Roof Deck Zone B
   - **Condition**: Fair
   - **Status**: Operational

### Sample Issue Reports
Open a public page (`/asset/{assetCode}/report`) without logging in to submit reports:
1. **Asset Code**: `ELEC-GEN-01`
   - **Complaint Text**: "The generator motor is vibrating excessively and there is a faint warning indicator flashing red on the main console board."
   - **AI Analysis**: Will suggest Title: *Generator Excessive Vibration*, Category: *Electrical*, Priority: *High*, and recommend checking mounts and indicator codes.
2. **Asset Code**: `HVAC-CHILL-04`
   - **Complaint Text**: "The compressor is leaking water from the primary valve connector and is making a low humming noise."
   - **AI Analysis**: Will suggest Title: *Water Leak on Compressor Valve*, Category: *HVAC*, Priority: *Medium*, and list initial inspection items.
