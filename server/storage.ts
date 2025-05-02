import { users, type User, type InsertUser, type InsertAffiliate, type Affiliate } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAffiliate(affiliate: InsertAffiliate): Promise<Affiliate>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private affiliates: Map<number, Affiliate>;
  currentId: number;
  affiliateId: number;

  constructor() {
    this.users = new Map();
    this.affiliates = new Map();
    this.currentId = 1;
    this.affiliateId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAffiliate(insertAffiliate: InsertAffiliate): Promise<Affiliate> {
    const id = this.affiliateId++;
    const now = new Date().toISOString();
    const affiliate: Affiliate = { 
      ...insertAffiliate, 
      id, 
      createdAt: now 
    };
    this.affiliates.set(id, affiliate);
    return affiliate;
  }
}

export const storage = new MemStorage();
