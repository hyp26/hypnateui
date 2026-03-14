import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { Button } from "../components/ui/Button";
import api from "../lib/api";

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const addProduct = useProductStore((s) => s.addProduct);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* --------------------------------------------------
   * IMAGE UPLOAD
   * -------------------------------------------------- */
  const uploadImage = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);

    const res = await api.post("/api/products/upload?mode=cloud", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (!res.data?.url) throw new Error("Image upload failed");
    return res.data.url;
  };

  /* --------------------------------------------------
   * SUBMIT
   * -------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);

      let imageUrl = null;
      if (imageFile) imageUrl = await uploadImage(imageFile);

      await addProduct({
        name,
        category: category || null,
        description: description || null,
        price: Number(price),
        stock: Number(stock),
        imageUrl,
      });

      navigate("/products");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Product creation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium">Product Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="e.g. food, apparel"
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
            required
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
        </div>

        <Button type="submit" className="w-full h-12" isLoading={isLoading}>
          {isLoading ? "Saving..." : "Add Product"}
        </Button>
      </form>
    </div>
  );
};