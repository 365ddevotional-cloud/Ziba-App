import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type NotificationTypeValue = 
  | "RIDE_REQUESTED"
  | "RIDE_ASSIGNED"
  | "DRIVER_ASSIGNED"
  | "TRIP_STARTED"
  | "TRIP_COMPLETED"
  | "RIDE_COMPLETED"
  | "PAYMENT_HELD"
  | "PAYMENT_RELEASED"
  | "PAYOUT_SENT"
  | "RATING_RECEIVED"
  | "REPORT_STATUS"
  | "WALLET_UPDATED"
  | "STATUS_CHANGE"
  | "ADMIN_ANNOUNCEMENT"
  | "SYSTEM";

interface NotificationData {
  userId: string;
  role: "rider" | "driver" | "admin";
  title: string;
  message: string;
  type: NotificationTypeValue;
  metadata?: Record<string, any>;
}

export async function createNotification(data: NotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        role: data.role,
        title: data.title,
        message: data.message,
        type: data.type as any,
        metadata: data.metadata || null,
      },
    });
    console.log(`[Notification] Created ${data.type} for ${data.role} ${data.userId}`);
    return notification;
  } catch (error) {
    console.error("[Notification] Failed to create notification:", error);
    return null;
  }
}

export async function notifyDriverAssigned(
  riderId: string,
  driverName: string,
  tripId: string,
  vehiclePlate: string
) {
  return createNotification({
    userId: riderId,
    role: "rider",
    title: "Driver Assigned",
    message: `${driverName} is on the way in vehicle ${vehiclePlate}`,
    type: "DRIVER_ASSIGNED",
    metadata: { tripId, driverName, vehiclePlate },
  });
}

export async function notifyTripStarted(
  riderId: string,
  driverId: string,
  tripId: string
) {
  await Promise.all([
    createNotification({
      userId: riderId,
      role: "rider",
      title: "Trip Started",
      message: "Your trip has begun. Enjoy your ride!",
      type: "TRIP_STARTED",
      metadata: { tripId },
    }),
    createNotification({
      userId: driverId,
      role: "driver",
      title: "Trip Started",
      message: "Trip is now in progress",
      type: "TRIP_STARTED",
      metadata: { tripId },
    }),
  ]);
}

export async function notifyTripCompleted(
  riderId: string,
  driverId: string,
  tripId: string,
  fare: number,
  currency: string
) {
  await Promise.all([
    createNotification({
      userId: riderId,
      role: "rider",
      title: "Trip Completed",
      message: `Your trip has been completed. Fare: ${currency}${fare.toFixed(2)}`,
      type: "TRIP_COMPLETED",
      metadata: { tripId, fare, currency },
    }),
    createNotification({
      userId: driverId,
      role: "driver",
      title: "Trip Completed",
      message: `Trip completed. Earnings: ${currency}${fare.toFixed(2)}`,
      type: "TRIP_COMPLETED",
      metadata: { tripId, fare, currency },
    }),
  ]);
}

export async function notifyPaymentHeld(
  driverId: string,
  tripId: string,
  amount: number,
  currency: string
) {
  return createNotification({
    userId: driverId,
    role: "driver",
    title: "Payment Held",
    message: `${currency}${amount.toFixed(2)} held for review`,
    type: "PAYMENT_HELD",
    metadata: { tripId, amount, currency },
  });
}

export async function notifyPaymentReleased(
  driverId: string,
  tripId: string,
  amount: number,
  currency: string
) {
  return createNotification({
    userId: driverId,
    role: "driver",
    title: "Payment Released",
    message: `${currency}${amount.toFixed(2)} has been added to your wallet`,
    type: "PAYMENT_RELEASED",
    metadata: { tripId, amount, currency },
  });
}

export async function notifyPayoutSent(
  driverId: string,
  amount: number,
  currency: string,
  payoutId: string
) {
  return createNotification({
    userId: driverId,
    role: "driver",
    title: "Payout Sent",
    message: `${currency}${amount.toFixed(2)} has been transferred to your bank account`,
    type: "PAYOUT_SENT",
    metadata: { payoutId, amount, currency },
  });
}

export async function notifyRatingReceived(
  userId: string,
  role: "rider" | "driver",
  rating: number,
  tripId: string
) {
  return createNotification({
    userId,
    role,
    title: "Rating Received",
    message: `You received a ${rating}-star rating`,
    type: "RATING_RECEIVED",
    metadata: { tripId, rating },
  });
}

export async function notifyReportStatus(
  userId: string,
  role: "rider" | "driver",
  status: string,
  reportId: string
) {
  const statusMessages: Record<string, string> = {
    REVIEWED: "Your report has been reviewed",
    ACTION_TAKEN: "Action has been taken on your report",
    DISMISSED: "Your report has been dismissed",
  };

  return createNotification({
    userId,
    role,
    title: "Report Update",
    message: statusMessages[status] || `Report status: ${status}`,
    type: "REPORT_STATUS",
    metadata: { reportId, status },
  });
}

export async function sendAdminAnnouncement(
  title: string,
  message: string,
  targetAudience: "all" | "riders" | "drivers",
  adminId: string
) {
  const notifications: NotificationData[] = [];

  if (targetAudience === "all" || targetAudience === "riders") {
    const riders = await prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });
    riders.forEach((rider) => {
      notifications.push({
        userId: rider.id,
        role: "rider",
        title,
        message,
        type: "ADMIN_ANNOUNCEMENT",
        metadata: { adminId, targetAudience },
      });
    });
  }

  if (targetAudience === "all" || targetAudience === "drivers") {
    const drivers = await prisma.driver.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });
    drivers.forEach((driver) => {
      notifications.push({
        userId: driver.id,
        role: "driver",
        title,
        message,
        type: "ADMIN_ANNOUNCEMENT",
        metadata: { adminId, targetAudience },
      });
    });
  }

  const results = await Promise.all(
    notifications.map((n) => createNotification(n))
  );

  console.log(`[Notification] Admin announcement sent to ${results.length} users`);
  return { count: results.filter(Boolean).length };
}

export async function notifyWalletUpdate(
  userId: string,
  role: "rider" | "driver",
  type: "credit" | "debit",
  amount: number,
  currency: string,
  description?: string
) {
  const action = type === "credit" ? "added to" : "deducted from";
  return createNotification({
    userId,
    role,
    title: "Wallet Updated",
    message: description || `${currency}${amount.toFixed(2)} ${action} your wallet`,
    type: "WALLET_UPDATED",
    metadata: { amount, currency, transactionType: type },
  });
}

export async function notifyStatusChange(
  userId: string,
  role: "rider" | "driver",
  newStatus: string,
  reason?: string
) {
  const statusMessages: Record<string, string> = {
    ACTIVE: "Your account has been activated",
    SUSPENDED: "Your account has been suspended",
    APPROVED: "Your application has been approved",
    REJECTED: "Your application has been rejected",
  };

  return createNotification({
    userId,
    role,
    title: "Account Status Update",
    message: reason || statusMessages[newStatus] || `Status changed to ${newStatus}`,
    type: "STATUS_CHANGE",
    metadata: { newStatus, reason },
  });
}
