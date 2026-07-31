import React from "react";

export const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 16px",
    borderRadius: 12,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "inherit",
};

export const selectStyle: React.CSSProperties = {
    ...inputStyle,
    background: "#fff",
    cursor: "pointer",
    appearance: "none" as any,
};

export const fi = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "#0d9488";
    e.target.style.boxShadow = "0 0 0 3px rgba(13,148,136,0.1)";
};

export const fo = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "#e2e8f0";
    e.target.style.boxShadow = "none";
};