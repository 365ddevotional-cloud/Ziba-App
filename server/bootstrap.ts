import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "founder@ziba.app";
const ADMIN_PASSWORD = "Ziba-admin-2013";

/**
 * Deterministic admin seed for DEV MODE ONLY
 * Ensures founder@ziba.app always exists with known credentials on server start
 * 
 * GUARANTEES:
 * - Runs ONLY in NODE_ENV=development
 * - Creates admin if missing
 * - Uses bcrypt.hash(password, 10) matching login verification
 * - Logs execution status clearly
 */
export async function seedDevAdmin(): Promise<void> {
  // GUARD: Never run in production
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  try {
    // STEP 2: FORCE RESET credentials in DEV (always reset, never skip)
    // Hash password using bcrypt (saltRounds = 10, same as login verification)
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const hashPreview = hashedPassword.substring(0, 8) + "...";

    // Use upsert to always ensure admin exists with correct credentials
    const admin = await prisma.admin.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        passwordHash: hashedPassword, // FORCE RESET password in DEV
      },
      create: {
        email: ADMIN_EMAIL,
        passwordHash: hashedPassword,
      },
    });

    // Log credentials with hash preview (DEV ONLY)
    console.log("[DEV ADMIN SEEDED]");
    console.log(`email=${ADMIN_EMAIL}`);
    console.log(`password=${ADMIN_PASSWORD}`);
    console.log(`hash=${hashPreview}`);
  } catch (error) {
    // In DEV, we want to know if seed fails
    console.error("[BOOTSTRAP] CRITICAL: Admin seed failed in DEV mode:", error);
    // Don't throw - allow server to start, but log clearly
  }
}

/**
 * Verify admin login after seeding (DEV ONLY)
 */
export async function verifyDevAdminLogin(): Promise<boolean> {
  if (process.env.NODE_ENV !== "development") {
    return false;
  }

  try {
    const testPassword = ADMIN_PASSWORD;
    const admin = await prisma.admin.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (!admin || !admin.passwordHash) {
      console.error("[VERIFY] Admin not found or password missing");
      return false;
    }

    const bcrypt = await import("bcryptjs");
    const isValid = await bcrypt.compare(testPassword, admin.passwordHash);

    if (isValid) {
      console.log("[DEV ADMIN LOGIN VERIFIED ✅]");
      return true;
    } else {
      console.error("[VERIFY] Password mismatch!");
      return false;
    }
  } catch (error) {
    console.error("[VERIFY] Login verification failed:", error);
    return false;
  }
}

// Legacy export for backwards compatibility
export const bootstrapFounderAdmin = seedDevAdmin;
