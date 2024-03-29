import { authorize } from "$lib/server/controller";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/db";

export const GET = (async ({ request, url }) => {
  const { userId, errResp } = await authorize(request);
  if (errResp) return errResp;

  // const query =
  //   "SELECT name, color FROM tasks WHERE user_id = $1 GROUP BY name, color ORDER BY COUNT(*)";
  // const result = await db.query(query, [user_id]);

  const result = await prisma.task.groupBy({
    by: ["name", "color"],
    where: {
      userId,
      startDate: {
        gte: Date.now() - 1000 * 60 * 60 * 24 * 7,
      },
    },
    orderBy: {
      _count: {
        name: "desc",
      },
    },
  });

  return new Response(JSON.stringify(result));
}) satisfies RequestHandler;
