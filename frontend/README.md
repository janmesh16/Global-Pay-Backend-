# GlobalPay – Frontend Application

High-performance, modern web app for GlobalPay built with React 18, Vite, Tailwind CSS, TanStack Query, Zustand, React Hook Form, Zod, Socket.io, and Firebase.

## 🚀 Setup & Execution

```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Run Vitest test suite
npm test

# Build production bundle
npm run build
```

## 🛠️ Stack Summary
- **Framework:** React 18 + Vite (JSX)
- **Routing:** React Router v6 (Lazy loaded pages with Protected & Role Guards)
- **Server State:** TanStack Query (Query Caching & Auto-Invalidation)
- **Client State:** Zustand (Auth session, Theme persistence, Notification Inbox)
- **Styling:** Tailwind CSS, custom design system tokens (Dark Mode, Glassmorphism)
- **Icons & UI Primitives:** Radix UI, Lucide React, Sonner Toasts
- **Realtime:** socket.io-client (JWT Handshake, Live Timelines & Events)
- **Push:** Firebase JS SDK (Google Auth & FCM Web Push)
- **Money Math:** Decimal.js for precise conversion calculations, Intl.NumberFormat for rendering
