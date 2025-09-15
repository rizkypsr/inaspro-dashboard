import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { storage } from "../firebase";

export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadError {
  message: string;
  code?: string;
}

/**
 * Image upload service for Firebase Storage operations
 */
export class ImageUploadService {
  private static readonly PRODUCTS_FOLDER = "products";
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  /**
   * Upload an image file to Firebase Storage
   * @param file - The image file to upload
   * @param productId - Optional product ID for organizing files
   * @returns Promise with upload result or throws error
   */
  static async uploadImage(
    file: File,
    productId?: string,
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const extension = file.name.split(".").pop();
      const fileName = `${timestamp}_${randomId}.${extension}`;

      // Create storage path
      const folderPath = productId
        ? `${this.PRODUCTS_FOLDER}/${productId}`
        : this.PRODUCTS_FOLDER;
      const filePath = `${folderPath}/${fileName}`;

      // Create storage reference
      const storageRef = ref(storage, filePath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        url: downloadURL,
        path: filePath,
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      throw this.handleUploadError(error);
    }
  }

  /**
   * Delete an image from Firebase Storage
   * @param imagePath - The storage path of the image to delete
   */
  static async deleteImage(imagePath: string): Promise<void> {
    try {
      const storageRef = ref(storage, imagePath);

      await deleteObject(storageRef);
    } catch (error) {
      console.error("Error deleting image:", error);
      // Don't throw error for delete operations to avoid blocking UI
      // Just log the error as the image might already be deleted
    }
  }

  /**
   * Extract storage path from Firebase download URL
   * @param downloadURL - The Firebase download URL
   * @returns The storage path or null if invalid URL
   */
  static extractPathFromURL(downloadURL: string): string | null {
    try {
      const url = new URL(downloadURL);
      const pathMatch = url.pathname.match(/\/o\/(.*?)\?/);

      return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
    } catch {
      return null;
    }
  }

  /**
   * Validate uploaded file
   * @param file - File to validate
   */
  private static validateFile(file: File): void {
    if (!file) {
      throw new Error("No file provided");
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(
        `File size too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(
        `Invalid file type. Allowed types: ${this.ALLOWED_TYPES.join(", ")}`,
      );
    }
  }

  /**
   * Handle upload errors and convert to user-friendly messages
   * @param error - The error object
   * @returns Formatted error object
   */
  private static handleUploadError(error: any): UploadError {
    if (error.code) {
      switch (error.code) {
        case "storage/unauthorized":
          return {
            message: "You don't have permission to upload images",
            code: error.code,
          };
        case "storage/canceled":
          return {
            message: "Upload was canceled",
            code: error.code,
          };
        case "storage/quota-exceeded":
          return {
            message: "Storage quota exceeded",
            code: error.code,
          };
        default:
          return {
            message: "Failed to upload image. Please try again.",
            code: error.code,
          };
      }
    }

    return {
      message: error.message || "Failed to upload image. Please try again.",
    };
  }
}

export default ImageUploadService;
