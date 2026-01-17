import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { useAuthStore } from "../stores/useAuthStore";
import { Button } from "../components/ui/Button";

export const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();

  const { updateProduct } = useProductStore();
  const token = useAuthStore((s) => s.token);
  const API = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({
    name: "",
    category: "",
    description: "",
    price: 0,
    stock: 0,
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  /* --------------------------------------------------
   * LOAD PRODUCT
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

        if (res.ok) {
          setForm(data);
        } else {
          alert("Failed to load product");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [API, token, productId]);

  /* --------------------------------------------------
   * IMAGE UPLOAD
   * -------------------------------------------------- */
  const uploadImageToBackend = async (file: File) => {
    if (!API || !token) throw new Error("Missing API or token");

    const formd = new FormData();
    formd.append("file", file);

    const res = await fetch(
      `${API}/api/products/upload?mode=cloud`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formd,
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Image upload failed");

    return data.url;
  };

  /* --------------------------------------------------
   * SAVE
   * -------------------------------------------------- */
  const handleSave = async () => {
    try {
      setIsSaving(true);

      let imageUrl = form.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImageToBackend(imageFile);
      }

      await updateProduct(productId, {
        name: form.name,
        category: form.category,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl,
      });

      navigate("/products");
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <div className="space-y-5">
        <div>
          <label className="block font-medium">Product Name</label>
          <input
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium">Category</label>
          <input
            value={form.category || ""}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            value={form.description || ""}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium">Price</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium">Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) =>
              setForm({ ...form, stock: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-medium">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImageFile(e.target.files?.[0] || null)
            }
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

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-12"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
