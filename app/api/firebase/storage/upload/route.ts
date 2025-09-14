import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Initialize Firebase
if (!getApps().length) {
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { fileName, content, contentType } = await request.json();

    if (!fileName || !content) {
      return NextResponse.json(
        { error: "Missing required fields: fileName and content" },
        { status: 400 },
      );
    }

    // Generate a unique filename to avoid conflicts
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;

    // Get Firebase Storage reference
    const storage = getStorage();
    const storageRef = ref(storage, uniqueFileName);

    // Convert base64 content to Uint8Array
    const base64Data = content.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const uint8Array = new Uint8Array(buffer);

    // Upload file to Firebase Storage
    const snapshot = await uploadBytes(storageRef, uint8Array, {
      contentType: contentType || "application/octet-stream",
    });

    // Get the download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return NextResponse.json({
      success: true,
      downloadUrl: downloadUrl,
      fileName: uniqueFileName,
    });
  } catch (error) {
    console.error("Error uploading file to Firebase Storage:", error);

    return NextResponse.json(
      { error: "Failed to upload file to Firebase Storage" },
      { status: 500 },
    );
  }
}
