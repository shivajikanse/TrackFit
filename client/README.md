# TrackFit — Elite Fitness SaaS Platform

A full-stack fitness platform connecting gym trainers and members with AI-powered plans, real-time tracking, and intelligent feedback.

---

## 🚀 Quick Start

```bash
cd trackfit
npm install
npm run dev
```

Open http://localhost:5173

---

## 🧱 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + CSS Variables |
| Animation | Framer Motion |
| State | Zustand (persisted) |
| HTTP | Axios (with JWT interceptor) |
| Charts | Recharts |
| Routing | React Router DOM v6 |
| Toasts | React Hot Toast |
| Icons | Lucide React |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx       ← Collapsible, role-aware sidebar
│   │   └── TopBar.jsx        ← Header with user info
│   └── ui/
│       └── index.jsx         ← StatCard, Badge, Modal, Input, etc.
├── layouts/
│   └── DashboardLayout.jsx   ← Sidebar + TopBar + Outlet
├── pages/
│   ├── public/
│   │   ├── Landing.jsx       ← Hero landing page
│   │   ├── Login.jsx         ← Auth login
│   │   └── Register.jsx      ← Auth register (trainer/member)
│   ├── trainer/
│   │   ├── TrainerDashboard.jsx
│   │   ├── MembersList.jsx
│   │   ├── MemberDetail.jsx
│   │   ├── AssignPlans.jsx   ← Workout + Diet builder with AI generate
│   │   └── Broadcast.jsx     ← All/selected member messaging
│   └── member/
│       ├── MemberDashboard.jsx
│       ├── MyWorkout.jsx     ← Daily workout with check-off
│       ├── MyDiet.jsx        ← Meal plan with macro breakdown
│       ├── Progress.jsx      ← Log + charts (weight/calories/sessions)
│       ├── AiFeedback.jsx    ← AI score + insights + recommendations
│       ├── Notes.jsx         ← Private notes (trainer cannot see)
│       └── Inbox.jsx         ← Messages from trainer
├── services/
│   ├── api.js                ← Axios instance + interceptors
│   └── index.js              ← authService, trainerService, workoutService, etc.
├── store/
│   └── index.js              ← Zustand auth + app store
├── App.jsx                   ← Routes + protected route guard
└── main.jsx                  ← Entry point
```

---

## 🔐 Auth Flow

1. Register as **Trainer** or **Member**
2. JWT stored via Zustand persist (localStorage)
3. Axios auto-attaches Bearer token on every request
4. Role-based route guards redirect unauthorized users
5. 401 response → auto logout + redirect to `/login`

---

## 🌐 API Base URL

All requests proxy to:
```
/api/v1  →  http://localhost:5000/api/v1
```

Change the proxy target in `vite.config.js` to match your backend.

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#0A0A0A` |
| Primary Accent | `#FF3C2F` |
| Muted BG | `#1A1A1A` / `#2A2A2A` |
| Success | `#39FF14` |
| Warning | `#FFB800` |
| Display Font | Bebas Neue |
| Heading Font | Oswald |
| Body Font | DM Sans |

CSS variables defined in `src/index.css`.

---

## 📄 Pages

### Public
- `/` — Landing page with hero, features, CTA
- `/login` — Login with demo account buttons
- `/register` — Register as trainer or member

### Trainer (requires trainer role)
- `/trainer` — Dashboard with stats + charts + member table
- `/trainer/members` — Full member roster with add/delete
- `/trainer/members/:id` — Member profile + weight trend + quick actions
- `/trainer/plans` — Assign workout & diet plans + AI generate
- `/trainer/broadcast` — Send messages to all or selected members

### Member (requires member role)
- `/member` — Dashboard with streak, progress chart, today's workout preview
- `/member/workout` — Today's workout with exercise check-off + progress bar
- `/member/diet` — Full meal plan with expandable macro breakdown
- `/member/progress` — Log daily progress + weight/calories/sessions charts
- `/member/ai-feedback` — AI performance score + insights + recommendations
- `/member/notes` — Private notes with color coding (trainer cannot see)
- `/member/inbox` — Messages from trainer with filter tabs

---

## 🤖 AI Integration Points

| Route | Endpoint | Description |
|---|---|---|
| AI Workout | `POST /api/v1/workout/ai-generate/:memberId` | Sends member stats → gets workout plan |
| AI Diet | `POST /api/v1/diet/ai-generate/:memberId` | Sends member goals → gets diet plan |
| AI Feedback | `GET /api/v1/member/ai-feedback` | Analyzes progress logs → returns insights |

All AI routes have graceful fallback to mock data when backend is unavailable.

---

## 🧪 Demo Accounts (add to your backend seed)

```js
// Trainer
{ email: 'trainer@demo.com', password: 'password123', role: 'trainer' }

// Member  
{ email: 'member@demo.com', password: 'password123', role: 'member' }
```

---

## 🛠 Build for Production

```bash
npm run build
npm run preview
```

Output in `dist/` folder.

---

Built for elite performance. 🔥
