import React from "react";
import { Link } from "react-router-dom";
import { useOktaAuth } from "@okta/okta-react";
import "./Navbar.css";

const Navbar = () => {
  const { oktaAuth, authState } = useOktaAuth();

  const login = async () => oktaAuth.signInWithRedirect();
  const logout = async () =>
    oktaAuth.signOut({ postLogoutRedirectUri: window.location.origin });

  return (
    <nav className="nav-bar">
      <div className="nav-left">
        <Link to="/" className="nav-link">
          Home
        </Link>
        {authState?.isAuthenticated && (
          <Link to="/dashboard" className="nav-link">
            Cart
          </Link>
        )}
      </div>

      <div className="nav-right">
        {authState?.isAuthenticated ? (
          <button onClick={logout} className="nav-btn">
            Logout
          </button>
        ) : (
          <button onClick={login} className="nav-btn">
            Login / Signup
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
