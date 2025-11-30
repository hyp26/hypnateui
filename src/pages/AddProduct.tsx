import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../stores/useAuthStore";

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const addProduct = useProductStore((s) => s.addProduct);
  const token = useAuthStore((s) => s.token); // GET TOKEN FROM ZUSTAND

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const API = process.env.REACT_APP_API_URL;

  // Upload file to backend (secure)
  const uploadImageToBackend = async (file: File): Promise<string> => {
    if (!token) throw new Error("User not authenticated");

    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API}/api/products/upload?mode=cloud`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // IMPORTANT FIX
      },
      body: form,
    });

    const data = await res.json();

    if (!res.ok || !data.url) {
      console.error("UPLOAD ERROR:", data);
      throw new Error("Image upload failed");
    }

    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Please upload an image");
      return;
    }

    try {
      setIsLoading(true);

      // 1. Upload image → backend → Cloudinary
      const imageUrl = await uploadImageToBackend(imageFile);

      // 2. Save product to DB via backend
      await addProduct({
        name,
        category,
        price: Number(price),
        stock: Number(stock),
        image: imageUrl,
      });

      navigate("/products");
    } catch (err) {
      console.error(err);
      alert("Product creation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-5">

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
          <input
            type="text"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
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

        <Button type="submit" className="w-full h-12" isLoading={isLoading}>
          {isLoading ? "Saving..." : "Add Product"}
        </Button>
      </form>
    </div>
  );
};
