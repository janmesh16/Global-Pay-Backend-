# GlobalPay – Real-Time Cross-Border Payments System

GlobalPay is a modern cross-border money transfer platform featuring a full-stack architecture with a Node.js/Express backend API and a React 18 + Vite frontend web application.

---

## 📁 Repository Structure

```
globalpay/
├── backend/      # Node.js/Express REST API, Socket.io server, MongoDB, Firebase Admin
├── frontend/     # React 18 + Vite SPA, Tailwind CSS, TanStack Query, Socket.io client
├── docs/         # System architecture & Postman collection documentation
├── package.json  # Root monorepo launcher with concurrently
└── README.md     # Root instructions
```

---

## ⚡ Quick Start (Run Locally)

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB (Running locally on `27017` or a MongoDB Atlas URI)

### 1. Install Dependencies
```bash
# Install root launcher
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment Variables

#### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/globalpay
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
ECB_API_URL=https://api.exchangerate-api.com/v4/latest/USD
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
```

### 3. Seed Initial Demo Data (Rates, Limits, Demo Users)
```bash
cd backend && npm run seed
```

### 4. Run Both Applications Concurrently
From the project root:
```bash
npm run dev
```

- **Frontend Application:** http://localhost:5173
- **Backend API Server:** http://localhost:5000/api
- **API Documentation (Swagger):** http://localhost:5000/api-docs

---

## 🚀 Key Features

### 👤 User Web App (`/app`)
- **Multi-Currency Wallet:** Instant deposit, real-time balance updates, and transaction ledger.
- **Send Money Wizard:** 4-step transfer workflow with live ECB exchange rates, transparent fee calculations, and idempotency protection.
- **Real-Time Tracking Timeline:** Socket.io room subscription for status updates (`pending` → `processing` → `completed` / `flagged`).
- **Recipients Management:** Full CRUD management of international bank accounts.
- **KYC Verification:** Identity document submission and status tracking.
- **Notification Inbox & Push:** Web Push (FCM) & in-app notification center.

### 🛡️ Admin Console (`/admin`)
- **KPI Metrics Dashboard:** Transaction throughput volume, revenue, success rate, and interactive Recharts visualizations.
- **User & Wallet Control:** Freeze/unfreeze wallets, change account statuses, and perform manual wallet adjustments with audit trails.
- **AML & Compliance Review Queue:** Inspect automated risk-scored transactions, approve or reject flagged transfers with officer notes.
- **System Limits & Fees:** Dynamically update fee percentages, daily limits, and AML flagging thresholds.
- **Analytics & Export:** Export system reports and transaction history to CSV.

---

## 🧪 Testing

```bash
# Run unit & component tests across frontend and backend
npm test
```
