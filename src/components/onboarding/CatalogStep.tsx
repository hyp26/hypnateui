import React, { useRef, useState } from "react";
import { Bot, Check, ExternalLink, Upload, Wand2, X } from "lucide-react";
import { ErrorBanner } from "./ErrorBanner";

interface CatalogStepProps {
    fileName: string | null;
    onFile: (name: string, file: File) => void;
    onClear: () => void;
    error: string;
    onErrorClear: () => void;
}

export const CatalogStep: React.FC<CatalogStepProps> = ({ fileName, onFile, onClear, error, onErrorClear }) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    // Bug fix: selecting a file used to leave a stale "Something went wrong"
    // banner on screen (from an earlier failed attempt) sitting right next to
    // the new "File ready for import" success card. Clearing the error here —
    // the moment a new file is picked — keeps the two from ever coexisting.
    const handleFile = (f: File) => {
        if (error) onErrorClear();
        onFile(f.name, f);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 24px rgba(99,102,241,0.25)" }}>
                    <Upload size={22} color="#fff" />
                </div>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.3px" }}>Add your products</h2>
                    <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Upload any file — our AI converts it automatically.</p>
                </div>
            </div>

            {error && <ErrorBanner error={error} onClear={onErrorClear} />}

            {!fileName ? (
                <>
                    <div
                        onClick={() => fileRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragging(false);
                            const f = e.dataTransfer.files[0];
                            if (f) handleFile(f);
                        }}
                        style={{
                            border: `2px dashed ${dragging ? "#6366f1" : "#e2e8f0"}`,
                            borderRadius: 20,
                            padding: "40px 20px",
                            textAlign: "center",
                            cursor: "pointer",
                            background: dragging ? "#f5f3ff" : "#f8fafc",
                            transition: "all 0.2s",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)", backgroundSize: "24px 24px", opacity: 0.5 }} />
                        <div style={{ position: "relative", zIndex: 1 }}>
                            <div
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 16,
                                    background: dragging ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#fff",
                                    boxShadow: dragging ? "0 12px 32px rgba(99,102,241,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                    transition: "all 0.2s",
                                }}
                            >
                                <Upload size={24} color={dragging ? "#fff" : "#94a3b8"} />
                            </div>
                            <p style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", margin: "0 0 6px" }}>{dragging ? "Drop it!" : "Drop your catalog here"}</p>
                            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px" }}>or click to browse files</p>
                            <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                                {[".csv", ".xlsx", ".xls", ".pdf", ".docx", ".txt"].map((ext) => (
                                    <span key={ext} style={{ padding: "3px 8px", background: "#fff", color: "#64748b", fontSize: 10, borderRadius: 6, fontWeight: 700, fontFamily: "monospace", border: "1px solid #e2e8f0" }}>{ext}</span>
                                ))}
                            </div>
                            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 10 }}>AI auto-converts any format · Max 500 products</p>
                        </div>
                    </div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".csv,.xlsx,.xls,.pdf,.doc,.docx,.txt"
                        style={{ display: "none" }}
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFile(f);
                        }}
                    />

                    <div style={{ display: "flex", gap: 12, padding: 16, background: "linear-gradient(135deg,#eff6ff,#f5f3ff)", border: "1px solid #c7d2fe", borderRadius: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
                            <Wand2 size={16} color="#fff" />
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#3730a3", margin: "0 0 3px" }}>AI-powered catalog conversion</p>
                            <p style={{ fontSize: 12, color: "#6366f1", margin: 0, lineHeight: 1.6 }}>Upload a PDF, Excel or Word doc — our AI extracts and structures all your products automatically.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            const csv = `name,price,description,category,stock\nSample Product,499,A great product,Retail,100`;
                            const blob = new Blob([csv], { type: "text/csv" });
                            const a = document.createElement("a");
                            a.href = URL.createObjectURL(blob);
                            a.download = "sample_catalog.csv";
                            a.click();
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 6, color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0, fontFamily: "inherit" }}
                    >
                        <ExternalLink size={13} /> Download sample CSV template
                    </button>
                </>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: "linear-gradient(135deg,#f0fdfa,#ecfdf5)", border: "2px solid #6ee7b7", borderRadius: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#0d9488,#34d399)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(13,148,136,0.3)" }}>
                            <Check size={20} color="#fff" strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 700, color: "#065f46", margin: "0 0 2px", fontSize: 14 }}>File ready for import</p>
                            <p style={{ fontSize: 12, color: "#0d9488", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</p>
                        </div>
                        <button onClick={onClear} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
                            <X size={13} /> Remove
                        </button>
                    </div>
                    <div style={{ display: "flex", gap: 10, padding: 14, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, alignItems: "flex-start" }}>
                        <Bot size={15} color="#0d9488" style={{ flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 13, color: "#166534", margin: 0 }}>Hypnate AI will process this file and structure your products after setup completes.</p>
                    </div>
                </div>
            )}
        </div>
    );
};