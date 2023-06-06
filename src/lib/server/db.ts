import pg from "pg";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
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

// const pool = new pg.Pool({
//   database: "visual_time",
// });

// export default pool;
