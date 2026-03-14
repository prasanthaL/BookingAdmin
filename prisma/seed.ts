import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  // 1. Create Super Admin
  await prisma.user.upsert({
    where: { email: "admin@hotel.com" },
    update: { passwordHash },
    create: {
      email: "admin@hotel.com",
      name: "Global Admin",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  // 2. Create Demo Business
  const demoBusiness = await prisma.business.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Guest House",
      slug: "demo",
      contactEmail: "demo@hotel.com",
      isActive: true,
      accessStatus: "ACTIVE",
      plan: "PROFESSIONAL",
      trialStartsAt: new Date(),
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      users: {
        create: {
          email: "demo@hotel.com",
          name: "Demo Manager",
          passwordHash,
          role: "ADMIN",
          isActive: true,
        },
      },
    },
  });

  const businessId = demoBusiness.id;

  // 3. Create Room Types
  const deluxe = await prisma.roomType.create({
    data: {
      businessId,
      name: "Deluxe Room",
      capacity: 2,
      basePrice: 15000,
      description: "Premium double room with balcony",
    },
  });

  const family = await prisma.roomType.create({
    data: {
      businessId,
      name: "Family Suite",
      capacity: 4,
      basePrice: 24000,
      description: "Large suite for families",
    },
  });

  // 4. Create Rooms
  await prisma.room.createMany({
    data: [
      { businessId, roomTypeId: deluxe.id, roomNumber: "101" },
      { businessId, roomTypeId: deluxe.id, roomNumber: "102" },
      { businessId, roomTypeId: family.id, roomNumber: "201" },
    ],
  });

  // 5. Create Guests
  await prisma.guest.createMany({
    data: [
      { businessId, fullName: "Kasun Perera", phone: "+94 77 111 1111", email: "kasun@example.com" },
      { businessId, fullName: "Nadee Silva", phone: "+94 77 222 2222", email: "nadee@example.com" },
    ],
  });

  // 6. Create Addons
  await prisma.addon.createMany({
    data: [
      { businessId, name: "Breakfast", category: "Food", priceType: "PER_DAY", unitPrice: 2500 },
      { businessId, name: "Airport Pickup", category: "Transport", priceType: "PER_BOOKING", unitPrice: 8000 },
      { businessId, name: "Extra Bed", category: "Room Service", priceType: "PER_NIGHT", unitPrice: 4000 },
    ],
  });

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
