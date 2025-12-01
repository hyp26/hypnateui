import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { useAuthStore } from "../stores/useAuthStore";
import { Button } from "../components/ui/Button";

type Category = { id: number; name: string };

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const addProduct = useProductStore((s) => s.addProduct);
  const token = useAuthStore((s) => s.token);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [customCategory, setCustomCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const API = process.env.REACT_APP_API_URL;
  const DESCRIPTION_LIMIT = 1000;
  const PREVIEW_LIMIT = 120;

  // Load categories on page mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API}/api/categories`);
        const data = await res.json();
        if (Array.isArray(data)) setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    loadCategories();
  }, [API]);

  // Upload image → Cloudinary (via backend)
  const uploadImage = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API}/api/products/upload?mode=cloud`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.message || "Image upload failed");
    return data.url;
  };

  // Preview sanitizer
  const formatPreview = (text: string) => {
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return escaped
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Product name is required");
    if (!price) return setError("Price is required");
    if (!stock) return setError("Stock is required");
    if (!imageFile) return setError("Please upload a product image");

    try {
      setIsLoading(true);

      // Upload image
      const imageUrl = await uploadImage(imageFile);

      // Handle custom category
      const finalCategory =
        category === "__custom" ? customCategory.trim() : category || null;

      await addProduct({
        name: name.trim(),
        category: finalCategory,
        description: description || null,
        price: Number(price),
        stock: Number(stock),
        imageUrl,
      });

      navigate("/products");
    } catch (err: any) {
      setError(err.message || "Product creation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow border">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        {/* Product Name */}
        <div>
          <label className="block font-medium">Product Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Category Selector */}
        <div>
          <label className="block font-medium">Category</label>

          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select category</option>

            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}

            <option value="__custom">— Add custom category —</option>
          </select>

          {category === "__custom" && (
            <input
              type="text"
              className="mt-2 w-full px-4 py-2 border rounded-lg"
              placeholder="Enter new category name"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              required
            />
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium">Description (optional)</label>

          <textarea
            className="w-full px-4 py-2 border rounded-lg"
            rows={6}
            placeholder="Write details. Use **bold** or _italic_ formatting."
            value={description}
            onChange={(e) => {
              const val = e.target.value.slice(0, DESCRIPTION_LIMIT);
              setDescription(val);
            }}
          />

          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{description.length}/{DESCRIPTION_LIMIT} characters</span>
            <button
              type="button"
              className="underline text-primary-600"
              onClick={() => setShowPreview((prev) => !prev)}
            >
              {showPreview ? "Hide preview" : "Show preview"}
            </button>
          </div>

          {showPreview && (
            <div
              className="p-3 mt-3 bg-gray-50 border rounded"
              dangerouslySetInnerHTML={{ __html: formatPreview(description) }}
            />
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block font-medium">Price</label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-lg"
            value={price}
            onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
            required
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block font-medium">Stock</label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-lg"
            value={stock}
            onChange={(e) => setStock(e.target.value ? Number(e.target.value) : "")}
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-medium">Product Image</label>
          <input
            type="file"
            className="w-full"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            required
          />
        </div>

        <Button className="w-full h-12" type="submit" isLoading={isLoading}>
          {isLoading ? "Saving..." : "Add Product"}
        </Button>
      </form>
    </div>
  );
};
