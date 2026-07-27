import React from "react";
import { Chrome } from "lucide-react";

interface GoogleButtonProps {
    onClick: () => void;
    label?: string;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
    onClick,
    label = "Continue with Google",
}) => (
    <button
        type="button"
        onClick={onClick}
        className="auth-btn-google"
        style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            border: "1.5px solid #e5e7eb",
            borderRadius: 11,
            height: 46,
            background: "#fff",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            color: "#374151",
            fontFamily: "'Outfit',sans-serif",
        }}
    >
        <Chrome size={17} color="#4285f4" />
        {label}
    </button>
);