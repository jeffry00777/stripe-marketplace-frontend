// src/components/RoleSelectSignup.jsx
import React, { useState } from "react";
import { OktaAuth } from "@okta/okta-auth-js";
import { oktaConfig } from "../auth/oktaConfig";

const oktaAuth = new OktaAuth(oktaConfig);

const RoleSelectSignup = () => {
  const [form, setForm] = useState({ email: "", password: "", role: "" });
  const [msg, setMsg] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await oktaAuth.signUp({
        profile: { email: form.email, login: form.email, role: form.role },
        credentials: { password: { value: form.password } },
      });
      setMsg("Signup successful! Please check email then log in.");
    } catch (err) {
      setMsg(err.errorSummary || "Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        onChange={handleChange}
      />
      <select name="role" required onChange={handleChange}>
        <option value="">Choose Role</option>
        <option value="Buyer">Buyer</option>
        <option value="Seller">Seller</option>
      </select>
      <button type="submit">Create account</button>
      {msg && <p>{msg}</p>}
    </form>
  );
};

export default RoleSelectSignup;
