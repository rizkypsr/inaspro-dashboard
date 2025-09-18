import { NextRequest, NextResponse } from "next/server";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { storage } from "../../../lib/firebase";

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileContent, contentType } = await request.json();

    if (!fileName || !fileContent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Convert base64 to blob
    const base64Data = fileContent.split(",")[1]; // Remove data:image/jpeg;base64, prefix
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType || "image/jpeg" });

    // Upload to Firebase Storage
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return NextResponse.json({
      downloadURL,
      fileName,
    });
  } catch (error) {
    console.error("Error uploading image:", error);

    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}