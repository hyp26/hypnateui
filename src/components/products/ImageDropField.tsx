import React, { useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageDropFieldProps {
    imagePreview: string | null;
    onFileSelect: (file: File) => void;
    onRemove: () => void;
    inputId?: string;
}

export const ImageDropField: React.FC<ImageDropFieldProps> = ({
    imagePreview, onFileSelect, onRemove, inputId = "product-image-input",
}) => {
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div className="pf-card">
            <div className="pf-card-title"><ImageIcon size={15} /> Product Image</div>
            <div
                className={`pf-drop ${isDragging ? "dragging" : ""} ${imagePreview ? "has-img" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const f = e.dataTransfer.files[0];
                    if (f) onFileSelect(f);
                }}
                onClick={() => document.getElementById(inputId)?.click()}
            >
                {imagePreview ? (
                    <>
                        <img src={imagePreview} alt="preview" className="pf-preview" />
                        <button type="button" className="pf-remove-img" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
                            <X size={14} />
                        </button>
                    </>
                ) : (
                    <div className="pf-drop-inner">
                        <Upload size={28} strokeWidth={1.5} />
                        <p>Drag & drop or <span>browse</span></p>
                        <p className="pf-drop-hint">PNG, JPG up to 5MB</p>
                    </div>
                )}
            </div>
            <input
                id={inputId}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect(f); }}
            />
        </div>
    );
};