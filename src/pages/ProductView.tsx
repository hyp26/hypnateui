import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../lib/api";
import { calcDiscountPercent } from "../utils/format";
import { ProductImagePanel } from "../components/products/ImagePanel";
import { ProductInfoPanel } from "../components/products/InfoPanel";
import '../styles/products.css';
import type { Product } from "../types/product";

export const ProductView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        const res = await api.get(`/api/products/${productId}`);
        setProduct(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/api/products/${productId}`);
      navigate("/products");
    } catch {
      alert("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, fontFamily: "'Outfit', sans-serif", color: "#94a3b8", gap: 12 }}>
        <div className="prod-spinner" />
        Loading product…
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: 40, color: "#dc2626", fontFamily: "'Outfit', sans-serif" }}>
        {error || "Product not found"}
      </div>
    );
  }

  const discountPercent = product.mrp ? calcDiscountPercent(product.price, product.mrp) : 0;

  return (
    <div className="pv-root">
      <Link to="/products" className="pv-back"><ArrowLeft size={16} /> Products</Link>

      <div className="pv-layout">
        <ProductImagePanel product={product} discountPercent={discountPercent} onDelete={handleDelete} />
        <ProductInfoPanel product={product} discountPercent={discountPercent} />
      </div>
    </div>
  );
};