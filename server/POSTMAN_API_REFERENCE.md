# TrackFit API - Postman Reference Guide

## Quick Start

### 1. Import the Collection into Postman

1. Open **Postman**
2. Click **"Import"** (top left)
3. Select **"Upload Files"** and choose `TrackFit-API.postman_collection.json`
4. Click **"Import"**

### 2. Set Environment Variables

After importing, set these variables in Postman:

| Variable        | Value                 | Example                 |
| --------------- | --------------------- | ----------------------- |
| `baseURL`       | Your API base URL     | `http://localhost:5000` |
| `token`         | JWT token after login | Get from login response |
| `refreshToken`  | Refresh token         | Get from login response |
| `memberId`      | Member ID             | From user object        |
| `workoutPlanId` | Workout plan ID       | From workout creation   |
| `dietPlanId`    | Diet plan ID          | From diet creation      |
| `progressId`    | Progress log ID       | From progress log       |
| `noteId`        | Note ID               | From note creation      |

**How to set variables in Postman:**

- Click **"Environments"** or **"Variables"** at the top
- Find **"TrackFit API"** environment
- Add/update the variables with your values

---

## API Endpoints Overview

### 1. **Authentication** (`/api/v1/auth`)

| Method | Endpoint    | Description              | Auth Required |
| ------ | ----------- | ------------------------ | ------------- |
| POST   | `/register` | Register new user        | ❌            |
| POST   | `/login`    | Login & get token        | ❌            |
| POST   | `/refresh`  | Refresh JWT token        | ❌            |
| GET    | `/me`       | Get current user profile | ✅            |
| PUT    | `/me`       | Update user profile      | ✅            |
| POST   | `/logout`   | Logout user              | ✅            |

**Register/Login Flow:**

```
1. POST /register → Create account
2. POST /login → Get token + refreshToken
3. Use token in Authorization header for all other requests
4. When token expires, use /refresh endpoint
```

---

### 2. **Workout Plans** (`/api/v1/workout`)

#### Member Routes

| Method | Endpoint   | Description          | Auth | Role   |
| ------ | ---------- | -------------------- | ---- | ------ |
| GET    | `/my-plan` | Get assigned workout | ✅   | Member |

#### Trainer Routes

| Method | Endpoint                 | Description              | Auth | Role    |
| ------ | ------------------------ | ------------------------ | ---- | ------- |
| POST   | `/assign/:memberId`      | Assign workout to member | ✅   | Trainer |
| POST   | `/ai-generate/:memberId` | Generate AI workout plan | ✅   | Trainer |
| GET    | `/member/:memberId`      | Get member's workouts    | ✅   | Trainer |
| PUT    | `/:planId`               | Update workout plan      | ✅   | Trainer |
| DELETE | `/:planId`               | Delete workout plan      | ✅   | Trainer |

#### Shared Routes

| Method | Endpoint   | Description         | Auth |
| ------ | ---------- | ------------------- | ---- |
| GET    | `/:planId` | Get workout details | ✅   |

**AI Generate Workout:**

```
The system uses your configured AI provider to generate personalized plans based on:
- Member's age, weight, height
- Fitness goals
- Activity level
- Medical conditions
Set AI_PROVIDER in .env (gemini | openai | claude)
```

---

### 3. **Diet Plans** (`/api/v1/diet`)

#### Member Routes

| Method | Endpoint   | Description       | Auth | Role   |
| ------ | ---------- | ----------------- | ---- | ------ |
| GET    | `/my-plan` | Get assigned diet | ✅   | Member |

#### Trainer Routes

| Method | Endpoint                 | Description           | Auth | Role    |
| ------ | ------------------------ | --------------------- | ---- | ------- |
| POST   | `/assign/:memberId`      | Assign diet to member | ✅   | Trainer |
| POST   | `/ai-generate/:memberId` | Generate AI diet plan | ✅   | Trainer |
| GET    | `/member/:memberId`      | Get member's diets    | ✅   | Trainer |
| PUT    | `/:planId`               | Update diet plan      | ✅   | Trainer |
| DELETE | `/:planId`               | Delete diet plan      | ✅   | Trainer |

**AI Generate Diet:**

```
Generates personalized nutrition plans using AI based on:
- Member's profile (age, weight, height)
- Fitness goals
- Allergies and restrictions
- Activity level
Returns: Daily meal schedules with calorie targets
```

---

### 4. **Progress Tracking** (`/api/v1/progress`)

#### Member Routes

| Method | Endpoint     | Description            | Auth | Role   |
| ------ | ------------ | ---------------------- | ---- | ------ |
| POST   | `/log`       | Log daily progress     | ✅   | Member |
| GET    | `/history`   | Get progress history   | ✅   | Member |
| GET    | `/analytics` | Get progress analytics | ✅   | Member |

#### Trainer Routes

| Method | Endpoint                     | Description          | Auth | Role    |
| ------ | ---------------------------- | -------------------- | ---- | ------- |
| GET    | `/history/:memberId`         | Get member progress  | ✅   | Trainer |
| GET    | `/analytics/:memberId`       | Get member analytics | ✅   | Trainer |
| PUT    | `/:progressId/trainer-notes` | Add feedback notes   | ✅   | Trainer |

**Progress Log Fields:**

```json
{
  "date": "2026-04-25",
  "weight": 75,
  "workoutCompleted": true,
  "caloriesConsumed": 2200,
  "energyLevel": 8,
  "mood": "great",
  "sleepHours": 8,
  "notes": "Optional personal notes"
}
```

---

### 5. **Member Dashboard** (`/api/v1/member`)

| Method | Endpoint         | Description                 | Auth |
| ------ | ---------------- | --------------------------- | ---- |
| GET    | `/ai-feedback`   | Get AI feedback on progress | ✅   |
| POST   | `/notes`         | Create personal note        | ✅   |
| GET    | `/notes`         | Get all notes               | ✅   |
| PUT    | `/notes/:noteId` | Update note                 | ✅   |
| DELETE | `/notes/:noteId` | Delete note                 | ✅   |
| GET    | `/inbox`         | Get broadcast messages      | ✅   |

---

### 6. **Trainer Dashboard** (`/api/v1/trainer`)

| Method | Endpoint             | Description         | Auth | Role    |
| ------ | -------------------- | ------------------- | ---- | ------- |
| GET    | `/dashboard`         | Get dashboard stats | ✅   | Trainer |
| POST   | `/member`            | Add member to team  | ✅   | Trainer |
| GET    | `/members`           | Get all members     | ✅   | Trainer |
| GET    | `/members/:memberId` | Get member details  | ✅   | Trainer |
| DELETE | `/members/:memberId` | Remove member       | ✅   | Trainer |
| POST   | `/broadcast`         | Send announcement   | ✅   | Trainer |
| GET    | `/broadcasts`        | Get sent broadcasts | ✅   | Trainer |

---

## Testing Workflow Example

### Step 1: Register & Login

```
1. POST /auth/register with trainer credentials
2. POST /auth/login to get token
3. Copy token to {{token}} variable
4. Copy refreshToken to {{refreshToken}} variable
```

### Step 2: Add Members (Trainer)

```
1. POST /trainer/member with member email
2. Save member ID to {{memberId}}
```

### Step 3: Generate & Assign Plans

```
1. POST /workout/ai-generate/:memberId (generates AI workout)
2. POST /diet/ai-generate/:memberId (generates AI diet)
3. Member logs in and GET /workout/my-plan
```

### Step 4: Track Progress

```
1. Member: POST /progress/log with daily metrics
2. Member: GET /progress/analytics
3. Trainer: GET /progress/analytics/:memberId for member data
```

### Step 5: Communication

```
1. Trainer: POST /trainer/broadcast to send announcement
2. Member: GET /member/inbox to receive messages
```

---

## Error Handling

### Common Errors

| Status | Error             | Solution                                        |
| ------ | ----------------- | ----------------------------------------------- |
| 401    | Unauthorized      | Token missing or expired. Use refresh endpoint. |
| 403    | Forbidden         | User doesn't have permission. Check role.       |
| 404    | Not Found         | Resource doesn't exist. Verify ID.              |
| 422    | Validation Failed | Request body has invalid data. Check format.    |
| 500    | Server Error      | Internal server error. Check logs.              |

### Example Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

---

## Authentication Header

All protected endpoints require:

```
Authorization: Bearer {{token}}
```

Postman handles this automatically if you set the `token` variable.

---

## Notes

- **AI Provider**: Set `AI_PROVIDER` in `.env` to `gemini`, `openai`, or `claude`
- **Base URL**: Default is `http://localhost:5000`
- **JWT Expiration**: Tokens expire after time set in `.env` (default: 7 days)
- **Refresh Token**: Use `/auth/refresh` when access token expires

---

## Tips for Testing

1. **Save responses** to use in subsequent requests
2. **Use Postman Tests** to extract IDs from responses
3. **Collection Variables** persist across requests
4. **Pre-request Scripts** can set dynamic values
5. **Mock data** in request bodies for testing

---

## Need Help?

- Check [Postman Documentation](https://learning.postman.com/)
- Review server logs: `logs/app.log`
- Verify MongoDB is running
- Check `.env` configuration
