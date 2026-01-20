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
  addons,
  orderAddons,
  applications,
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
  type Addon,
  type InsertAddon,
  type OrderAddon,
  type InsertOrderAddon,
  type Application,
  type InsertApplication,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  
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
  deleteDocument(id: string): Promise<void>;
  
  getAdminSettings(): Promise<AdminSettings | undefined>;
  updateAdminSettings(settings: Partial<InsertAdminSettings>): Promise<AdminSettings>;
  
  getWidgetLayout(userId: string): Promise<WidgetLayout | undefined>;
  saveWidgetLayout(userId: string, widgets: any[]): Promise<WidgetLayout>;
  
  getAddons(): Promise<Addon[]>;
  getAddon(id: string): Promise<Addon | undefined>;
  createAddon(addon: InsertAddon): Promise<Addon>;
  updateAddon(id: string, data: Partial<InsertAddon>): Promise<Addon | undefined>;
  
  getOrderAddons(orderId: string): Promise<OrderAddon[]>;
  createOrderAddon(orderAddon: InsertOrderAddon): Promise<OrderAddon>;
  updateOrderAddon(id: string, data: Partial<InsertOrderAddon>): Promise<OrderAddon | undefined>;
  
  getApplications(userId: string): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, data: Partial<InsertApplication>): Promise<Application | undefined>;
  deleteApplication(id: string): Promise<void>;
}

const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === 'production') {
  throw new Error("Database connection string not found");
}

const pool = databaseUrl ? new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
}) : null;

const db = pool ? drizzle(pool) : null;

export class PostgresStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    if (!db) return undefined;
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) return undefined;
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!db) return undefined;
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) throw new Error("Database not connected");
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getUsersByRole(role: string): Promise<User[]> {
    if (!db) return [];
    return await db.select().from(users).where(eq(users.role, role));
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    if (!db) throw new Error("Database not connected");
    const result = await db.insert(leads).values(insertLead).returning();
    return result[0];
  }

  async getLeads(): Promise<Lead[]> {
    if (!db) return [];
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    if (!db) return undefined;
    const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return result[0];
  }

  async updateLead(id: string, data: Partial<InsertLead>): Promise<Lead | undefined> {
    if (!db) return undefined;
    const result = await db.update(leads).set(data).where(eq(leads.id, id)).returning();
    return result[0];
  }

  async deleteLead(id: string): Promise<void> {
    if (!db) return;
    await db.delete(leads).where(eq(leads.id, id));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    if (!db) throw new Error("Database not connected");
    const result = await db.insert(orders).values(insertOrder).returning();
    return result[0];
  }

  async getOrders(): Promise<Order[]> {
    if (!db) return [];
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    if (!db) return undefined;
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getOrdersByClient(clientId: string): Promise<Order[]> {
    if (!db) return [];
    return await db.select().from(orders).where(eq(orders.clientId, clientId)).orderBy(desc(orders.createdAt));
  }

  async getOrdersByWriter(writerId: string): Promise<Order[]> {
    if (!db) return [];
    return await db.select().from(orders).where(eq(orders.writerId, writerId)).orderBy(desc(orders.createdAt));
  }

  async updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined> {
    if (!db) return undefined;
    const result = await db.update(orders).set({ ...data, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    return result[0];
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    if (!db) throw new Error("Database not connected");
    const result = await db.insert(messages).values(insertMessage).returning();
    return result[0];
  }

  async getMessages(orderId?: string): Promise<Message[]> {
    if (!db) return [];
    if (orderId) {
      return await db.select().from(messages).where(eq(messages.orderId, orderId)).orderBy(messages.createdAt);
    }
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async getMessagesByUsers(userId1: string, userId2: string): Promise<Message[]> {
    if (!db) return [];
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
    if (!db) return;
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    if (!db) throw new Error("Database not connected");
    const result = await db.insert(documents).values(insertDocument).returning();
    return result[0];
  }

  async getDocuments(orderId: string): Promise<Document[]> {
    if (!db) return [];
    return await db.select().from(documents).where(eq(documents.orderId, orderId)).orderBy(desc(documents.createdAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    if (!db) return undefined;
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result[0];
  }
  
  async deleteDocument(id: string): Promise<void> {
    if (!db) return;
    await db.delete(documents).where(eq(documents.id, id));
  }

  async getAdminSettings(): Promise<AdminSettings | undefined> {
    if (!db) return undefined;
    const result = await db.select().from(adminSettings).limit(1);
    return result[0];
  }

  async updateAdminSettings(settings: Partial<InsertAdminSettings>): Promise<AdminSettings> {
    if (!db) throw new Error("Database not connected");
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
    if (!db) return undefined;
    const result = await db.select().from(widgetLayouts).where(eq(widgetLayouts.userId, userId)).limit(1);
    return result[0];
  }

  async saveWidgetLayout(userId: string, widgets: any[]): Promise<WidgetLayout> {
    if (!db) throw new Error("Database not connected");
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

  async getAllUsers(): Promise<User[]> {
    if (!db) return [];
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    if (!db) return undefined;
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getAddons(): Promise<Addon[]> {
    if (!db) return [];
    return await db.select().from(addons).orderBy(addons.name);
  }

  async getAddon(id: string): Promise<Addon | undefined> {
    if (!db) return undefined;
    const result = await db.select().from(addons).where(eq(addons.id, id)).limit(1);
    return result[0];
  }

  async createAddon(insertAddon: InsertAddon): Promise<Addon> {
    if (!db) throw new Error("Database not connected");
    const result = await db.insert(addons).values(insertAddon).returning();
    return result[0];
  }

  async updateAddon(id: string, data: Partial<InsertAddon>): Promise<Addon | undefined> {
    if (!db) return undefined;
    const result = await db.update(addons).set(data).where(eq(addons.id, id)).returning();
    return result[0];
  }

  async getOrderAddons(orderId: string): Promise<OrderAddon[]> {
    if (!db) return [];
    return await db.select().from(orderAddons).where(eq(orderAddons.orderId, orderId));
  }

  async createOrderAddon(insertOrderAddon: InsertOrderAddon): Promise<OrderAddon> {
    if (!db) throw new Error("Database not connected");
    const result = await db.insert(orderAddons).values(insertOrderAddon).returning();
    return result[0];
  }

  async updateOrderAddon(id: string, data: Partial<InsertOrderAddon>): Promise<OrderAddon | undefined> {
    if (!db) return undefined;
    const result = await db.update(orderAddons).set(data).where(eq(orderAddons.id, id)).returning();
    return result[0];
  }

  async getApplications(userId: string): Promise<Application[]> {
    if (!db) return [];
    return await db.select().from(applications).where(eq(applications.userId, userId)).orderBy(desc(applications.appliedAt));
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    if (!db) throw new Error("Database not connected");
    const result = await db.insert(applications).values(insertApplication).returning();
    return result[0];
  }

  async updateApplication(id: string, data: Partial<InsertApplication>): Promise<Application | undefined> {
    if (!db) return undefined;
    const result = await db.update(applications).set({ ...data, updatedAt: new Date() }).where(eq(applications.id, id)).returning();
    return result[0];
  }

  async deleteApplication(id: string): Promise<void> {
    if (!db) return;
    await db.delete(applications).where(eq(applications.id, id));
  }
}

export const storage = new PostgresStorage();
