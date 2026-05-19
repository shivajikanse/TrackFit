import api from "./api";

// ── AUTH ──────────────────────────────────────────────
export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
};

// ── TRAINER ───────────────────────────────────────────
export const trainerService = {
  getDashboard: () => api.get("/trainer/dashboard"),
  getMembers: () => api.get("/trainer/members"),
  getMember: (id) => api.get(`/trainer/members/${id}`),
  addMember: (data) => api.post("/trainer/member", data),
  deleteMember: (id) => api.delete(`/trainer/members/${id}`),
  broadcast: (data) => api.post("/messages/broadcast", data),
  sendToSelected: (data) => api.post("/messages/send", data),
  getSentMessages: () => api.get("/messages/sent"),
};

// ── WORKOUT ───────────────────────────────────────────
export const workoutService = {
  getMyPlan: () => api.get("/workout/my-plan"),
  assignWorkout: (memberId, data) =>
    api.post(`/workout/assign/${memberId}`, data),
  updateWorkout: (workoutId, data) => api.put(`/workout/${workoutId}`, data),
  deleteWorkout: (workoutId) => api.delete(`/workout/${workoutId}`),
  aiGenerate: (memberId, data) =>
    api.post(`/workout/ai-generate/${memberId}`, data),
  getForMember: (memberId) => api.get(`/workout/${memberId}`),
};

// ── DIET ──────────────────────────────────────────────
export const dietService = {
  getMyPlan: () => api.get("/diet/my-plan"),
  assignDiet: (memberId, data) => api.post(`/diet/assign/${memberId}`, data),
  updateDiet: (dietId, data) => api.put(`/diet/${dietId}`, data),
  aiGenerate: (memberId, data) =>
    api.post(`/diet/ai-generate/${memberId}`, data),
  getForMember: (memberId) => api.get(`/diet/${memberId}`),
};

// ── PROGRESS ──────────────────────────────────────────
export const progressService = {
  logProgress: (data) => api.post("/progress/log", data),
  getAnalytics: () => api.get("/progress/analytics"),
  getHistory: () => api.get("/progress/history"),
};

// ── MEMBER ────────────────────────────────────────────
export const memberService = {
  getAiFeedback: () => api.get("/member/ai-feedback"),
  getInbox: () => api.get("/messages/inbox"),
  getNotes: () => api.get("/member/notes"),
  createNote: (data) => api.post("/member/notes", data),
  updateNote: (id, data) => api.put(`/member/notes/${id}`, data),
  deleteNote: (id) => api.delete(`/member/notes/${id}`),
  // Profile endpoints
  getProfile: () => api.get("/member/profile"),
  updateProfile: (data) => api.put("/member/profile", data),
  getMemberProfile: (memberId) => api.get(`/member/profile/${memberId}`),
  getMemberProfileForAI: (memberId) =>
    api.get(`/member/profile-ai/${memberId}`),
};
