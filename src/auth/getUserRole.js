// returns "Seller", "Buyer", or null
import { jwtDecode } from "jwt-decode";

const GROUPS_CLAIM = "groups";

export default function getUserRole(idToken) {
  if (!idToken) return null;
  const { claims } = idToken;
  return claims?.userRole?.toLowerCase();
}
