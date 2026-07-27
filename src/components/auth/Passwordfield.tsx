import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    hint?: string;
    name?: string;
    autoComplete?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
    label = "Password",
    value,
    onChange,
    placeholder = "••••••••",
    error,
    hint,
    name = "password",
    autoComplete = "current-password",
}) => {
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <label
                htmlFor={name}
                style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}
            >
                {label}
            </label>
            <div style={{ position: "relative" }}>
                <input
                    id={name}
                    name={name}
                    type={visible ? "text" : "password"}
                    value={value}
                    autoComplete={autoComplete}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    aria-invalid={!!error}
                    className="auth-input"
                    style={{
                        width: "100%",
                        padding: "11px 42px 11px 14px",
                        borderRadius: 10,
                        border: `1.5px solid ${error ? "#fca5a5" : "#e5e7eb"}`,
                        fontSize: 14,
                        color: "#111827",
                        background: "#fff",
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: "'Outfit',sans-serif",
                    }}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Hide password" : "Show password"}
                    style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {error ? (
                <p style={{ fontSize: 11, color: "#dc2626", marginTop: 5 }}>{error}</p>
            ) : hint ? (
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 5 }}>{hint}</p>
            ) : null}
        </div>
    );
};