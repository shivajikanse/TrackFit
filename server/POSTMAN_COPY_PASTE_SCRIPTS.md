# Copy-Paste Ready Scripts for Postman

## How to Use

1. Go to any Postman request
2. Click the **"Tests"** tab
3. Copy the script from below
4. Paste it into the Tests tab
5. Click **Send**

---

## AUTH ENDPOINTS

### 1️⃣ POST /auth/register (TRAINER)

**Tests Tab Script:**

```javascript
if (pm.response.code === 201) {
  const data = pm.response.json().data;
  pm.environment.set("token", data.accessToken);
  pm.environment.set("refreshToken", data.refreshToken);
  pm.environment.set("trainerId", data.user._id);
  pm.environment.set("trainerEmail", data.user.email);

  console.log("✅ Trainer Registered!");
  console.log("ID: " + data.user._id);
  console.log("Email: " + data.user.email);
} else {
  const error = pm.response.json();
  console.log("❌ Error: " + error.message);
}
```

---

### 2️⃣ POST /auth/register (MEMBER)

**Pre-request Tab Script:**

```javascript
// Verify trainerId is set
if (!pm.environment.get("trainerId")) {
  console.log("⚠️ WARNING: trainerId not set!");
  console.log("Please register a trainer first");
}
```

**Tests Tab Script:**

```javascript
if (pm.response.code === 201) {
  const data = pm.response.json().data;
  pm.environment.set("memberToken", data.accessToken);
  pm.environment.set("memberRefreshToken", data.refreshToken);
  pm.environment.set("memberId", data.user._id);
  pm.environment.set("memberEmail", data.user.email);

  console.log("✅ Member Registered!");
  console.log("ID: " + data.user._id);
  console.log("Trainer ID: " + pm.environment.get("trainerId"));
} else {
  const error = pm.response.json();
  console.log("❌ Error: " + error.message);
}
```

---

### 3️⃣ POST /auth/login

**Tests Tab Script:**

```javascript
if (pm.response.code === 200) {
  const data = pm.response.json().data;
  const role = data.user.role;

  if (role === "trainer") {
    pm.environment.set("token", data.accessToken);
    pm.environment.set("refreshToken", data.refreshToken);
    console.log("✅ Trainer Logged In!");
  } else {
    pm.environment.set("memberToken", data.accessToken);
    pm.environment.set("memberRefreshToken", data.refreshToken);
    console.log("✅ Member Logged In!");
  }

  console.log("User: " + data.user.name);
  console.log("Role: " + role);
} else {
  console.log("❌ Login Failed");
}
```

---

### 4️⃣ POST /auth/refresh

**Tests Tab Script:**

```javascript
if (pm.response.code === 200) {
  const data = pm.response.json().data;
  pm.environment.set("token", data.accessToken);
  pm.environment.set("refreshToken", data.refreshToken);
  console.log("✅ Token Refreshed!");
} else {
  console.log("❌ Refresh Failed");
}
```

---

## WORKOUT ENDPOINTS

### 5️⃣ POST /workout/ai-generate/:memberId

**Tests Tab Script:**

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  const data = pm.response.json().data;
  pm.environment.set("workoutPlanId", data._id);
  pm.environment.set("workoutTitle", data.title);

  console.log("✅ Workout Plan Generated!");
  console.log("ID: " + data._id);
  console.log("Title: " + data.title);
  console.log("Duration: " + data.durationWeeks + " weeks");
} else {
  const error = pm.response.json();
  console.log("❌ Generation Failed: " + error.message);
}
```

---

### 6️⃣ GET /workout/my-plan

**Tests Tab Script:**

```javascript
if (pm.response.code === 200) {
  const data = pm.response.json().data;

  if (data) {
    pm.environment.set("workoutPlanId", data._id);
    console.log("✅ Workout Plan Retrieved!");
    console.log("Title: " + data.title);
    console.log("Duration: " + data.durationWeeks + " weeks");
  } else {
    console.log("ℹ️ No workout plan assigned yet");
  }
}
```

---

### 7️⃣ GET /workout/:planId

**Tests Tab Script:**

```javascript
if (pm.response.code === 200) {
  const data = pm.response.json().data;
  console.log("✅ Workout Retrieved!");
  console.log("Title: " + data.title);
  console.log("Days: " + data.schedule.length);
}
```

---

## DIET ENDPOINTS

### 8️⃣ POST /diet/ai-generate/:memberId

**Tests Tab Script:**

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  const data = pm.response.json().data;
  pm.environment.set("dietPlanId", data._id);
  pm.environment.set("dietTitle", data.title);

  console.log("✅ Diet Plan Generated!");
  console.log("ID: " + data._id);
  console.log("Title: " + data.title);
  console.log("Calories: " + data.targetCalories);
} else {
  const error = pm.response.json();
  console.log("❌ Generation Failed: " + error.message);
}
```

---

### 9️⃣ GET /diet/my-plan

**Tests Tab Script:**

```javascript
if (pm.response.code === 200) {
  const data = pm.response.json().data;

  if (data) {
    pm.environment.set("dietPlanId", data._id);
    console.log("✅ Diet Plan Retrieved!");
    console.log("Title: " + data.title);
    console.log("Target Calories: " + data.targetCalories);
  } else {
    console.log("ℹ️ No diet plan assigned yet");
  }
}
```

---

## PROGRESS ENDPOINTS

### 🔟 POST /progress/log

**Tests Tab Script:**

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  const data = pm.response.json().data;
  pm.environment.set("progressId", data._id);

  console.log("✅ Progress Logged!");
  console.log("ID: " + data._id);
  console.log("Date: " + data.date);
  console.log("Weight: " + data.weight + " kg");
  console.log("Workout Completed: " + data.workoutCompleted);
} else {
  const error = pm.response.json();
  console.log("❌ Log Failed: " + error.message);
}
```

---

### 1️⃣1️⃣ GET /progress/history

**Tests Tab Script:**

```javascript
if (pm.response.code === 200) {
  const data = pm.response.json().data;
  console.log("✅ Progress History Retrieved!");
  console.log("Total Logs: " + data.length);

  if (data.length > 0) {
    console.log("Latest: " + data[0].date);
    console.log("Weight: " + data[0].weight + " kg");
  }
}
```

---

### 1️⃣2️⃣ GET /progress/analytics

**Tests Tab Script:**

```javascript
if (pm.response.code === 200) {
  const data = pm.response.json().data;
  console.log("✅ Analytics Retrieved!");
  console.log("Total Logs: " + data.totalLogs);
  console.log(
    "Avg Weight: " +
      (data.avgWeight ? data.avgWeight.toFixed(1) : "N/A") +
      " kg",
  );
  console.log(
    "Completion Rate: " +
      (data.completionRate ? data.completionRate.toFixed(1) : "N/A") +
      "%",
  );
}
```

---

## MEMBER ENDPOINTS

### 1️⃣3️⃣ POST /member/notes

**Tests Tab Script:**

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  const data = pm.response.json().data;
  pm.environment.set("noteId", data._id);

  console.log("✅ Note Created!");
  console.log("ID: " + data._id);
  console.log("Title: " + data.title);
} else {
  console.log("❌ Failed");
}
```

---

### 1️⃣4️⃣ GET /member/notes

**Tests Tab Script:**

```javascript
if (pm.response.code === 200) {
  const data = pm.response.json().data;
  console.log("✅ Notes Retrieved!");
  console.log("Total Notes: " + data.length);
}
```

---

### 1️⃣5️⃣ GET /member/inbox

**Tests Tab Script:**

```javascript
if (pm.response.code === 200) {
  const data = pm.response.json().data;
  console.log("✅ Inbox Retrieved!");
  console.log("Total Messages: " + data.length);

  if (data.length > 0) {
    console.log("Latest: " + data[0].title);
  }
}
```

---

## TRAINER ENDPOINTS

### 1️⃣6️⃣ POST /trainer/member

**Tests Tab Script:**

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  const data = pm.response.json().data;
  pm.environment.set("memberId", data._id);

  console.log("✅ Member Added!");
  console.log("ID: " + data._id);
  console.log("Email: " + data.email);
} else {
  const error = pm.response.json();
  console.log("❌ Error: " + error.message);
}
```

---

### 1️⃣7️⃣ GET /trainer/members

**Tests Tab Script:**

```javascript
if (pm.response.code === 200) {
  const data = pm.response.json().data;
  console.log("✅ Members Retrieved!");
  console.log("Total Members: " + data.length);

  if (data.length > 0) {
    pm.environment.set("memberId", data[0]._id);
    console.log("First Member: " + data[0].name);
    console.log("Saved ID: " + data[0]._id);
  }
}
```

---

### 1️⃣8️⃣ GET /trainer/members/:memberId

**Tests Tab Script:**

```javascript
if (pm.response.code === 200) {
  const data = pm.response.json().data;
  console.log("✅ Member Details Retrieved!");
  console.log("Name: " + data.name);
  console.log("Email: " + data.email);
  console.log("Status: " + (data.isActive ? "Active" : "Inactive"));
}
```

---

### 1️⃣9️⃣ GET /trainer/dashboard

**Tests Tab Script:**

```javascript
if (pm.response.code === 200) {
  const data = pm.response.json().data;
  console.log("✅ Dashboard Data Retrieved!");
  console.log("Total Members: " + data.totalMembers);
  console.log("Active Workouts: " + data.activeWorkouts);
  console.log("Progress Logs: " + data.progressLogs);
}
```

---

### 2️⃣0️⃣ POST /trainer/broadcast

**Tests Tab Script:**

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  const data = pm.response.json().data;
  pm.environment.set("broadcastId", data._id);

  console.log("✅ Broadcast Sent!");
  console.log("ID: " + data._id);
  console.log("Recipients: " + data.recipients.length);
} else {
  console.log("❌ Failed");
}
```

---

## UNIVERSAL SCRIPTS

### Error Handler (Add to all requests)

**Tests Tab Script:**

```javascript
// Universal error handling
if (pm.response.code >= 400) {
  const error = pm.response.json();
  console.log("❌ HTTP " + pm.response.code);
  console.log("Error: " + error.message);
} else {
  console.log("✅ Success: " + pm.response.code);
}
```

---

### Response Debugger

**Tests Tab Script:**

```javascript
// Print entire response for debugging
console.log("Full Response:");
console.log(JSON.stringify(pm.response.json(), null, 2));
```

---

### Variable Inspector

**Tests Tab Script:**

```javascript
// Check all saved variables
console.log("=== Environment Variables ===");
console.log("Token: " + (pm.environment.get("token") ? "✅" : "❌"));
console.log("Trainer ID: " + (pm.environment.get("trainerId") ? "✅" : "❌"));
console.log("Member ID: " + (pm.environment.get("memberId") ? "✅" : "❌"));
console.log(
  "Workout Plan: " + (pm.environment.get("workoutPlanId") ? "✅" : "❌"),
);
console.log("Diet Plan: " + (pm.environment.get("dietPlanId") ? "✅" : "❌"));
```

---

## Tips

✅ **Copy exactly as shown** - no modifications needed
✅ **Scripts run automatically** after each request
✅ **Check Console** for output (Ctrl+Alt+C)
✅ **Variables persist** across requests in same session
✅ **Use {{variableName}}** in URL and body for saved values

Ready to paste! 🚀
