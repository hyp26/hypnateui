import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { formatCurrency } from "../lib/utils";
import api from "../lib/api";

export const ProductView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* --------------------------------------------------
   * LOAD PRODUCT
   * -------------------------------------------------- */
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${productId}`);
        setProduct(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load product");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  if (loading) return <div className="p-10">Loading...</div>;

  if (error || !product) return (
    <div className="p-10 text-red-600">{error || "Product not found"}</div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/products" className="text-blue-600 hover:underline mb-4 block">
        ← Back to Products
      </Link>

      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex gap-10">

          {/* Product Image */}
          <div>
            <img
              src={product.imageUrl || "https://via.placeholder.com/300?text=No+Image"}
              alt={product.name}
              className="w-64 h-64 object-cover rounded-lg border"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{product.name}</h1>

            <p className="text-gray-700">
              <strong>Category:</strong> {product.category || "—"}
            </p>

            <p className="text-gray-700">
              <strong>Description:</strong> {product.description || "No description"}
            </p>

            <p className="text-gray-900 text-xl">
              <strong>Price:</strong> {formatCurrency(product.price)}
            </p>

            <p>
              <strong>Stock:</strong>{" "}
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  product.stock < 10
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {product.stock} in stock
              </span>
            </p>

            <p className="text-gray-500 text-sm">
              Created on: {new Date(product.createdAt).toLocaleString()}
            </p>

            <div className="flex gap-3 mt-6">
              <Link to={`/products/${product.id}/edit`}>
                <Button>Edit Product</Button>
              </Link>
              <Button variant="outline" onClick={() => navigate("/products")}>
                Close
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};