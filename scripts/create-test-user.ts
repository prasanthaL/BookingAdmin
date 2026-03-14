import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@test.com";
  const password = "password123";

  // Check if already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("User already exists:", email);
    // Update the password hash just in case
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { email }, data: { passwordHash, isActive: true } });
    console.log("Password updated for:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();
  const trialEndsAt = new Date(now);
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const business = await prisma.business.create({
    data: {
      name: "Test Hotel",
      slug: "test-hotel-" + Date.now(),
      contactEmail: email,
      contactPhone: "1234567890",
      plan: "STARTER",
      trialStartsAt: now,
      trialEndsAt,
      accessStatus: "TRIAL",
      isActive: true,
      users: {
        create: {
          name: "Test Admin",
          email,
          passwordHash,
          role: "ADMIN",
          isActive: true,
        },
      },
    },
    include: { users: true },
  });

  console.log("✅ Created business:", business.name);
  console.log("✅ Created user:", email, "/ password:", password);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
