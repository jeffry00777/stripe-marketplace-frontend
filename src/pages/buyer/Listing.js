import React, { useEffect, useState } from "react";
import axios from "axios";
import { useOktaAuth } from "@okta/okta-react";
import "./Listing.css";

const API = process.env.REACT_APP_API_BASE;

export default function Listing() {
  const { authState } = useOktaAuth();
  const token = authState?.accessToken?.accessToken || "";
  const oktaId = authState?.idToken?.claims?.sub || "";
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const { data } = await axios.get(
          `${API}/api/products/seller/products`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProducts(data);
      } catch (err) {
        console.error("Load products failed:", err);
        setMsg("Failed to load your products.");
      }
    })();
  }, [token]);

  const handleBuy = async (product) => {
    try {
      const { data } = await axios.post(
        `${API}/api/checkout/create-session`,
        {
          productId: product._id,
          price: product.price,
          buyerId: oktaId,
          address: "123 Main St",
          phone: "555-1234",
          time: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      window.location.href = data.url;
    } catch (err) {
      console.error(
        "Stripe checkout error:",
        err.response?.data || err.message
      );
      alert("Checkout failed.");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authState?.isAuthenticated) {
    return (
      <p className="error-msg">You must be logged in to view this page.</p>
    );
  }

  return (
    <>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        rel="stylesheet"
      />

      <div className="bg-light full-screen">
        <div className="container py-5">
          <div className="search-container full-width">
            <div className="search-wrapper">
              <div className="search-header">
                <div className="search-input-group">
                  <input
                    type="text"
                    className="search-input form-control"
                    placeholder="Search products, categories, brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="fas fa-search search-icon"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.map((p) => (
              <div key={p._id} className="product-card">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="product-img" />
                ) : (
                  <div className="product-img placeholder">No image</div>
                )}
                <div className="product-details">
                  <h5>{p.name}</h5>
                  <p className="product-price">${p.price.toFixed(2)}</p>
                  <p className="product-desc">{p.description}</p>
                  <button className="buy-link" onClick={() => handleBuy(p)}>
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
