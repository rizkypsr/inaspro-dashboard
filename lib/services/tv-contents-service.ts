import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";

import { db } from "../firebase";
import {
  TvContent,
  CreateTvContentData,
  UpdateTvContentData,
} from "../../types/tv";

const TV_CATEGORIES_COLLECTION = "tvCategories";
const TV_CONTENTS_SUBCOLLECTION = "contents";

export class TvContentsService {
  // Get all contents for a specific category
  static async getContents(categoryId: string): Promise<TvContent[]> {
    try {
      const contentsRef = collection(
        db,
        TV_CATEGORIES_COLLECTION,
        categoryId,
        TV_CONTENTS_SUBCOLLECTION,
      );
      const q = query(contentsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as TvContent[];
    } catch (error) {
      console.error("Error fetching TV contents:", error);
      throw error;
    }
  }

  // Get a single content by ID
  static async getContent(
    categoryId: string,
    contentId: string,
  ): Promise<TvContent | null> {
    try {
      const contentRef = doc(
        db,
        TV_CATEGORIES_COLLECTION,
        categoryId,
        TV_CONTENTS_SUBCOLLECTION,
        contentId,
      );
      const snapshot = await getDoc(contentRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate() || new Date(),
      } as TvContent;
    } catch (error) {
      console.error("Error fetching TV content:", error);
      throw error;
    }
  }

  // Create a new content in a category
  static async createContent(
    categoryId: string,
    data: CreateTvContentData,
  ): Promise<TvContent> {
    try {
      return await runTransaction(db, async (transaction) => {
        const docRef = doc(
          collection(
            db,
            TV_CATEGORIES_COLLECTION,
            categoryId,
            TV_CONTENTS_SUBCOLLECTION,
          ),
        );

        const contentData = {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        transaction.set(docRef, contentData);

        return {
          id: docRef.id,
          title: data.title,
          image: data.image,
          link: data.link,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
    } catch (error) {
      console.error("Error creating TV content:", error);
      throw error;
    }
  }

  // Update an existing content
  static async updateContent(
    categoryId: string,
    contentId: string,
    data: UpdateTvContentData,
  ): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const contentRef = doc(
          db,
          TV_CATEGORIES_COLLECTION,
          categoryId,
          TV_CONTENTS_SUBCOLLECTION,
          contentId,
        );
        const docSnap = await transaction.get(contentRef);

        if (!docSnap.exists()) {
          throw new Error("Content not found");
        }

        transaction.update(contentRef, {
          ...data,
          updatedAt: serverTimestamp(),
        } as any);
      });
    } catch (error) {
      console.error("Error updating TV content:", error);
      throw error;
    }
  }

  // Delete a content
  static async deleteContent(
    categoryId: string,
    contentId: string,
  ): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const contentRef = doc(
          db,
          TV_CATEGORIES_COLLECTION,
          categoryId,
          TV_CONTENTS_SUBCOLLECTION,
          contentId,
        );
        const docSnap = await transaction.get(contentRef);

        if (!docSnap.exists()) {
          throw new Error("Content not found");
        }

        transaction.delete(contentRef);
      });
    } catch (error) {
      console.error("Error deleting TV content:", error);
      throw error;
    }
  }

  // Get total count of contents in a category
  static async getContentsCount(categoryId: string): Promise<number> {
    try {
      const contents = await this.getContents(categoryId);

      return contents.length;
    } catch (error) {
      console.error("Error getting contents count:", error);

      return 0;
    }
  }
}
