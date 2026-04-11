import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { Plus, Search, Eye, Edit2, Trash2, Package, Grid3X3, List, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const discount = (price: number, mrp: number) => mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

export const Products: React.FC = () => {
  const { products, total, page, limit, loading, fetchProducts, deleteProduct } = useProductStore();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("createdAt_desc");
  const [localPage, setLocalPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [visible, setVisible] = useState(false);
  const debouncedQ = useDebounce(q, 400);

  useEffect(() => { fetchProducts({ page: localPage, limit, search: debouncedQ, category, sort }); }, [fetchProducts, localPage, limit, debouncedQ, category, sort]);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const dynamicCategories = useMemo<string[]>(() => Array.from(new Set(products.map(p => p.category).filter((c): c is string => !!c && c.trim() !== ""))), [products]);
  const lowStock = products.filter(p => p.stock < 10).length;

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try { await deleteProduct(id); fetchProducts({ page: localPage, limit, search: debouncedQ, category, sort }); } catch { alert("Failed to delete product"); }
  };

  return (
    <>
      <style>{css}</style>
      <div className={`prod-root ${visible ? "prod-visible" : ""}`}>

        {/* Header */}
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

        {/* Toolbar */}
        <div className="prod-toolbar">
          <div className="prod-search-wrap">
            <Search size={14} className="prod-search-icon" />
            <input value={q} onChange={e => { setQ(e.target.value); setLocalPage(1); }} placeholder="Search products…" className="prod-search" />
          </div>
          <div className="prod-filters">
            <select value={category} onChange={e => { setCategory(e.target.value); setLocalPage(1); }} className="prod-select">
              <option value="">All categories</option>
              {dynamicCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={sort} onChange={e => setSort(e.target.value)} className="prod-select prod-select-hide">
              <option value="createdAt_desc">Newest</option>
              <option value="createdAt_asc">Oldest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="stock_asc">Stock ↑</option>
              <option value="stock_desc">Stock ↓</option>
            </select>
            <div className="view-toggle">
              <button className={`view-btn ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}><Grid3X3 size={14} /></button>
              <button className={`view-btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}><List size={14} /></button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="prod-loading"><div className="prod-spinner" /><p>Loading products…</p></div>
        ) : products.length === 0 ? (
          <div className="prod-empty">
            <Package size={44} strokeWidth={1.2} />
            <h3>No products found</h3>
            <p>Add your first product to get started</p>
            <Link to="/products/new" className="prod-add-btn" style={{ marginTop: 16 }}><Plus size={15} /> Add Product</Link>
          </div>
        ) : view === "grid" ? (
          <div className="prod-grid">
            {products.map((p, i) => {
              const disc = p.mrp ? discount(p.price, p.mrp) : 0;
              return (
                <div key={p.id} className="prod-card" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="prod-img-wrap">
                    <img src={p.imageUrl || "/placeholder-80.png"} alt={p.name} className="prod-img" />
                    {disc > 0 && <span className="disc-badge">{disc}% off</span>}
                    {p.stock < 10 && <span className="stock-badge">Low stock</span>}
                    <div className="prod-card-actions">
                      <Link to={`/products/${p.id}`} className="card-action-btn"><Eye size={13} /></Link>
                      <Link to={`/products/${p.id}/edit`} className="card-action-btn"><Edit2 size={13} /></Link>
                      <button onClick={() => handleDelete(p.id)} className="card-action-btn danger"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div className="prod-card-body">
                    {p.category && <span className="prod-cat">{p.category}</span>}
                    <h3 className="prod-name">{p.name}</h3>
                    {p.sizes && p.sizes.length > 0 && (
                      <div className="prod-sizes">
                        {p.sizes.slice(0, 4).map((s: string) => <span key={s} className="size-chip">{s}</span>)}
                        {p.sizes.length > 4 && <span className="size-chip muted">+{p.sizes.length - 4}</span>}
                      </div>
                    )}
                    <div className="prod-price-row">
                      <span className="prod-price">{fmt(p.price)}</span>
                      {p.mrp && p.mrp > p.price && <span className="prod-mrp">{fmt(p.mrp)}</span>}
                    </div>
                    <span className={`stock-pill ${p.stock < 10 ? "low" : "ok"}`}>{p.stock} in stock</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="prod-list">
            <div className="list-header">
              <span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span style={{ textAlign: "right" }}>Actions</span>
            </div>
            {products.map((p, i) => (
              <div key={p.id} className="list-row" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="list-product">
                  <img src={p.imageUrl || "/placeholder-80.png"} alt={p.name} className="list-img" />
                  <div>
                    <p className="list-name">{p.name}</p>
                    {p.description && <p className="list-desc">{p.description.slice(0, 40)}{p.description.length > 40 ? "…" : ""}</p>}
                  </div>
                </div>
                <span className="prod-cat">{p.category || "—"}</span>
                <div><span className="prod-price" style={{ fontSize: 14 }}>{fmt(p.price)}</span>{p.mrp && p.mrp > p.price && <><br /><span className="prod-mrp">{fmt(p.mrp)}</span></>}</div>
                <span className={`stock-pill ${p.stock < 10 ? "low" : "ok"}`}>{p.stock}</span>
                <div className="list-actions">
                  <Link to={`/products/${p.id}`} className="card-action-btn"><Eye size={12} /></Link>
                  <Link to={`/products/${p.id}/edit`} className="card-action-btn"><Edit2 size={12} /></Link>
                  <button onClick={() => handleDelete(p.id)} className="card-action-btn danger"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="prod-pagination">
            <span className="page-info">Page {page} of {totalPages} · {total} products</span>
            <div className="page-btns">
              <button onClick={() => setLocalPage(p => Math.max(1, p - 1))} disabled={localPage <= 1} className="page-btn"><ChevronLeft size={14} /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(totalPages - 4, localPage - 2)) + i;
                return <button key={pg} onClick={() => setLocalPage(pg)} className={`page-btn ${pg === localPage ? "active" : ""}`}>{pg}</button>;
              })}
              <button onClick={() => setLocalPage(p => Math.min(totalPages, p + 1))} disabled={localPage >= totalPages} className="page-btn"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.prod-root { font-family: 'Outfit', sans-serif; padding: 16px; opacity: 0; transform: translateY(12px); transition: opacity 0.4s ease, transform 0.4s ease; }
.prod-visible { opacity: 1 !important; transform: none !important; }
@media(min-width:640px){ .prod-root { padding: 20px; } }
@media(min-width:1024px){ .prod-root { padding: 28px 32px; } }

.prod-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; gap: 12px; }
.prod-title { font-size: clamp(20px, 4vw, 28px); font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
.prod-sub { font-size: 12px; color: #94a3b8; margin: 4px 0 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.low-stock-pill { background: #fff7ed; color: #c2410c; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
.prod-add-btn { display: inline-flex; align-items: center; gap: 5px; background: #0d9488; color: #fff; font-size: 12px; font-weight: 700; padding: 9px 14px; border-radius: 10px; text-decoration: none; white-space: nowrap; font-family: 'Outfit', sans-serif; }
.prod-add-btn:hover { background: #0f766e; }

.prod-toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; background: #fff; padding: 10px 12px; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 4px rgba(0,0,0,0.05); flex-wrap: wrap; }
.prod-search-wrap { position: relative; flex: 1; min-width: 140px; }
.prod-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
.prod-search { width: 100%; box-sizing: border-box; padding: 8px 10px 8px 32px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 13px; font-family: 'Outfit', sans-serif; outline: none; color: #0f172a; background: #f8fafc; }
.prod-search:focus { border-color: #0f172a; background: #fff; }
.prod-filters { display: flex; gap: 8px; align-items: center; }
.prod-select { padding: 7px 10px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 12px; font-family: 'Outfit', sans-serif; color: #374151; background: #f8fafc; outline: none; cursor: pointer; }
.prod-select-hide { display: none; }
@media(min-width:640px){ .prod-select-hide { display: block; } }

.view-toggle { display: flex; border: 1.5px solid #e2e8f0; border-radius: 9px; overflow: hidden; }
.view-btn { padding: 6px 9px; border: none; background: transparent; cursor: pointer; color: #94a3b8; display: flex; align-items: center; transition: all 0.15s; }
.view-btn.active { background: #0f172a; color: #fff; }

/* Grid */
.prod-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
@media(min-width:480px){ .prod-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }
@media(min-width:768px){ .prod-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
@media(min-width:1280px){ .prod-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }

.prod-card { background: #fff; border-radius: 14px; border: 1px solid #f1f5f9; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s; animation: fadeUp 0.4s ease both; }
.prod-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.09); }
@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
.prod-img-wrap { position: relative; aspect-ratio: 1; overflow: hidden; background: #f8fafc; }
.prod-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.prod-card:hover .prod-img { transform: scale(1.04); }
.disc-badge { position: absolute; top: 7px; left: 7px; background: #ef4444; color: #fff; font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 20px; }
.stock-badge { position: absolute; top: 7px; right: 7px; background: #fff7ed; color: #c2410c; font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 20px; border: 1px solid #fed7aa; }
.prod-card-actions { position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: center; gap: 5px; padding: 8px; background: linear-gradient(to top, rgba(0,0,0,0.55), transparent); opacity: 0; transition: opacity 0.2s; }
.prod-card:hover .prod-card-actions { opacity: 1; }
.card-action-btn { width: 28px; height: 28px; border-radius: 7px; background: rgba(255,255,255,0.9); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #374151; transition: all 0.15s; text-decoration: none; }
.card-action-btn:hover { background: #fff; transform: scale(1.1); }
.card-action-btn.danger:hover { background: #fef2f2; color: #dc2626; }
.prod-card-body { padding: 10px 12px; }
.prod-cat { display: inline-block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #0d9488; background: #f0fdfa; padding: 2px 7px; border-radius: 20px; margin-bottom: 5px; }
.prod-name { font-size: 12px; font-weight: 700; color: #0f172a; margin: 0 0 6px; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.prod-sizes { display: flex; gap: 3px; flex-wrap: nowrap; margin-bottom: 6px; overflow: hidden; }
.size-chip { font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 5px; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; white-space: nowrap; }
.size-chip.muted { color: #94a3b8; }
.prod-price-row { display: flex; align-items: baseline; gap: 5px; margin-bottom: 5px; }
.prod-price { font-size: 15px; font-weight: 800; color: #0f172a; }
.prod-mrp { font-size: 11px; color: #94a3b8; text-decoration: line-through; }
.stock-pill { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
.stock-pill.ok { background: #dcfce7; color: #166534; }
.stock-pill.low { background: #fff7ed; color: #c2410c; }

/* List */
.prod-list { background: #fff; border-radius: 14px; border: 1px solid #f1f5f9; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow-x: auto; }
.list-header { display: grid; grid-template-columns: 2fr 1fr 1fr 0.6fr 0.8fr; padding: 10px 16px; background: #f8fafc; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.6px; border-bottom: 1px solid #f1f5f9; min-width: 500px; }
.list-row { display: grid; grid-template-columns: 2fr 1fr 1fr 0.6fr 0.8fr; padding: 12px 16px; border-bottom: 1px solid #f8fafc; align-items: center; transition: background 0.1s; animation: fadeUp 0.35s ease both; min-width: 500px; }
.list-row:hover { background: #f8fafc; }
.list-row:last-child { border-bottom: none; }
.list-product { display: flex; align-items: center; gap: 10px; }
.list-img { width: 38px; height: 38px; border-radius: 8px; object-fit: cover; background: #f1f5f9; flex-shrink: 0; }
.list-name { font-size: 13px; font-weight: 600; color: #0f172a; margin: 0 0 2px; }
.list-desc { font-size: 11px; color: #94a3b8; margin: 0; }
.list-actions { display: flex; gap: 4px; justify-content: flex-end; }

/* States */
.prod-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; gap: 14px; color: #94a3b8; font-size: 13px; }
.prod-spinner { width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #0f172a; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.prod-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; gap: 10px; color: #94a3b8; text-align: center; }
.prod-empty h3 { font-size: 17px; font-weight: 700; color: #334155; margin: 0; }
.prod-empty p { font-size: 13px; margin: 0; }

/* Pagination */
.prod-pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; flex-wrap: wrap; gap: 10px; }
.page-info { font-size: 12px; color: #94a3b8; }
.page-btns { display: flex; gap: 4px; }
.page-btn { width: 32px; height: 32px; border: 1.5px solid #e2e8f0; border-radius: 7px; background: #fff; color: #374151; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: 'Outfit', sans-serif; }
.page-btn:hover:not(:disabled) { border-color: #0f172a; color: #0f172a; }
.page-btn.active { background: #0d9488; border-color: #0d9488; color: #fff; }
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
`;