import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"],
});

async function main() {
  const tasks = await prisma.task.findMany({
    where: {
      userId: "5JZAz4dyS3NQsjZ49HSYMDqCMSo1",
      OR: [
        {
          name: "time tracker",
        },
        {
          name: "time tracker 2",
        },
      ],
    },
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
