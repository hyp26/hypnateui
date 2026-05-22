import React from "react";

const Field = ({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) => {
    return (
        <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>
                {label}
            </label>
            {children}
        </div>
    );
};

export default Field;