import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useOktaAuth } from "@okta/okta-react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import "./ProductUpload.css";

const API = process.env.REACT_APP_API_BASE;

export default function ProductUpload() {
  const { authState } = useOktaAuth();
  const token = authState?.accessToken?.accessToken;
  const oktaId = authState?.idToken?.claims?.sub || "";
  const fileInputRef = useRef(null);

  const [accountId, setAccountId] = useState(
    localStorage.getItem("stripeAccountId") || ""
  );
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    usage: "new",
  });
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (accountId) localStorage.setItem("stripeAccountId", accountId);
  }, [accountId]);

  const handleStripeConnect = async () => {
    try {
      const storedId = localStorage.getItem("stripeAccountId") || "";
      const { data } = await axios.post(
        `${API}/api/stripe/connect`,
        { existingAccountId: storedId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("stripeAccountId", data.accountId);
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setMsg("Could not start Stripe onboarding");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const list = Array.from(e.target.files);
    setFiles(list);
    setPreview(list.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("Uploading…");

    if (!accountId) {
      setMsg("Connect Stripe before uploading.");
      return;
    }

    try {
      // 1. Upload images first and collect their IDs
      let imageIds = [];

      if (files.length) {
        const uploads = await Promise.all(
          files.map(async (file) => {
            const fd = new FormData();
            fd.append("image", file);
            const res = await axios.post(`${API}/api/images/upload`, fd, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return res.data.id;
          })
        );
        imageIds = uploads;
      }

      const { data: product } = await axios.post(
        `${API}/api/products/save`,
        {
          ...form,
          price: Number(form.price),
          sellerId: oktaId,
          stripeAccountId: accountId,
          images: imageIds,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg("Product saved");
      setForm({ name: "", description: "", price: "", usage: "new" });
      setFiles([]);
      setPreview([]);
      fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.error || "Upload failed");
    }
  };

  return (
    <div className="upload-container">
      <h2>Add Product</h2>

      {!accountId && (
        <div className="warning-box">
          <p>Connect a Stripe account to start selling.</p>
          <Button
            onClick={handleStripeConnect}
            variant="contained"
            color="primary"
          >
            Connect Stripe
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mui-form">
        <label>Name</label>
        <TextField
          name="name"
          variant="outlined"
          value={form.name}
          onChange={handleChange}
          fullWidth
          required
          disabled={!accountId}
          sx={{ mb: 2 }}
        />

        <label>Description</label>
        <TextField
          name="description"
          variant="outlined"
          multiline
          rows={3}
          value={form.description}
          onChange={handleChange}
          fullWidth
          disabled={!accountId}
          sx={{ mb: 2 }}
        />

        <label>Price</label>
        <TextField
          name="price"
          type="number"
          variant="outlined"
          value={form.price}
          onChange={handleChange}
          fullWidth
          required
          disabled={!accountId}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="usage-label">Usage</InputLabel>
          <Select
            labelId="usage-label"
            name="usage"
            value={form.usage}
            onChange={handleChange}
            disabled={!accountId}
            label="Usage"
          >
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="used">Used</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <FormLabel>Upload Images</FormLabel>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFile}
            className="form-file"
            disabled={!accountId}
            ref={fileInputRef}
          />
        </FormControl>

        {preview.length > 0 && (
          <div className="image-preview">
            {preview.map((url) => (
              <img key={url} src={url} alt="Preview" className="preview-img" />
            ))}
          </div>
        )}

        <Button
          type="submit"
          variant="contained"
          color="success"
          disabled={!accountId}
        >
          Save Product
        </Button>
      </form>

      {msg && <p className="form-message">{msg}</p>}
    </div>
  );
}
