import React from "react";
import { Link } from "react-router-dom";
import { Edit2, Trash2, AlertTriangle } from "lucide-react";
import { PLACEHOLDER_PRODUCT_IMAGE, handleProductImageError } from "../../utils/productImage";
import type { Product } from "../../types/product";

interface ProductImagePanelProps {
    product: Product;
    discountPercent: number;
    onDelete: () => void;
}

export const ProductImagePanel: React.FC<ProductImagePanelProps> = ({ product, discountPercent, onDelete }) => (
    <div className="pv-img-col">
        <div className="pv-img-wrap">
            <img
                src={product.imageUrl || PLACEHOLDER_PRODUCT_IMAGE}
                onError={handleProductImageError}
                alt={product.name}
                className="pv-img"
            />
            {discountPercent > 0 && <span className="pv-disc-badge">{discountPercent}% OFF</span>}
            {product.stock < 10 && (
                <div className="pv-low-stock">
                    <AlertTriangle size={13} /> Only {product.stock} left
                </div>
            )}
        </div>

        <div className="pv-actions">
            <Link to={`/products/${product.id}/edit`} className="pv-btn-edit">
                <Edit2 size={15} /> Edit Product
            </Link>
            <button onClick={onDelete} className="pv-btn-delete">
                <Trash2 size={15} /> Delete
            </button>
        </div>
    </div>
);