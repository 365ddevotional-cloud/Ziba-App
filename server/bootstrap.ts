import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export async function bootstrapFounderAdmin(): Promise<void> {
  try {
    const adminCount = await prisma.admin.count();
    
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash("admin-ziba-2013", 10);
      
      await prisma.admin.create({
        data: {
          email: "founder@ziba.app",
          passwordHash: hashedPassword,
        },
      });
      
      console.log("[BOOTSTRAP] Created founder admin: founder@ziba.app");
    }
  } catch (error) {
    console.error("[BOOTSTRAP] Error during admin bootstrap:", error);
  }
}
