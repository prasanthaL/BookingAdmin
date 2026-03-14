const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const payments = await prisma.payment.findMany({
    include: { booking: true }
  });
  console.log('Payments count:', payments.length);
  console.log('Payments:', JSON.stringify(payments, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
