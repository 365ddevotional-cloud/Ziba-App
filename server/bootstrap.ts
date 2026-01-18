import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export async function bootstrapFounderAdmin(): Promise<void> {
  // Only run in development mode
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  try {
    const ADMIN_EMAIL = "founder@ziba.app";
    const ADMIN_PASSWORD = "Ziba-admin-2013";
    
    // Hash password using same method as login (bcrypt, 10 rounds)
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    // Use upsert to ensure admin exists with correct password (dev mode only)
    // This will create if not exists, or update password if exists
    const admin = await prisma.admin.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        passwordHash: hashedPassword, // Always ensure correct password in dev mode
      },
      create: {
        email: ADMIN_EMAIL,
        passwordHash: hashedPassword,
      },
    });

    // Verify the password hash works by testing it
    const passwordIsValid = await bcrypt.compare(ADMIN_PASSWORD, admin.passwordHash);
    
    if (passwordIsValid) {
      console.log("[BOOTSTRAP] DEV: Admin user seeded or verified");
      console.log(`[BOOTSTRAP] Email: ${ADMIN_EMAIL}`);
      console.log(`[BOOTSTRAP] Password verification: SUCCESS`);
    } else {
      console.error("[BOOTSTRAP] WARNING: Password verification failed after upsert!");
    }
  } catch (error) {
    console.error("[BOOTSTRAP] Error during admin bootstrap:", error);
    // Don't throw - allow server to start even if bootstrap fails
  }
}
