import { prisma } from "./prisma";
import { hashPassword } from "./auth";
import { log } from "./index";

const FOUNDER_EMAIL = "founder@ziba.app";

export async function bootstrapFounderAdmin(): Promise<void> {
  try {
    const existingAdminCount = await prisma.admin.count();
    
    if (existingAdminCount > 0) {
      log("Admin account(s) already exist. Skipping bootstrap.", "bootstrap");
      return;
    }

    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD;
    if (!defaultPassword) {
      log("No ADMIN_DEFAULT_PASSWORD set. Skipping founder admin creation.", "bootstrap");
      return;
    }

    const passwordHash = await hashPassword(defaultPassword);
    
    await prisma.admin.create({
      data: {
        email: FOUNDER_EMAIL,
        passwordHash,
      },
    });

    log(`Founder admin created: ${FOUNDER_EMAIL}`, "bootstrap");
    log("IMPORTANT: Change the default password immediately after first login!", "bootstrap");
  } catch (error) {
    log(`Bootstrap error: ${error}`, "bootstrap");
  }
}
