import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { Button } from "../components/ui/Button";
import api from "../lib/api";

export const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();

  const { updateProduct } = useProductStore();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    name: "",
    category: "",
    description: "",
    price: 0,
    stock: 0,
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  /* --------------------------------------------------
   * LOAD PRODUCT
   * -------------------------------------------------- */
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${productId}`);
        setForm(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  /* --------------------------------------------------
   * IMAGE UPLOAD
   * -------------------------------------------------- */
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/api/products/upload?mode=cloud", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (!res.data?.url) throw new Error("Image upload failed");
    return res.data.url;
  };

  /* --------------------------------------------------
   * SAVE
   * -------------------------------------------------- */
  const handleSave = async () => {
    setError(null);

    try {
      setIsSaving(true);

      let imageUrl = form.imageUrl;
      if (imageFile) imageUrl = await uploadImage(imageFile);

      await updateProduct(productId, {
        name: form.name,
        category: form.category,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl,
      });

      navigate("/products");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block font-medium">Product Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium">Category</label>
          <input
            value={form.category || ""}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium">Price</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium">Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full"
          />
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              className="w-24 h-24 mt-3 object-cover rounded"
              alt="preview"
            />
          )}
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full h-12">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};