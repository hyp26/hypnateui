export interface Product {
    id: number;
    name: string;
    description?: string | null;
    category?: string | null;
    price: number;
    mrp?: number | null;
    stock: number;
    sizes?: string[];
    imageUrl?: string | null;
    createdAt?: string;
}