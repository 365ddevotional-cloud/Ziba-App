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
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (!existingAdmin) {
      // Admin does NOT exist - create it
      // Hash password using bcrypt (saltRounds = 10, same as login verification)
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

      await prisma.admin.create({
        data: {
          email: ADMIN_EMAIL,
          passwordHash: hashedPassword,
        },
      });

      // Log credentials ONCE when seeding (dev only)
      console.log("✅ DEV ADMIN SEEDED");
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
    } else {
      // Admin EXISTS - verify password hash exists
      if (!existingAdmin.passwordHash) {
        // Fix if password is missing
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await prisma.admin.update({
          where: { email: ADMIN_EMAIL },
          data: { passwordHash: hashedPassword },
        });
        console.log("✅ DEV ADMIN SEEDED (password restored)");
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Password: ${ADMIN_PASSWORD}`);
      } else {
        console.log("ℹ️ DEV ADMIN ALREADY EXISTS");
      }
    }
  } catch (error) {
    // In DEV, we want to know if seed fails
    console.error("[BOOTSTRAP] CRITICAL: Admin seed failed in DEV mode:", error);
    // Don't throw - allow server to start, but log clearly
  }
}

// Legacy export for backwards compatibility
export const bootstrapFounderAdmin = seedDevAdmin;
