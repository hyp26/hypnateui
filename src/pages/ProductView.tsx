import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2, Package, Tag, Calendar, Layers, IndianRupee, AlertTriangle } from "lucide-react";
import api from "../lib/api";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const ProductView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
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

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, fontFamily: "'Outfit', sans-serif", color: "#94a3b8", gap: 12 }}>
      <div style={{ width: 28, height: 28, border: "3px solid #e2e8f0", borderTopColor: "#0f172a", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      Loading product…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error || !product) return (
    <div style={{ padding: 40, color: "#dc2626", fontFamily: "'Outfit', sans-serif" }}>{error || "Product not found"}</div>
  );

  const disc = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <>
      <style>{viewCss}</style>
      <div className="pv-root">

        {/* Back */}
        <Link to="/products" className="pv-back"><ArrowLeft size={16} /> Products</Link>

        <div className="pv-layout">

          {/* LEFT — Image */}
          <div className="pv-img-col">
            <div className="pv-img-wrap">
              <img
                src={product.imageUrl || "https://via.placeholder.com/400?text=No+Image"}
                alt={product.name}
                className="pv-img"
              />
              {disc > 0 && <span className="pv-disc-badge">{disc}% OFF</span>}
              {product.stock < 10 && (
                <div className="pv-low-stock">
                  <AlertTriangle size={13} /> Only {product.stock} left
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pv-actions">
              <Link to={`/products/${product.id}/edit`} className="pv-btn-edit">
                <Edit2 size={15} /> Edit Product
              </Link>
              <button
                onClick={async () => {
                  if (!window.confirm("Delete this product?")) return;
                  try {
                    await api.delete(`/api/products/${productId}`);
                    navigate("/products");
                  } catch { alert("Failed to delete"); }
                }}
                className="pv-btn-delete"
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>

          {/* RIGHT — Info */}
          <div className="pv-info-col">
            {product.category && (
              <span className="pv-category"><Tag size={11} /> {product.category}</span>
            )}

            <h1 className="pv-name">{product.name}</h1>

            {/* Price block */}
            <div className="pv-price-block">
              <span className="pv-price">{fmt(product.price)}</span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="pv-mrp">MRP {fmt(product.mrp)}</span>
                  <span className="pv-save">Save {fmt(product.mrp - product.price)} ({disc}% off)</span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className={`pv-stock ${product.stock < 10 ? "low" : "ok"}`}>
              <Package size={14} />
              {product.stock < 10
                ? `Only ${product.stock} units left — restock soon`
                : `${product.stock} units in stock`}
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pv-section">
                <div className="pv-section-label"><Layers size={13} /> Available Sizes</div>
                <div className="pv-sizes">
                  {product.sizes.map((s: string) => (
                    <span key={s} className="pv-size-chip">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="pv-section">
                <div className="pv-section-label"><Package size={13} /> Description</div>
                <p className="pv-desc">{product.description}</p>
              </div>
            )}

            {/* Meta */}
            <div className="pv-meta">
              <div className="pv-meta-item">
                <Calendar size={13} />
                <span>Added {new Date(product.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <div className="pv-meta-item">
                <IndianRupee size={13} />
                <span>Product ID #{product.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const viewCss = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
.pv-root { font-family: 'Outfit', sans-serif; padding: 28px 32px; max-width: 1000px; }

.pv-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #64748b; text-decoration: none; padding: 7px 12px; border-radius: 10px; background: #f1f5f9; transition: background 0.15s; margin-bottom: 24px; }
.pv-back:hover { background: #e2e8f0; }

.pv-layout { display: grid; grid-template-columns: 400px 1fr; gap: 32px; align-items: start; }

.pv-img-col { display: flex; flex-direction: column; gap: 16px; }
.pv-img-wrap { position: relative; border-radius: 20px; overflow: hidden; aspect-ratio: 1; background: #f8fafc; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.pv-img { width: 100%; height: 100%; object-fit: cover; }
.pv-disc-badge { position: absolute; top: 14px; left: 14px; background: #ef4444; color: #fff; font-size: 12px; font-weight: 800; padding: 5px 12px; border-radius: 20px; letter-spacing: 0.5px; }
.pv-low-stock { position: absolute; bottom: 14px; left: 14px; right: 14px; background: rgba(194,65,12,0.9); color: #fff; font-size: 12px; font-weight: 600; padding: 8px 14px; border-radius: 12px; display: flex; align-items: center; gap: 6px; backdrop-filter: blur(4px); }

.pv-actions { display: grid; grid-template-columns: 1fr auto; gap: 10px; }
.pv-btn-edit { display: flex; align-items: center; justify-content: center; gap: 7px; background: #0f172a; color: #fff; font-size: 14px; font-weight: 700; padding: 12px; border-radius: 12px; text-decoration: none; transition: background 0.15s; font-family: 'Outfit', sans-serif; }
.pv-btn-edit:hover { background: #1e293b; }
.pv-btn-delete { display: flex; align-items: center; gap: 6px; background: #fef2f2; color: #dc2626; border: 1.5px solid #fecaca; font-size: 14px; font-weight: 700; padding: 12px 16px; border-radius: 12px; cursor: pointer; transition: all 0.15s; font-family: 'Outfit', sans-serif; }
.pv-btn-delete:hover { background: #fee2e2; }

.pv-info-col { padding-top: 4px; }
.pv-category { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #0d9488; background: #f0fdfa; padding: 4px 10px; border-radius: 20px; margin-bottom: 12px; }
.pv-name { font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 20px; line-height: 1.2; letter-spacing: -0.5px; }

.pv-price-block { display: flex; align-items: baseline; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; padding: 20px; background: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9; }
.pv-price { font-size: 36px; font-weight: 800; color: #0f172a; }
.pv-mrp { font-size: 18px; color: #94a3b8; text-decoration: line-through; }
.pv-save { font-size: 14px; font-weight: 700; color: #16a34a; background: #dcfce7; padding: 4px 12px; border-radius: 20px; }

.pv-stock { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; padding: 12px 16px; border-radius: 12px; margin-bottom: 20px; }
.pv-stock.ok { background: #f0fdf4; color: #166534; }
.pv-stock.low { background: #fff7ed; color: #c2410c; }

.pv-section { margin-bottom: 20px; }
.pv-section-label { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 10px; }

.pv-sizes { display: flex; flex-wrap: wrap; gap: 8px; }
.pv-size-chip { padding: 7px 16px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: 14px; font-weight: 600; color: #374151; }

.pv-desc { font-size: 15px; color: #475569; line-height: 1.7; margin: 0; }

.pv-meta { display: flex; flex-direction: column; gap: 8px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
.pv-meta-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #94a3b8; }
`;