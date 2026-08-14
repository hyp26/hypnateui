import React from "react";
import { Link } from "react-router-dom";
import { Eye, Edit2, Trash2 } from "lucide-react";
import { PLACEHOLDER_PRODUCT_IMAGE, handleProductImageError } from "../../utils/productImage";
import { formatINR, calcDiscountPercent } from "../../utils/format";
import type { Product } from "../../types/product";

interface ProductGridCardProps {
    product: Product;
    index: number;
    onDelete: (id: number) => void;
}

export const ProductGridCard: React.FC<ProductGridCardProps> = ({ product: p, index, onDelete }) => {
    const disc = p.mrp ? calcDiscountPercent(p.price, p.mrp) : 0;

    return (
        <div className="prod-card" style={{ animationDelay: `${index * 40}ms` }}>
            <div className="prod-img-wrap">
                <img
                    src={p.imageUrl || PLACEHOLDER_PRODUCT_IMAGE}
                    onError={handleProductImageError}
                    alt={p.name}
                    className="prod-img"
                />
                {disc > 0 && <span className="disc-badge">{disc}% off</span>}
                {p.stock < 10 && <span className="stock-badge">Low stock</span>}
                <div className="prod-card-actions">
                    <Link to={`/products/${p.id}`} className="card-action-btn"><Eye size={13} /></Link>
                    <Link to={`/products/${p.id}/edit`} className="card-action-btn"><Edit2 size={13} /></Link>
                    <button onClick={() => onDelete(p.id)} className="card-action-btn danger"><Trash2 size={13} /></button>
                </div>
            </div>
            <div className="prod-card-body">
                {p.category && <span className="prod-cat">{p.category}</span>}
                <h3 className="prod-name">{p.name}</h3>
                {p.sizes && p.sizes.length > 0 && (
                    <div className="prod-sizes">
                        {p.sizes.slice(0, 4).map((s) => <span key={s} className="size-chip">{s}</span>)}
                        {p.sizes.length > 4 && <span className="size-chip muted">+{p.sizes.length - 4}</span>}
                    </div>
                )}
                <div className="prod-price-row">
                    <span className="prod-price">{formatINR(p.price)}</span>
                    {p.mrp && p.mrp > p.price && <span className="prod-mrp">{formatINR(p.mrp)}</span>}
                </div>
                <span className={`stock-pill ${p.stock < 10 ? "low" : "ok"}`}>{p.stock} in stock</span>
            </div>
        </div>
    );
};