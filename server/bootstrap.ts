import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export async function bootstrapFounderAdmin(): Promise<void> {
  // Only run in development mode
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  try {
    // Check if founder admin exists, if not create it
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: "founder@ziba.app" },
    });

    if (!existingAdmin) {
      // Password: Ziba-admin-2013
      const hashedPassword = await bcrypt.hash("Ziba-admin-2013", 10);
      
      await prisma.admin.create({
        data: {
          email: "founder@ziba.app",
          passwordHash: hashedPassword,
        },
      });
      
      console.log("[BOOTSTRAP] Created founder admin: founder@ziba.app (password: Ziba-admin-2013)");
    } else {
      // Update password if it exists but might be wrong (dev mode only)
      const testHash = await bcrypt.hash("Ziba-admin-2013", 10);
      const isValid = await bcrypt.compare("Ziba-admin-2013", existingAdmin.passwordHash || "");
      
      if (!isValid) {
        await prisma.admin.update({
          where: { email: "founder@ziba.app" },
          data: { passwordHash: testHash },
        });
        console.log("[BOOTSTRAP] Updated founder admin password: founder@ziba.app");
      } else {
        console.log("[BOOTSTRAP] Founder admin already exists: founder@ziba.app");
      }
    }
  } catch (error) {
    console.error("[BOOTSTRAP] Error during admin bootstrap:", error);
    // Don't throw - allow server to start even if bootstrap fails
  }
}
