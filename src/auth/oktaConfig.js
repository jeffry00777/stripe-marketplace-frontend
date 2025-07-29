// src/oktaConfig.js
export const oktaConfig = {
  clientId: process.env.CLIENT_ID,
  issuer: process.env.ISSUER_URL,
  redirectUri: window.location.origin + "/login/callback",
  scopes: ["openid", "profile", "email"],
  pkce: true,
};
