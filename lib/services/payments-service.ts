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

export interface Payment {
  id?: string;
  registrationId: string; // referensi balik ke registrasi
  fantasyId: string; // referensi ke event
  userId: string; // siapa yang bayar
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
  invoiceUrl: string; // link ke Xendit invoice
  externalId: string; // ID unik dari Xendit
  paymentMethod: string; // e-wallet, bank_transfer, QRIS, dsb
  paidAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

class PaymentsService {
  private collectionName = "payments";

  // Get all payments
  async getAllPayments(): Promise<Payment[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      const payments: Payment[] = [];

      querySnapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data(),
        } as Payment);
      });

      return payments;
    } catch (error) {
      console.error("Error getting payments:", error);
      throw new Error("Failed to fetch payments");
    }
  }

  // Get payments by fantasy ID
  async getPaymentsByFantasyId(fantasyId: string): Promise<Payment[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("fantasyId", "==", fantasyId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const payments: Payment[] = [];

      querySnapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data(),
        } as Payment);
      });

      return payments;
    } catch (error) {
      console.error("Error getting payments by fantasy ID:", error);
      throw new Error("Failed to fetch payments by fantasy ID");
    }
  }

  // Get payments by user ID
  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const payments: Payment[] = [];

      querySnapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data(),
        } as Payment);
      });

      return payments;
    } catch (error) {
      console.error("Error getting payments by user ID:", error);
      throw new Error("Failed to fetch payments by user ID");
    }
  }

  // Get payments by status
  async getPaymentsByStatus(
    status: "PENDING" | "PAID" | "FAILED" | "EXPIRED",
  ): Promise<Payment[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("status", "==", status),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const payments: Payment[] = [];

      querySnapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data(),
        } as Payment);
      });

      return payments;
    } catch (error) {
      console.error("Error getting payments by status:", error);
      throw new Error("Failed to fetch payments by status");
    }
  }

  // Get payment by ID
  async getPaymentById(paymentId: string): Promise<Payment | null> {
    try {
      const docRef = doc(db, this.collectionName, paymentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Payment;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting payment:", error);
      throw new Error("Failed to fetch payment");
    }
  }

  // Get payment by registration ID
  async getPaymentByRegistrationId(
    registrationId: string,
  ): Promise<Payment | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("registrationId", "==", registrationId),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];

        return {
          id: doc.id,
          ...doc.data(),
        } as Payment;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting payment by registration ID:", error);
      throw new Error("Failed to fetch payment by registration ID");
    }
  }

  // Get payment by external ID (Xendit)
  async getPaymentByExternalId(externalId: string): Promise<Payment | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("externalId", "==", externalId),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];

        return {
          id: doc.id,
          ...doc.data(),
        } as Payment;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting payment by external ID:", error);
      throw new Error("Failed to fetch payment by external ID");
    }
  }

  // Get total revenue by fantasy ID
  async getTotalRevenueByFantasyId(fantasyId: string): Promise<number> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("fantasyId", "==", fantasyId),
        where("status", "==", "PAID"),
      );

      const querySnapshot = await getDocs(q);
      let totalRevenue = 0;

      querySnapshot.forEach((doc) => {
        const payment = doc.data() as Payment;

        totalRevenue += payment.amount;
      });

      return totalRevenue;
    } catch (error) {
      console.error("Error getting total revenue:", error);
      throw new Error("Failed to calculate total revenue");
    }
  }

  // Get payments by payment method
  async getPaymentsByMethod(
    paymentMethod: string,
    fantasyId?: string,
  ): Promise<Payment[]> {
    try {
      let q;

      if (fantasyId) {
        q = query(
          collection(db, this.collectionName),
          where("paymentMethod", "==", paymentMethod),
          where("fantasyId", "==", fantasyId),
          orderBy("createdAt", "desc"),
        );
      } else {
        q = query(
          collection(db, this.collectionName),
          where("paymentMethod", "==", paymentMethod),
          orderBy("createdAt", "desc"),
        );
      }

      const querySnapshot = await getDocs(q);
      const payments: Payment[] = [];

      querySnapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data(),
        } as Payment);
      });

      return payments;
    } catch (error) {
      console.error("Error getting payments by method:", error);
      throw new Error("Failed to fetch payments by method");
    }
  }
}

export const paymentsService = new PaymentsService();
