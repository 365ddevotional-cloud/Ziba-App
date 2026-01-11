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
      if (currentUser.role !== "admin") {
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
        prisma.ride.count({ where: { status: "ACCEPTED" } }),
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
      if (currentUser.role !== "admin" && currentUser.role !== "director") {
        return res.status(403).json({ message: "Access denied" });
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
    res.json(user);
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, role } = req.body;
      if (!email || !role) {
        return res.status(400).json({ message: "Email and role are required" });
      }

      let account: any = null;
      let needsPasswordSetup = false;

      if (role === "user") {
        account = await prisma.user.findUnique({ where: { email } });
      } else if (role === "director") {
        account = await prisma.director.findUnique({ where: { email } });
      } else if (role === "admin") {
        account = await prisma.admin.findUnique({ where: { email } });
      } else {
        return res.status(400).json({ message: "Invalid role" });
      }

      if (!account) {
        return res.status(401).json({ message: "Account not found" });
      }

      if (!account.passwordHash) {
        needsPasswordSetup = true;
        req.session.userId = account.id;
        req.session.userRole = role as UserRole;
        req.session.userEmail = account.email;
        req.session.needsPasswordSetup = true;
        return res.json({ 
          needsPasswordSetup: true, 
          message: "Password setup required",
          user: { id: account.id, email: account.email, role }
        });
      }

      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      const isValid = await verifyPassword(password, account.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      req.session.userId = account.id;
      req.session.userRole = role as UserRole;
      req.session.userEmail = account.email;
      req.session.needsPasswordSetup = false;

      res.json({ 
        message: "Login successful",
        user: { 
          id: account.id, 
          email: account.email, 
          role,
          fullName: account.fullName
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/setup-password", async (req, res) => {
    try {
      const { password } = req.body;
      if (!req.session.userId || !req.session.needsPasswordSetup) {
        return res.status(401).json({ message: "Unauthorized or no password setup required" });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const hash = await hashPassword(password);
      const role = req.session.userRole;

      if (role === "user") {
        await prisma.user.update({ 
          where: { id: req.session.userId }, 
          data: { passwordHash: hash } 
        });
      } else if (role === "director") {
        await prisma.director.update({ 
          where: { id: req.session.userId }, 
          data: { passwordHash: hash } 
        });
      } else if (role === "admin") {
        await prisma.admin.update({ 
          where: { id: req.session.userId }, 
          data: { passwordHash: hash } 
        });
      }

      req.session.needsPasswordSetup = false;
      res.json({ message: "Password set successfully" });
    } catch (error) {
      console.error("Password setup error:", error);
      res.status(500).json({ message: "Failed to set password" });
    }
  });

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
          status: "ACCEPTED"
        },
        include: { user: true, driver: true },
      });

      res.json(updatedRide);
    } catch (error) {
      console.error("Error assigning ride:", error);
      res.status(500).json({ message: "Failed to assign ride" });
    }
  });

  // Start ride (ACCEPTED → IN_PROGRESS)
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

      if (ride.status !== "ACCEPTED") {
        return res.status(400).json({ message: `Cannot start ride. Status is ${ride.status}, expected ACCEPTED` });
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
      const currentUser = getCurrentUser(req);

      const ride = await prisma.ride.findUnique({ 
        where: { id },
        include: { driver: true }
      });
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }

      if (ride.status !== "IN_PROGRESS") {
        return res.status(400).json({ message: `Cannot complete ride. Status is ${ride.status}, expected IN_PROGRESS` });
      }

      const updatedRide = await prisma.ride.update({
        where: { id },
        data: { status: "COMPLETED" },
        include: { user: true, driver: true, payment: true },
      });

      // Auto-create payment if fare estimate exists and no payment exists
      if (updatedRide.fareEstimate && !updatedRide.payment) {
        await prisma.payment.create({
          data: {
            amount: updatedRide.fareEstimate,
            status: "PENDING",
            rideId: id,
          },
        });
      }

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

  return httpServer;
}
