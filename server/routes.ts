import type { Express } from "express";
import { createServer, type Server } from "http";
import { prisma } from "./prisma";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Public API - Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Public API - Drivers
  app.get("/api/drivers", async (req, res) => {
    try {
      const drivers = await prisma.driver.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(drivers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  // Public API - Rides
  app.get("/api/rides", async (req, res) => {
    try {
      const rides = await prisma.ride.findMany({
        include: {
          user: true,
          driver: true,
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(rides);
    } catch (error) {
      console.error("Error fetching rides:", error);
      res.status(500).json({ message: "Failed to fetch rides" });
    }
  });

  // Public API - Admins (read-only)
  app.get("/api/admins", async (req, res) => {
    try {
      const admins = await prisma.admin.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(admins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  // Admin Stats (public for Stage 2)
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const [userCount, driverCount, rideCount] = await Promise.all([
        prisma.user.count(),
        prisma.driver.count(),
        prisma.ride.count(),
      ]);
      
      res.json({
        totalUsers: userCount,
        totalDrivers: driverCount,
        totalRides: rideCount,
        platformStatus: "Operational",
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
