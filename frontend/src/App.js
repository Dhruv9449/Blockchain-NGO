import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import NGOPage from "./pages/NGOPage";
import { AuthProvider } from "./context/AuthContext";
import NGODashboard from "./components/ngo/NGODashboard";
import PrivateRoute from "./components/PrivateRoute";

// Create a separate component for the routes
function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth type="login" />} />
          <Route path="/register" element={<Auth type="register" />} />
          <Route path="/ngo/:id" element={<NGOPage />} />
          <Route
            path="/ngo-admin"
            element={
              <PrivateRoute requireNGOAdmin={true}>
                <NGODashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// Main App component
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
