import Prisma from "@prisma/client";

const prisma = new Prisma.PrismaClient({
  // log: [
  //   {
  //     emit: "event",
  //     level: "query",
  //   },
  // ],
});

// prisma.$on("query", (e) => {
//   console.log(`${e.query} ${e.params}`);
// });

export default prisma;
