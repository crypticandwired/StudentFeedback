import { useAuth } from "./context/AuthContext";

const AppContent = () => {
  const { isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return null;
};
import Profile from "./pages/Profile";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"

// Pages
import Login from "./pages/Login"
import Register from "./pages/Register"
import AdminLogin from "./pages/AdminLogin"
import Dashboard from "./pages/Dashboard"
import SubmitFeedback from "./pages/SubmitFeedback"
import MyFeedback from "./pages/MyFeedback"
import AdminDashboard from "./pages/AdminDashboard"
import AdminStudents from "./pages/AdminStudents"
import AdminCourses from "./pages/AdminCourses"
import AdminFeedback from "./pages/AdminFeedback"
import AdminAnalytics from "./pages/AdminAnalytics"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Student Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback/submit"
              element={
                <ProtectedRoute>
                  <SubmitFeedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback/my-feedback"
              element={
                <ProtectedRoute>
                  <MyFeedback />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute adminOnly>
                  <AdminStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute adminOnly>
                  <AdminCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <ProtectedRoute adminOnly>
                  <AdminFeedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
          element={
            <ProtectedRoute adminOnly>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  </Router>
</AuthProvider>
  )
}

export default App
