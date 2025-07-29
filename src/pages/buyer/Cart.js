import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useOktaAuth } from "@okta/okta-react";
import axios from "axios";

const API = process.env.REACT_APP_API_BASE;

export default function Cart() {
  const [search] = useSearchParams();
  const productId = search.get("productId");
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({ address: "", phone: "", time: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const { authState, oktaAuth } = useOktaAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const { data } = await axios.get(`${API}/api/products/${productId}`);
        setProduct(data);
      } catch (err) {
        console.error("Product load failed", err);
        setMsg("Unable to load product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCheckout = async () => {
    if (!authState?.isAuthenticated) {
      setMsg("Please login to continue checkout.");
      return;
    }

    try {
      setMsg("Redirecting to Stripe...");
      const token = await oktaAuth.getAccessToken();
      const { data } = await axios.post(
        `${API}/api/checkout/create-session`,
        {
          productId,
          price: product.price,
          buyerId: authState.idToken.claims.sub,
          ...form,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location = data.url;
    } catch (err) {
      console.error("Checkout error", err);
      setMsg("Failed to start checkout.");
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="cart-container">
      <h2>🛒 Checkout</h2>

      {msg && <p className="status-msg">{msg}</p>}

      {product ? (
        <>
          <p>
            <strong>{product.name}</strong> – ${product.price / 100}
          </p>

          <h3>Meet-up & Contact Info</h3>
          <div className="form-group">
            <input
              name="address"
              placeholder="Meetup address"
              value={form.address}
              onChange={handleChange}
              required
            />
            <input
              name="phone"
              placeholder="Phone number"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <input
              name="time"
              placeholder="Preferred time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </div>

          <button
            onClick={handleCheckout}
            disabled={!authState?.isAuthenticated}
          >
            Proceed to Payment
          </button>
        </>
      ) : (
        <p>Product not found.</p>
      )}
    </div>
  );
}
