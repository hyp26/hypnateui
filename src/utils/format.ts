export const formatINR = (n: number): string =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const calcDiscountPercent = (price: number, mrp: number): number =>
    mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;