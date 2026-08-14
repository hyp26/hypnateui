import React from "react";
import { IndianRupee } from "lucide-react";
import { calcDiscountPercent } from "../../utils/format";

interface ProductPricingCardProps {
    price: number | ""; onPriceChange: (v: number | "") => void;
    mrp: number | ""; onMrpChange: (v: number | "") => void;
}

export const ProductPricingCard: React.FC<ProductPricingCardProps> = ({ price, onPriceChange, mrp, onMrpChange }) => {
    const discountPct = mrp && price && Number(mrp) > Number(price)
        ? calcDiscountPercent(Number(price), Number(mrp))
        : 0;

    return (
        <div className="pf-card">
            <div className="pf-card-title"><IndianRupee size={15} /> Pricing</div>
            <div className="pf-row">
                <div className="pf-field">
                    <label className="pf-label">Selling Price *</label>
                    <div className="pf-input-prefix">
                        <span>₹</span>
                        <input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(e) => onPriceChange(e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="0"
                            className="pf-input pf-prefixed"
                        />
                    </div>
                </div>
                <div className="pf-field">
                    <label className="pf-label">MRP <span className="pf-optional">(crossed-out price)</span></label>
                    <div className="pf-input-prefix">
                        <span>₹</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={mrp}
                            onChange={(e) => onMrpChange(e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="0"
                            className="pf-input pf-prefixed"
                        />
                    </div>
                </div>
            </div>

            {discountPct > 0 && (
                <div className="pf-discount-preview">
                    <span className="pf-disc-badge">{discountPct}% off</span>
                    <span>Customer saves ₹{(Number(mrp) - Number(price)).toLocaleString()}</span>
                </div>
            )}
        </div>
    );
};