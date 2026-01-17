import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { Button } from "../components/ui/Button";
import { formatCurrency } from "../lib/utils";

export const ProductView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();

  const token = useAuthStore((s) => s.token);
  const API = process.env.REACT_APP_API_URL;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* --------------------------------------------------
   * LOAD PRODUCT (CI-SAFE)
   * -------------------------------------------------- */
  useEffect(() => {
    if (!API || !token || !productId) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${API}/api/products/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          alert("Failed to load product");
          navigate("/products");
          return;
        }

        setProduct(data);
      } catch (err) {
        console.error(err);
        alert("Error loading product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [API, token, productId, navigate]);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!product) return <div className="p-10">Product not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link
        to="/products"
        className="text-blue-600 hover:underline mb-4 block"
      >
        ← Back to Products
      </Link>

      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex gap-10">
          {/* Product Image */}
          <div>
            <img
              src={
                product.imageUrl ||
                "https://via.placeholder.com/300?text=No+Image"
              }
              alt={product.name}
              className="w-64 h-64 object-cover rounded-lg border"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{product.name}</h1>

            <p className="text-gray-700">
              <strong>Category:</strong>{" "}
              {product.category || "—"}
            </p>

            <p className="text-gray-700">
              <strong>Description:</strong>{" "}
              {product.description || "No description"}
            </p>

            <p className="text-gray-900 text-xl">
              <strong>Price:</strong>{" "}
              {formatCurrency(product.price)}
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
              Created on:{" "}
              {new Date(product.createdAt).toLocaleString()}
            </p>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <Link to={`/products/${product.id}/edit`}>
                <Button>Edit Product</Button>
              </Link>

              <Button
                variant="outline"
                onClick={() => navigate("/products")}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
