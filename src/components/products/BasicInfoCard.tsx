import React from "react";
import { Package } from "lucide-react";

interface ProductBasicInfoCardProps {
    name: string; onNameChange: (v: string) => void;
    category: string; onCategoryChange: (v: string) => void;
    stock: number | ""; onStockChange: (v: number | "") => void;
    description: string; onDescriptionChange: (v: string) => void;
    error?: string | null;
}

export const ProductBasicInfoCard: React.FC<ProductBasicInfoCardProps> = ({
    name, onNameChange, category, onCategoryChange, stock, onStockChange, description, onDescriptionChange, error,
}) => (
    <div className="pf-card">
        <div className="pf-card-title"><Package size={15} /> Basic Info</div>
        {error && <div className="pf-error">{error}</div>}

        <div className="pf-field">
            <label className="pf-label">Product Name *</label>
            <input
                required
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="e.g. Cotton Kurta Blue"
                className="pf-input"
            />
        </div>

        <div className="pf-row">
            <div className="pf-field">
                <label className="pf-label">Category</label>
                <input value={category} onChange={(e) => onCategoryChange(e.target.value)} placeholder="e.g. Clothing" className="pf-input" />
            </div>
            <div className="pf-field">
                <label className="pf-label">Stock *</label>
                <input
                    required
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => onStockChange(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="0"
                    className="pf-input"
                />
            </div>
        </div>

        <div className="pf-field">
            <label className="pf-label">Description</label>
            <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Product details, material, care instructions…"
                className="pf-input pf-textarea"
            />
        </div>
    </div>
);