# 🏋️ Fitness Tracker Backend

AI-Powered Fitness Management Platform for Gym Trainers & Members.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Anthropic or OpenAI API key

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and fill in your values
```

### 3. Run in Development
```bash
npm run dev
```

### 4. Run in Production
```bash
npm start
```

---

## 🐳 Docker Deployment

### Production (API + MongoDB)
```bash
cp .env.example .env
# Fill in your secrets in .env

docker-compose up -d
```

### Development (with Mongo Express UI)
```bash
docker-compose --profile dev up -d
# Access Mongo Express at http://localhost:8081
```

### Build & Push Image
```bash
docker build -t fitness-tracker-api:latest .
docker tag fitness-tracker-api:latest your-registry/fitness-tracker-api:latest
docker push your-registry/fitness-tracker-api:latest
```

---

## ☁️ Cloud Deployment

### Render.com (Free Tier)
1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect your repo
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`
6. Add all environment variables from `.env.example`
7. Add MongoDB Atlas URI as `MONGO_URI_PROD`

### Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
railway variables set JWT_SECRET=... MONGO_URI_PROD=... ANTHROPIC_API_KEY=...
```

### AWS EC2 / DigitalOcean
```bash
# On server:
git clone <your-repo>
cd fitness-tracker-backend
cp .env.example .env && nano .env  # fill in values
docker-compose up -d

# Install nginx reverse proxy
sudo apt install nginx
# Point nginx to localhost:5000
```

### Heroku
```bash
heroku create fitness-tracker-api
heroku config:set JWT_SECRET=... MONGO_URI_PROD=... ANTHROPIC_API_KEY=...
git push heroku main
```

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

### Authentication
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register trainer or member |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| GET | `/api/auth/me` | Private | Get own profile |
| PUT | `/api/auth/me` | Private | Update profile |
| POST | `/api/auth/logout` | Private | Logout |

### Trainer
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/trainer/dashboard` | Trainer | Dashboard stats |
| POST | `/api/trainer/member` | Trainer | Add member by email |
| GET | `/api/trainer/members` | Trainer | List all members |
| GET | `/api/trainer/members/:id` | Trainer | Member details + plans |
| DELETE | `/api/trainer/members/:id` | Trainer | Remove member |
| POST | `/api/trainer/broadcast` | Trainer | Broadcast message |
| GET | `/api/trainer/broadcasts` | Trainer | Get all broadcasts |

### Workout Plans
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/workout/assign/:memberId` | Trainer | Assign manual plan |
| POST | `/api/workout/ai-generate/:memberId` | Trainer | AI-generate plan |
| GET | `/api/workout/my-plan` | Member | Get active plan |
| GET | `/api/workout/member/:memberId` | Trainer | Get member's plans |
| PUT | `/api/workout/:planId` | Trainer | Update plan |
| DELETE | `/api/workout/:planId` | Trainer | Delete plan |

### Diet Plans
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/diet/assign/:memberId` | Trainer | Assign manual diet |
| POST | `/api/diet/ai-generate/:memberId` | Trainer | AI-generate diet |
| GET | `/api/diet/my-plan` | Member | Get active diet |
| GET | `/api/diet/member/:memberId` | Trainer | Get member's diets |

### Progress
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/progress/log` | Member | Log daily progress |
| GET | `/api/progress/history` | Member | Own progress history |
| GET | `/api/progress/analytics` | Member | Progress analytics |
| GET | `/api/progress/history/:memberId` | Trainer | Member's history |
| GET | `/api/progress/analytics/:memberId` | Trainer | Member's analytics |
| PUT | `/api/progress/:id/trainer-notes` | Trainer | Add trainer notes |

### Member
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/member/ai-feedback` | Member | Get AI feedback on progress |
| POST | `/api/member/notes` | Both | Create note |
| GET | `/api/member/notes` | Both | Get notes |
| PUT | `/api/member/notes/:id` | Both | Update own note |
| DELETE | `/api/member/notes/:id` | Both | Delete own note |
| GET | `/api/member/inbox` | Member | Get broadcasts |

---

## 🔒 Security Features
- JWT access + refresh token rotation
- bcrypt password hashing (12 rounds)
- Helmet.js security headers
- MongoDB injection sanitization
- HTTP Parameter Pollution protection
- CORS with whitelist
- Role-based access control
- Rate limiting (global + auth-specific)
- Graceful shutdown handling

---

## 📊 Health Check
```
GET /health
```
Returns server status, uptime, environment.

---

## 🤖 AI Configuration
Set `AI_PROVIDER=claude` (default) or `AI_PROVIDER=openai` in `.env`.

- **Claude**: Set `ANTHROPIC_API_KEY`
- **OpenAI**: Set `OPENAI_API_KEY`

---

## 📁 Project Structure
```
src/
├── config/         # DB config
├── controllers/    # Route handlers
├── middleware/     # Auth, validation, error handling
├── models/         # Mongoose schemas
├── routes/         # Express routers
├── services/       # AI service
├── utils/          # Logger, API response helpers
└── server.js       # App entry point
```
