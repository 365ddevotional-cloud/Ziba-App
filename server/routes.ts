import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { loginSchema, serverRegisterSchema, serverAdminSetupSchema } from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePassword(supplied: string, stored: string): Promise<boolean> {
  const [hashedPassword, salt] = stored.split(".");
  const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
  const suppliedPasswordBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
    adminId?: string;
  }
}

async function ensureAdminExists() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPhone = process.env.ADMIN_PHONE;
  
  if (!adminEmail) {
    console.log("ADMIN_EMAIL not set, skipping admin initialization");
    return;
  }
  
  const existingAdmin = await storage.getAdminByEmail(adminEmail);
  if (!existingAdmin) {
    await storage.createAdmin({
      email: adminEmail,
      phone: adminPhone || null,
      password: null,
    });
    console.log(`Admin created with email: ${adminEmail}`);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "ziba-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  await ensureAdminExists();

  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = serverRegisterSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const { name, email, password, phone } = result.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
      });

      req.session.userId = user.id;
      res.json({ id: user.id, email: user.email, name: user.name, phone: user.phone });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const { email, password } = result.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      res.json({ id: user.id, email: user.email, name: user.name, phone: user.phone });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "User not found" });
    }

    res.json({ id: user.id, email: user.email, name: user.name, phone: user.phone });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/admin/status", async (req, res) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return res.status(404).json({ message: "Admin not configured" });
    }

    const admin = await storage.getAdminByEmail(adminEmail);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ needsSetup: !admin.isPasswordSet });
  });

  app.post("/api/admin/setup", async (req, res) => {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        return res.status(404).json({ message: "Admin not configured" });
      }

      const admin = await storage.getAdminByEmail(adminEmail);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      if (admin.isPasswordSet) {
        return res.status(400).json({ message: "Admin password already set" });
      }

      const result = serverAdminSetupSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const hashedPassword = await hashPassword(result.data.password);
      const updatedAdmin = await storage.updateAdminPassword(admin.id, hashedPassword);

      req.session.adminId = updatedAdmin.id;
      res.json({ 
        id: updatedAdmin.id, 
        email: updatedAdmin.email, 
        phone: updatedAdmin.phone,
        isPasswordSet: updatedAdmin.isPasswordSet 
      });
    } catch (error) {
      console.error("Admin setup error:", error);
      res.status(500).json({ message: "Admin setup failed" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const { email, password } = result.data;

      const admin = await storage.getAdminByEmail(email);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!admin.isPasswordSet || !admin.password) {
        return res.status(400).json({ message: "Admin password not set. Please complete setup first." });
      }

      const isValid = await comparePassword(password, admin.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.adminId = admin.id;
      res.json({ 
        id: admin.id, 
        email: admin.email, 
        phone: admin.phone,
        isPasswordSet: admin.isPasswordSet 
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Admin login failed" });
    }
  });

  app.get("/api/admin/me", async (req, res) => {
    if (!req.session.adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const admin = await storage.getAdmin(req.session.adminId);
    if (!admin) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "Admin not found" });
    }

    res.json({ 
      id: admin.id, 
      email: admin.email, 
      phone: admin.phone,
      isPasswordSet: admin.isPasswordSet 
    });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/admin/stats", async (req, res) => {
    if (!req.session.adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const totalUsers = await storage.getUserCount();
    
    res.json({
      totalUsers,
      activeToday: Math.floor(totalUsers * 0.3),
      platformStatus: "Operational",
    });
  });

  app.get("/api/admin/recent-users", async (req, res) => {
    if (!req.session.adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const users = await storage.getRecentUsers(10);
    res.json(users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
    })));
  });

  return httpServer;
}
