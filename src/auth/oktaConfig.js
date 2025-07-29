// src/oktaConfig.js
export const oktaConfig = {
  clientId: "0oat7m5qecol7ATfb697",
  issuer: "https://trial-7472583.okta.com/oauth2/default",
  redirectUri: "https://stripe-marketplace-frontend.vercel.app/login/callback",
  scopes: ["openid", "profile", "email"],
  pkce: true,
};
