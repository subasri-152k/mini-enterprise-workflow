import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Notifications from "../pages/Notifications";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Tasks from "../pages/Tasks";
import CreateTask from "../pages/CreateTask";
import EditTask from "../pages/EditTask";
import Approvals from "../pages/Approvals";
import Users from "../pages/Users";
import Sidebar from "../components/Sidebar";
import Documents from "../pages/Documents";
import AuditLogs from "../pages/AuditLogs";
// ================= PROTECTED ROUTE =================

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ================= PUBLIC ROUTE =================

function PublicRoute({ children }) {
  const token = localStorage.getItem("access_token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ================= PROTECTED LAYOUT =================

function ProtectedLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-content">
        {children}
      </main>

      <style>{`
        .app-content {
          margin-left: 250px;
          min-height: 100vh;
        }

        @media (max-width: 700px) {
          .app-content {
            margin-left: 70px;
          }
        }
      `}</style>
    </div>
  );
}

// ================= APP ROUTES =================

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= LOGIN ================= */}

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* ================= REGISTER ================= */}

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* ================= DASHBOARD ================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= TASKS ================= */}

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Tasks />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= CREATE TASK ================= */}

        <Route
          path="/tasks/create"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <CreateTask />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= EDIT TASK ================= */}

        <Route
          path="/tasks/edit/:taskId"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <EditTask />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= APPROVALS ================= */}

        <Route
          path="/approvals"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Approvals />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= USERS ================= */}

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Users />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= DEFAULT ================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* ================= UNKNOWN ROUTES ================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
<Route
  path="/notifications"
  element={<Notifications />}
/>

<Route
  path="/documents"
  element={<Documents />}
/>

<Route
  path="/audit-logs"
  element={<AuditLogs />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;