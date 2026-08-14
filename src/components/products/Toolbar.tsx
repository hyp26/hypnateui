import React from "react";
import { Search, Grid3X3, List } from "lucide-react";

interface ProductsToolbarProps {
    query: string;
    onQueryChange: (v: string) => void;
    category: string;
    onCategoryChange: (v: string) => void;
    categories: string[];
    sort: string;
    onSortChange: (v: string) => void;
    view: "grid" | "list";
    onViewChange: (v: "grid" | "list") => void;
}

export const ProductsToolbar: React.FC<ProductsToolbarProps> = ({
    query, onQueryChange, category, onCategoryChange, categories, sort, onSortChange, view, onViewChange,
}) => (
    <div className="prod-toolbar">
        <div className="prod-search-wrap">
            <Search size={14} className="prod-search-icon" />
            <input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search products…"
                className="prod-search"
            />
        </div>
        <div className="prod-filters">
            <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className="prod-select">
                <option value="">All categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={sort} onChange={(e) => onSortChange(e.target.value)} className="prod-select prod-select-hide">
                <option value="createdAt_desc">Newest</option>
                <option value="createdAt_asc">Oldest</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
                <option value="stock_asc">Stock ↑</option>
                <option value="stock_desc">Stock ↓</option>
            </select>
            <div className="view-toggle">
                <button className={`view-btn ${view === "grid" ? "active" : ""}`} onClick={() => onViewChange("grid")}>
                    <Grid3X3 size={14} />
                </button>
                <button className={`view-btn ${view === "list" ? "active" : ""}`} onClick={() => onViewChange("list")}>
                    <List size={14} />
                </button>
            </div>
        </div>
    </div>
);