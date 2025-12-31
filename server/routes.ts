import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { insertUserSchema, insertLeadSchema, insertOrderSchema, insertMessageSchema, insertDocumentSchema } from "@shared/schema";

const SESSION_SECRET = process.env.SESSION_SECRET || "proresumes-secret-key-change-in-production";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      console.log("Login attempt for username:", username);
      const user = await storage.getUserByUsername(username);
      console.log("User found:", user ? "yes" : "no");
      if (!user) {
        return done(null, false, { message: "Invalid username or password" });
      }
      
      console.log("Comparing passwords...");
      console.log("Input password:", password);
      console.log("Stored hash:", user.password);
      console.log("Hash length:", user.password.length);
      const isValid = await bcrypt.compare(password, user.password);
      console.log("Password valid:", isValid);
      if (!isValid) {
        return done(null, false, { message: "Invalid username or password" });
      }
      
      return done(null, user);
    } catch (err) {
      console.error("Login error:", err);
      return done(err);
    }
  })
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin access required" });
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after signup" });
        }
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Error during login" });
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in" });
        }
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  app.get("/api/users/writers", isAuthenticated, async (req, res) => {
    try {
      const writers = await storage.getUsersByRole("writer");
      const writersWithoutPasswords = writers.map(({ password, ...writer }) => writer);
      res.json(writersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Error fetching writers" });
    }
  });

  app.get("/api/users/admins", isAdmin, async (req, res) => {
    try {
      const admins = await storage.getUsersByRole("admin");
      const adminsWithoutPasswords = admins.map(({ password, ...admin }) => admin);
      res.json(adminsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Error fetching admins" });
    }
  });

  app.get("/api/users/clients", isAdmin, async (req, res) => {
    try {
      const clients = await storage.getUsersByRole("client");
      const clientsWithoutPasswords = clients.map(({ password, ...client }) => client);
      res.json(clientsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Error fetching clients" });
    }
  });

  app.post("/api/users", isAdmin, async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });
      
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const data = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(data);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating lead" });
    }
  });

  app.get("/api/leads", isAdmin, async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Error fetching leads" });
    }
  });

  app.patch("/api/leads/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const lead = await storage.updateLead(id, req.body);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Error updating lead" });
    }
  });

  app.delete("/api/leads/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLead(id);
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting lead" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(data);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating order" });
    }
  });

  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      let orders;
      
      if (user.role === "admin") {
        orders = await storage.getOrders();
      } else if (user.role === "writer") {
        orders = await storage.getOrdersByWriter(user.id);
      } else {
        orders = await storage.getOrdersByClient(user.id);
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order" });
    }
  });

  app.patch("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user as any;
      const existingOrder = await storage.getOrder(id);
      
      if (!existingOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (user.role !== "admin" && existingOrder.writerId !== user.id) {
        return res.status(403).json({ message: "Unauthorized to update this order" });
      }
      
      const order = await storage.updateOrder(id, req.body);
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Error updating order" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const data = insertMessageSchema.parse(req.body);
      const user = req.user as any;
      
      if (data.orderId) {
        const order = await storage.getOrder(data.orderId);
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }
        if (user.role !== "admin" && order.clientId !== user.id && order.writerId !== user.id) {
          return res.status(403).json({ message: "Unauthorized to send message on this order" });
        }
      }
      
      data.senderId = user.id;
      
      const message = await storage.createMessage(data);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating message" });
    }
  });

  app.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const { orderId } = req.query;
      if (!orderId) {
        return res.status(400).json({ message: "orderId is required" });
      }
      
      const user = req.user as any;
      const order = await storage.getOrder(orderId as string);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (user.role !== "admin" && order.clientId !== user.id && order.writerId !== user.id) {
        return res.status(403).json({ message: "Unauthorized to view these messages" });
      }
      
      const messages = await storage.getMessages(orderId as string);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  app.patch("/api/messages/:id/read", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markMessageAsRead(id);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Error marking message as read" });
    }
  });

  app.post("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const data = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(data);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating document" });
    }
  });

  app.get("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const { orderId } = req.query;
      if (!orderId) {
        return res.status(400).json({ message: "orderId is required" });
      }
      const documents = await storage.getDocuments(orderId as string);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching documents" });
    }
  });

  app.get("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const settings = await storage.getAdminSettings();
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ message: "Error fetching admin settings" });
    }
  });

  app.patch("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const settings = await storage.updateAdminSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Error updating admin settings" });
    }
  });

  app.get("/api/widgets", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const layout = await storage.getWidgetLayout(user.id);
      res.json(layout?.widgets || null);
    } catch (error) {
      res.status(500).json({ message: "Error fetching widget layout" });
    }
  });

  app.put("/api/widgets", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { widgets } = req.body;
      const layout = await storage.saveWidgetLayout(user.id, widgets);
      res.json(layout);
    } catch (error) {
      res.status(500).json({ message: "Error saving widget layout" });
    }
  });

  // User management (Admin)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(u => ({ ...u, password: undefined })));
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.patch("/api/admin/users/:id/role", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const currentUser = req.user as any;
      
      if (id === currentUser.id && role !== 'admin') {
        return res.status(400).json({ message: "Cannot demote yourself" });
      }
      
      const user = await storage.updateUser(id, { role });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Error updating user role" });
    }
  });

  // Add-ons catalog
  app.get("/api/addons", async (req, res) => {
    try {
      const addonsList = await storage.getAddons();
      res.json(addonsList);
    } catch (error) {
      res.status(500).json({ message: "Error fetching addons" });
    }
  });

  app.post("/api/addons", isAdmin, async (req, res) => {
    try {
      const addon = await storage.createAddon(req.body);
      res.status(201).json(addon);
    } catch (error) {
      res.status(500).json({ message: "Error creating addon" });
    }
  });

  app.patch("/api/addons/:id", isAdmin, async (req, res) => {
    try {
      const addon = await storage.updateAddon(req.params.id, req.body);
      if (!addon) {
        return res.status(404).json({ message: "Addon not found" });
      }
      res.json(addon);
    } catch (error) {
      res.status(500).json({ message: "Error updating addon" });
    }
  });

  // Order add-ons
  app.get("/api/orders/:orderId/addons", isAuthenticated, async (req, res) => {
    try {
      const orderAddons = await storage.getOrderAddons(req.params.orderId);
      res.json(orderAddons);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order addons" });
    }
  });

  app.post("/api/orders/:orderId/addons", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { addonId, price } = req.body;
      const orderAddon = await storage.createOrderAddon({
        orderId: req.params.orderId,
        addonId,
        price,
        pushedBy: user.id,
        pushedByRole: user.role,
        status: user.role === 'client' ? 'accepted' : 'pending',
        acceptedAt: user.role === 'client' ? new Date() : undefined,
      });
      res.status(201).json(orderAddon);
    } catch (error) {
      res.status(500).json({ message: "Error adding addon to order" });
    }
  });

  app.patch("/api/orders/:orderId/addons/:id/accept", isAuthenticated, async (req, res) => {
    try {
      const orderAddon = await storage.updateOrderAddon(req.params.id, {
        status: 'accepted',
        acceptedAt: new Date(),
      });
      res.json(orderAddon);
    } catch (error) {
      res.status(500).json({ message: "Error accepting addon" });
    }
  });

  // Price override (Admin)
  app.patch("/api/orders/:id/override-price", isAdmin, async (req, res) => {
    try {
      const { customPrice, overrideReason } = req.body;
      const user = req.user as any;
      const order = await storage.updateOrder(req.params.id, {
        customPrice,
        overrideReason,
        overrideBy: user.id,
      });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Error overriding price" });
    }
  });

  // Chat log viewing (Admin)
  app.get("/api/admin/messages", isAdmin, async (req, res) => {
    try {
      const { orderId } = req.query;
      const messages = await storage.getMessages(orderId as string | undefined);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  // --- ADD THESE TO server/routes.ts ---

  // 1. ADD NEW ADMINISTRATORS
  // This route allows an existing admin to create a new user with the 'admin' role
  app.post("/api/admin/create-user", isAdmin, async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      // Ensure the role is strictly set to what the admin chooses (admin/writer/client)
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });
      
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating administrator" });
    }
  });

  // 2. MANAGE PACKAGE PRICING
  // This updates the JSON 'packages' field in your admin_settings table
  app.patch("/api/admin/packages", isAdmin, async (req, res) => {
    try {
      const { packages } = req.body;
      if (!Array.isArray(packages)) {
        return res.status(400).json({ message: "Packages must be an array" });
      }

      // We update the settings by passing the new packages array
      const settings = await storage.updateAdminSettings({ packages });
      res.json(settings);
    } catch (error) {
      console.error("Error updating packages:", error);
      res.status(500).json({ message: "Error updating package pricing" });
    }
  });
  return httpServer;
}
