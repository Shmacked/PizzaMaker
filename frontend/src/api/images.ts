import { apiFetch } from "./client";

const API_BASE_URL = "http://localhost:9002";

/**
 * Upload an image file to the server
 * @param file The file to upload
 * @returns Promise resolving to the uploaded file's filename and path
 */
export const uploadImage = async (file: File): Promise<{ filename: string; path: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch(`${API_BASE_URL}/pizza/upload_image`, {
        method: "POST",
        body: formData,
    });
    
    if (!response.ok) {
        throw new Error(await response.text());
    }
    
    return await response.json();
};

/**
 * Delete an image file from the server
 * @param filename The filename or path of the image to delete
 * @returns Promise that resolves when the file is deleted
 */
export const deleteImage = async (filename: string): Promise<void> => {
    await apiFetch<void>(`/pizza/delete_image/${filename}`, {
        method: "DELETE",
    });
};

/**
 * Convert database image path to URL path for display
 * Handles conversion from "dist/images/..." to "/dist/images/..." for URL access
 * @param imageUrl The image URL from the database (may include "dist" prefix)
 * @returns The URL path suitable for use in img src attributes
 */
export const getImageUrl = (imageUrl: string | undefined | null): string => {
    if (!imageUrl) return "https://via.placeholder.com/150";
    // Convert "dist/images/..." to "/dist/images/..." for URL access
    if (imageUrl.startsWith("dist/images/")) {
        return `/${imageUrl}`;
    }
    // If it already starts with "/", return as is
    if (imageUrl.startsWith("/")) {
        return imageUrl;
    }
    // Otherwise, assume it's a relative path and add "/"
    return `/${imageUrl}`;
};
