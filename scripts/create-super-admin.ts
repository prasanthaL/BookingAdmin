import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "superadmin@booking.com";
  const password = "superpassword123";

  // Check if already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Super Admin already exists:", email);
    // Update the password hash just in case
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ 
      where: { email }, 
      data: { 
        passwordHash, 
        role: "SUPER_ADMIN",
        isActive: true 
      } 
    });
    console.log("Super Admin updated for:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: "System Super Admin",
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log("✅ Created Super Admin:", email);
  console.log("✅ Password:", password);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
