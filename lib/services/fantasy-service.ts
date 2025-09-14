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
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Fantasy {
  id?: string;
  title: string;
  address: string;
  schedule: Timestamp;
  venue: string;
  notes: string;
  international: boolean;
  registrationFee: number;
  createdBy: string; // userId (admin)
  createdAt: Timestamp;
}

export interface CreateFantasyData {
  title: string;
  address: string;
  schedule: Date;
  venue: string;
  notes: string;
  international: boolean;
  registrationFee: number;
  createdBy: string;
}

class FantasyService {
  private collectionName = 'fantasies';

  // Create a new fantasy
  async createFantasy(data: CreateFantasyData): Promise<string> {
    try {
      const fantasyData: Omit<Fantasy, 'id'> = {
        ...data,
        schedule: Timestamp.fromDate(data.schedule),
        createdAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, this.collectionName), fantasyData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating fantasy:', error);
      throw new Error('Failed to create fantasy');
    }
  }

  // Get all fantasies
  async getAllFantasies(): Promise<Fantasy[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      const fantasies: Fantasy[] = [];
      
      querySnapshot.forEach((doc) => {
        fantasies.push({
          id: doc.id,
          ...doc.data()
        } as Fantasy);
      });
      
      return fantasies;
    } catch (error) {
      console.error('Error getting fantasies:', error);
      throw new Error('Failed to fetch fantasies');
    }
  }

  // Get fantasy by ID
  async getFantasyById(fantasyId: string): Promise<Fantasy | null> {
    try {
      const docRef = doc(db, this.collectionName, fantasyId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Fantasy;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting fantasy:', error);
      throw new Error('Failed to fetch fantasy');
    }
  }

  // Update fantasy
  async updateFantasy(fantasyId: string, data: Partial<CreateFantasyData>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, fantasyId);
      const { schedule, ...restData } = data;
      const updateData: any = { ...restData };
      
      if (schedule) {
        updateData.schedule = Timestamp.fromDate(schedule);
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating fantasy:', error);
      throw new Error('Failed to update fantasy');
    }
  }

  // Delete fantasy
  async deleteFantasy(fantasyId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, fantasyId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting fantasy:', error);
      throw new Error('Failed to delete fantasy');
    }
  }

  // Get fantasies by creator
  async getFantasiesByCreator(createdBy: string): Promise<Fantasy[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('createdBy', '==', createdBy),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fantasies: Fantasy[] = [];
      
      querySnapshot.forEach((doc) => {
        fantasies.push({
          id: doc.id,
          ...doc.data()
        } as Fantasy);
      });
      
      return fantasies;
    } catch (error) {
      console.error('Error getting fantasies by creator:', error);
      throw new Error('Failed to fetch fantasies by creator');
    }
  }

  // Get upcoming fantasies
  async getUpcomingFantasies(): Promise<Fantasy[]> {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, this.collectionName),
        where('schedule', '>', now),
        orderBy('schedule', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const fantasies: Fantasy[] = [];
      
      querySnapshot.forEach((doc) => {
        fantasies.push({
          id: doc.id,
          ...doc.data()
        } as Fantasy);
      });
      
      return fantasies;
    } catch (error) {
      console.error('Error getting upcoming fantasies:', error);
      throw new Error('Failed to fetch upcoming fantasies');
    }
  }
}

export const fantasyService = new FantasyService();