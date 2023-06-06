import { authorize } from "$lib/server/controller";
import prisma from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const GET = (async ({ request, url }) => {
  const { userId, errResp } = await authorize(request);
  if (errResp) return errResp;

  //   const query = `SELECT user_id as "userId", id, name, color, start_date as "startDate", end_date as "endDate", active
  // FROM tasks
  // WHERE user_id = $1
  // AND active = true`;
  //   const result = await db.query(query, [user_id]);

  const result = prisma.task.findFirst({
    where: {
      userId,
      active: true,
    },
  });

  return new Response(JSON.stringify(result ?? null));
}) satisfies RequestHandler;
