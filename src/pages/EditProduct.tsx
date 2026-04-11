import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import api from "../lib/api";
import { ArrowLeft, Upload, X, Plus, ImageIcon, Package, IndianRupee, Layers, Save } from "lucide-react";

const PRESET_SIZES = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  footwear: ["4", "5", "6", "7", "8", "9", "10", "11", "12"],
  kids: ["2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "10Y", "12Y"],
  free: ["Free Size"],
};

export const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();
  const { updateProduct } = useProductStore();

  const [form, setForm] = useState({
    name: "", category: "", description: "",
    price: 0 as number | "",
    mrp: "" as number | "",
    stock: 0 as number | "",
    imageUrl: "",
  });
  const [sizes, setSizes] = useState<string[]>([]);
  const [customSize, setCustomSize] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        const res = await api.get(`/api/products/${productId}`);
        const p = res.data;
        setForm({
          name: p.name || "",
          category: p.category || "",
          description: p.description || "",
          price: p.price ?? 0,
          mrp: p.mrp ?? "",
          stock: p.stock ?? 0,
          imageUrl: p.imageUrl || "",
        });
        setSizes(p.sizes || []);
        if (p.imageUrl) setImagePreview(p.imageUrl);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const handleImageFile = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post("/api/products/upload?mode=cloud", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!res.data?.url) throw new Error("Image upload failed");
    return res.data.url;
  };

  const toggleSize = (s: string) =>
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const addCustomSize = () => {
    const v = customSize.trim();
    if (v && !sizes.includes(v)) setSizes(prev => [...prev, v]);
    setCustomSize("");
  };

  const handleSave = async () => {
    setError(null);
    try {
      setIsSaving(true);
      let imageUrl = form.imageUrl;
      if (imageFile) imageUrl = await uploadImage(imageFile);

      await updateProduct(productId, {
        name: form.name,
        category: form.category || null,
        description: form.description || null,
        price: Number(form.price),
        mrp: form.mrp ? Number(form.mrp) : null,
        stock: Number(form.stock),
        imageUrl,
        sizes,
      });
      navigate("/products");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  const discountPct = form.mrp && form.price && Number(form.mrp) > Number(form.price)
    ? Math.round(((Number(form.mrp) - Number(form.price)) / Number(form.mrp)) * 100)
    : 0;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, fontFamily: "'Outfit', sans-serif", color: "#94a3b8" }}>
      <div style={{ width: 28, height: 28, border: "3px solid #e2e8f0", borderTopColor: "#0f172a", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: 12 }} />
      Loading product…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{productFormCss}</style>
      <div className="pf-root">
        <div className="pf-top">
          <Link to="/products" className="pf-back"><ArrowLeft size={16} /> Products</Link>
          <h1 className="pf-title">Edit Product</h1>
        </div>

        <div className="pf-layout">
          {/* LEFT */}
          <div className="pf-left">
            <div className="pf-card">
              <div className="pf-card-title"><ImageIcon size={15} /> Product Image</div>
              <div
                className={`pf-drop ${isDragging ? "dragging" : ""} ${imagePreview ? "has-img" : ""}`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f); }}
                onClick={() => document.getElementById("img-input-edit")?.click()}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="preview" className="pf-preview" />
                    <button type="button" className="pf-remove-img" onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(null); set("imageUrl", ""); }}>
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="pf-drop-inner">
                    <Upload size={28} strokeWidth={1.5} />
                    <p>Drag & drop or <span>browse</span></p>
                    <p className="pf-drop-hint">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
              <input id="img-input-edit" type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} />
            </div>

            <div className="pf-card">
              <div className="pf-card-title"><Layers size={15} /> Sizes</div>
              {Object.entries(PRESET_SIZES).map(([group, opts]) => (
                <div key={group} className="pf-size-group">
                  <p className="pf-size-label">{group.charAt(0).toUpperCase() + group.slice(1)}</p>
                  <div className="pf-size-chips">
                    {opts.map(s => (
                      <button type="button" key={s}
                        className={`pf-size-chip ${sizes.includes(s) ? "selected" : ""}`}
                        onClick={() => toggleSize(s)}>{s}</button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pf-custom-size">
                <input value={customSize} onChange={e => setCustomSize(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomSize())}
                  placeholder="Custom size…" className="pf-input" />
                <button type="button" onClick={addCustomSize} className="pf-add-size-btn"><Plus size={14} /></button>
              </div>
              {sizes.length > 0 && (
                <div className="pf-selected-sizes">
                  {sizes.map(s => (
                    <span key={s} className="pf-selected-chip">
                      {s} <button type="button" onClick={() => toggleSize(s)}><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="pf-right">
            <div className="pf-card">
              <div className="pf-card-title"><Package size={15} /> Basic Info</div>
              {error && <div className="pf-error">{error}</div>}

              <div className="pf-field">
                <label className="pf-label">Product Name *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} className="pf-input" />
              </div>
              <div className="pf-row">
                <div className="pf-field">
                  <label className="pf-label">Category</label>
                  <input value={form.category} onChange={e => set("category", e.target.value)} placeholder="e.g. Clothing" className="pf-input" />
                </div>
                <div className="pf-field">
                  <label className="pf-label">Stock *</label>
                  <input type="number" min="0" value={form.stock} onChange={e => set("stock", e.target.value === "" ? "" : Number(e.target.value))} className="pf-input" />
                </div>
              </div>
              <div className="pf-field">
                <label className="pf-label">Description</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)} className="pf-input pf-textarea" />
              </div>
            </div>

            <div className="pf-card">
              <div className="pf-card-title"><IndianRupee size={15} /> Pricing</div>
              <div className="pf-row">
                <div className="pf-field">
                  <label className="pf-label">Selling Price *</label>
                  <div className="pf-input-prefix">
                    <span>₹</span>
                    <input type="number" min="0" step="0.01" value={form.price}
                      onChange={e => set("price", e.target.value === "" ? "" : Number(e.target.value))}
                      className="pf-input pf-prefixed" />
                  </div>
                </div>
                <div className="pf-field">
                  <label className="pf-label">MRP <span className="pf-optional">(crossed-out)</span></label>
                  <div className="pf-input-prefix">
                    <span>₹</span>
                    <input type="number" min="0" step="0.01" value={form.mrp}
                      onChange={e => set("mrp", e.target.value === "" ? "" : Number(e.target.value))}
                      className="pf-input pf-prefixed" />
                  </div>
                </div>
              </div>
              {discountPct > 0 && (
                <div className="pf-discount-preview">
                  <span className="pf-disc-badge">{discountPct}% off</span>
                  <span>Customer saves ₹{(Number(form.mrp) - Number(form.price)).toLocaleString()}</span>
                </div>
              )}
            </div>

            <button onClick={handleSave} disabled={isSaving} className="pf-submit">
              {isSaving ? <><div className="pf-btn-spinner" /> Saving…</> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* Shared responsive product form styles for AddProduct.tsx and EditProduct.tsx */
/* Replace the existing formCss string in both files with this content */

export const productFormCss = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.pf-root { font-family: 'Outfit', sans-serif; padding: 16px; max-width: 1100px; }
@media(min-width:640px){ .pf-root { padding: 20px; } }
@media(min-width:1024px){ .pf-root { padding: 28px 32px; } }

.pf-top { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.pf-back { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: #64748b; text-decoration: none; padding: 7px 11px; border-radius: 9px; background: #f1f5f9; transition: background 0.15s; white-space: nowrap; }
.pf-back:hover { background: #e2e8f0; }
.pf-title { font-size: clamp(18px, 4vw, 24px); font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px; }

/* Responsive layout: stack on mobile, side-by-side on lg+ */
.pf-layout { display: flex; flex-direction: column; gap: 16px; }
@media(min-width:1024px){ .pf-layout { display: grid; grid-template-columns: 300px 1fr; gap: 20px; align-items: start; } }

.pf-left { display: flex; flex-direction: column; gap: 14px; }
.pf-right { display: flex; flex-direction: column; gap: 14px; }

.pf-card { background: #fff; border-radius: 14px; padding: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
@media(min-width:640px){ .pf-card { padding: 20px; } }
.pf-card-title { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; }

.pf-drop { border: 2px dashed #e2e8f0; border-radius: 12px; min-height: 160px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; background: #f8fafc; }
.pf-drop:hover, .pf-drop.dragging { border-color: #0f172a; background: #f1f5f9; }
.pf-drop.has-img { border-style: solid; border-color: #e2e8f0; }
.pf-drop-inner { text-align: center; color: #94a3b8; }
.pf-drop-inner svg { margin: 0 auto 10px; display: block; }
.pf-drop-inner p { font-size: 13px; margin: 0 0 4px; }
.pf-drop-inner span { color: #0f172a; font-weight: 600; text-decoration: underline; }
.pf-drop-hint { font-size: 11px !important; color: #cbd5e1 !important; }
.pf-preview { width: 100%; height: 100%; object-fit: cover; }
.pf-remove-img { position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; border-radius: 7px; background: rgba(0,0,0,0.5); border: none; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }

.pf-size-group { margin-bottom: 10px; }
.pf-size-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
.pf-size-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.pf-size-chip { padding: 4px 10px; border-radius: 7px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: 12px; font-weight: 600; color: #374151; cursor: pointer; transition: all 0.15s; font-family: 'Outfit', sans-serif; }
.pf-size-chip.selected { background: #0f172a; border-color: #0f172a; color: #fff; }
.pf-size-chip:hover:not(.selected) { border-color: #0f172a; }
.pf-custom-size { display: flex; gap: 8px; margin-top: 8px; }
.pf-add-size-btn { width: 34px; height: 34px; border-radius: 9px; background: #0f172a; border: none; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pf-selected-sizes { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #f1f5f9; }
.pf-selected-chip { display: inline-flex; align-items: center; gap: 5px; background: #f0fdfa; color: #0d9488; font-size: 12px; font-weight: 600; padding: 3px 9px; border-radius: 7px; border: 1px solid #ccfbf1; }
.pf-selected-chip button { background: none; border: none; cursor: pointer; color: #0d9488; padding: 0; display: flex; align-items: center; }

.pf-field { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.pf-label { font-size: 13px; font-weight: 600; color: #374151; }
.pf-optional { font-size: 11px; font-weight: 400; color: #94a3b8; }
.pf-input { padding: 9px 11px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 13px; font-family: 'Outfit', sans-serif; color: #0f172a; outline: none; transition: border-color 0.2s; background: #fafafa; width: 100%; box-sizing: border-box; }
.pf-input:focus { border-color: #0f172a; background: #fff; }
.pf-textarea { min-height: 80px; resize: vertical; }
.pf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }

.pf-input-prefix { position: relative; display: flex; align-items: center; }
.pf-input-prefix > span { position: absolute; left: 11px; font-size: 14px; font-weight: 600; color: #94a3b8; pointer-events: none; }
.pf-prefixed { padding-left: 24px !important; }

.pf-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 13px; padding: 9px 13px; border-radius: 9px; margin-bottom: 12px; }

.pf-discount-preview { display: flex; align-items: center; gap: 10px; margin-top: 10px; padding: 9px 13px; background: #f0fdf4; border-radius: 9px; font-size: 12px; color: #166534; font-weight: 500; }
.pf-disc-badge { background: #16a34a; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 9px; border-radius: 20px; }

.pf-submit { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px; background: #0f172a; color: #fff; border: none; border-radius: 11px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Outfit', sans-serif; transition: background 0.15s; }
.pf-submit:hover:not(:disabled) { background: #1e293b; }
.pf-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.pf-btn-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
`;