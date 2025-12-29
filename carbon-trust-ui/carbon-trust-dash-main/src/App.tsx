// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Import  Auth hook

// Import page components
import LoginPage from './pages/Index';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard'; // Import  admin dashboard
import ProjectDetail from './pages/ProjectDetail';
import CarbonCalculator from './pages/Calculator';
import MyPortfolio from "./pages/MyPortfolio";

/**
 * A component that acts as a gatekeeper after login,
 * redirecting the user to the correct dashboard based on their role.
 */
const HomeRedirect = () => {
  const { profile } = useAuth();

  if (profile?.role === 'Platform Admin' || profile?.role === 'Aggregator') {
    return <Navigate to="/admin" />;
  }
  
  // Default to BuyerDashboard
  return <Navigate to="/dashboard" />;
};

function App() {
  const { session, loading } = useAuth();

  // Show a loading state while the session and profile are being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Initializing...
      </div>
    );
  }
  
  return (
    <BrowserRouter>
      <Routes>
        {/* If not logged in, show the login page. If logged in, the HomeRedirect decides where to go. */}

        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={session ? <HomeRedirect /> : <Navigate to="/login" />}
        />
        {/* Protected, Role-Specific Routes */}
        <Route
          path="/dashboard"
          element={session ? <BuyerDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={session ? <AdminDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/project/:id"
          element={session ? <ProjectDetail /> : <Navigate to="/login" />}
        />
        <Route
          path="/portfolio"
          element={session ? <MyPortfolio /> : <Navigate to="/login" />}
        />
        <Route
          path="/calculator"
          element={session ? <CarbonCalculator /> : <Navigate to="/login" />}
        />
        {/* A fallback route for any unknown paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;