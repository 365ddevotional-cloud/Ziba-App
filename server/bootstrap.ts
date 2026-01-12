import { prisma } from "./prisma";
import { hashPassword, verifyPassword } from "./auth";
import { log } from "./index";

const FOUNDER_EMAIL = "founder@ziba.app";
const FOUNDER_PASSWORD = "Ziba-admin-2013";

export async function bootstrapFounderAdmin(): Promise<void> {
  try {
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: FOUNDER_EMAIL },
    });

    if (existingAdmin) {
      if (existingAdmin.passwordHash) {
        const isAlreadySet = await verifyPassword(FOUNDER_PASSWORD, existingAdmin.passwordHash);
        if (isAlreadySet) {
          return;
        }
      }
      
      const passwordHash = await hashPassword(FOUNDER_PASSWORD);
      await prisma.admin.update({
        where: { email: FOUNDER_EMAIL },
        data: { passwordHash },
      });
      log("[ADMIN RESET] Admin password initialized", "bootstrap");
      return;
    }

    const passwordHash = await hashPassword(FOUNDER_PASSWORD);
    await prisma.admin.create({
      data: {
        email: FOUNDER_EMAIL,
        passwordHash,
      },
    });
    log("[ADMIN RESET] Admin password initialized", "bootstrap");
  } catch (error) {
    log(`Bootstrap error: ${error}`, "bootstrap");
  }
}
