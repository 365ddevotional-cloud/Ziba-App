import { PrismaClient, OwnerType, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

const PLATFORM_WALLET_ID = "PLATFORM";

export interface WalletOperationResult {
  success: boolean;
  walletId?: string;
  newBalance?: number;
  newLockedBalance?: number;
  transactionId?: string;
  error?: string;
}

export async function ensurePlatformWallet(): Promise<string> {
  const existing = await prisma.wallet.findFirst({
    where: { ownerType: "PLATFORM" },
  });

  if (existing) {
    return existing.id;
  }

  const wallet = await prisma.wallet.create({
    data: {
      ownerId: PLATFORM_WALLET_ID,
      ownerType: "PLATFORM",
      balance: 0,
      lockedBalance: 0,
      currency: "NGN",
    },
  });

  console.log("[WalletService] Platform wallet created:", wallet.id);
  return wallet.id;
}

export async function getOrCreateWallet(
  ownerId: string,
  ownerType: OwnerType
): Promise<string> {
  if (ownerType === "PLATFORM") {
    return ensurePlatformWallet();
  }

  const existing = await prisma.wallet.findUnique({
    where: { ownerId_ownerType: { ownerId, ownerType } },
  });

  if (existing) {
    return existing.id;
  }

  const wallet = await prisma.wallet.create({
    data: {
      ownerId,
      ownerType,
      balance: 0,
      lockedBalance: 0,
      currency: "NGN",
    },
  });

  console.log(`[WalletService] Created ${ownerType} wallet for ${ownerId}`);
  return wallet.id;
}

export async function getWallet(walletId: string) {
  return prisma.wallet.findUnique({
    where: { id: walletId },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
}

export async function getWalletByOwner(ownerId: string, ownerType: OwnerType) {
  return prisma.wallet.findUnique({
    where: { ownerId_ownerType: { ownerId, ownerType } },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
}

export async function credit(
  walletId: string,
  amount: number,
  reference: string,
  description?: string,
  tripId?: string
): Promise<WalletOperationResult> {
  if (amount <= 0) {
    return { success: false, error: "Amount must be positive" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      const existingTx = await tx.walletTransaction.findFirst({
        where: { reference },
      });
      if (existingTx) {
        throw new Error("Duplicate transaction reference");
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: { balance: { increment: amount } },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId,
          tripId,
          type: "CREDIT",
          amount,
          description: description || "Credit",
          reference,
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    console.log(
      `[WalletService] CREDIT ${amount} to wallet ${walletId}, ref: ${reference}`
    );

    return {
      success: true,
      walletId,
      newBalance: result.wallet.balance,
      newLockedBalance: result.wallet.lockedBalance,
      transactionId: result.transaction.id,
    };
  } catch (error: any) {
    console.error("[WalletService] Credit failed:", error.message);
    return { success: false, error: error.message };
  }
}

export async function debit(
  walletId: string,
  amount: number,
  reference: string,
  description?: string,
  tripId?: string
): Promise<WalletOperationResult> {
  if (amount <= 0) {
    return { success: false, error: "Amount must be positive" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      if (wallet.balance < amount) {
        throw new Error(
          `Insufficient balance. Available: ${wallet.balance}, Required: ${amount}`
        );
      }

      const existingTx = await tx.walletTransaction.findFirst({
        where: { reference },
      });
      if (existingTx) {
        throw new Error("Duplicate transaction reference");
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: { balance: { decrement: amount } },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId,
          tripId,
          type: "DEBIT",
          amount,
          description: description || "Debit",
          reference,
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    console.log(
      `[WalletService] DEBIT ${amount} from wallet ${walletId}, ref: ${reference}`
    );

    return {
      success: true,
      walletId,
      newBalance: result.wallet.balance,
      newLockedBalance: result.wallet.lockedBalance,
      transactionId: result.transaction.id,
    };
  } catch (error: any) {
    console.error("[WalletService] Debit failed:", error.message);
    return { success: false, error: error.message };
  }
}

export async function hold(
  walletId: string,
  amount: number,
  reference: string,
  description?: string,
  tripId?: string
): Promise<WalletOperationResult> {
  if (amount <= 0) {
    return { success: false, error: "Amount must be positive" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      if (wallet.balance < amount) {
        throw new Error(
          `Insufficient balance to hold. Available: ${wallet.balance}, Required: ${amount}`
        );
      }

      const existingTx = await tx.walletTransaction.findFirst({
        where: { reference },
      });
      if (existingTx) {
        throw new Error("Duplicate transaction reference");
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: { decrement: amount },
          lockedBalance: { increment: amount },
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId,
          tripId,
          type: "HOLD",
          amount,
          description: description || "Funds held for trip",
          reference,
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    console.log(
      `[WalletService] HOLD ${amount} in wallet ${walletId}, tripId: ${tripId}, ref: ${reference}`
    );

    return {
      success: true,
      walletId,
      newBalance: result.wallet.balance,
      newLockedBalance: result.wallet.lockedBalance,
      transactionId: result.transaction.id,
    };
  } catch (error: any) {
    console.error("[WalletService] Hold failed:", error.message);
    return { success: false, error: error.message };
  }
}

export async function release(
  walletId: string,
  amount: number,
  reference: string,
  description?: string,
  tripId?: string
): Promise<WalletOperationResult> {
  if (amount <= 0) {
    return { success: false, error: "Amount must be positive" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      if (wallet.lockedBalance < amount) {
        throw new Error(
          `Insufficient locked balance to release. Locked: ${wallet.lockedBalance}, Required: ${amount}`
        );
      }

      const existingTx = await tx.walletTransaction.findFirst({
        where: { reference },
      });
      if (existingTx) {
        throw new Error("Duplicate transaction reference");
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: {
          lockedBalance: { decrement: amount },
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId,
          tripId,
          type: "RELEASE",
          amount,
          description: description || "Funds released after settlement",
          reference,
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    console.log(
      `[WalletService] RELEASE ${amount} from wallet ${walletId}, tripId: ${tripId}, ref: ${reference}`
    );

    return {
      success: true,
      walletId,
      newBalance: result.wallet.balance,
      newLockedBalance: result.wallet.lockedBalance,
      transactionId: result.transaction.id,
    };
  } catch (error: any) {
    console.error("[WalletService] Release failed:", error.message);
    return { success: false, error: error.message };
  }
}

export interface SettlementResult {
  success: boolean;
  tripId: string;
  riderWalletId?: string;
  driverWalletId?: string;
  platformWalletId?: string;
  driverPayout?: number;
  platformFee?: number;
  error?: string;
}

export async function settleTrip(tripId: string): Promise<SettlementResult> {
  console.log(`[WalletService] Starting settlement for trip ${tripId}`);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const trip = await tx.ride.findUnique({
        where: { id: tripId },
        include: { user: true, driver: true },
      });

      if (!trip) {
        throw new Error("Trip not found");
      }

      if (trip.status !== "COMPLETED") {
        throw new Error(
          `Trip must be COMPLETED to settle. Current status: ${trip.status}`
        );
      }

      if (trip.settledAt) {
        throw new Error("Trip already settled");
      }

      const lockedFare = trip.lockedFare;
      if (!lockedFare || lockedFare <= 0) {
        throw new Error("Trip has no locked fare");
      }

      if (!trip.driverId || !trip.driver) {
        throw new Error("Trip has no assigned driver");
      }

      const config = await tx.platformConfig.findFirst();
      const commissionRate = config?.commissionRate || 0.15;

      const platformFee = Math.round(lockedFare * commissionRate * 100) / 100;
      const driverPayout =
        Math.round((lockedFare - platformFee) * 100) / 100;

      const riderWallet = await tx.wallet.findUnique({
        where: { ownerId_ownerType: { ownerId: trip.userId, ownerType: "USER" } },
      });

      if (!riderWallet) {
        throw new Error("Rider wallet not found");
      }

      if (riderWallet.lockedBalance < lockedFare) {
        throw new Error(
          `Rider locked balance insufficient. Locked: ${riderWallet.lockedBalance}, Required: ${lockedFare}`
        );
      }

      let driverWallet = await tx.wallet.findUnique({
        where: {
          ownerId_ownerType: { ownerId: trip.driverId, ownerType: "DRIVER" },
        },
      });

      if (!driverWallet) {
        driverWallet = await tx.wallet.create({
          data: {
            ownerId: trip.driverId,
            ownerType: "DRIVER",
            balance: 0,
            lockedBalance: 0,
            currency: "NGN",
          },
        });
      }

      let platformWallet = await tx.wallet.findFirst({
        where: { ownerType: "PLATFORM" },
      });

      if (!platformWallet) {
        platformWallet = await tx.wallet.create({
          data: {
            ownerId: PLATFORM_WALLET_ID,
            ownerType: "PLATFORM",
            balance: 0,
            lockedBalance: 0,
            currency: "NGN",
          },
        });
      }

      const timestamp = Date.now();

      await tx.wallet.update({
        where: { id: riderWallet.id },
        data: { lockedBalance: { decrement: lockedFare } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: riderWallet.id,
          tripId,
          type: "RELEASE",
          amount: lockedFare,
          description: `Trip ${tripId} settled - funds released`,
          reference: `SETTLE-RELEASE-${tripId}-${timestamp}`,
        },
      });

      await tx.wallet.update({
        where: { id: driverWallet.id },
        data: { balance: { increment: driverPayout } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: driverWallet.id,
          tripId,
          type: "CREDIT",
          amount: driverPayout,
          description: `Trip ${tripId} payout (${(1 - commissionRate) * 100}%)`,
          reference: `SETTLE-DRIVER-${tripId}-${timestamp}`,
        },
      });

      await tx.wallet.update({
        where: { id: platformWallet.id },
        data: { balance: { increment: platformFee } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: platformWallet.id,
          tripId,
          type: "COMMISSION",
          amount: platformFee,
          description: `Trip ${tripId} commission (${commissionRate * 100}%)`,
          reference: `SETTLE-PLATFORM-${tripId}-${timestamp}`,
        },
      });

      const statusHistory = Array.isArray(trip.statusHistory)
        ? trip.statusHistory
        : [];

      await tx.ride.update({
        where: { id: tripId },
        data: {
          status: "SETTLED",
          settledAt: new Date(),
          platformCommissionRate: commissionRate,
          platformCommissionAmount: platformFee,
          driverPayoutAmount: driverPayout,
          statusHistory: [
            ...statusHistory,
            {
              status: "SETTLED",
              timestamp: new Date().toISOString(),
              actor: "SYSTEM",
            },
          ],
        },
      });

      return {
        tripId,
        riderWalletId: riderWallet.id,
        driverWalletId: driverWallet.id,
        platformWalletId: platformWallet.id,
        driverPayout,
        platformFee,
        commissionRate,
      };
    });

    console.log(
      `[WalletService] Trip ${tripId} settled successfully:`,
      `Driver: ${result.driverPayout}, Platform: ${result.platformFee}`
    );

    return {
      success: true,
      tripId: result.tripId,
      riderWalletId: result.riderWalletId,
      driverWalletId: result.driverWalletId,
      platformWalletId: result.platformWalletId,
      driverPayout: result.driverPayout,
      platformFee: result.platformFee,
    };
  } catch (error: any) {
    console.error(`[WalletService] Settlement failed for trip ${tripId}:`, error.message);
    return {
      success: false,
      tripId,
      error: error.message,
    };
  }
}

export async function holdFareForTrip(
  tripId: string,
  riderUserId: string,
  fare: number
): Promise<WalletOperationResult> {
  const walletId = await getOrCreateWallet(riderUserId, "USER");
  const reference = `HOLD-TRIP-${tripId}-${Date.now()}`;
  
  return hold(
    walletId,
    fare,
    reference,
    `Fare held for trip ${tripId}`,
    tripId
  );
}
