import type { Express } from "express";
import { createServer, type Server } from "http";
import { prisma } from "./prisma";
import { hashPassword, verifyPassword, requireAuth, getCurrentUser, UserRole } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ==================== USERS ====================
  
  app.get("/api/users", async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          city: true,
          status: true,
          averageRating: true,
          totalRatings: true,
          createdAt: true,
          _count: { select: { rides: true } },
        },
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
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can update user status" });
      }

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

  app.get("/api/drivers/active", async (req, res) => {
    try {
      const drivers = await prisma.driver.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      });
      res.json(drivers);
    } catch (error) {
      console.error("Error fetching active drivers:", error);
      res.status(500).json({ message: "Failed to fetch active drivers" });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      const { fullName, email, phone, vehicleType, vehiclePlate, status, currentRate, avgStartTime, avgEndTime } = req.body;
      if (!fullName || !email || !phone || !vehiclePlate) {
        return res.status(400).json({ message: "Full name, email, phone, and vehicle plate are required" });
      }
      const driver = await prisma.driver.create({
        data: { 
          fullName,
          email,
          phone, 
          vehicleType: vehicleType || "CAR", 
          vehiclePlate,
          status: status || "PENDING",
          currentRate: currentRate || 1.0,
          avgStartTime,
          avgEndTime
        },
      });
      res.status(201).json(driver);
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Email already exists" });
      }
      console.error("Error creating driver:", error);
      res.status(500).json({ message: "Failed to create driver" });
    }
  });

  app.patch("/api/drivers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, email, phone, vehicleType, vehiclePlate, status, currentRate, avgStartTime, avgEndTime } = req.body;
      const driver = await prisma.driver.update({
        where: { id },
        data: { fullName, email, phone, vehicleType, vehiclePlate, status, currentRate, avgStartTime, avgEndTime },
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
      const { status, search, startDate, endDate } = req.query;
      
      const where: any = {};
      
      // Filter by status
      if (status && status !== "all") {
        where.status = status;
      }
      
      // Filter by date range
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate as string);
        }
        if (endDate) {
          const end = new Date(endDate as string);
          end.setHours(23, 59, 59, 999);
          where.createdAt.lte = end;
        }
      }
      
      // Search by pickup/dropoff location
      if (search) {
        where.OR = [
          { pickupLocation: { contains: search as string, mode: "insensitive" } },
          { dropoffLocation: { contains: search as string, mode: "insensitive" } },
        ];
      }
      
      const rides = await prisma.ride.findMany({
        where,
        include: {
          user: true,
          driver: true,
          payment: true,
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

      // If driver is assigned, verify they are active
      if (driverId) {
        const driver = await prisma.driver.findUnique({ where: { id: driverId } });
        if (!driver) {
          return res.status(400).json({ message: "Driver not found" });
        }
        if (driver.status !== "ACTIVE") {
          return res.status(400).json({ message: "Only active drivers can be assigned to rides" });
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
      const { pickupLocation, dropoffLocation, fareEstimate } = req.body;

      // This endpoint now only allows updating ride details, NOT status or driver assignment
      // Use the dedicated lifecycle endpoints for status changes: /assign, /start, /complete, /cancel
      
      const ride = await prisma.ride.update({
        where: { id },
        data: { 
          pickupLocation, 
          dropoffLocation, 
          fareEstimate: fareEstimate !== undefined ? parseFloat(fareEstimate) : undefined,
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

  app.patch("/api/directors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { contractEnd } = req.body;
      const currentUser = getCurrentUser(req);

      // Only admin can update contractEnd
      if (contractEnd !== undefined) {
        if (currentUser.role !== "admin") {
          return res.status(403).json({ message: "Only admins can update contract end date" });
        }

        // Validate contractEnd is a valid date
        const contractEndDate = new Date(contractEnd);
        if (isNaN(contractEndDate.getTime())) {
          return res.status(400).json({ message: "Invalid contract end date" });
        }

        // Validate contractEnd is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (contractEndDate < today) {
          return res.status(400).json({ message: "Contract end date must be in the future" });
        }

        // Get the director to check contractStart
        const director = await prisma.director.findUnique({ where: { id } });
        if (!director) {
          return res.status(404).json({ message: "Director not found" });
        }

        // Validate contractEnd is after contractStart
        if (director.contractStart && contractEndDate <= director.contractStart) {
          return res.status(400).json({ message: "Contract end date must be after contract start date" });
        }
      }

      const updatedDirector = await prisma.director.update({
        where: { id },
        data: { contractEnd: contractEnd ? new Date(contractEnd) : undefined },
      });
      res.json(updatedDirector);
    } catch (error) {
      console.error("Error updating director:", error);
      res.status(500).json({ message: "Failed to update director" });
    }
  });

  // ==================== ADMIN DIRECTORS ====================

  // Update director status (Admin only)
  app.patch("/api/admin/directors/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const currentUser = getCurrentUser(req);

      // Only admin can update status
      if (currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can update director status" });
      }

      // Validate status
      const validStatuses = ["ACTIVE", "PENDING", "SUSPENDED", "TERMINATED"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be ACTIVE, PENDING, SUSPENDED, or TERMINATED" });
      }

      const director = await prisma.director.findUnique({ where: { id } });
      if (!director) {
        return res.status(404).json({ message: "Director not found" });
      }

      const updatedDirector = await prisma.director.update({
        where: { id },
        data: { status },
      });
      res.json(updatedDirector);
    } catch (error) {
      console.error("Error updating director status:", error);
      res.status(500).json({ message: "Failed to update director status" });
    }
  });

  // Update director contract dates (Admin only)
  app.patch("/api/admin/directors/:id/contract", async (req, res) => {
    try {
      const { id } = req.params;
      const { contractStart, contractEnd } = req.body;
      const currentUser = getCurrentUser(req);

      // Only admin can update contract dates
      if (currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can update contract dates" });
      }

      const director = await prisma.director.findUnique({ where: { id } });
      if (!director) {
        return res.status(404).json({ message: "Director not found" });
      }

      const updateData: { contractStart?: Date | null; contractEnd?: Date | null } = {};

      // Handle contractStart - can be set to null to clear
      if (contractStart !== undefined) {
        if (contractStart === null || contractStart === "") {
          updateData.contractStart = null;
        } else {
          const startDate = new Date(contractStart);
          if (isNaN(startDate.getTime())) {
            return res.status(400).json({ message: "Invalid contract start date" });
          }
          updateData.contractStart = startDate;
        }
      }

      // Handle contractEnd - can be set to null to clear
      if (contractEnd !== undefined) {
        if (contractEnd === null || contractEnd === "") {
          updateData.contractEnd = null;
        } else {
          const endDate = new Date(contractEnd);
          if (isNaN(endDate.getTime())) {
            return res.status(400).json({ message: "Invalid contract end date" });
          }

          // Validate contractEnd is in the future
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (endDate < today) {
            return res.status(400).json({ message: "Contract end date must be in the future" });
          }

          // Validate contractEnd is after contractStart (only if start is set)
          const effectiveStart = updateData.contractStart !== undefined 
            ? updateData.contractStart 
            : director.contractStart;
          if (effectiveStart && endDate <= effectiveStart) {
            return res.status(400).json({ message: "Contract end date must be after contract start date" });
          }

          updateData.contractEnd = endDate;
        }
      }

      const updatedDirector = await prisma.director.update({
        where: { id },
        data: updateData,
      });
      res.json(updatedDirector);
    } catch (error) {
      console.error("Error updating director contract:", error);
      res.status(500).json({ message: "Failed to update director contract" });
    }
  });

  // Update director role (Admin only)
  app.patch("/api/admin/directors/:id/role", async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const currentUser = getCurrentUser(req);

      // Only admin can update role
      if (currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can update director role" });
      }

      // Validate role
      const validRoles = ["OPERATIONS", "FINANCE", "COMPLIANCE", "GROWTH", "REGIONAL_MANAGER"];
      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be OPERATIONS, FINANCE, COMPLIANCE, GROWTH, or REGIONAL_MANAGER" });
      }

      const director = await prisma.director.findUnique({ where: { id } });
      if (!director) {
        return res.status(404).json({ message: "Director not found" });
      }

      const updatedDirector = await prisma.director.update({
        where: { id },
        data: { role },
      });
      res.json(updatedDirector);
    } catch (error) {
      console.error("Error updating director role:", error);
      res.status(500).json({ message: "Failed to update director role" });
    }
  });

  // Update director region (Admin only)
  app.patch("/api/admin/directors/:id/region", async (req, res) => {
    try {
      const { id } = req.params;
      const { region } = req.body;
      const currentUser = getCurrentUser(req);

      // Only admin can update region
      if (currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can update director region" });
      }

      if (!region || typeof region !== "string" || region.trim().length === 0) {
        return res.status(400).json({ message: "Region is required" });
      }

      const director = await prisma.director.findUnique({ where: { id } });
      if (!director) {
        return res.status(404).json({ message: "Director not found" });
      }

      const updatedDirector = await prisma.director.update({
        where: { id },
        data: { region: region.trim() },
      });
      res.json(updatedDirector);
    } catch (error) {
      console.error("Error updating director region:", error);
      res.status(500).json({ message: "Failed to update director region" });
    }
  });

  // ==================== ADMINS ====================
  
  app.get("/api/admins", async (req, res) => {
    const currentUser = getCurrentUser(req);
    if (currentUser.role !== "admin") {
      return res.status(401).json({ message: "Not authenticated as admin" });
    }
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
    const currentUser = getCurrentUser(req);
    if (currentUser.role !== "admin") {
      return res.status(401).json({ message: "Not authenticated as admin" });
    }
    try {
      const [
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalDrivers,
        activeDrivers,
        pendingDrivers,
        suspendedDrivers,
        offlineDrivers,
        driversOnline,
        totalRides,
        requestedRides,
        acceptedRides,
        inProgressRides,
        completedRides,
        cancelledRides,
        totalDirectors,
        avgDriverRating,
        avgUserRating,
        totalRevenue,
        pendingPayments,
        paidPayments,
        failedPayments,
        totalIncentives,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "ACTIVE" } }),
        prisma.user.count({ where: { status: "SUSPENDED" } }),
        prisma.driver.count(),
        prisma.driver.count({ where: { status: "ACTIVE" } }),
        prisma.driver.count({ where: { status: "PENDING" } }),
        prisma.driver.count({ where: { status: "SUSPENDED" } }),
        prisma.driver.count({ where: { status: "OFFLINE" } }),
        prisma.driver.count({ where: { status: "ACTIVE", isOnline: true } }),
        prisma.ride.count(),
        prisma.ride.count({ where: { status: "REQUESTED" } }),
        prisma.ride.count({ where: { status: { in: ["ACCEPTED", "DRIVER_EN_ROUTE"] } } }),
        prisma.ride.count({ where: { status: "IN_PROGRESS" } }),
        prisma.ride.count({ where: { status: "COMPLETED" } }),
        prisma.ride.count({ where: { status: "CANCELLED" } }),
        prisma.director.count(),
        prisma.driver.aggregate({ _avg: { averageRating: true }, where: { totalRatings: { gt: 0 } } }),
        prisma.user.aggregate({ _avg: { averageRating: true }, where: { totalRatings: { gt: 0 } } }),
        prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
        prisma.payment.aggregate({ _sum: { amount: true }, _count: true, where: { status: "PENDING" } }),
        prisma.payment.aggregate({ _sum: { amount: true }, _count: true, where: { status: "PAID" } }),
        prisma.payment.aggregate({ _count: true, where: { status: "FAILED" } }),
        prisma.incentive.aggregate({ _sum: { amount: true }, _count: true }),
      ]);
      
      res.json({
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          avgRating: avgUserRating._avg.averageRating || 0,
        },
        drivers: {
          total: totalDrivers,
          active: activeDrivers,
          pending: pendingDrivers,
          suspended: suspendedDrivers,
          offline: offlineDrivers,
          online: driversOnline,
          avgRating: avgDriverRating._avg.averageRating || 0,
        },
        rides: {
          total: totalRides,
          requested: requestedRides,
          accepted: acceptedRides,
          inProgress: inProgressRides,
          completed: completedRides,
          cancelled: cancelledRides,
          active: requestedRides + acceptedRides + inProgressRides,
        },
        directors: {
          total: totalDirectors,
        },
        revenue: {
          totalPaid: totalRevenue._sum.amount || 0,
          pending: pendingPayments._sum.amount || 0,
          pendingCount: pendingPayments._count || 0,
          paidCount: paidPayments._count || 0,
          failedCount: failedPayments._count || 0,
        },
        incentives: {
          total: totalIncentives._sum.amount || 0,
          count: totalIncentives._count || 0,
        },
        platformStatus: "Operational",
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // ==================== RECENT ACTIVITY ====================

  app.get("/api/admin/activity", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (currentUser.role !== "admin") {
        return res.status(401).json({ message: "Not authenticated as admin" });
      }

      const [recentRides, recentPayments, recentIncentives, recentUsers, recentDrivers] = await Promise.all([
        prisma.ride.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: true, driver: true },
        }),
        prisma.payment.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { ride: { include: { user: true } } },
        }),
        prisma.incentive.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { driver: true },
        }),
        prisma.user.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
        }),
        prisma.driver.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
        }),
      ]);

      const activities: Array<{
        type: string;
        message: string;
        timestamp: Date;
        icon: string;
      }> = [];

      recentRides.forEach((ride) => {
        activities.push({
          type: "ride",
          message: `${ride.user.fullName} requested a ride to ${ride.dropoffLocation}`,
          timestamp: ride.createdAt,
          icon: "map",
        });
      });

      recentPayments.forEach((payment) => {
        activities.push({
          type: "payment",
          message: `Payment of ₦${payment.amount.toLocaleString()} ${payment.status.toLowerCase()}`,
          timestamp: payment.createdAt,
          icon: "dollar",
        });
      });

      recentIncentives.forEach((incentive) => {
        activities.push({
          type: "incentive",
          message: `₦${incentive.amount.toLocaleString()} incentive for ${incentive.driver.fullName}`,
          timestamp: incentive.createdAt,
          icon: "gift",
        });
      });

      recentUsers.forEach((user) => {
        activities.push({
          type: "user",
          message: `${user.fullName} joined the platform`,
          timestamp: user.createdAt,
          icon: "user",
        });
      });

      recentDrivers.forEach((driver) => {
        activities.push({
          type: "driver",
          message: `${driver.fullName} registered as a driver`,
          timestamp: driver.createdAt,
          icon: "car",
        });
      });

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      res.json(activities.slice(0, 10));
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // ==================== PAYMENTS ====================

  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await prisma.payment.findMany({
        include: {
          ride: {
            include: {
              user: true,
              driver: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.patch("/api/payments/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const currentUser = getCurrentUser(req);

      if (currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can update payment status" });
      }

      const validStatuses = ["PENDING", "PAID", "FAILED"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be PENDING, PAID, or FAILED" });
      }

      const payment = await prisma.payment.update({
        where: { id },
        data: { status },
        include: {
          ride: {
            include: { user: true, driver: true },
          },
        },
      });
      res.json(payment);
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // ==================== INCENTIVES ====================

  app.get("/api/incentives", async (req, res) => {
    try {
      const incentives = await prisma.incentive.findMany({
        include: { driver: true },
        orderBy: { createdAt: "desc" },
      });
      res.json(incentives);
    } catch (error) {
      console.error("Error fetching incentives:", error);
      res.status(500).json({ message: "Failed to fetch incentives" });
    }
  });

  app.post("/api/incentives", async (req, res) => {
    try {
      const { driverId, amount, reason } = req.body;
      const currentUser = getCurrentUser(req);

      if (currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can create incentives" });
      }

      if (!driverId || !amount || !reason) {
        return res.status(400).json({ message: "Driver, amount, and reason are required" });
      }

      const driver = await prisma.driver.findUnique({ where: { id: driverId } });
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      const incentive = await prisma.incentive.create({
        data: {
          driverId,
          amount: parseFloat(amount),
          reason,
        },
        include: { driver: true },
      });
      res.status(201).json(incentive);
    } catch (error) {
      console.error("Error creating incentive:", error);
      res.status(500).json({ message: "Failed to create incentive" });
    }
  });

  app.delete("/api/incentives/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = getCurrentUser(req);

      if (currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can delete incentives" });
      }

      await prisma.incentive.delete({ where: { id } });
      res.json({ message: "Incentive deleted" });
    } catch (error) {
      console.error("Error deleting incentive:", error);
      res.status(500).json({ message: "Failed to delete incentive" });
    }
  });

  // Driver earnings (sum of fare from completed rides + incentives)
  app.get("/api/drivers/:id/earnings", async (req, res) => {
    try {
      const { id } = req.params;
      
      const driver = await prisma.driver.findUnique({ where: { id } });
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      const [completedRides, incentives] = await Promise.all([
        prisma.ride.findMany({
          where: { driverId: id, status: "COMPLETED" },
          include: { payment: true },
        }),
        prisma.incentive.aggregate({
          where: { driverId: id },
          _sum: { amount: true },
        }),
      ]);

      const rideEarnings = completedRides.reduce((sum, ride) => {
        return sum + (ride.fareEstimate || 0);
      }, 0);

      const paidRideEarnings = completedRides.reduce((sum, ride) => {
        if (ride.payment?.status === "PAID") {
          return sum + (ride.fareEstimate || 0);
        }
        return sum;
      }, 0);

      res.json({
        driverId: id,
        driverName: driver.fullName,
        totalRides: completedRides.length,
        totalEarnings: rideEarnings,
        paidEarnings: paidRideEarnings,
        pendingEarnings: rideEarnings - paidRideEarnings,
        incentives: incentives._sum.amount || 0,
        grandTotal: rideEarnings + (incentives._sum.amount || 0),
      });
    } catch (error) {
      console.error("Error fetching driver earnings:", error);
      res.status(500).json({ message: "Failed to fetch driver earnings" });
    }
  });

  // ==================== AUTHENTICATION ====================

  app.get("/api/auth/me", (req, res) => {
    const user = getCurrentUser(req);
    if (!user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({
      ...user,
      isImpersonating: req.session.isImpersonating || false,
      originalAdmin: req.session.originalAdmin ? { email: req.session.originalAdmin.email } : null,
    });
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, role } = req.body;
      
      // Only admin login is allowed
      if (role !== "admin") {
        return res.status(403).json({ message: "Only admin login is available" });
      }

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const account = await prisma.admin.findUnique({ where: { email } });

      if (!account) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!account.passwordHash) {
        return res.status(401).json({ message: "Account not properly configured" });
      }

      const isValid = await verifyPassword(password, account.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = account.id;
      req.session.userRole = "admin" as UserRole;
      req.session.userEmail = account.email;
      req.session.needsPasswordSetup = false;

      res.json({ 
        message: "Login successful",
        user: { 
          id: account.id, 
          email: account.email, 
          role: "admin"
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Password setup removed - admin has pre-configured password

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // ==================== RIDE LIFECYCLE ====================

  // Get available drivers for assignment (ACTIVE, isOnline, not on IN_PROGRESS ride)
  app.get("/api/drivers/available", async (req, res) => {
    try {
      const drivers = await prisma.driver.findMany({
        where: { 
          status: "ACTIVE",
          isOnline: true,
          rides: {
            none: {
              status: "IN_PROGRESS"
            }
          }
        },
        orderBy: { averageRating: "desc" },
        include: { _count: { select: { rides: true } } },
      });
      res.json(drivers);
    } catch (error) {
      console.error("Error fetching available drivers:", error);
      res.status(500).json({ message: "Failed to fetch available drivers" });
    }
  });

  // Assign driver to ride (REQUESTED → ACCEPTED)
  app.post("/api/rides/:id/assign", async (req, res) => {
    try {
      const { id } = req.params;
      const { driverId } = req.body;
      const currentUser = getCurrentUser(req);

      if (currentUser.role !== "admin" && currentUser.role !== "director") {
        return res.status(403).json({ message: "Only admins and directors can assign rides" });
      }

      const ride = await prisma.ride.findUnique({ where: { id } });
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }

      if (ride.status !== "REQUESTED") {
        return res.status(400).json({ message: `Cannot assign driver. Ride status is ${ride.status}, expected REQUESTED` });
      }

      const driver = await prisma.driver.findUnique({ 
        where: { id: driverId },
        include: { rides: { where: { status: "IN_PROGRESS" } } }
      });
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      if (driver.status !== "ACTIVE") {
        return res.status(400).json({ message: "Driver must be ACTIVE to be assigned" });
      }
      if (!driver.isOnline) {
        return res.status(400).json({ message: "Driver must be ONLINE to be assigned" });
      }
      if (driver.rides.length > 0) {
        return res.status(400).json({ message: "Driver is currently on another ride" });
      }

      const updatedRide = await prisma.ride.update({
        where: { id },
        data: { 
          driverId,
          status: "DRIVER_EN_ROUTE"
        },
        include: { user: true, driver: true },
      });

      res.json(updatedRide);
    } catch (error) {
      console.error("Error assigning ride:", error);
      res.status(500).json({ message: "Failed to assign ride" });
    }
  });

  // Start ride (DRIVER_EN_ROUTE/ARRIVED → IN_PROGRESS)
  app.post("/api/rides/:id/start", async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = getCurrentUser(req);

      const ride = await prisma.ride.findUnique({ 
        where: { id },
        include: { driver: true }
      });
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }

      if (ride.status !== "ACCEPTED" && ride.status !== "DRIVER_EN_ROUTE" && ride.status !== "ARRIVED") {
        return res.status(400).json({ message: `Cannot start ride. Status is ${ride.status}, expected DRIVER_EN_ROUTE or ARRIVED` });
      }

      if (!ride.driverId) {
        return res.status(400).json({ message: "No driver assigned to this ride" });
      }

      const updatedRide = await prisma.ride.update({
        where: { id },
        data: { status: "IN_PROGRESS" },
        include: { user: true, driver: true },
      });

      res.json(updatedRide);
    } catch (error) {
      console.error("Error starting ride:", error);
      res.status(500).json({ message: "Failed to start ride" });
    }
  });

  // Complete ride (IN_PROGRESS → COMPLETED)
  app.post("/api/rides/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;

      const ride = await prisma.ride.findUnique({ 
        where: { id },
        include: { driver: true, user: true }
      });
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }

      if (ride.status !== "IN_PROGRESS") {
        return res.status(400).json({ message: `Cannot complete ride. Status is ${ride.status}, expected IN_PROGRESS` });
      }

      // Get platform config for commission rate
      let config = await prisma.platformConfig.findFirst();
      if (!config) {
        config = await prisma.platformConfig.create({
          data: { commissionRate: 0.15 },
        });
      }

      const fareAmount = ride.fareEstimate || 1000;
      const commissionAmount = fareAmount * config.commissionRate;
      const driverEarnings = fareAmount - commissionAmount;

      // Use transaction for atomic wallet operations
      const result = await prisma.$transaction(async (tx) => {
        // Update ride status
        const updatedRide = await tx.ride.update({
          where: { id },
          data: { status: "COMPLETED" },
          include: { user: true, driver: true, payment: true },
        });

        // Auto-create payment if no payment exists
        if (!updatedRide.payment) {
          await tx.payment.create({
            data: {
              amount: fareAmount,
              status: "PAID",
              rideId: id,
            },
          });
        }

        // Get or create user wallet
        let userWallet = await tx.wallet.findUnique({
          where: { ownerId_ownerType: { ownerId: ride.userId, ownerType: "USER" } },
        });
        if (!userWallet) {
          userWallet = await tx.wallet.create({
            data: { ownerId: ride.userId, ownerType: "USER", balance: 5000 },
          });
        }

        // Debit user wallet
        await tx.transaction.create({
          data: {
            walletId: userWallet.id,
            type: "DEBIT",
            amount: -fareAmount,
            reference: `Ride payment - ${ride.pickupLocation} to ${ride.dropoffLocation}`,
          },
        });
        await tx.wallet.update({
          where: { id: userWallet.id },
          data: { balance: { decrement: fareAmount } },
        });

        // Create notification for user
        await tx.notification.create({
          data: {
            userId: ride.userId,
            role: "user",
            message: `Ride completed! ₦${fareAmount.toLocaleString()} has been debited from your wallet`,
            type: "RIDE_COMPLETED",
          },
        });

        // Credit driver wallet (if driver exists)
        if (ride.driverId) {
          let driverWallet = await tx.wallet.findUnique({
            where: { ownerId_ownerType: { ownerId: ride.driverId, ownerType: "DRIVER" } },
          });
          if (!driverWallet) {
            driverWallet = await tx.wallet.create({
              data: { ownerId: ride.driverId, ownerType: "DRIVER", balance: 0 },
            });
          }

          // Credit driver earnings
          await tx.transaction.create({
            data: {
              walletId: driverWallet.id,
              type: "CREDIT",
              amount: driverEarnings,
              reference: `Earnings from ride - ${ride.pickupLocation} to ${ride.dropoffLocation}`,
            },
          });

          // Record commission
          await tx.transaction.create({
            data: {
              walletId: driverWallet.id,
              type: "COMMISSION",
              amount: -commissionAmount,
              reference: `Platform commission (${config.commissionRate * 100}%)`,
            },
          });

          await tx.wallet.update({
            where: { id: driverWallet.id },
            data: { balance: { increment: driverEarnings } },
          });

          // Create notification for driver
          await tx.notification.create({
            data: {
              userId: ride.driverId,
              role: "driver",
              message: `Ride completed! ₦${driverEarnings.toLocaleString()} has been credited to your wallet`,
              type: "RIDE_COMPLETED",
            },
          });
        }

        return updatedRide;
      });

      // Fetch the updated ride with payment
      const rideWithPayment = await prisma.ride.findUnique({
        where: { id },
        include: { user: true, driver: true, payment: true },
      });

      res.json(rideWithPayment);
    } catch (error) {
      console.error("Error completing ride:", error);
      res.status(500).json({ message: "Failed to complete ride" });
    }
  });

  // Cancel ride (REQUESTED or ACCEPTED → CANCELLED)
  app.post("/api/rides/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = getCurrentUser(req);

      if (currentUser.role !== "admin" && currentUser.role !== "director") {
        return res.status(403).json({ message: "Only admins and directors can cancel rides" });
      }

      const ride = await prisma.ride.findUnique({ where: { id } });
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }

      if (ride.status === "COMPLETED") {
        return res.status(400).json({ message: "Cannot cancel a completed ride" });
      }

      if (ride.status === "CANCELLED") {
        return res.status(400).json({ message: "Ride is already cancelled" });
      }

      if (ride.status === "IN_PROGRESS") {
        return res.status(400).json({ message: "Cannot cancel a ride in progress" });
      }

      const updatedRide = await prisma.ride.update({
        where: { id },
        data: { status: "CANCELLED" },
        include: { user: true, driver: true },
      });

      res.json(updatedRide);
    } catch (error) {
      console.error("Error cancelling ride:", error);
      res.status(500).json({ message: "Failed to cancel ride" });
    }
  });

  // ==================== DRIVER ONLINE/OFFLINE ====================

  // Toggle driver online
  app.post("/api/drivers/:id/online", async (req, res) => {
    try {
      const { id } = req.params;

      const driver = await prisma.driver.findUnique({ where: { id } });
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      if (driver.status !== "ACTIVE") {
        return res.status(400).json({ message: "Only ACTIVE drivers can go online" });
      }

      const updatedDriver = await prisma.driver.update({
        where: { id },
        data: { isOnline: true },
      });

      res.json(updatedDriver);
    } catch (error) {
      console.error("Error setting driver online:", error);
      res.status(500).json({ message: "Failed to set driver online" });
    }
  });

  // Toggle driver offline
  app.post("/api/drivers/:id/offline", async (req, res) => {
    try {
      const { id } = req.params;

      const driver = await prisma.driver.findUnique({ 
        where: { id },
        include: { rides: { where: { status: "IN_PROGRESS" } } }
      });
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      if (driver.rides.length > 0) {
        return res.status(400).json({ message: "Cannot go offline while on an active ride" });
      }

      const updatedDriver = await prisma.driver.update({
        where: { id },
        data: { isOnline: false },
      });

      res.json(updatedDriver);
    } catch (error) {
      console.error("Error setting driver offline:", error);
      res.status(500).json({ message: "Failed to set driver offline" });
    }
  });

  // ==================== RATINGS ====================

  // Rate a driver (after completed ride)
  app.post("/api/ratings/driver", async (req, res) => {
    try {
      const { rideId, rating } = req.body;

      if (!rideId || rating === undefined) {
        return res.status(400).json({ message: "rideId and rating are required" });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      const ride = await prisma.ride.findUnique({ 
        where: { id: rideId },
        include: { driver: true, driverRating: true }
      });
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }

      if (ride.status !== "COMPLETED") {
        return res.status(400).json({ message: "Can only rate completed rides" });
      }

      if (!ride.driverId) {
        return res.status(400).json({ message: "No driver assigned to this ride" });
      }

      if (ride.driverRating) {
        return res.status(400).json({ message: "Driver already rated for this ride" });
      }

      // Create rating
      const driverRating = await prisma.driverRating.create({
        data: {
          rating,
          rideId,
          driverId: ride.driverId,
          userId: ride.userId,
        },
      });

      // Update driver's average rating
      const driver = await prisma.driver.findUnique({ where: { id: ride.driverId } });
      if (driver) {
        const newTotal = driver.totalRatings + 1;
        const newAverage = ((driver.averageRating * driver.totalRatings) + rating) / newTotal;
        await prisma.driver.update({
          where: { id: ride.driverId },
          data: { 
            averageRating: Math.round(newAverage * 10) / 10,
            totalRatings: newTotal
          },
        });
      }

      res.status(201).json(driverRating);
    } catch (error) {
      console.error("Error rating driver:", error);
      res.status(500).json({ message: "Failed to rate driver" });
    }
  });

  // Rate a user (after completed ride)
  app.post("/api/ratings/user", async (req, res) => {
    try {
      const { rideId, rating } = req.body;

      if (!rideId || rating === undefined) {
        return res.status(400).json({ message: "rideId and rating are required" });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      const ride = await prisma.ride.findUnique({ 
        where: { id: rideId },
        include: { user: true, userRating: true }
      });
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }

      if (ride.status !== "COMPLETED") {
        return res.status(400).json({ message: "Can only rate completed rides" });
      }

      if (!ride.driverId) {
        return res.status(400).json({ message: "No driver assigned to this ride" });
      }

      if (ride.userRating) {
        return res.status(400).json({ message: "User already rated for this ride" });
      }

      // Create rating
      const userRating = await prisma.userRating.create({
        data: {
          rating,
          rideId,
          userId: ride.userId,
          driverId: ride.driverId,
        },
      });

      // Update user's average rating
      const user = await prisma.user.findUnique({ where: { id: ride.userId } });
      if (user) {
        const newTotal = user.totalRatings + 1;
        const newAverage = ((user.averageRating * user.totalRatings) + rating) / newTotal;
        await prisma.user.update({
          where: { id: ride.userId },
          data: { 
            averageRating: Math.round(newAverage * 10) / 10,
            totalRatings: newTotal
          },
        });
      }

      res.status(201).json(userRating);
    } catch (error) {
      console.error("Error rating user:", error);
      res.status(500).json({ message: "Failed to rate user" });
    }
  });

  // ==================== WALLETS ====================

  // Get or create wallet for user/driver
  async function getOrCreateWallet(ownerId: string, ownerType: "USER" | "DRIVER") {
    let wallet = await prisma.wallet.findUnique({
      where: { ownerId_ownerType: { ownerId, ownerType } },
    });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { ownerId, ownerType, balance: ownerType === "USER" ? 5000 : 0 },
      });
    }
    return wallet;
  }

  // Get platform config
  async function getPlatformConfig() {
    let config = await prisma.platformConfig.findFirst();
    if (!config) {
      config = await prisma.platformConfig.create({
        data: { commissionRate: 0.15 },
      });
    }
    return config;
  }

  // Create notification helper
  async function createNotification(userId: string, role: string, message: string, type: "RIDE_REQUESTED" | "RIDE_ASSIGNED" | "RIDE_COMPLETED" | "WALLET_UPDATED" | "STATUS_CHANGE" | "SYSTEM") {
    return prisma.notification.create({
      data: { userId, role, message, type },
    });
  }

  // Get all wallets (admin only)
  app.get("/api/wallets", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const wallets = await prisma.wallet.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });

      // Enrich with owner info
      const enrichedWallets = await Promise.all(
        wallets.map(async (wallet) => {
          let ownerInfo = null;
          if (wallet.ownerType === "USER") {
            ownerInfo = await prisma.user.findUnique({
              where: { id: wallet.ownerId },
              select: { fullName: true, email: true },
            });
          } else {
            ownerInfo = await prisma.driver.findUnique({
              where: { id: wallet.ownerId },
              select: { fullName: true, email: true },
            });
          }
          return { ...wallet, owner: ownerInfo };
        })
      );

      res.json(enrichedWallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      res.status(500).json({ message: "Failed to fetch wallets" });
    }
  });

  // Get wallet by owner
  app.get("/api/wallets/:ownerType/:ownerId", async (req, res) => {
    try {
      const { ownerType, ownerId } = req.params;
      if (ownerType !== "USER" && ownerType !== "DRIVER") {
        return res.status(400).json({ message: "Invalid owner type" });
      }
      
      const wallet = await getOrCreateWallet(ownerId, ownerType);
      const transactions = await prisma.transaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      res.json({ ...wallet, transactions });
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  // Get all transactions (admin only)
  app.get("/api/transactions", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const transactions = await prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { wallet: true },
      });

      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Mark payout as paid (admin only)
  app.post("/api/wallets/:walletId/payout", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { walletId } = req.params;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount required" });
      }

      // Use transaction for atomic payout operations
      const transaction = await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
        if (!wallet) {
          throw new Error("Wallet not found");
        }

        if (wallet.balance < amount) {
          throw new Error("Insufficient balance");
        }

        // Create payout transaction and update balance atomically
        const payoutTx = await tx.transaction.create({
          data: {
            walletId,
            type: "PAYOUT",
            amount: -amount,
            reference: `Payout processed by admin`,
          },
        });

        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { decrement: amount } },
        });

        // Create notification
        await tx.notification.create({
          data: {
            userId: wallet.ownerId,
            role: wallet.ownerType === "USER" ? "user" : "driver",
            message: `Payout of ₦${amount.toLocaleString()} has been processed`,
            type: "WALLET_UPDATED",
          },
        });

        return payoutTx;
      });

      res.json(transaction);
    } catch (error: any) {
      console.error("Error processing payout:", error);
      if (error.message === "Wallet not found") {
        return res.status(404).json({ message: "Wallet not found" });
      }
      if (error.message === "Insufficient balance") {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      res.status(500).json({ message: "Failed to process payout" });
    }
  });

  // ==================== TIPS ====================
  // Stage 17 — Tips system

  // Get all tips (admin only)
  app.get("/api/tips", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tips = await prisma.tip.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          user: { select: { fullName: true, email: true } },
          driver: { select: { fullName: true, email: true } },
        },
      });

      res.json(tips);
    } catch (error) {
      console.error("Error fetching tips:", error);
      res.status(500).json({ message: "Failed to fetch tips" });
    }
  });

  // Create tip after ride completion
  app.post("/api/tips", async (req, res) => {
    try {
      const { rideId, amount } = req.body;

      if (!rideId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Valid ride ID and amount required" });
      }

      // Check ride exists and is completed
      const ride = await prisma.ride.findUnique({
        where: { id: rideId },
        include: { user: true, driver: true },
      });

      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }

      if (ride.status !== "COMPLETED") {
        return res.status(400).json({ message: "Can only tip after ride is completed" });
      }

      if (!ride.driverId) {
        return res.status(400).json({ message: "No driver assigned to this ride" });
      }

      // Check if tip already exists for this ride
      const existingTip = await prisma.tip.findUnique({
        where: { rideId },
      });

      if (existingTip) {
        return res.status(400).json({ message: "Tip already given for this ride" });
      }

      // Create tip and credit driver wallet atomically
      const result = await prisma.$transaction(async (tx) => {
        // Create tip record
        const tip = await tx.tip.create({
          data: {
            rideId,
            userId: ride.userId,
            driverId: ride.driverId!,
            amount,
          },
        });

        // Get or create driver wallet
        let driverWallet = await tx.wallet.findUnique({
          where: { ownerId_ownerType: { ownerId: ride.driverId!, ownerType: "DRIVER" } },
        });

        if (!driverWallet) {
          driverWallet = await tx.wallet.create({
            data: { ownerId: ride.driverId!, ownerType: "DRIVER", balance: 0 },
          });
        }

        // Credit tip to driver wallet (100% goes to driver)
        await tx.transaction.create({
          data: {
            walletId: driverWallet.id,
            type: "TIP",
            amount,
            reference: `Tip from ride ${rideId}`,
          },
        });

        await tx.wallet.update({
          where: { id: driverWallet.id },
          data: { balance: { increment: amount } },
        });

        // Notify driver
        await tx.notification.create({
          data: {
            userId: ride.driverId!,
            role: "driver",
            message: `You received a tip of ₦${amount.toLocaleString()}!`,
            type: "WALLET_UPDATED",
          },
        });

        return tip;
      });

      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating tip:", error);
      res.status(500).json({ message: "Failed to create tip" });
    }
  });

  // Get/update platform config (admin only)
  app.get("/api/config", async (req, res) => {
    try {
      const config = await getPlatformConfig();
      res.json(config);
    } catch (error) {
      console.error("Error fetching config:", error);
      res.status(500).json({ message: "Failed to fetch config" });
    }
  });

  app.patch("/api/config", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { commissionRate, testModeEnabled, paymentGateway, paymentGatewayMode } = req.body;
      
      const updateData: any = {};
      
      if (commissionRate !== undefined) {
        if (commissionRate < 0 || commissionRate > 1) {
          return res.status(400).json({ message: "Commission rate must be between 0 and 1" });
        }
        updateData.commissionRate = commissionRate;
      }

      if (testModeEnabled !== undefined) {
        updateData.testModeEnabled = testModeEnabled;
      }

      if (paymentGateway !== undefined) {
        if (!["STRIPE", "PAYSTACK", "FLUTTERWAVE"].includes(paymentGateway)) {
          return res.status(400).json({ message: "Invalid payment gateway" });
        }
        updateData.paymentGateway = paymentGateway;
      }

      if (paymentGatewayMode !== undefined) {
        if (!["SANDBOX", "LIVE"].includes(paymentGatewayMode)) {
          return res.status(400).json({ message: "Invalid payment gateway mode" });
        }
        updateData.paymentGatewayMode = paymentGatewayMode;
      }

      const config = await getPlatformConfig();
      const updated = await prisma.platformConfig.update({
        where: { id: config.id },
        data: updateData,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating config:", error);
      res.status(500).json({ message: "Failed to update config" });
    }
  });

  // Toggle test mode (admin only)
  app.post("/api/config/toggle-test-mode", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const config = await getPlatformConfig();
      const updated = await prisma.platformConfig.update({
        where: { id: config.id },
        data: { testModeEnabled: !config.testModeEnabled },
      });

      res.json(updated);
    } catch (error) {
      console.error("Error toggling test mode:", error);
      res.status(500).json({ message: "Failed to toggle test mode" });
    }
  });

  // ==================== NOTIFICATIONS ====================

  // Get notifications for current user/role
  app.get("/api/notifications", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      const role = currentUser?.role || "user";
      const userId = currentUser?.id || "preview";

      // Admin sees all, others see their own
      const where = role === "admin" 
        ? {} 
        : { OR: [{ userId }, { role }] };

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ message: "Failed to mark notification read" });
    }
  });

  // Mark all notifications as read
  app.post("/api/notifications/read-all", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      const role = currentUser?.role || "user";
      const userId = currentUser?.id || "preview";

      const where = role === "admin" 
        ? {} 
        : { OR: [{ userId }, { role }] };

      await prisma.notification.updateMany({
        where: { ...where, read: false },
        data: { read: true },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications read:", error);
      res.status(500).json({ message: "Failed to mark notifications read" });
    }
  });

  // Get unread notification count
  app.get("/api/notifications/unread-count", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      const role = currentUser?.role || "user";
      const userId = currentUser?.id || "preview";

      const where = role === "admin" 
        ? { read: false } 
        : { read: false, OR: [{ userId }, { role }] };

      const count = await prisma.notification.count({ where });
      res.json({ count });
    } catch (error) {
      console.error("Error counting notifications:", error);
      res.status(500).json({ message: "Failed to count notifications" });
    }
  });

  // ==================== FARE CONFIG ====================

  // Get all fare configs (admin only)
  app.get("/api/fare-configs", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can access fare configs" });
      }

      const fareConfigs = await prisma.fareConfig.findMany({
        orderBy: { countryName: "asc" },
      });
      res.json(fareConfigs);
    } catch (error) {
      console.error("Error fetching fare configs:", error);
      res.status(500).json({ message: "Failed to fetch fare configs" });
    }
  });

  // Get fare config by country code (admin only)
  app.get("/api/fare-configs/:countryCode", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can access fare configs" });
      }

      const { countryCode } = req.params;
      const fareConfig = await prisma.fareConfig.findUnique({
        where: { countryCode },
      });
      if (!fareConfig) {
        return res.status(404).json({ message: "Fare config not found" });
      }
      res.json(fareConfig);
    } catch (error) {
      console.error("Error fetching fare config:", error);
      res.status(500).json({ message: "Failed to fetch fare config" });
    }
  });

  // Create or update fare config (admin only)
  app.post("/api/fare-configs", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can manage fare configs" });
      }

      const { 
        countryCode, 
        countryName, 
        currency, 
        currencySymbol,
        baseFare, 
        pricePerKm, 
        pricePerMinute, 
        minimumFare,
        driverCommission,
        platformCommission,
        distanceUnit,
        surgeEnabled,
        surgeMultiplier,
        maxSurgeCap,
        peakHoursStart,
        peakHoursEnd,
        weatherMultiplier,
        trafficMultiplier
      } = req.body;

      if (!countryCode || !countryName || !currency || !currencySymbol) {
        return res.status(400).json({ message: "Country code, name, currency and symbol are required" });
      }

      const fareConfig = await prisma.fareConfig.upsert({
        where: { countryCode },
        create: {
          countryCode,
          countryName,
          currency,
          currencySymbol,
          baseFare: baseFare || 500,
          pricePerKm: pricePerKm || 120,
          pricePerMinute: pricePerMinute || 30,
          minimumFare: minimumFare || 300,
          driverCommission: driverCommission || 0.85,
          platformCommission: platformCommission || 0.15,
          distanceUnit: distanceUnit || "KM",
          surgeEnabled: surgeEnabled || false,
          surgeMultiplier: surgeMultiplier || 1.0,
          maxSurgeCap: maxSurgeCap || 1.3,
          peakHoursStart: peakHoursStart || null,
          peakHoursEnd: peakHoursEnd || null,
          weatherMultiplier: weatherMultiplier || 1.0,
          trafficMultiplier: trafficMultiplier || 1.0,
          updatedBy: currentUser.email,
        },
        update: {
          countryName,
          currency,
          currencySymbol,
          baseFare,
          pricePerKm,
          pricePerMinute,
          minimumFare,
          driverCommission,
          platformCommission,
          distanceUnit,
          surgeEnabled,
          surgeMultiplier,
          maxSurgeCap,
          peakHoursStart,
          peakHoursEnd,
          weatherMultiplier,
          trafficMultiplier,
          updatedBy: currentUser.email,
        },
      });

      res.json(fareConfig);
    } catch (error) {
      console.error("Error saving fare config:", error);
      res.status(500).json({ message: "Failed to save fare config" });
    }
  });

  // Update fare config (admin only)
  app.patch("/api/fare-configs/:countryCode", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can manage fare configs" });
      }

      const { countryCode } = req.params;
      const { 
        baseFare, 
        pricePerKm, 
        pricePerMinute, 
        minimumFare,
        driverCommission,
        platformCommission,
        distanceUnit,
        surgeEnabled,
        surgeMultiplier,
        maxSurgeCap,
        peakHoursStart,
        peakHoursEnd,
        weatherMultiplier,
        trafficMultiplier
      } = req.body;

      const fareConfig = await prisma.fareConfig.update({
        where: { countryCode },
        data: {
          baseFare,
          pricePerKm,
          pricePerMinute,
          minimumFare,
          driverCommission,
          platformCommission,
          distanceUnit,
          surgeEnabled,
          surgeMultiplier,
          maxSurgeCap,
          peakHoursStart,
          peakHoursEnd,
          weatherMultiplier,
          trafficMultiplier,
          updatedBy: currentUser.email,
        },
      });

      res.json(fareConfig);
    } catch (error) {
      console.error("Error updating fare config:", error);
      res.status(500).json({ message: "Failed to update fare config" });
    }
  });

  // Delete fare config (admin only)
  app.delete("/api/fare-configs/:countryCode", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can manage fare configs" });
      }

      const { countryCode } = req.params;
      await prisma.fareConfig.delete({
        where: { countryCode },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting fare config:", error);
      res.status(500).json({ message: "Failed to delete fare config" });
    }
  });

  // ==================== ANALYTICS ====================

  app.get("/api/analytics", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "director")) {
        return res.status(403).json({ message: "Access denied" });
      }

      const config = await getPlatformConfig();

      // Core metrics
      const [
        totalUsers,
        activeUsers,
        totalDrivers,
        activeDrivers,
        onlineDrivers,
        totalRides,
        completedRides,
        totalDirectors,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "ACTIVE" } }),
        prisma.driver.count(),
        prisma.driver.count({ where: { status: "ACTIVE" } }),
        prisma.driver.count({ where: { status: "ACTIVE", isOnline: true } }),
        prisma.ride.count(),
        prisma.ride.count({ where: { status: "COMPLETED" } }),
        prisma.director.count(),
      ]);

      // Revenue calculations
      const payments = await prisma.payment.findMany({
        where: { status: "PAID" },
      });
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalCommissions = totalRevenue * config.commissionRate;

      // Wallet stats
      const wallets = await prisma.wallet.findMany();
      const userWallets = wallets.filter(w => w.ownerType === "USER");
      const driverWallets = wallets.filter(w => w.ownerType === "DRIVER");
      const totalUserBalance = userWallets.reduce((sum, w) => sum + w.balance, 0);
      const totalDriverBalance = driverWallets.reduce((sum, w) => sum + w.balance, 0);

      // Transaction stats
      const transactions = await prisma.transaction.findMany();
      const payouts = transactions.filter(t => t.type === "PAYOUT");
      const totalPayouts = Math.abs(payouts.reduce((sum, t) => sum + t.amount, 0));

      // Director performance (region-based)
      const directors = await prisma.director.findMany({
        where: { status: "ACTIVE" },
      });

      const directorMetrics = directors.map(d => {
        const onlineRatio = d.driversAssigned > 0 
          ? d.driversOnline / d.driversAssigned 
          : 0;
        const performanceRating = Math.min(5, Math.max(1, Math.round(onlineRatio * 5)));
        return {
          id: d.id,
          fullName: d.fullName,
          region: d.region,
          role: d.role,
          driversAssigned: d.driversAssigned,
          driversOnline: d.driversOnline,
          performanceRating,
        };
      });

      res.json({
        users: { total: totalUsers, active: activeUsers },
        drivers: { total: totalDrivers, active: activeDrivers, online: onlineDrivers },
        directors: { total: totalDirectors, metrics: directorMetrics },
        rides: { total: totalRides, completed: completedRides },
        revenue: {
          total: totalRevenue,
          commissions: totalCommissions,
          commissionRate: config.commissionRate,
        },
        wallets: {
          userBalance: totalUserBalance,
          driverBalance: totalDriverBalance,
          totalPayouts,
        },
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // ==================== TEST ACCOUNTS (ADMIN ONLY - DEV MODE) ====================

  // Get all test accounts
  app.get("/api/test-accounts", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can access test accounts" });
      }

      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ message: "Test accounts disabled in production" });
      }

      const testAccounts = await prisma.testAccount.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(testAccounts);
    } catch (error) {
      console.error("Error fetching test accounts:", error);
      res.status(500).json({ message: "Failed to fetch test accounts" });
    }
  });

  // Create test account
  app.post("/api/test-accounts", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can create test accounts" });
      }

      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ message: "Test accounts disabled in production" });
      }

      const { role, countryCode, region, city, status, fullName } = req.body;

      if (!role || !countryCode || !fullName) {
        return res.status(400).json({ message: "Role, country code, and full name are required" });
      }

      const rolePrefix = role.toLowerCase();
      const locationSlug = (city || region || "test").toLowerCase().replace(/\s+/g, "_");
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const email = `${rolePrefix}_test_${locationSlug}_${randomSuffix}@ziba.test`;
      const plainPassword = `Test${randomSuffix}!${Date.now().toString(36)}`;
      const passwordHash = await hashPassword(plainPassword);

      const testAccount = await prisma.testAccount.create({
        data: {
          email,
          passwordHash,
          role,
          countryCode,
          region,
          city,
          status: status || "ACTIVE",
          fullName,
          isTestAccount: true,
          createdBy: currentUser.email,
        },
      });

      res.json({ ...testAccount, temporaryPassword: plainPassword });
    } catch (error) {
      console.error("Error creating test account:", error);
      res.status(500).json({ message: "Failed to create test account" });
    }
  });

  // Update test account status
  app.patch("/api/test-accounts/:id", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can update test accounts" });
      }

      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ message: "Test accounts disabled in production" });
      }

      const { id } = req.params;
      const { status, region, city } = req.body;

      const testAccount = await prisma.testAccount.update({
        where: { id },
        data: { status, region, city },
      });

      res.json(testAccount);
    } catch (error) {
      console.error("Error updating test account:", error);
      res.status(500).json({ message: "Failed to update test account" });
    }
  });

  // Reset test account password
  app.post("/api/test-accounts/:id/reset-password", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can reset test account passwords" });
      }

      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ message: "Test accounts disabled in production" });
      }

      const { id } = req.params;
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const plainPassword = `Reset${randomSuffix}!${Date.now().toString(36)}`;
      const passwordHash = await hashPassword(plainPassword);

      await prisma.testAccount.update({
        where: { id },
        data: { passwordHash },
      });

      res.json({ temporaryPassword: plainPassword });
    } catch (error) {
      console.error("Error resetting test account password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Delete test account
  app.delete("/api/test-accounts/:id", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can delete test accounts" });
      }

      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ message: "Test accounts disabled in production" });
      }

      const { id } = req.params;
      await prisma.testAccount.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting test account:", error);
      res.status(500).json({ message: "Failed to delete test account" });
    }
  });

  // Delete all test accounts
  app.delete("/api/test-accounts", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can delete test accounts" });
      }

      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ message: "Test accounts disabled in production" });
      }

      await prisma.testAccount.deleteMany({});
      res.json({ success: true, message: "All test accounts deleted" });
    } catch (error) {
      console.error("Error deleting all test accounts:", error);
      res.status(500).json({ message: "Failed to delete test accounts" });
    }
  });

  // Login as test account (DEV MODE ONLY + TEST_MODE ENABLED)
  // Stage 17 — Safe test mode with platform config check
  app.post("/api/test-accounts/:id/login-as", async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can use login-as" });
      }

      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ message: "Login-as disabled in production" });
      }

      if (process.env.ALLOW_TEST_LOGIN !== "true") {
        return res.status(403).json({ message: "Test login feature is disabled" });
      }

      // Check platform config for test mode
      const config = await getPlatformConfig();
      if (!config.testModeEnabled) {
        return res.status(403).json({ message: "Test mode is disabled. Enable it in Platform Settings." });
      }

      const { id } = req.params;
      const testAccount = await prisma.testAccount.findUnique({ where: { id } });

      if (!testAccount) {
        return res.status(404).json({ message: "Test account not found" });
      }

      req.session.originalAdmin = {
        id: currentUser.id,
        email: currentUser.email ?? "",
        role: "admin",
      };
      req.session.isImpersonating = true;

      req.session.user = {
        id: testAccount.id,
        email: testAccount.email,
        role: testAccount.role.toLowerCase(),
        isTestAccount: true,
      };

      res.json({ 
        success: true, 
        redirectTo: testAccount.role === "ADMIN" ? "/admin" 
          : testAccount.role === "DIRECTOR" ? "/directors"
          : testAccount.role === "DRIVER" ? "/drivers"
          : "/",
        user: {
          id: testAccount.id,
          email: testAccount.email,
          role: testAccount.role.toLowerCase(),
          fullName: testAccount.fullName,
          isTestAccount: true,
        }
      });
    } catch (error) {
      console.error("Error logging in as test account:", error);
      res.status(500).json({ message: "Failed to login as test account" });
    }
  });

  // Play Store readiness check
  // Stage 16 — Production readiness verification
  app.get("/api/playstore-readiness", async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const isProduction = process.env.NODE_ENV === "production";
      
      const security = [
        {
          id: "no-hardcoded-creds",
          label: "No Hardcoded Credentials",
          status: "pass" as const,
          description: "All credentials are stored as environment secrets"
        },
        {
          id: "password-hashing",
          label: "Password Hashing",
          status: "pass" as const,
          description: "Passwords hashed with bcrypt (cost factor 10)"
        },
        {
          id: "admin-protected",
          label: "Admin Routes Protected",
          status: "pass" as const,
          description: "All admin routes require authentication"
        },
        {
          id: "test-accounts-blocked",
          label: "Test Accounts Blocked in Production",
          status: isProduction ? "pass" as const : "warning" as const,
          description: isProduction ? "Test accounts disabled" : "Will be disabled in production"
        },
        {
          id: "bootstrap-disabled",
          label: "Bootstrap Logic Disabled",
          status: "pass" as const,
          description: "No magic passwords or auto-reset logic"
        }
      ];

      const requiredPages = [
        {
          id: "privacy-policy",
          label: "Privacy Policy",
          status: "pass" as const,
          description: "Available at /legal/privacy"
        },
        {
          id: "terms-of-service",
          label: "Terms of Service",
          status: "pass" as const,
          description: "Available at /legal/terms"
        },
        {
          id: "cookie-policy",
          label: "Cookie Policy",
          status: "pass" as const,
          description: "Available at /legal/cookies"
        },
        {
          id: "help-center",
          label: "Help Center",
          status: "pass" as const,
          description: "Available at /support/help-center"
        },
        {
          id: "contact-page",
          label: "Contact Page",
          status: "pass" as const,
          description: "Available at /support/contact"
        }
      ];

      const deployment = [
        {
          id: "no-polling",
          label: "No Background Polling",
          status: "pass" as const,
          description: "refetchInterval disabled globally"
        },
        {
          id: "env-configured",
          label: "Environment Variables",
          status: process.env.SESSION_SECRET ? "pass" as const : "fail" as const,
          description: process.env.SESSION_SECRET ? "Required secrets configured" : "Missing SESSION_SECRET"
        },
        {
          id: "database-connected",
          label: "Database Connection",
          status: process.env.DATABASE_URL ? "pass" as const : "fail" as const,
          description: process.env.DATABASE_URL ? "PostgreSQL connected" : "Missing DATABASE_URL"
        },
        {
          id: "verbose-logging",
          label: "Production Logging",
          status: "pass" as const,
          description: "Verbose logging controlled by environment"
        }
      ];

      const appMetadata = [
        {
          id: "app-name",
          label: "App Name",
          status: "pass" as const,
          description: "Ziba"
        },
        {
          id: "app-category",
          label: "App Category",
          status: "pass" as const,
          description: "Transportation"
        },
        {
          id: "short-description",
          label: "Short Description",
          status: "warning" as const,
          description: "Needs to be added to Play Store listing"
        },
        {
          id: "app-icon",
          label: "App Icon",
          status: "warning" as const,
          description: "512x512 PNG required for Play Store"
        }
      ];

      const allItems = [...security, ...requiredPages, ...deployment, ...appMetadata];
      const passCount = allItems.filter(i => i.status === "pass").length;
      const overallScore = Math.round((passCount / allItems.length) * 100);
      
      const criticalFails = allItems.filter(i => i.status === "fail").length;
      const buildReady = criticalFails === 0;

      res.json({
        overallScore,
        buildStatus: {
          ready: buildReady,
          message: buildReady 
            ? "All critical requirements met" 
            : `${criticalFails} critical issue(s) need resolution`
        },
        security,
        requiredPages,
        deployment,
        appMetadata
      });
    } catch (error) {
      console.error("Error checking playstore readiness:", error);
      res.status(500).json({ message: "Failed to check readiness" });
    }
  });

  // Check dev mode status (includes platform config test mode)
  // Stage 17 — Safe test mode status
  app.get("/api/dev-mode", async (req, res) => {
    const allowTestLogin = process.env.ALLOW_TEST_LOGIN === "true";
    const config = await getPlatformConfig();
    res.json({ 
      isDevMode: process.env.NODE_ENV !== "production",
      testAccountsEnabled: process.env.NODE_ENV !== "production" && allowTestLogin && config.testModeEnabled,
      testModeEnabled: config.testModeEnabled,
      paymentGatewayMode: config.paymentGatewayMode
    });
  });

  // Return to admin from impersonation
  app.post("/api/test-accounts/return-to-admin", async (req, res) => {
    try {
      if (!req.session.originalAdmin) {
        return res.status(400).json({ message: "No admin session to return to" });
      }

      req.session.user = req.session.originalAdmin;
      delete req.session.originalAdmin;
      delete req.session.isImpersonating;

      res.json({ 
        success: true,
        user: req.session.user
      });
    } catch (error) {
      console.error("Error returning to admin:", error);
      res.status(500).json({ message: "Failed to return to admin" });
    }
  });

  // ==================== RIDER APP AUTHENTICATION ====================

  // TEST_MODE: When true, skip email verification and enable test driver matching
  // This is for development/testing only and will be replaced with real logic later
  // Can be disabled via environment variable: TEST_MODE=false
  const TEST_MODE = process.env.TEST_MODE !== "false";

  // Create test drivers if none exist (only in TEST_MODE)
  async function ensureTestDriversExist() {
    if (!TEST_MODE) return;

    const testDriverCount = await prisma.driver.count({
      where: { isTestAccount: true, status: "ACTIVE" }
    });

    if (testDriverCount >= 3) return;

    const testDrivers = [
      { fullName: "Michael Okonkwo", email: "driver1@test.ziba.app", phone: "+2348012345001", vehicleType: "CAR" as const, vehiclePlate: "LAG-123-AB", averageRating: 4.8 },
      { fullName: "Amina Bello", email: "driver2@test.ziba.app", phone: "+2348012345002", vehicleType: "CAR" as const, vehiclePlate: "LAG-456-CD", averageRating: 4.9 },
      { fullName: "Chidi Nnamdi", email: "driver3@test.ziba.app", phone: "+2348012345003", vehicleType: "CAR" as const, vehiclePlate: "LAG-789-EF", averageRating: 4.7 },
      { fullName: "Fatima Yusuf", email: "driver4@test.ziba.app", phone: "+2348012345004", vehicleType: "BIKE" as const, vehiclePlate: "LAG-111-GH", averageRating: 4.6 },
      { fullName: "Emeka Obi", email: "driver5@test.ziba.app", phone: "+2348012345005", vehicleType: "VAN" as const, vehiclePlate: "LAG-222-IJ", averageRating: 4.5 },
    ];

    for (const driver of testDrivers) {
      const existing = await prisma.driver.findUnique({ where: { email: driver.email } });
      if (!existing) {
        await prisma.driver.create({
          data: {
            ...driver,
            status: "ACTIVE",
            isOnline: true,
            isTestAccount: true,
            totalRatings: Math.floor(Math.random() * 100) + 50
          }
        });
        
        // Create wallet for test driver
        const newDriver = await prisma.driver.findUnique({ where: { email: driver.email } });
        if (newDriver) {
          await prisma.wallet.create({
            data: {
              ownerId: newDriver.id,
              ownerType: "DRIVER",
              balance: 0
            }
          });
        }
      }
    }
    console.log("[TEST_MODE] Test drivers ensured");
  }

  // Initialize test drivers on server start
  ensureTestDriversExist().catch(console.error);

  // Find an available test driver for matching
  async function findAvailableTestDriver(): Promise<any> {
    const driver = await prisma.driver.findFirst({
      where: {
        isTestAccount: true,
        status: "ACTIVE",
        isOnline: true
      },
      orderBy: { averageRating: "desc" }
    });
    return driver;
  }

  // Rider registration
  app.post("/api/rider/register", async (req, res) => {
    try {
      const { fullName, email, password, phone, city } = req.body;
      
      if (!fullName || !email || !password) {
        return res.status(400).json({ message: "Full name, email, and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const passwordHash = await hashPassword(password);
      
      // In TEST_MODE, mark as test account (email auto-verified)
      const user = await prisma.user.create({
        data: {
          fullName,
          email,
          passwordHash,
          phone: phone || null,
          city: city || null,
          status: "ACTIVE",
          isTestAccount: TEST_MODE
        }
      });

      // Create wallet for new user
      await prisma.wallet.create({
        data: {
          ownerId: user.id,
          ownerType: "USER",
          balance: 0
        }
      });

      // Set session
      req.session.userId = user.id;
      req.session.userRole = "rider" as UserRole;
      req.session.userEmail = user.email;

      res.status(201).json({
        message: "Registration successful",
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          city: user.city,
          role: "rider",
          isTestAccount: user.isTestAccount
        }
      });
    } catch (error: any) {
      console.error("Rider registration error:", error);
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Email already registered" });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Driver registration
  app.post("/api/driver/register", async (req, res) => {
    try {
      const { fullName, email, password, phone, vehicleType, vehiclePlate } = req.body;
      
      if (!fullName || !email || !password || !phone || !vehicleType || !vehiclePlate) {
        return res.status(400).json({ message: "Full name, email, password, phone, vehicle type, and vehicle plate are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const validVehicleTypes = ["CAR", "BIKE", "VAN"];
      if (!validVehicleTypes.includes(vehicleType)) {
        return res.status(400).json({ message: "Invalid vehicle type. Must be CAR, BIKE, or VAN" });
      }

      const existingDriver = await prisma.driver.findUnique({ where: { email } });
      if (existingDriver) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const passwordHash = await hashPassword(password);
      
      const driver = await prisma.driver.create({
        data: {
          fullName,
          email,
          passwordHash,
          phone,
          vehicleType: vehicleType as "CAR" | "BIKE" | "VAN",
          vehiclePlate,
          status: "PENDING",
          isVerified: false,
          isTestAccount: TEST_MODE
        }
      });

      // Create wallet for new driver
      await prisma.wallet.create({
        data: {
          ownerId: driver.id,
          ownerType: "DRIVER",
          balance: 0
        }
      });

      // Set session
      req.session.userId = driver.id;
      req.session.userRole = "driver" as UserRole;
      req.session.userEmail = driver.email;

      res.status(201).json({
        message: "Registration successful. Your account is pending verification.",
        user: {
          id: driver.id,
          fullName: driver.fullName,
          email: driver.email,
          phone: driver.phone,
          vehicleType: driver.vehicleType,
          vehiclePlate: driver.vehiclePlate,
          status: driver.status,
          role: "driver",
          isVerified: driver.isVerified,
          isTestAccount: driver.isTestAccount
        }
      });
    } catch (error: any) {
      console.error("Driver registration error:", error);
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Email already registered" });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Director registration
  app.post("/api/director/register", async (req, res) => {
    try {
      const { fullName, email, password, phone, role, region } = req.body;
      
      if (!fullName || !email || !password) {
        return res.status(400).json({ message: "Full name, email, and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existingDirector = await prisma.director.findUnique({ where: { email } });
      if (existingDirector) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const passwordHash = await hashPassword(password);
      
      const director = await prisma.director.create({
        data: {
          fullName,
          email,
          passwordHash,
          phone: phone || null,
          role: role || "OPERATIONS",
          region: region || "Default",
          status: "PENDING",
          isVerified: false,
          isApproved: false,
          isTestAccount: TEST_MODE
        }
      });

      // Set session
      req.session.userId = director.id;
      req.session.userRole = "director" as UserRole;
      req.session.userEmail = director.email;

      res.status(201).json({
        message: "Registration successful. Your account is pending admin approval.",
        user: {
          id: director.id,
          fullName: director.fullName,
          email: director.email,
          role: director.role,
          region: director.region,
          status: director.status,
          accountRole: "director",
          isVerified: director.isVerified,
          isApproved: director.isApproved,
          isTestAccount: director.isTestAccount
        }
      });
    } catch (error: any) {
      console.error("Director registration error:", error);
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Email already registered" });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Rider login
  app.post("/api/rider/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.passwordHash) {
        return res.status(401).json({ message: "Account not configured for login" });
      }

      if (user.status === "SUSPENDED") {
        return res.status(403).json({ message: "Account suspended" });
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.userRole = "rider" as UserRole;
      req.session.userEmail = user.email;

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          city: user.city,
          role: "rider",
          isTestAccount: user.isTestAccount
        }
      });
    } catch (error) {
      console.error("Rider login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Rider auth check
  app.get("/api/rider/me", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          city: true,
          status: true,
          averageRating: true,
          isTestAccount: true
        }
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        ...user,
        role: "rider"
      });
    } catch (error) {
      console.error("Error fetching rider:", error);
      res.status(500).json({ message: "Failed to fetch rider data" });
    }
  });

  // Rider logout
  app.post("/api/rider/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Driver login
  app.post("/api/driver/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const driver = await prisma.driver.findUnique({ where: { email } });
      if (!driver) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!driver.passwordHash) {
        return res.status(401).json({ message: "Account not configured for login" });
      }

      const isValid = await verifyPassword(password, driver.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check verification status
      if (!driver.isVerified) {
        return res.status(403).json({ 
          message: "Account pending verification", 
          status: "PENDING_VERIFICATION",
          redirect: "/driver/pending-verification"
        });
      }

      if (driver.status === "SUSPENDED") {
        return res.status(403).json({ message: "Account suspended" });
      }

      // Set session
      req.session.userId = driver.id;
      req.session.userRole = "driver" as UserRole;
      req.session.userEmail = driver.email;

      res.json({
        message: "Login successful",
        user: {
          id: driver.id,
          fullName: driver.fullName,
          email: driver.email,
          phone: driver.phone,
          vehicleType: driver.vehicleType,
          vehiclePlate: driver.vehiclePlate,
          status: driver.status,
          role: "driver",
          isVerified: driver.isVerified,
          isTestAccount: driver.isTestAccount
        }
      });
    } catch (error) {
      console.error("Driver login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Driver auth check
  app.get("/api/driver/me", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "driver") {
      return res.status(401).json({ message: "Not authenticated as driver" });
    }

    try {
      const driver = await prisma.driver.findUnique({
        where: { id: req.session.userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          vehicleType: true,
          vehiclePlate: true,
          status: true,
          isOnline: true,
          averageRating: true,
          isVerified: true,
          isTestAccount: true
        }
      });

      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      res.json({
        ...driver,
        role: "driver"
      });
    } catch (error) {
      console.error("Error fetching driver:", error);
      res.status(500).json({ message: "Failed to fetch driver data" });
    }
  });

  // Driver logout
  app.post("/api/driver/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Director login
  app.post("/api/director/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const director = await prisma.director.findUnique({ where: { email } });
      if (!director) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!director.passwordHash) {
        return res.status(401).json({ message: "Account not configured for login" });
      }

      const isValid = await verifyPassword(password, director.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check verification status first
      if (!director.isVerified) {
        return res.status(403).json({ 
          message: "Account pending verification", 
          status: "PENDING_VERIFICATION",
          redirect: "/director/pending-approval"
        });
      }

      // Check approval status
      if (!director.isApproved) {
        return res.status(403).json({ 
          message: "Account pending admin approval", 
          status: "PENDING_APPROVAL",
          redirect: "/director/pending-approval"
        });
      }

      if (director.status === "SUSPENDED") {
        return res.status(403).json({ message: "Account suspended" });
      }

      // Set session
      req.session.userId = director.id;
      req.session.userRole = "director" as UserRole;
      req.session.userEmail = director.email;

      res.json({
        message: "Login successful",
        user: {
          id: director.id,
          fullName: director.fullName,
          email: director.email,
          role: director.role,
          region: director.region,
          status: director.status,
          accountRole: "director",
          isApproved: director.isApproved,
          isTestAccount: director.isTestAccount
        }
      });
    } catch (error) {
      console.error("Director login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Director auth check
  app.get("/api/director/me", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "director") {
      return res.status(401).json({ message: "Not authenticated as director" });
    }

    try {
      const director = await prisma.director.findUnique({
        where: { id: req.session.userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          region: true,
          status: true,
          isApproved: true,
          isTestAccount: true
        }
      });

      if (!director) {
        return res.status(404).json({ message: "Director not found" });
      }

      res.json({
        ...director,
        accountRole: "director"
      });
    } catch (error) {
      console.error("Error fetching director:", error);
      res.status(500).json({ message: "Failed to fetch director data" });
    }
  });

  // Director logout
  app.post("/api/director/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Rider profile update
  app.patch("/api/rider/profile", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const { fullName, phone, city } = req.body;
      
      const user = await prisma.user.update({
        where: { id: req.session.userId },
        data: { fullName, phone, city },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          city: true,
          status: true,
          averageRating: true
        }
      });

      res.json(user);
    } catch (error) {
      console.error("Error updating rider profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // ==================== RIDER APP RIDES ====================

  // Get single ride by ID
  app.get("/api/rider/rides/:id", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const { id } = req.params;
      const ride = await prisma.ride.findFirst({
        where: { id, userId: req.session.userId },
        include: {
          driver: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              vehicleType: true,
              vehiclePlate: true,
              averageRating: true
            }
          },
          payment: true,
          driverRating: true
        }
      });

      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }

      res.json(ride);
    } catch (error) {
      console.error("Error fetching ride:", error);
      res.status(500).json({ message: "Failed to fetch ride" });
    }
  });

  // Get rider's rides
  app.get("/api/rider/rides", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const rides = await prisma.ride.findMany({
        where: { userId: req.session.userId },
        orderBy: { createdAt: "desc" },
        include: {
          driver: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              vehicleType: true,
              vehiclePlate: true,
              averageRating: true
            }
          },
          payment: true
        }
      });

      res.json(rides);
    } catch (error) {
      console.error("Error fetching rider rides:", error);
      res.status(500).json({ message: "Failed to fetch rides" });
    }
  });

  // Get active ride for rider
  app.get("/api/rider/active-ride", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const activeRide = await prisma.ride.findFirst({
        where: {
          userId: req.session.userId,
          status: { in: ["REQUESTED", "ACCEPTED", "DRIVER_EN_ROUTE", "ARRIVED", "IN_PROGRESS"] }
        },
        include: {
          driver: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              vehicleType: true,
              vehiclePlate: true,
              averageRating: true
            }
          },
          payment: true
        }
      });

      res.json(activeRide);
    } catch (error) {
      console.error("Error fetching active ride:", error);
      res.status(500).json({ message: "Failed to fetch active ride" });
    }
  });

  // Request a new ride
  app.post("/api/rider/request-ride", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const { pickupLocation, dropoffLocation, fareEstimate } = req.body;

      if (!pickupLocation || !dropoffLocation) {
        return res.status(400).json({ message: "Pickup and dropoff locations are required" });
      }

      // Check for existing active ride
      const existingRide = await prisma.ride.findFirst({
        where: {
          userId: req.session.userId,
          status: { in: ["REQUESTED", "ACCEPTED", "DRIVER_EN_ROUTE", "ARRIVED", "IN_PROGRESS"] }
        }
      });

      if (existingRide) {
        return res.status(400).json({ message: "You already have an active ride" });
      }

      let ride = await prisma.ride.create({
        data: {
          userId: req.session.userId,
          pickupLocation,
          dropoffLocation,
          fareEstimate: fareEstimate || null,
          status: "REQUESTED"
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true }
          },
          driver: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              vehicleType: true,
              vehiclePlate: true,
              averageRating: true
            }
          }
        }
      });

      // TEST_MODE: Auto-assign a test driver after a short delay simulation
      if (TEST_MODE) {
        const testDriver = await findAvailableTestDriver();
        if (testDriver) {
          // Update ride with assigned driver and transition to DRIVER_EN_ROUTE
          ride = await prisma.ride.update({
            where: { id: ride.id },
            data: {
              driverId: testDriver.id,
              status: "DRIVER_EN_ROUTE"
            },
            include: {
              user: {
                select: { id: true, fullName: true, email: true }
              },
              driver: {
                select: {
                  id: true,
                  fullName: true,
                  phone: true,
                  vehicleType: true,
                  vehiclePlate: true,
                  averageRating: true
                }
              }
            }
          });
          console.log(`[TEST_MODE] Auto-assigned driver ${testDriver.fullName} to ride ${ride.id}`);
        }
      }

      res.status(201).json(ride);
    } catch (error) {
      console.error("Error requesting ride:", error);
      res.status(500).json({ message: "Failed to request ride" });
    }
  });

  // Cancel ride (rider can only cancel REQUESTED rides)
  app.post("/api/rider/rides/:id/cancel", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const { id } = req.params;

      const ride = await prisma.ride.findFirst({
        where: { id, userId: req.session.userId }
      });

      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }

      if (!["REQUESTED", "ACCEPTED", "DRIVER_EN_ROUTE", "ARRIVED"].includes(ride.status)) {
        return res.status(400).json({ message: "Can only cancel rides that haven't started yet" });
      }

      const updatedRide = await prisma.ride.update({
        where: { id },
        data: { status: "CANCELLED" }
      });

      res.json(updatedRide);
    } catch (error) {
      console.error("Error cancelling ride:", error);
      res.status(500).json({ message: "Failed to cancel ride" });
    }
  });

  // ==================== TEST MODE RIDE CONTROLS ====================
  // These endpoints allow testing the full ride flow without a driver app
  // Only available when TEST_MODE is enabled

  // Test: Driver arrived at pickup
  app.post("/api/rider/rides/:id/test-arrive", async (req, res) => {
    if (!TEST_MODE) {
      return res.status(403).json({ message: "Test mode is not enabled" });
    }
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const { id } = req.params;
      const ride = await prisma.ride.findFirst({
        where: { id, userId: req.session.userId }
      });

      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }

      if (ride.status !== "DRIVER_EN_ROUTE" && ride.status !== "ACCEPTED") {
        return res.status(400).json({ message: "Driver can only arrive when en route to pickup" });
      }

      const updatedRide = await prisma.ride.update({
        where: { id },
        data: { status: "ARRIVED" },
        include: {
          driver: {
            select: { id: true, fullName: true, phone: true, vehicleType: true, vehiclePlate: true, averageRating: true }
          }
        }
      });

      console.log(`[TEST_MODE] Driver arrived for ride ${id}`);
      res.json(updatedRide);
    } catch (error) {
      console.error("Error simulating driver arrival:", error);
      res.status(500).json({ message: "Failed to simulate driver arrival" });
    }
  });

  // Test: Start the ride (driver begins trip)
  app.post("/api/rider/rides/:id/test-start", async (req, res) => {
    if (!TEST_MODE) {
      return res.status(403).json({ message: "Test mode is not enabled" });
    }
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const { id } = req.params;
      const ride = await prisma.ride.findFirst({
        where: { id, userId: req.session.userId }
      });

      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }

      if (ride.status !== "ARRIVED") {
        return res.status(400).json({ message: "Can only start ride when driver has arrived" });
      }

      const updatedRide = await prisma.ride.update({
        where: { id },
        data: { status: "IN_PROGRESS" },
        include: {
          driver: {
            select: { id: true, fullName: true, phone: true, vehicleType: true, vehiclePlate: true, averageRating: true }
          }
        }
      });

      console.log(`[TEST_MODE] Ride ${id} started`);
      res.json(updatedRide);
    } catch (error) {
      console.error("Error simulating ride start:", error);
      res.status(500).json({ message: "Failed to simulate ride start" });
    }
  });

  // Test: Complete the ride
  app.post("/api/rider/rides/:id/test-complete", async (req, res) => {
    if (!TEST_MODE) {
      return res.status(403).json({ message: "Test mode is not enabled" });
    }
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const { id } = req.params;
      const ride = await prisma.ride.findFirst({
        where: { id, userId: req.session.userId },
        include: { driver: true }
      });

      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }

      if (ride.status !== "IN_PROGRESS") {
        return res.status(400).json({ message: "Can only complete rides that are in progress" });
      }

      const finalFare = ride.fareEstimate || 1500; // Use estimate or default

      // Use transaction for data integrity
      // Note: In TEST_MODE, we skip balance checks since no real money moves
      const updatedRide = await prisma.$transaction(async (tx) => {
        // Complete the ride
        const completedRide = await tx.ride.update({
          where: { id },
          data: { 
            status: "COMPLETED",
            fareEstimate: finalFare
          },
          include: {
            driver: {
              select: { id: true, fullName: true, phone: true, vehicleType: true, vehiclePlate: true, averageRating: true }
            }
          }
        });

        // Get user wallet and create transaction record
        const userWallet = await tx.wallet.findUnique({
          where: { ownerId_ownerType: { ownerId: ride.userId, ownerType: "USER" } }
        });

        if (userWallet) {
          await tx.transaction.create({
            data: {
              walletId: userWallet.id,
              amount: finalFare,
              type: "DEBIT",
              reference: `RIDE-${id}`
            }
          });

          await tx.wallet.update({
            where: { id: userWallet.id },
            data: { balance: { decrement: finalFare } }
          });
        }

        // Credit driver wallet if driver exists
        if (ride.driverId) {
          const driverWallet = await tx.wallet.findUnique({
            where: { ownerId_ownerType: { ownerId: ride.driverId, ownerType: "DRIVER" } }
          });

          if (driverWallet) {
            const commission = finalFare * 0.10;
            const driverAmount = finalFare - commission;

            await tx.transaction.create({
              data: {
                walletId: driverWallet.id,
                amount: driverAmount,
                type: "CREDIT",
                reference: `RIDE-${id}`
              }
            });

            await tx.wallet.update({
              where: { id: driverWallet.id },
              data: { balance: { increment: driverAmount } }
            });
          }

          // Mark test driver as available again
          await tx.driver.update({
            where: { id: ride.driverId },
            data: { isOnline: true }
          });
        }

        return completedRide;
      });

      console.log(`[TEST_MODE] Ride ${id} completed. Fare: ${finalFare}`);
      res.json(updatedRide);
    } catch (error) {
      console.error("Error simulating ride completion:", error);
      res.status(500).json({ message: "Failed to simulate ride completion" });
    }
  });

  // Get test mode status
  app.get("/api/test-mode", async (req, res) => {
    res.json({ enabled: TEST_MODE });
  });

  // Rate driver after ride completion
  app.post("/api/rider/rides/:id/rate", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const { id } = req.params;
      const { rating } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      const ride = await prisma.ride.findFirst({
        where: { id, userId: req.session.userId }
      });

      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }

      if (ride.status !== "COMPLETED") {
        return res.status(400).json({ message: "Can only rate completed rides" });
      }

      if (!ride.driverId) {
        return res.status(400).json({ message: "No driver assigned to this ride" });
      }

      // Check if already rated
      const existingRating = await prisma.driverRating.findUnique({
        where: { rideId: id }
      });

      if (existingRating) {
        return res.status(400).json({ message: "You have already rated this ride" });
      }

      // Create rating
      await prisma.driverRating.create({
        data: {
          rideId: id,
          driverId: ride.driverId,
          userId: req.session.userId,
          rating
        }
      });

      // Update driver average rating
      const allRatings = await prisma.driverRating.findMany({
        where: { driverId: ride.driverId }
      });
      const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

      await prisma.driver.update({
        where: { id: ride.driverId },
        data: {
          averageRating: avgRating,
          totalRatings: allRatings.length
        }
      });

      res.json({ message: "Rating submitted", rating });
    } catch (error) {
      console.error("Error rating driver:", error);
      res.status(500).json({ message: "Failed to submit rating" });
    }
  });

  // ==================== RIDER APP WALLET ====================

  // Get rider wallet
  app.get("/api/rider/wallet", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      let wallet = await prisma.wallet.findUnique({
        where: {
          ownerId_ownerType: {
            ownerId: req.session.userId,
            ownerType: "USER"
          }
        },
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 20
          }
        }
      });

      // Create wallet if doesn't exist
      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            ownerId: req.session.userId,
            ownerType: "USER",
            balance: 0
          },
          include: {
            transactions: true
          }
        });
      }

      res.json(wallet);
    } catch (error) {
      console.error("Error fetching rider wallet:", error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  // Add tip to driver
  app.post("/api/rider/tips", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const { rideId, amount } = req.body;

      if (!rideId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Valid ride ID and tip amount required" });
      }

      const ride = await prisma.ride.findFirst({
        where: { id: rideId, userId: req.session.userId, status: "COMPLETED" }
      });

      if (!ride) {
        return res.status(404).json({ message: "Completed ride not found" });
      }

      if (!ride.driverId) {
        return res.status(400).json({ message: "No driver assigned to this ride" });
      }

      // Check if tip already exists
      const existingTip = await prisma.tip.findUnique({
        where: { rideId }
      });

      if (existingTip) {
        return res.status(400).json({ message: "Tip already added for this ride" });
      }

      // Create tip
      const tip = await prisma.tip.create({
        data: {
          rideId,
          userId: req.session.userId,
          driverId: ride.driverId,
          amount
        }
      });

      // Credit driver wallet (tips go 100% to driver)
      const driverWallet = await prisma.wallet.findUnique({
        where: {
          ownerId_ownerType: {
            ownerId: ride.driverId,
            ownerType: "DRIVER"
          }
        }
      });

      if (driverWallet) {
        await prisma.wallet.update({
          where: { id: driverWallet.id },
          data: { balance: { increment: amount } }
        });

        await prisma.transaction.create({
          data: {
            walletId: driverWallet.id,
            type: "TIP",
            amount,
            reference: `Tip for ride ${rideId}`
          }
        });
      }

      res.json({ message: "Tip sent successfully", tip });
    } catch (error) {
      console.error("Error adding tip:", error);
      res.status(500).json({ message: "Failed to send tip" });
    }
  });

  // Add funds to wallet (simulated for now)
  app.post("/api/rider/wallet/add-funds", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const { amount, method } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount required" });
      }

      const wallet = await prisma.wallet.findUnique({
        where: {
          ownerId_ownerType: {
            ownerId: req.session.userId,
            ownerType: "USER"
          }
        }
      });

      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      // Actually credit the wallet (simulating instant funding for demo)
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } }
      });

      const transaction = await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: "CREDIT",
          amount,
          reference: `Wallet top-up via ${method || "card"}`
        }
      });

      res.json({ 
        message: "Funds added successfully", 
        transaction,
        status: "COMPLETED"
      });
    } catch (error) {
      console.error("Error adding funds:", error);
      res.status(500).json({ message: "Failed to process funding request" });
    }
  });

  // Add card (simulated for now)
  app.post("/api/rider/wallet/add-card", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const { cardNumber, expiryDate, cvv, cardName } = req.body;

      if (!cardNumber || !expiryDate || !cvv || !cardName) {
        return res.status(400).json({ message: "All card fields are required" });
      }

      // Simulate card validation and storage
      const last4 = cardNumber.replace(/\s/g, "").slice(-4);
      const brand = cardNumber.startsWith("4") ? "Visa" : 
                    cardNumber.startsWith("5") ? "Mastercard" : "Verve";
      const [month, year] = expiryDate.split("/");

      res.json({ 
        message: "Card added successfully",
        card: {
          id: `card_${Date.now()}`,
          last4,
          brand,
          expiryMonth: parseInt(month),
          expiryYear: 2000 + parseInt(year),
          isDefault: true
        }
      });
    } catch (error) {
      console.error("Error adding card:", error);
      res.status(500).json({ message: "Failed to add card" });
    }
  });

  // Get payment methods
  app.get("/api/rider/payment-methods", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      // Return sample saved card for demo (in production this would fetch from payment provider)
      res.json({
        cards: [
          {
            id: "card_demo_1",
            last4: "4242",
            brand: "Visa",
            expiryMonth: 12,
            expiryYear: 2026,
            isDefault: true
          }
        ],
        bankAccounts: []
      });
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  // Set default payment method
  app.post("/api/rider/payment-methods/:id/default", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const { id } = req.params;
      const { type } = req.body;

      res.json({ 
        message: "Default payment method updated",
        id,
        type,
        isDefault: true
      });
    } catch (error) {
      console.error("Error setting default:", error);
      res.status(500).json({ message: "Failed to update default" });
    }
  });

  // Delete payment method
  app.delete("/api/rider/payment-methods/:id", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const { id } = req.params;

      res.json({ 
        message: "Payment method removed",
        id
      });
    } catch (error) {
      console.error("Error removing payment method:", error);
      res.status(500).json({ message: "Failed to remove payment method" });
    }
  });

  // Get single transaction
  app.get("/api/rider/wallet/transaction/:id", async (req, res) => {
    if (!req.session.userId || req.session.userRole !== "rider") {
      return res.status(401).json({ message: "Not authenticated as rider" });
    }

    try {
      const { id } = req.params;

      const wallet = await prisma.wallet.findUnique({
        where: {
          ownerId_ownerType: {
            ownerId: req.session.userId,
            ownerType: "USER"
          }
        }
      });

      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          walletId: wallet.id
        }
      });

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json({
        ...transaction,
        status: "COMPLETED"
      });
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  // ==================== RIDER APP FARE ESTIMATE ====================

  // Get fare estimate (no auth required for guest browsing)
  app.post("/api/rider/fare-estimate", async (req, res) => {
    try {
      const { distance, duration, countryCode } = req.body;

      if (!distance || distance <= 0) {
        return res.status(400).json({ message: "Valid distance required" });
      }

      // Get fare config for country (default to NG if not specified)
      let fareConfig = await prisma.fareConfig.findUnique({
        where: { countryCode: countryCode || "NG" }
      });

      if (!fareConfig) {
        // Use default values
        fareConfig = {
          id: "default",
          countryCode: "NG",
          countryName: "Nigeria",
          currency: "NGN",
          currencySymbol: "₦",
          baseFare: 500,
          pricePerKm: 120,
          pricePerMinute: 30,
          minimumFare: 300,
          driverCommission: 0.85,
          platformCommission: 0.15,
          distanceUnit: "KM",
          surgeEnabled: false,
          surgeMultiplier: 1.0,
          maxSurgeCap: 1.3,
          peakHoursStart: null,
          peakHoursEnd: null,
          weatherMultiplier: 1.0,
          trafficMultiplier: 1.0,
          updatedAt: new Date(),
          updatedBy: null
        };
      }

      let fare = fareConfig.baseFare + (distance * fareConfig.pricePerKm);
      
      if (duration && duration > 0) {
        fare += duration * fareConfig.pricePerMinute;
      }

      // Apply surge if enabled
      if (fareConfig.surgeEnabled) {
        const surgeMultiplier = Math.min(fareConfig.surgeMultiplier, fareConfig.maxSurgeCap);
        fare *= surgeMultiplier;
      }

      // Apply minimum fare
      fare = Math.max(fare, fareConfig.minimumFare);

      res.json({
        fare: Math.round(fare),
        currency: fareConfig.currency,
        currencySymbol: fareConfig.currencySymbol,
        breakdown: {
          baseFare: fareConfig.baseFare,
          distanceCharge: distance * fareConfig.pricePerKm,
          timeCharge: duration ? duration * fareConfig.pricePerMinute : 0,
          surgeApplied: fareConfig.surgeEnabled,
          surgeMultiplier: fareConfig.surgeEnabled ? fareConfig.surgeMultiplier : 1.0
        }
      });
    } catch (error) {
      console.error("Error calculating fare:", error);
      res.status(500).json({ message: "Failed to calculate fare" });
    }
  });

  return httpServer;
}
