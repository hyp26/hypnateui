import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductsPaginationProps {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
}

export const ProductsPagination: React.FC<ProductsPaginationProps> = ({ page, totalPages, total, onPageChange }) => (
    <div className="prod-pagination">
        <span className="page-info">Page {page} of {totalPages} · {total} products</span>
        <div className="page-btns">
            <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} className="page-btn">
                <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                    <button key={pg} onClick={() => onPageChange(pg)} className={`page-btn ${pg === page ? "active" : ""}`}>
                        {pg}
                    </button>
                );
            })}
            <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="page-btn">
                <ChevronRight size={14} />
            </button>
        </div>
    </div>
);