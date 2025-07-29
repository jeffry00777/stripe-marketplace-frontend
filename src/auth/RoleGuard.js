import { useOktaAuth } from "@okta/okta-react";
import { Navigate } from "react-router-dom";

export default function RoleGuard({ allowed, children }) {
  const { authState } = useOktaAuth();
  const groups = authState?.idToken?.claims?.groups || [];

  if (!authState?.isAuthenticated) return null; // waiting for Okta
  if (allowed.some((r) => groups.includes(r))) return children;

  return <Navigate to="/" replace />;
}
