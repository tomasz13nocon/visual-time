import { authorize } from "$lib/server/controller";
import prisma from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const GET = (async ({ request, url }) => {
  const { userId, errResp } = await authorize(request);
  if (errResp) return errResp;

  let from: string | number | null = url.searchParams.get("from");
  let to: string | number | null = url.searchParams.get("to");
  // const includeActive = url.searchParams.get("includeActive") === "true";
  if (!from || !to || isNaN(parseInt(from)) || isNaN(parseInt(to))) {
    return new Response("'from' and 'to' params required and need to be numbers", { status: 400 });
  }
  from = parseInt(from) + 1; // +1 to exclude entries ending at midnight
  to = parseInt(to);

  //   const query = `SELECT user_id as "userId", id, name, color, start_date as "startDate", end_date as "endDate", active
  // FROM tasks
  // WHERE user_id = $1
  // AND (
  //   end_date >= $2
  //   AND start_date <= $3
  //   OR
  //   active = true
  //   AND $4 >= $2
  //   AND start_date <= $3
  // )
  // ORDER BY start_date DESC`;
  // const result = await db.query(query, [user_id, from, to, Date.now()]);

  const result = await prisma.task.findMany({
    where: {
      userId,
      OR: [
        {
          AND: [
            {
              endDate: {
                gte: from,
              },
              startDate: {
                lte: to,
              },
            },
          ],
        },
        Date.now() < from
          ? {}
          : {
            AND: [
              {
                active: true,
              },
              {
                startDate: {
                  lte: to,
                },
              },
            ],
          },
      ],
    },
    orderBy: {
      startDate: "desc",
    },
    include: {
      tags: true,
    },
  });

  return new Response(JSON.stringify(result));
}) satisfies RequestHandler;

class MissingRequiredFieldError extends Error { }

export const POST = (async ({ request, url }) => {
  const { userId, errResp } = await authorize(request);
  if (errResp) return errResp;

  const body = await request.json();
  const { name, color, startDate, endDate, active, tags } = body;
  if (
    name === undefined ||
    color === undefined ||
    startDate === undefined ||
    endDate === undefined ||
    active === undefined ||
    isNaN(parseInt(startDate)) ||
    isNaN(parseInt(endDate))
  ) {
    return new Response("Missing required fields", { status: 400 });
  }

  let newTags;
  if (tags && Array.isArray(tags) && tags.length > 0) {
    try {
      newTags = tags.map((tag: any) => {
        if (!tag.name) throw new MissingRequiredFieldError();
        return { name: tag.name, userId };
      });
    } catch (e) {
      if (e instanceof MissingRequiredFieldError) {
        return new Response("Missing required fields", { status: 400 });
      } else throw e;
    }
  }

  // const result = await db.query(
  //   "INSERT INTO tasks (user_id, name, color, start_date, end_date, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
  //   [user_id, name, color, parseInt(startDate), parseInt(endDate), active]
  // );

  const result = await prisma.task.create({
    data: {
      userId,
      name,
      color,
      startDate: parseInt(startDate),
      endDate: parseInt(endDate),
      active,
      tags: {
        // TODO validation
        create: newTags,
      },
    },
  });

  return new Response(JSON.stringify(result));
}) satisfies RequestHandler;
