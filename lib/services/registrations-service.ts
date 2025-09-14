import {
  collection,
  doc,
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

export interface Registration {
  id?: string;
  userId: string;
  teamId: string;
  teamName: string;
  teamSize: number;
  shoeId?: string;
  shoeName?: string;
  shoeSize?: number;
  totalPaid: number;
  paymentStatus: "pending" | "paid" | "failed" | "expired";
  paymentId: string; // link ke payments collection
  registeredAt: Timestamp;
}

class RegistrationsService {
  private getCollectionPath(fantasyId: string) {
    return `fantasies/${fantasyId}/registrations`;
  }

  // Get all registrations for a fantasy
  async getRegistrationsByFantasyId(
    fantasyId: string,
  ): Promise<Registration[]> {
    try {
      const q = query(
        collection(db, this.getCollectionPath(fantasyId)),
        orderBy("registeredAt", "desc"),
      );

      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      const registrations: Registration[] = [];

      querySnapshot.forEach((doc) => {
        registrations.push({
          id: doc.id,
          ...doc.data(),
        } as Registration);
      });

      return registrations;
    } catch (error) {
      console.error("Error getting registrations:", error);
      throw new Error("Failed to fetch registrations");
    }
  }

  // Get registrations by user ID
  async getRegistrationsByUserId(
    fantasyId: string,
    userId: string,
  ): Promise<Registration[]> {
    try {
      const q = query(
        collection(db, this.getCollectionPath(fantasyId)),
        where("userId", "==", userId),
        orderBy("registeredAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const registrations: Registration[] = [];

      querySnapshot.forEach((doc) => {
        registrations.push({
          id: doc.id,
          ...doc.data(),
        } as Registration);
      });

      return registrations;
    } catch (error) {
      console.error("Error getting registrations by user ID:", error);
      throw new Error("Failed to fetch registrations by user ID");
    }
  }

  // Get registrations by payment status
  async getRegistrationsByPaymentStatus(
    fantasyId: string,
    paymentStatus: "pending" | "paid" | "failed" | "expired",
  ): Promise<Registration[]> {
    try {
      const q = query(
        collection(db, this.getCollectionPath(fantasyId)),
        where("paymentStatus", "==", paymentStatus),
        orderBy("registeredAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const registrations: Registration[] = [];

      querySnapshot.forEach((doc) => {
        registrations.push({
          id: doc.id,
          ...doc.data(),
        } as Registration);
      });

      return registrations;
    } catch (error) {
      console.error("Error getting registrations by payment status:", error);
      throw new Error("Failed to fetch registrations by payment status");
    }
  }

  // Get registration by ID
  async getRegistrationById(
    fantasyId: string,
    registrationId: string,
  ): Promise<Registration | null> {
    try {
      const docRef = doc(db, this.getCollectionPath(fantasyId), registrationId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Registration;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting registration:", error);
      throw new Error("Failed to fetch registration");
    }
  }

  // Get registrations by team ID
  async getRegistrationsByTeamId(
    fantasyId: string,
    teamId: string,
  ): Promise<Registration[]> {
    try {
      const q = query(
        collection(db, this.getCollectionPath(fantasyId)),
        where("teamId", "==", teamId),
        orderBy("registeredAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const registrations: Registration[] = [];

      querySnapshot.forEach((doc) => {
        registrations.push({
          id: doc.id,
          ...doc.data(),
        } as Registration);
      });

      return registrations;
    } catch (error) {
      console.error("Error getting registrations by team ID:", error);
      throw new Error("Failed to fetch registrations by team ID");
    }
  }

  // Get total registrations count
  async getRegistrationsCount(fantasyId: string): Promise<number> {
    try {
      const querySnapshot = await getDocs(
        collection(db, this.getCollectionPath(fantasyId)),
      );

      return querySnapshot.size;
    } catch (error) {
      console.error("Error getting registrations count:", error);
      throw new Error("Failed to get registrations count");
    }
  }

  // Get total revenue from paid registrations
  async getTotalRevenue(fantasyId: string): Promise<number> {
    try {
      const q = query(
        collection(db, this.getCollectionPath(fantasyId)),
        where("paymentStatus", "==", "paid"),
      );

      const querySnapshot = await getDocs(q);
      let totalRevenue = 0;

      querySnapshot.forEach((doc) => {
        const registration = doc.data() as Registration;

        totalRevenue += registration.totalPaid;
      });

      return totalRevenue;
    } catch (error) {
      console.error("Error getting total revenue:", error);
      throw new Error("Failed to calculate total revenue");
    }
  }
}

export const registrationsService = new RegistrationsService();
