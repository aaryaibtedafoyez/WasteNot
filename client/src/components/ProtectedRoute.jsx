import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loading">
        <p className="mono">Loading WasteNot…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
