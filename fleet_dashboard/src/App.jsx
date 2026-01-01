import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <Router>
      <nav className="bg-gray-800 p-4 text-white shadow sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold hover:text-blue-300">
            Fleet Dashboard
          </Link>
          <div className="space-x-4">
            <Link to="/login" className="text-sm hover:text-blue-300">
              Login
            </Link>
            <Link to="/register" className="text-sm hover:text-blue-300">
              Register
            </Link>
          </div>
        </div>
      </nav>

      <Routes>
        {/* Default landing page → Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Toaster position="top-right" />
    </Router>
  );
}
