import type { Express } from "express";
import { createServer, type Server } from "http";
import { prisma } from "./prisma";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ==================== USERS ====================
  
  app.get("/api/users", async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { rides: true } } },
      });
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { fullName, email, phone, city, status } = req.body;
      if (!fullName || !email) {
        return res.status(400).json({ message: "Full name and email are required" });
      }
      const user = await prisma.user.create({
        data: { fullName, email, phone, city, status: status || "ACTIVE" },
      });
      res.status(201).json(user);
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Email already exists" });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, email, phone, city, status } = req.body;
      const user = await prisma.user.update({
        where: { id },
        data: { fullName, email, phone, city, status },
      });
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // ==================== DRIVERS ====================
  
  app.get("/api/drivers", async (req, res) => {
    try {
      const drivers = await prisma.driver.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { rides: true } } },
      });
      res.json(drivers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.get("/api/drivers/approved", async (req, res) => {
    try {
      const drivers = await prisma.driver.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      });
      res.json(drivers);
    } catch (error) {
      console.error("Error fetching approved drivers:", error);
      res.status(500).json({ message: "Failed to fetch approved drivers" });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      const { fullName, phone, vehicleType, vehiclePlate, status } = req.body;
      if (!fullName || !phone || !vehiclePlate) {
        return res.status(400).json({ message: "Full name, phone, and vehicle plate are required" });
      }
      const driver = await prisma.driver.create({
        data: { 
          fullName, 
          phone, 
          vehicleType: vehicleType || "CAR", 
          vehiclePlate,
          status: status || "PENDING"
        },
      });
      res.status(201).json(driver);
    } catch (error) {
      console.error("Error creating driver:", error);
      res.status(500).json({ message: "Failed to create driver" });
    }
  });

  app.patch("/api/drivers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, phone, vehicleType, vehiclePlate, status } = req.body;
      const driver = await prisma.driver.update({
        where: { id },
        data: { fullName, phone, vehicleType, vehiclePlate, status },
      });
      res.json(driver);
    } catch (error) {
      console.error("Error updating driver:", error);
      res.status(500).json({ message: "Failed to update driver" });
    }
  });

  // ==================== RIDES ====================
  
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

  app.post("/api/rides", async (req, res) => {
    try {
      const { pickupLocation, dropoffLocation, fareEstimate, userId, driverId } = req.body;
      
      if (!pickupLocation || !dropoffLocation || !userId) {
        return res.status(400).json({ message: "Pickup, dropoff, and user are required" });
      }

      // Verify user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // If driver is assigned, verify they are approved
      if (driverId) {
        const driver = await prisma.driver.findUnique({ where: { id: driverId } });
        if (!driver) {
          return res.status(400).json({ message: "Driver not found" });
        }
        if (driver.status !== "APPROVED") {
          return res.status(400).json({ message: "Only approved drivers can be assigned to rides" });
        }
      }

      const ride = await prisma.ride.create({
        data: { 
          pickupLocation, 
          dropoffLocation, 
          fareEstimate: fareEstimate ? parseFloat(fareEstimate) : null,
          userId,
          driverId,
          status: driverId ? "ACCEPTED" : "REQUESTED"
        },
        include: { user: true, driver: true },
      });
      res.status(201).json(ride);
    } catch (error) {
      console.error("Error creating ride:", error);
      res.status(500).json({ message: "Failed to create ride" });
    }
  });

  app.patch("/api/rides/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { pickupLocation, dropoffLocation, fareEstimate, status, driverId } = req.body;

      let finalStatus = status;

      // If assigning a driver, verify they are approved and auto-set status to ACCEPTED
      if (driverId) {
        const driver = await prisma.driver.findUnique({ where: { id: driverId } });
        if (!driver) {
          return res.status(400).json({ message: "Driver not found" });
        }
        if (driver.status !== "APPROVED") {
          return res.status(400).json({ message: "Only approved drivers can be assigned to rides" });
        }
        // Auto-set status to ACCEPTED when driver is assigned (unless explicitly completed/cancelled)
        if (!status || (status !== "COMPLETED" && status !== "CANCELLED")) {
          finalStatus = "ACCEPTED";
        }
      }

      const ride = await prisma.ride.update({
        where: { id },
        data: { 
          pickupLocation, 
          dropoffLocation, 
          fareEstimate: fareEstimate !== undefined ? parseFloat(fareEstimate) : undefined,
          status: finalStatus,
          driverId
        },
        include: { user: true, driver: true },
      });
      res.json(ride);
    } catch (error) {
      console.error("Error updating ride:", error);
      res.status(500).json({ message: "Failed to update ride" });
    }
  });

  // ==================== DIRECTORS ====================
  
  app.get("/api/directors", async (req, res) => {
    try {
      const directors = await prisma.director.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(directors);
    } catch (error) {
      console.error("Error fetching directors:", error);
      res.status(500).json({ message: "Failed to fetch directors" });
    }
  });

  app.post("/api/directors", async (req, res) => {
    try {
      const { fullName, email, role, region } = req.body;
      if (!fullName || !email || !role || !region) {
        return res.status(400).json({ message: "Full name, email, role, and region are required" });
      }
      const director = await prisma.director.create({
        data: { fullName, email, role, region },
      });
      res.status(201).json(director);
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Email already exists" });
      }
      console.error("Error creating director:", error);
      res.status(500).json({ message: "Failed to create director" });
    }
  });

  // ==================== ADMINS ====================
  
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

  // ==================== ADMIN STATS ====================
  
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const [
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalDrivers,
        approvedDrivers,
        pendingDrivers,
        suspendedDrivers,
        totalRides,
        requestedRides,
        acceptedRides,
        completedRides,
        cancelledRides,
        totalDirectors,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "ACTIVE" } }),
        prisma.user.count({ where: { status: "SUSPENDED" } }),
        prisma.driver.count(),
        prisma.driver.count({ where: { status: "APPROVED" } }),
        prisma.driver.count({ where: { status: "PENDING" } }),
        prisma.driver.count({ where: { status: "SUSPENDED" } }),
        prisma.ride.count(),
        prisma.ride.count({ where: { status: "REQUESTED" } }),
        prisma.ride.count({ where: { status: "ACCEPTED" } }),
        prisma.ride.count({ where: { status: "COMPLETED" } }),
        prisma.ride.count({ where: { status: "CANCELLED" } }),
        prisma.director.count(),
      ]);
      
      res.json({
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
        },
        drivers: {
          total: totalDrivers,
          approved: approvedDrivers,
          pending: pendingDrivers,
          suspended: suspendedDrivers,
        },
        rides: {
          total: totalRides,
          requested: requestedRides,
          accepted: acceptedRides,
          completed: completedRides,
          cancelled: cancelledRides,
          active: requestedRides + acceptedRides,
        },
        directors: {
          total: totalDirectors,
        },
        platformStatus: "Operational",
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
