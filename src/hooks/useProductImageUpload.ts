import { useState } from "react";
import api from "../lib/api";

export function useProductImageUpload(initialPreview: string | null = null) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialPreview);

    const selectFile = (file: File) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const clear = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    // Uploads the pending file, if any, and returns its hosted URL.
    // Returns null when no new file was selected — callers fall back to
    // whatever URL they already had (e.g. EditProduct's existing imageUrl).
    const upload = async (): Promise<string | null> => {
        if (!imageFile) return null;
        const fd = new FormData();
        fd.append("file", imageFile);
        const res = await api.post("/api/products/upload?mode=cloud", fd, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (!res.data?.url) throw new Error("Image upload failed");
        return res.data.url;
    };

    return { imageFile, imagePreview, selectFile, clear, upload, setImagePreview };
}