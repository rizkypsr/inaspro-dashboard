"use client";

import React, { useState, useRef } from "react";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Spinner } from "@heroui/spinner";

import ImageUploadService, {
  UploadResult,
} from "../lib/services/image-upload-service";

interface ImageUploadProps {
  onImageUploaded: (result: UploadResult) => void;
  onError?: (error: string) => void;
  onUploadStart?: () => void;
  productId?: string;
  disabled?: boolean;
  className?: string;
  isUploading?: boolean;
}

interface UploadingFile {
  file: File;
  preview: string;
  progress: number;
}

const UploadIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const ImageIcon = () => (
  <svg
    className="w-8 h-8 text-default-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

export default function ImageUpload({
  onImageUploaded,
  onError,
  onUploadStart,
  productId,
  disabled = false,
  className = "",
  isUploading: externalUploading = false,
}: ImageUploadProps) {
  const [uploadingFile, setUploadingFile] = useState<UploadingFile | null>(
    null,
  );
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      // Create preview
      const preview = URL.createObjectURL(file);

      setUploadingFile({ file, preview, progress: 0 });
      onUploadStart?.();

      // Simulate progress (Firebase doesn't provide real-time progress for small files)
      const progressInterval = setInterval(() => {
        setUploadingFile((prev) =>
          prev ? { ...prev, progress: Math.min(prev.progress + 20, 90) } : null,
        );
      }, 200);

      // Upload to Firebase Storage
      const result = await ImageUploadService.uploadImage(file, productId);

      clearInterval(progressInterval);
      setUploadingFile((prev) => (prev ? { ...prev, progress: 100 } : null));

      // Clean up preview URL
      URL.revokeObjectURL(preview);

      // Notify parent component
      onImageUploaded(result);

      // Reset state
      setTimeout(() => {
        setUploadingFile(null);
      }, 500);
    } catch (error: any) {
      console.error("Upload failed:", error);

      // Clean up on error
      if (uploadingFile?.preview) {
        URL.revokeObjectURL(uploadingFile.preview);
      }
      setUploadingFile(null);

      // Notify parent component
      const errorMessage = error.message || "Failed to upload image";

      onError?.(errorMessage);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploadingFile) return;

    const files = e.dataTransfer.files;

    handleFileSelect(files);
  };

  const handleButtonClick = () => {
    if (disabled || uploadingFile || externalUploading) return;
    fileInputRef.current?.click();
  };

  const isUploading = uploadingFile !== null;

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled || isUploading}
        type="file"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      <div
        aria-label="Upload image by clicking or dragging and dropping"
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-default-300 hover:border-default-400"
          }
          ${disabled || isUploading || externalUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        role="button"
        tabIndex={disabled || isUploading || externalUploading ? -1 : 0}
        onClick={handleButtonClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleButtonClick();
          }
        }}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <Image
                alt="Uploading preview"
                className="w-full h-full object-cover rounded"
                src={uploadingFile.preview}
              />
              <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                <Spinner color="white" size="sm" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-default-600">Uploading...</p>
              <div className="w-full bg-default-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadingFile.progress}%` }}
                />
              </div>
              <p className="text-xs text-default-500">
                {uploadingFile.progress}% complete
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <ImageIcon />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-default-700">
                Drop an image here, or click to select
              </p>
              <p className="text-xs text-default-500">
                Supports: JPEG, PNG, WebP (max 5MB)
              </p>
            </div>
            <Button
              color="primary"
              disabled={disabled || externalUploading}
              size="sm"
              startContent={
                externalUploading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <UploadIcon />
                )
              }
              variant="flat"
              onPress={handleButtonClick}
            >
              {externalUploading ? "Uploading..." : "Choose Image"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
