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
  TvCategory,
  CreateTvCategoryData,
  UpdateTvCategoryData,
} from "../../types/tv";

const TV_CATEGORIES_COLLECTION = "tvCategories";

export class TvCategoriesService {
  // Get all TV categories ordered by order field
  static async getCategories(): Promise<TvCategory[]> {
    try {
      const categoriesRef = collection(db, TV_CATEGORIES_COLLECTION);
      const q = query(categoriesRef, orderBy("order", "asc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as TvCategory[];
    } catch (error) {
      console.error("Error fetching TV categories:", error);
      throw error;
    }
  }

  // Get a single TV category by ID
  static async getCategory(id: string): Promise<TvCategory | null> {
    try {
      const categoryRef = doc(db, TV_CATEGORIES_COLLECTION, id);
      const snapshot = await getDoc(categoryRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate() || new Date(),
      } as TvCategory;
    } catch (error) {
      console.error("Error fetching TV category:", error);
      throw error;
    }
  }

  // Create a new TV category
  static async createCategory(data: CreateTvCategoryData): Promise<TvCategory> {
    try {
      return await runTransaction(db, async (transaction) => {
        const docRef = doc(collection(db, TV_CATEGORIES_COLLECTION));

        const categoryData = {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        transaction.set(docRef, categoryData);

        return {
          id: docRef.id,
          title: data.title,
          order: data.order,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
    } catch (error) {
      console.error("Error creating TV category:", error);
      throw error;
    }
  }

  // Update an existing TV category
  static async updateCategory(
    id: string,
    data: UpdateTvCategoryData,
  ): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const docRef = doc(db, TV_CATEGORIES_COLLECTION, id);
        const docSnap = await transaction.get(docRef);

        if (!docSnap.exists()) {
          throw new Error("Category not found");
        }

        transaction.update(docRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (error) {
      console.error("Error updating TV category:", error);
      throw error;
    }
  }

  // Delete a TV category
  static async deleteCategory(id: string): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const docRef = doc(db, TV_CATEGORIES_COLLECTION, id);
        const docSnap = await transaction.get(docRef);

        if (!docSnap.exists()) {
          throw new Error("Category not found");
        }

        // Also delete all contents in this category
        const contentsQuery = query(
          collection(db, TV_CATEGORIES_COLLECTION, id, "contents"),
        );
        const contentsSnapshot = await getDocs(contentsQuery);

        contentsSnapshot.docs.forEach((contentDoc) => {
          transaction.delete(
            doc(db, TV_CATEGORIES_COLLECTION, id, "contents", contentDoc.id),
          );
        });

        transaction.delete(docRef);
      });
    } catch (error) {
      console.error("Error deleting TV category:", error);
      throw error;
    }
  }

  // Get the next order number for new categories
  static async getNextOrder(): Promise<number> {
    try {
      const categories = await this.getCategories();

      if (categories.length === 0) {
        return 1;
      }

      const maxOrder = Math.max(...categories.map((cat) => cat.order));

      return maxOrder + 1;
    } catch (error) {
      console.error("Error getting next order:", error);

      return 1;
    }
  }
}