import React from "react";
import { Link } from "react-router-dom";
import { Eye, Edit2, Trash2 } from "lucide-react";
import { PLACEHOLDER_PRODUCT_IMAGE, handleProductImageError } from "../../utils/productImage";
import { formatINR } from "../../utils/format";
import type { Product } from "../../types/product";

interface ProductListRowProps {
    product: Product;
    index: number;
    onDelete: (id: number) => void;
}

export const ProductListRow: React.FC<ProductListRowProps> = ({ product: p, index, onDelete }) => (
    <div className="list-row" style={{ animationDelay: `${index * 30}ms` }}>
        <div className="list-product">
            <img
                src={p.imageUrl || PLACEHOLDER_PRODUCT_IMAGE}
                onError={handleProductImageError}
                alt={p.name}
                className="list-img"
            />
            <div>
                <p className="list-name">{p.name}</p>
                {p.description && (
                    <p className="list-desc">
                        {p.description.slice(0, 40)}{p.description.length > 40 ? "…" : ""}
                    </p>
                )}
            </div>
        </div>
        <span className="prod-cat">{p.category || "—"}</span>
        <div>
            <span className="prod-price" style={{ fontSize: 14 }}>{formatINR(p.price)}</span>
            {p.mrp && p.mrp > p.price && <><br /><span className="prod-mrp">{formatINR(p.mrp)}</span></>}
        </div>
        <span className={`stock-pill ${p.stock < 10 ? "low" : "ok"}`}>{p.stock}</span>
        <div className="list-actions">
            <Link to={`/products/${p.id}`} className="card-action-btn"><Eye size={12} /></Link>
            <Link to={`/products/${p.id}/edit`} className="card-action-btn"><Edit2 size={12} /></Link>
            <button onClick={() => onDelete(p.id)} className="card-action-btn danger"><Trash2 size={12} /></button>
        </div>
    </div>
);