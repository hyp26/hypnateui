import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { Plus, Edit2, Trash2, Search, Filter } from "lucide-react";
import { Button } from "../components/ui/Button";
import { formatCurrency } from "../lib/utils";
import { useDebounce } from "../hooks/useDebounce";

export const Products: React.FC = () => {
  const {
    products,
    total,
    page,
    limit,
    loading,
    fetchProducts,
    deleteProduct,
  } = useProductStore();

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("");
  const [sort, setSort] = useState<string>("createdAt_desc");
  const [localPage, setLocalPage] = useState<number>(1);

  const debouncedQ = useDebounce(q, 400);

  // Load products based on filters
  useEffect(() => {
    fetchProducts({
      page: localPage,
      limit,
      search: debouncedQ,
      category,
      sort,
    });
  }, [localPage, debouncedQ, category, sort]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Generate dynamic category list from products
  const dynamicCategories = useMemo<string[]>(() => {
    const unique = Array.from(
      new Set(
        products
          .map((p) => p.category)
          .filter((c): c is string => !!c && c.trim() !== "")
      )
    ) as string[];
    return ["", ...unique]; // "" for All categories
  }, [products]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product? This cannot be undone.")) return;
    try {
      await deleteProduct(id);
      fetchProducts({ page: localPage, limit, search: debouncedQ, category, sort });
    } catch {
      alert("Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link to="/products/new">
          <Button><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
        </Link>
      </div>

      {/* Search / Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setLocalPage(1); }}
            type="text"
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none"
          />
        </div>

        {/* Dynamic categories */}
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setLocalPage(1); }}
          className="px-3 py-2 border rounded"
        >
          <option value="">All categories</option>
          {dynamicCategories.map((cat) =>
            cat !== "" ? <option key={cat} value={cat}>{cat}</option> : null
          )}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="createdAt_desc">Newest</option>
          <option value="createdAt_asc">Oldest</option>
          <option value="price_asc">Price: low → high</option>
          <option value="price_desc">Price: high → low</option>
          <option value="stock_asc">Stock: low → high</option>
          <option value="stock_desc">Stock: high → low</option>
        </select>

        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" /> Filter
        </Button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {products.map((product, i) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{(page - 1) * limit + i + 1}</td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.imageUrl || "/placeholder-80.png"}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                    />
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </div>
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {product.category || "-"}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.stock < 10
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {product.stock} in stock
                  </span>
                </td>

                <td className="px-6 py-4 font-medium text-gray-900">
                  {formatCurrency(product.price)}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {product.description || "-"}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/products/${product.id}/edit`}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  {loading ? "Loading..." : "No products found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Showing page {page} of {totalPages} — {total} products
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocalPage((p) => Math.max(1, p - 1))}
            disabled={localPage <= 1}
            className="px-3 py-2 border rounded"
          >
            Prev
          </button>

          <span className="px-3 py-2 border rounded bg-white">{localPage}</span>

          <button
            onClick={() => setLocalPage((p) => Math.min(totalPages, p + 1))}
            disabled={localPage >= totalPages}
            className="px-3 py-2 border rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
