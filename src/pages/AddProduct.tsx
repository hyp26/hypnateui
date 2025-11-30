import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { Button } from "../components/ui/Button";

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const addProduct = useProductStore((s) => s.addProduct);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME!;
  const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET!;

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!data.secure_url) {
      throw new Error("Image upload failed");
    }

    return data.secure_url; // This is the final hosted image URL
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please upload an image.");
      return;
    }

    try {
      setIsUploading(true);

      // Upload the image first
      const imageUrl = await uploadToCloudinary(imageFile);

      // Save product to backend
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
      alert("Failed to add product");
    } finally {
      setIsUploading(false);
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
            onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium">Stock</label>
          <input
            type="number"
            required
            value={stock}
            onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
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

        <Button type="submit" className="w-full h-12" isLoading={isUploading}>
          {isUploading ? "Uploading..." : "Add Product"}
        </Button>
      </form>
    </div>
  );
};
