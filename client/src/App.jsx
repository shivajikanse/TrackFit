import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store";
import { ErrorBoundary } from "./components/ErrorBoundary";
import DashboardLayout from "./layouts/DashboardLayout";
import Landing from "./pages/public/Landing";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

// Trainer pages
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import TrainerProfile from "./pages/trainer/TrainerProfile";
import MembersList from "./pages/trainer/MembersList";
import MemberDetail from "./pages/trainer/MemberDetail";
import AssignPlans from "./pages/trainer/AssignPlans";
import Broadcast from "./pages/trainer/Broadcast";

// Member pages
import MemberDashboard from "./pages/member/MemberDashboard";
import MyWorkout from "./pages/member/MyWorkout";
import MyDiet from "./pages/member/MyDiet";
import Progress from "./pages/member/Progress";
import AiFeedback from "./pages/member/AiFeedback";
import Notes from "./pages/member/Notes";
import Inbox from "./pages/member/Inbox";

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { isAuthenticated, user } = useAuthStore();

  // DEBUG: Log auth state on every render
  // console.log("🔍 App Render - Auth State:", {
  //   isAuthenticated,
  //   user: user?.email,
  //   role: user?.role,
  //   token: !!useAuthStore.getState().token,
  // });

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={(() => {
          if (isAuthenticated) {
            const redirectPath =
              user?.role === "trainer" ? "/trainer" : "/member";
            return <Navigate to={redirectPath} />;
          }
          return <Login />;
        })()}
      />
      <Route
        path="/register"
        element={(() => {
          if (isAuthenticated) {
            return <Navigate to="/" />;
          }
          return <Register />;
        })()}
      />

      {/* Trainer */}
      <Route
        path="/trainer"
        element={
          <ProtectedRoute role="trainer">
            <DashboardLayout role="trainer" />
          </ProtectedRoute>
        }
      >
        <Route index element={<TrainerDashboard />} />
        <Route path="profile" element={<TrainerProfile />} />
        <Route path="members" element={<MembersList />} />
        <Route path="members/:id" element={<MemberDetail />} />
        <Route
          path="plans"
          element={
            <ErrorBoundary>
              <AssignPlans />
            </ErrorBoundary>
          }
        />
        <Route path="broadcast" element={<Broadcast />} />
      </Route>

      {/* Member */}
      <Route
        path="/member"
        element={
          <ProtectedRoute role="member">
            <DashboardLayout role="member" />
          </ProtectedRoute>
        }
      >
        <Route index element={<MemberDashboard />} />
        <Route path="workout" element={<MyWorkout />} />
        <Route path="diet" element={<MyDiet />} />
        <Route path="progress" element={<Progress />} />
        <Route path="ai-feedback" element={<AiFeedback />} />
        <Route path="notes" element={<Notes />} />
        <Route path="inbox" element={<Inbox />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
