import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useProductStore } from "../stores/useProductStore";
import { Button } from "../components/ui/Button";

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const addProduct = useProductStore((s) => s.addProduct);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [image, setImage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      await addProduct({
        name,
        category,
        price: Number(price),
        stock: Number(stock),
        image,
      });

      navigate("/products");
    } catch (err) {
      alert("Failed to add product");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Cotton Kurta"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Apparel, Beauty, Home..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            type="number"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="1299"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input
            type="number"
            required
            value={stock}
            onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="text"
            required
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <Button type="submit" className="w-full h-12" isLoading={isLoading}>
          Add Product
        </Button>

      </form>
    </div>
  );
};
