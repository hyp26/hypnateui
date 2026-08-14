import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import api from "../lib/api";
import { useProductImageUpload } from "../hooks/useProductImageUpload";
import { ImageDropField } from "../components/products/ImageDropField";
import { SizePicker } from "../components/products/SizePicker";
import { ProductBasicInfoCard } from "../components/products/BasicInfoCard";
import { ProductPricingCard } from "../components/products/PricingCard";
import "../components/products/productForm.css";

export const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();
  const { updateProduct } = useProductStore();
  const { imagePreview, selectFile, clear, upload, setImagePreview } = useProductImageUpload();

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: 0 as number | "",
    mrp: "" as number | "",
    stock: 0 as number | "",
    imageUrl: "",
  });
  const [sizes, setSizes] = useState<string[]>([]);
  const [customSize, setCustomSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

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
  }, [productId, setImagePreview]);

  const toggleSize = (s: string) =>
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const addCustomSize = () => {
    const v = customSize.trim();
    if (v && !sizes.includes(v)) setSizes((prev) => [...prev, v]);
    setCustomSize("");
  };

  const handleRemoveImage = () => {
    clear();
    set("imageUrl", "");
  };

  const handleSave = async () => {
    setError(null);
    try {
      setIsSaving(true);
      const uploadedUrl = await upload();
      const imageUrl = uploadedUrl ?? form.imageUrl;

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

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, fontFamily: "'Outfit', sans-serif", color: "#94a3b8", gap: 12 }}>
        <div className="pf-page-spinner" />
        Loading product…
      </div>
    );
  }

  return (
    <div className="pf-root">
      <div className="pf-top">
        <Link to="/products" className="pf-back"><ArrowLeft size={16} /> Products</Link>
        <h1 className="pf-title">Edit Product</h1>
      </div>

      <div className="pf-layout">
        <div className="pf-left">
          <ImageDropField imagePreview={imagePreview} onFileSelect={selectFile} onRemove={handleRemoveImage} inputId="edit-product-image" />
          <SizePicker
            sizes={sizes}
            onToggle={toggleSize}
            customSize={customSize}
            onCustomSizeChange={setCustomSize}
            onAddCustomSize={addCustomSize}
          />
        </div>

        <div className="pf-right">
          <ProductBasicInfoCard
            name={form.name} onNameChange={(v) => set("name", v)}
            category={form.category} onCategoryChange={(v) => set("category", v)}
            stock={form.stock} onStockChange={(v) => set("stock", v)}
            description={form.description} onDescriptionChange={(v) => set("description", v)}
            error={error}
          />
          <ProductPricingCard
            price={form.price} onPriceChange={(v) => set("price", v)}
            mrp={form.mrp} onMrpChange={(v) => set("mrp", v)}
          />

          <button onClick={handleSave} disabled={isSaving} className="pf-submit">
            {isSaving ? <><div className="pf-btn-spinner" /> Saving…</> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};