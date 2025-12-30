import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, desc } from "drizzle-orm";
import { Pool } from "pg";
import {
  users,
  leads,
  orders,
  messages,
  documents,
  adminSettings,
  widgetLayouts,
  type User,
  type InsertUser,
  type Lead,
  type InsertLead,
  type Order,
  type InsertOrder,
  type Message,
  type InsertMessage,
  type Document,
  type InsertDocument,
  type AdminSettings,
  type InsertAdminSettings,
  type WidgetLayout,
  type InsertWidgetLayout,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  updateLead(id: string, data: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<void>;
  
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByClient(clientId: string): Promise<Order[]>;
  getOrdersByWriter(writerId: string): Promise<Order[]>;
  updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(orderId?: string): Promise<Message[]>;
  getMessagesByUsers(userId1: string, userId2: string): Promise<Message[]>;
  markMessageAsRead(id: string): Promise<void>;
  
  createDocument(document: InsertDocument): Promise<Document>;
  getDocuments(orderId: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  
  getAdminSettings(): Promise<AdminSettings | undefined>;
  updateAdminSettings(settings: Partial<InsertAdminSettings>): Promise<AdminSettings>;
  
  getWidgetLayout(userId: string): Promise<WidgetLayout | undefined>;
  saveWidgetLayout(userId: string, widgets: any[]): Promise<WidgetLayout>;
}

const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Database connection string not found");
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

const db = drizzle(pool);

export class PostgresStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const result = await db.insert(leads).values(insertLead).returning();
    return result[0];
  }

  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return result[0];
  }

  async updateLead(id: string, data: Partial<InsertLead>): Promise<Lead | undefined> {
    const result = await db.update(leads).set(data).where(eq(leads.id, id)).returning();
    return result[0];
  }

  async deleteLead(id: string): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(insertOrder).returning();
    return result[0];
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getOrdersByClient(clientId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.clientId, clientId)).orderBy(desc(orders.createdAt));
  }

  async getOrdersByWriter(writerId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.writerId, writerId)).orderBy(desc(orders.createdAt));
  }

  async updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined> {
    const result = await db.update(orders).set({ ...data, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    return result[0];
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(insertMessage).returning();
    return result[0];
  }

  async getMessages(orderId?: string): Promise<Message[]> {
    if (orderId) {
      return await db.select().from(messages).where(eq(messages.orderId, orderId)).orderBy(messages.createdAt);
    }
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async getMessagesByUsers(userId1: string, userId2: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(
        and(
          eq(messages.senderId, userId1),
          eq(messages.recipientId, userId2)
        )
      )
      .orderBy(messages.createdAt);
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const result = await db.insert(documents).values(insertDocument).returning();
    return result[0];
  }

  async getDocuments(orderId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.orderId, orderId)).orderBy(desc(documents.createdAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result[0];
  }

  async getAdminSettings(): Promise<AdminSettings | undefined> {
    const result = await db.select().from(adminSettings).limit(1);
    return result[0];
  }

  async updateAdminSettings(settings: Partial<InsertAdminSettings>): Promise<AdminSettings> {
    const existing = await this.getAdminSettings();
    
    if (existing) {
      const result = await db.update(adminSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(adminSettings.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(adminSettings).values(settings).returning();
      return result[0];
    }
  }

  async getWidgetLayout(userId: string): Promise<WidgetLayout | undefined> {
    const result = await db.select().from(widgetLayouts).where(eq(widgetLayouts.userId, userId)).limit(1);
    return result[0];
  }

  async saveWidgetLayout(userId: string, widgets: any[]): Promise<WidgetLayout> {
    const existing = await this.getWidgetLayout(userId);
    
    if (existing) {
      const result = await db.update(widgetLayouts)
        .set({ widgets, updatedAt: new Date() })
        .where(eq(widgetLayouts.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(widgetLayouts).values({ userId, widgets }).returning();
      return result[0];
    }
  }
}

export const storage = new PostgresStorage();
