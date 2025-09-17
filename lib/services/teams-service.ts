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

export interface TShirt {
  id: string;
  size: string; // S, M, L, XL, XXL, XXXL
  image: string; // Image URL from Firebase Storage
}

export interface Team {
  id?: string;
  name: string;
  description: string;
  tshirts: TShirt[]; // Array of t-shirts with different sizes
  fantasyId: string; // reference ke event terkait
  createdAt: Timestamp;
}

export interface CreateTeamData {
  name: string;
  description: string;
  tshirts: TShirt[];
  fantasyId: string;
}

class TeamsService {
  private collectionName = "teams";

  // Create a new team
  async createTeam(data: CreateTeamData): Promise<string> {
    try {
      const teamData: Omit<Team, "id"> = {
        ...data,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, this.collectionName),
        teamData,
      );

      return docRef.id;
    } catch (error) {
      console.error("Error creating team:", error);
      throw new Error("Failed to create team");
    }
  }

  // Get all teams
  async getAllTeams(): Promise<Team[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      const teams: Team[] = [];

      querySnapshot.forEach((doc) => {
        teams.push({
          id: doc.id,
          ...doc.data(),
        } as Team);
      });

      return teams;
    } catch (error) {
      console.error("Error getting teams:", error);
      throw new Error("Failed to fetch teams");
    }
  }

  // Get teams by fantasy ID
  async getTeamsByFantasyId(fantasyId: string): Promise<Team[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("fantasyId", "==", fantasyId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const teams: Team[] = [];

      querySnapshot.forEach((doc) => {
        teams.push({
          id: doc.id,
          ...doc.data(),
        } as Team);
      });

      return teams;
    } catch (error) {
      console.error("Error getting teams by fantasy ID:", error);
      throw new Error("Failed to fetch teams by fantasy ID");
    }
  }

  // Get team by ID
  async getTeamById(teamId: string): Promise<Team | null> {
    try {
      const docRef = doc(db, this.collectionName, teamId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Team;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting team:", error);
      throw new Error("Failed to fetch team");
    }
  }

  // Update team
  async updateTeam(
    teamId: string,
    data: Partial<CreateTeamData>,
  ): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, teamId);

      await updateDoc(docRef, data);
    } catch (error) {
      console.error("Error updating team:", error);
      throw new Error("Failed to update team");
    }
  }

  // Delete team
  async deleteTeam(teamId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, teamId);

      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting team:", error);
      throw new Error("Failed to delete team");
    }
  }

  // Get teams that have t-shirts with specific size
  async getTeamsBySize(size: string, fantasyId?: string): Promise<Team[]> {
    try {
      let q;

      if (fantasyId) {
        q = query(
          collection(db, this.collectionName),
          where("fantasyId", "==", fantasyId),
          orderBy("createdAt", "desc"),
        );
      } else {
        q = query(
          collection(db, this.collectionName),
          orderBy("createdAt", "desc"),
        );
      }

      const querySnapshot = await getDocs(q);
      const teams: Team[] = [];

      querySnapshot.forEach((doc) => {
        const teamData = {
          id: doc.id,
          ...doc.data(),
        } as Team;

        // Filter teams that have t-shirts with the specified size
        if (teamData.tshirts && teamData.tshirts.some(tshirt => tshirt.size === size)) {
          teams.push(teamData);
        }
      });

      return teams;
    } catch (error) {
      console.error("Error getting teams by size:", error);
      throw new Error("Failed to fetch teams by size");
    }
  }
}

export const teamsService = new TeamsService();
