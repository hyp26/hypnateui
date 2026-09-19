import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { useProductImageUpload } from "../hooks/useProductImageUpload";
import { ImageDropField } from "../components/products/ImageDropField";
import { SizePicker } from "../components/products/SizePicker";
import { ProductBasicInfoCard } from "../components/products/BasicInfoCard";
import { ProductPricingCard } from "../components/products/PricingCard";
import '../styles/productForm.css';

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const addProduct = useProductStore((s) => s.addProduct);
  const { imagePreview, selectFile, clear, upload } = useProductImageUpload();

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "" as number | "",
    mrp: "" as number | "",
    stock: "" as number | "",
  });
  const [sizes, setSizes] = useState<string[]>([]);
  const [customSize, setCustomSize] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const toggleSize = (s: string) =>
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const addCustomSize = () => {
    const v = customSize.trim();
    if (v && !sizes.includes(v)) setSizes((prev) => [...prev, v]);
    setCustomSize("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setIsLoading(true);
      const imageUrl = await upload();

      await addProduct({
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
      setError(err?.response?.data?.message || err.message || "Failed to add product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pf-root">
      <div className="pf-top">
        <Link to="/products" className="pf-back"><ArrowLeft size={16} /> Products</Link>
        <h1 className="pf-title">Add Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="pf-layout">
        <div className="pf-left">
          <ImageDropField imagePreview={imagePreview} onFileSelect={selectFile} onRemove={clear} inputId="add-product-image" />
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

          <button type="submit" disabled={isLoading} className="pf-submit">
            {isLoading ? <><div className="pf-btn-spinner" /> Adding…</> : <><Plus size={16} /> Add Product</>}
          </button>
        </div>
      </form>
    </div>
  );
};