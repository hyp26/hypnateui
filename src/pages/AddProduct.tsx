import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../stores/useAuthStore";

type Category = { id: number; name: string };

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const addProduct = useProductStore((s) => s.addProduct);
  const token = useAuthStore((s) => s.token);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string | null>(null);
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
  const DESCRIPTION_LIMIT = 1000; // char limit
  const EXCERPT_LENGTH = 120;

  useEffect(() => {
    // load categories
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/categories`);
        const data = await res.json();
        if (Array.isArray(data)) setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    load();
  }, [API]);

  // Upload image to backend → Cloudinary
  const uploadImageToBackend = async (file: File): Promise<string> => {
    if (!token) throw new Error("User not authenticated");

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API}/api/products/upload?mode=cloud`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await res.json();

    if (!res.ok || !data.url) {
      console.error("UPLOAD ERROR:", data);
      throw new Error(data.message || "Image upload failed");
    }

    return data.url;
  };

  // Basic sanitized preview renderer for bold/italic (very small subset of markdown)
  const renderPreviewHtml = (text: string) => {
    if (!text) return "";
    // Escape angle brackets
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    // **bold**
    const bolded = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // _italic_
    const italic = bolded.replace(/_(.+?)_/g, "<em>$1</em>");
    // line breaks
    const withBreaks = italic.replace(/\n/g, "<br/>");
    return withBreaks;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!imageFile) {
      setError("Please upload an image");
      return;
    }
    if (!name.trim()) {
      setError("Product name is required");
      return;
    }
    if (price === "" || Number.isNaN(Number(price))) {
      setError("Price is required");
      return;
    }
    if (stock === "" || Number.isNaN(Number(stock))) {
      setError("Stock is required");
      return;
    }

    try {
      setIsLoading(true);

      const imageUrl = await uploadImageToBackend(imageFile);

      const finalCategory = category === "custom" ? (customCategory || null) : category;
      const excerpt = (description || "").slice(0, EXCERPT_LENGTH);

      await addProduct({
        name: name.trim(),
        category: finalCategory ?? null,
        description: description || null,
        price: Number(price),
        stock: Number(stock),
        imageUrl,
      });

      navigate("/products");
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Product creation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>
        )}

        <div>
          <label className="block font-medium">Product Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium">Category</label>

          <div className="flex gap-2 items-center">
            <select
              value={category ?? ""}
              onChange={(e) => setCategory(e.target.value || null)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="custom">— Add custom category —</option>
            </select>

            {category === "custom" && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter category name"
                className="px-3 py-2 border rounded-lg flex-1"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block font-medium">Description (optional)</label>

          <div className="mt-1">
            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value.slice(0, DESCRIPTION_LIMIT)
                )
              }
              rows={6}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Write product details. Use **bold** or _italic_ for quick formatting."
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
            <div>{description.length}/{DESCRIPTION_LIMIT} characters</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreview((s) => !s)}
                className="text-sm text-primary-600 underline"
              >
                {showPreview ? "Hide preview" : "Show preview"}
              </button>
            </div>
          </div>

          {showPreview && (
            <div
              className="mt-3 p-3 border rounded bg-gray-50 prose max-w-full"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: renderPreviewHtml(description) }}
            />
          )}
        </div>

        <div>
          <label className="block font-medium">Price</label>
          <input
            type="number"
            required
            value={price}
            onChange={(e) =>
              setPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium">Stock</label>
          <input
            type="number"
            required
            value={stock}
            onChange={(e) =>
              setStock(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium">Product Image</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>

        <Button type="submit" className="w-full h-12" isLoading={isLoading} disabled={isLoading}>
          {isLoading ? "Saving..." : "Add Product"}
        </Button>
      </form>
    </div>
  );
};
