import React from "react";
import { Tag, Package, Layers, Calendar, IndianRupee } from "lucide-react";
import { formatINR } from "../../utils/format";
import type { Product } from "../../types/product";

interface ProductInfoPanelProps {
    product: Product;
    discountPercent: number;
}

export const ProductInfoPanel: React.FC<ProductInfoPanelProps> = ({ product, discountPercent }) => (
    <div className="pv-info-col">
        {product.category && (
            <span className="pv-category"><Tag size={11} /> {product.category}</span>
        )}

        <h1 className="pv-name">{product.name}</h1>

        <div className="pv-price-block">
            <span className="pv-price">{formatINR(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
                <>
                    <span className="pv-mrp">MRP {formatINR(product.mrp)}</span>
                    <span className="pv-save">Save {formatINR(product.mrp - product.price)} ({discountPercent}% off)</span>
                </>
            )}
        </div>

        <div className={`pv-stock ${product.stock < 10 ? "low" : "ok"}`}>
            <Package size={14} />
            {product.stock < 10
                ? `Only ${product.stock} units left — restock soon`
                : `${product.stock} units in stock`}
        </div>

        {product.sizes && product.sizes.length > 0 && (
            <div className="pv-section">
                <div className="pv-section-label"><Layers size={13} /> Available Sizes</div>
                <div className="pv-sizes">
                    {product.sizes.map((s) => <span key={s} className="pv-size-chip">{s}</span>)}
                </div>
            </div>
        )}

        {product.description && (
            <div className="pv-section">
                <div className="pv-section-label"><Package size={13} /> Description</div>
                <p className="pv-desc">{product.description}</p>
            </div>
        )}

        <div className="pv-meta">
            {product.createdAt && (
                <div className="pv-meta-item">
                    <Calendar size={13} />
                    <span>
                        Added {new Date(product.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                </div>
            )}
            <div className="pv-meta-item">
                <IndianRupee size={13} />
                <span>Product ID #{product.id}</span>
            </div>
        </div>
    </div>
);