import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { useDebounce } from "../hooks/useDebounce";
import { ProductsToolbar } from "../components/products/Toolbar";
import { ProductGridCard } from "../components/products/GridCard";
import { ProductListRow } from "../components/products/ListRow";
import { ProductsLoadingState, ProductsEmptyState } from "../components/products/StateViews";
import { ProductsPagination } from "../components/products/Pagination";
import "../components/products/products.css";

export const Products: React.FC = () => {
  const { products, total, page, limit, loading, fetchProducts, deleteProduct } = useProductStore();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("createdAt_desc");
  const [localPage, setLocalPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [visible, setVisible] = useState(false);
  const debouncedQ = useDebounce(q, 400);

  useEffect(() => {
    fetchProducts({ page: localPage, limit, search: debouncedQ, category, sort });
  }, [fetchProducts, localPage, limit, debouncedQ, category, sort]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const dynamicCategories = useMemo<string[]>(
    () => Array.from(new Set(products.map((p) => p.category).filter((c): c is string => !!c && c.trim() !== ""))),
    [products]
  );
  const lowStock = products.filter((p) => p.stock < 10).length;

  const refetch = () => fetchProducts({ page: localPage, limit, search: debouncedQ, category, sort });

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await deleteProduct(id);
      refetch();
    } catch {
      alert("Failed to delete product");
    }
  };

  const handleQueryChange = (v: string) => { setQ(v); setLocalPage(1); };
  const handleCategoryChange = (v: string) => { setCategory(v); setLocalPage(1); };

  return (
    <div className={`prod-root ${visible ? "prod-visible" : ""}`}>
      <div className="prod-header">
        <div>
          <h1 className="prod-title">Products</h1>
          <p className="prod-sub">
            {total} total
            {lowStock > 0 && <span className="low-stock-pill">⚠ {lowStock} low stock</span>}
          </p>
        </div>
        <Link to="/products/new" className="prod-add-btn"><Plus size={15} /> <span>Add Product</span></Link>
      </div>

      <ProductsToolbar
        query={q}
        onQueryChange={handleQueryChange}
        category={category}
        onCategoryChange={handleCategoryChange}
        categories={dynamicCategories}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
      />

      {loading ? (
        <ProductsLoadingState />
      ) : products.length === 0 ? (
        <ProductsEmptyState />
      ) : view === "grid" ? (
        <div className="prod-grid">
          {products.map((p, i) => (
            <ProductGridCard key={p.id} product={p} index={i} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="prod-list">
          <div className="list-header">
            <span>Product</span><span>Category</span><span>Price</span><span>Stock</span>
            <span style={{ textAlign: "right" }}>Actions</span>
          </div>
          {products.map((p, i) => (
            <ProductListRow key={p.id} product={p} index={i} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {!loading && products.length > 0 && (
        <ProductsPagination page={page} totalPages={totalPages} total={total} onPageChange={setLocalPage} />
      )}
    </div>
  );
};