import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ children, requireNGOAdmin = false }) {
  const { isAuthenticated, isNGOAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireNGOAdmin && !isNGOAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;
