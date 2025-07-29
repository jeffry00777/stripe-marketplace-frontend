import React, { useEffect } from "react";
import { useOktaAuth } from "@okta/okta-react";

export default function RequireAuth({ children }) {
  const { oktaAuth, authState } = useOktaAuth();

  useEffect(() => {
    if (authState && !authState.isPending && !authState.isAuthenticated) {
      oktaAuth.signInWithRedirect();
    }
  }, [authState, oktaAuth]);

  if (!authState?.isAuthenticated) return null;

  return children;
}
