import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  Timestamp,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export interface Shoe {
  id?: string;
  name: string;
  description: string;
  price: number;
  size: number; // Size of the shoe (numeric)
  images: string[]; // Array of image URLs from Firebase Storage
  fantasyId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CreateShoeData {
  name: string;
  description: string;
  price: number;
  size: number;
  images: string[]; // Array of image URLs from Firebase Storage
  fantasyId: string;
}

class ShoesService {
  private collectionName = "shoes";

  // Create a new shoe
  async createShoe(data: CreateShoeData): Promise<string> {
    try {
      const shoeData: Omit<Shoe, "id"> = {
        ...data,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, this.collectionName),
        shoeData,
      );

      return docRef.id;
    } catch (error) {
      console.error("Error creating shoe:", error);
      throw new Error("Failed to create shoe");
    }
  }

  // Get all shoes
  async getAllShoes(): Promise<Shoe[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      const shoes: Shoe[] = [];

      querySnapshot.forEach((doc) => {
        shoes.push({
          id: doc.id,
          ...doc.data(),
        } as Shoe);
      });

      return shoes;
    } catch (error) {
      console.error("Error getting shoes:", error);
      throw new Error("Failed to fetch shoes");
    }
  }

  // Get shoes by fantasy ID
  async getShoesByFantasyId(fantasyId: string): Promise<Shoe[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("fantasyId", "==", fantasyId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const shoes: Shoe[] = [];

      querySnapshot.forEach((doc) => {
        shoes.push({
          id: doc.id,
          ...doc.data(),
        } as Shoe);
      });

      return shoes;
    } catch (error) {
      console.error("Error getting shoes by fantasy ID:", error);
      throw new Error("Failed to fetch shoes by fantasy ID");
    }
  }

  // Get shoe by ID
  async getShoeById(shoeId: string): Promise<Shoe | null> {
    try {
      const docRef = doc(db, this.collectionName, shoeId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Shoe;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting shoe:", error);
      throw new Error("Failed to fetch shoe");
    }
  }

  // Update shoe
  async updateShoe(
    shoeId: string,
    data: Partial<CreateShoeData>,
  ): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, shoeId);

      await updateDoc(docRef, data);
    } catch (error) {
      console.error("Error updating shoe:", error);
      throw new Error("Failed to update shoe");
    }
  }

  // Delete shoe
  async deleteShoe(shoeId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, shoeId);

      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting shoe:", error);
      throw new Error("Failed to delete shoe");
    }
  }

  // Get shoes by size
  async getShoesBySize(size: number, fantasyId?: string): Promise<Shoe[]> {
    try {
      let q;

      if (fantasyId) {
        q = query(
          collection(db, this.collectionName),
          where("size", "==", size),
          where("fantasyId", "==", fantasyId),
          orderBy("createdAt", "desc"),
        );
      } else {
        q = query(
          collection(db, this.collectionName),
          where("size", "==", size),
          orderBy("createdAt", "desc"),
        );
      }

      const querySnapshot = await getDocs(q);
      const shoes: Shoe[] = [];

      querySnapshot.forEach((doc) => {
        shoes.push({
          id: doc.id,
          ...doc.data(),
        } as Shoe);
      });

      return shoes;
    } catch (error) {
      console.error("Error getting shoes by size:", error);
      throw new Error("Failed to fetch shoes by size");
    }
  }

  // Get shoes by price range
  async getShoesByPriceRange(
    minPrice: number,
    maxPrice: number,
    fantasyId?: string,
  ): Promise<Shoe[]> {
    try {
      let q;

      if (fantasyId) {
        q = query(
          collection(db, this.collectionName),
          where("price", ">=", minPrice),
          where("price", "<=", maxPrice),
          where("fantasyId", "==", fantasyId),
          orderBy("price", "asc"),
        );
      } else {
        q = query(
          collection(db, this.collectionName),
          where("price", ">=", minPrice),
          where("price", "<=", maxPrice),
          orderBy("price", "asc"),
        );
      }

      const querySnapshot = await getDocs(q);
      const shoes: Shoe[] = [];

      querySnapshot.forEach((doc) => {
        shoes.push({
          id: doc.id,
          ...doc.data(),
        } as Shoe);
      });

      return shoes;
    } catch (error) {
      console.error("Error getting shoes by price range:", error);
      throw new Error("Failed to fetch shoes by price range");
    }
  }
}

export const shoesService = new ShoesService();
