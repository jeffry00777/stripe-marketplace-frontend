import React, { useMemo, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { Security, useOktaAuth, LoginCallback } from "@okta/okta-react";

/* ── layout & pages ─────────────────────────────── */
import Navbar from "./components/Navbar";
import RoleSelectSignup from "./components/RoleSelectSignup";
import Home from "./pages/common/Home";
import Listing from "./pages/buyer/Listing";
import Cart from "./pages/buyer/Cart";
import ProductUpload from "./pages/seller/ProductUpload";

import RoleGuard from "./auth/RoleGuard";

function PostLoginRouter({ children }) {
  const { authState } = useOktaAuth();
  const navigate = useNavigate();

  /* 1. derive role from group claim */
  const role = useMemo(() => {
    if (!authState?.isAuthenticated || !authState.idToken) return null;
    const groups = authState.idToken.claims.groups || [];
    return groups.includes("seller") ? "seller" : "buyer";
  }, [authState]);

  /* 2. redirect exactly once when ready */
  useEffect(() => {
    if (!authState?.isAuthenticated || !role) return;

    const pending = sessionStorage.getItem("app.pendingRoute");
    if (pending) {
      sessionStorage.removeItem("app.pendingRoute");
      navigate(pending, { replace: true });
    } else {
      navigate(role === "seller" ? "/upload" : "/listing", { replace: true });
    }
  }, [authState?.isAuthenticated, role, navigate]);

  return children;
}

export default function App({ oktaAuth }) {
  const navigate = useNavigate();

  return (
    <Security
      oktaAuth={oktaAuth}
      restoreOriginalUri={async (_auth, originalUri) => {
        if (originalUri) {
          const rel = new URL(originalUri, window.location.origin).pathname;
          sessionStorage.setItem("app.pendingRoute", rel);
        }
        navigate("/", { replace: true });
      }}
    >
      <PostLoginRouter>
        <Navbar />
        <Routes>
          {/* public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<RoleSelectSignup />} />
          <Route path="/login/callback" element={<LoginCallback />} />

          {/* buyer-only */}
          <Route
            path="/listing"
            element={
              <RoleGuard allowed={["buyer"]}>
                <Listing />
              </RoleGuard>
            }
          />
          <Route
            path="/cart"
            element={
              <RoleGuard allowed={["buyer"]}>
                <Cart />
              </RoleGuard>
            }
          />

          {/* seller-only */}
          <Route
            path="/upload"
            element={
              <RoleGuard allowed={["seller"]}>
                <ProductUpload />
              </RoleGuard>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PostLoginRouter>
    </Security>
  );
}
