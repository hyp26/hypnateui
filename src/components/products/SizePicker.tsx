import React from "react";
import { Plus, X, Layers } from "lucide-react";
import { PRESET_SIZES } from "../../data/productSizes";

interface SizePickerProps {
    sizes: string[];
    onToggle: (size: string) => void;
    customSize: string;
    onCustomSizeChange: (v: string) => void;
    onAddCustomSize: () => void;
}

export const SizePicker: React.FC<SizePickerProps> = ({
    sizes, onToggle, customSize, onCustomSizeChange, onAddCustomSize,
}) => (
    <div className="pf-card">
        <div className="pf-card-title"><Layers size={15} /> Sizes</div>
        {Object.entries(PRESET_SIZES).map(([group, opts]) => (
            <div key={group} className="pf-size-group">
                <p className="pf-size-label">{group.charAt(0).toUpperCase() + group.slice(1)}</p>
                <div className="pf-size-chips">
                    {opts.map((s) => (
                        <button
                            type="button"
                            key={s}
                            className={`pf-size-chip ${sizes.includes(s) ? "selected" : ""}`}
                            onClick={() => onToggle(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        ))}
        <div className="pf-custom-size">
            <input
                value={customSize}
                onChange={(e) => onCustomSizeChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAddCustomSize(); } }}
                placeholder="Custom size…"
                className="pf-input"
            />
            <button type="button" onClick={onAddCustomSize} className="pf-add-size-btn"><Plus size={14} /></button>
        </div>
        {sizes.length > 0 && (
            <div className="pf-selected-sizes">
                {sizes.map((s) => (
                    <span key={s} className="pf-selected-chip">
                        {s} <button type="button" onClick={() => onToggle(s)}><X size={10} /></button>
                    </span>
                ))}
            </div>
        )}
    </div>
);