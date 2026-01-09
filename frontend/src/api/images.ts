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
