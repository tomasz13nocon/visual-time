import { authorize } from "$lib/server/controller";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/db";

export const GET = (async ({ request, url }) => {
  const { userId, errResp } = await authorize(request);
  if (errResp) return errResp;

  const result = await prisma.tag.groupBy({
    by: ["name"],
    where: {
      userId,
    },
    orderBy: {
      _count: {
        name: "desc",
      },
    },
  });

  return new Response(JSON.stringify(result));
}) satisfies RequestHandler;
