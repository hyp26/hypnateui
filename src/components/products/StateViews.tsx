import React from "react";
import { Link } from "react-router-dom";
import { Package, Plus } from "lucide-react";

export const ProductsLoadingState: React.FC = () => (
    <div className="prod-loading">
        <div className="prod-spinner" />
        <p>Loading products…</p>
    </div>
);

export const ProductsEmptyState: React.FC = () => (
    <div className="prod-empty">
        <Package size={44} strokeWidth={1.2} />
        <h3>No products found</h3>
        <p>Add your first product to get started</p>
        <Link to="/products/new" className="prod-add-btn" style={{ marginTop: 16 }}>
            <Plus size={15} /> Add Product
        </Link>
    </div>
);