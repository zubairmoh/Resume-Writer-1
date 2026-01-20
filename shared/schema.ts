import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- USER & AUTH TABLES ---
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// --- LEADS & ORDERS TABLES ---
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  source: text("source").notNull(),
  status: text("status").notNull().default('new'),
  assignedWriterId: varchar("assigned_writer_id").references(() => users.id),
  notes: text("notes"),
  atsScore: integer("ats_score"),
  resumeText: text("resume_text"),
  targetJob: text("target_job"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => users.id),
  writerId: varchar("writer_id").references(() => users.id),
  packageType: text("package_type").notNull(),
  status: text("status").notNull().default('pending'),
  price: integer("price").notNull(),
  basePrice: integer("base_price"),
  customPrice: integer("custom_price"),
  overrideReason: text("override_reason"),
  overrideBy: varchar("override_by").references(() => users.id),
  addons: jsonb("addons"),
  addonsTotal: integer("addons_total").default(0),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").default('pending'),
  paymentIntentId: text("payment_intent_id"),
  targetJobUrl: text("target_job_url"),
  targetJobTitle: text("target_job_title"),
  additionalInfo: text("additional_info"),
  deliveryDate: timestamp("delivery_date"),
  revisionsRemaining: integer("revisions_remaining").default(3),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// --- COMMUNICATION & DOCUMENTS ---
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  type: text("type").default('chat'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  notes: text("notes"),
  version: integer("version").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// --- ADMIN SETTINGS & PRICING ---
export const packageSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  description: z.string(),
  features: z.array(z.string()).optional(),
});

export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stripePublishableKey: text("stripe_publishable_key"),
  stripeSecretKey: text("stripe_secret_key"),
  paypalClientId: text("paypal_client_id"),
  paypalClientSecret: text("paypal_client_secret"),
  businessEmail: text("business_email"),
  businessPhone: text("business_phone"),
  businessAddress: text("business_address"),
  fomoEnabled: boolean("fomo_enabled").default(true),
  chatWidgetEnabled: boolean("chat_widget_enabled").default(true),
  notificationEmail: text("notification_email"),
  smtpHost: text("smtp_host"),
  smtpPort: integer("smtp_port"),
  smtpUser: text("smtp_user"),
  smtpPass: text("smtp_pass"),
  browseNotificationsEnabled: boolean("browse_notifications_enabled").default(false),
  packages: jsonb("packages").default([
    { id: "basic", name: "Basic", price: 99, description: "Professional Resume", features: ["ATS Optimization", "Professional Formatting", "1 Revision"] },
    { id: "pro", name: "Professional", price: 199, description: "Resume + Cover Letter", features: ["ATS Optimization", "Cover Letter", "3 Revisions", "LinkedIn Tips"] },
    { id: "exec", name: "Executive", price: 299, description: "Full Career Suite", features: ["ATS Optimization", "Cover Letter", "LinkedIn Profile", "Unlimited Revisions", "Priority Support"] }
  ]),
  coupons: jsonb("coupons").default([]),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdminSettingsSchema = createInsertSchema(adminSettings, {
  packages: z.array(packageSchema).optional(),
  smtpPort: z.number().optional(),
}).omit({
  id: true,
  updatedAt: true,
});

export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;
export type AdminSettings = typeof adminSettings.$inferSelect;

// --- ADDONS & WIDGETS ---
export const addons = pgTable("addons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAddonSchema = createInsertSchema(addons).omit({
  id: true,
  createdAt: true,
});

export type InsertAddon = z.infer<typeof insertAddonSchema>;
export type Addon = typeof addons.$inferSelect;

export const orderAddons = pgTable("order_addons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  addonId: varchar("addon_id").notNull().references(() => addons.id),
  price: integer("price").notNull(),
  status: text("status").notNull().default('pending'),
  pushedBy: varchar("pushed_by").references(() => users.id),
  pushedByRole: text("pushed_by_role"),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderAddonSchema = createInsertSchema(orderAddons).omit({
  id: true,
  createdAt: true,
});

export type InsertOrderAddon = z.infer<typeof insertOrderAddonSchema>;
export type OrderAddon = typeof orderAddons.$inferSelect;

export const widgetLayouts = pgTable("widget_layouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  widgets: jsonb("widgets").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWidgetLayoutSchema = createInsertSchema(widgetLayouts).omit({
  id: true,
  updatedAt: true,
});

export type InsertWidgetLayout = z.infer<typeof insertWidgetLayoutSchema>;
export type WidgetLayout = typeof widgetLayouts.$inferSelect;

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  company: text("company").notNull(),
  position: text("position").notNull(),
  status: text("status").notNull().default('applied'), // applied, interviewing, offer, rejected
  notes: text("notes"),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
  updatedAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export const widgetConfigSchema = z.object({
  id: z.string(),
  type: z.enum(["stats", "chart", "activity", "shortcuts", "orders", "leads", "messages"]),
  title: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  visible: z.boolean().default(true),
});

export type WidgetConfig = z.infer<typeof widgetConfigSchema>;
