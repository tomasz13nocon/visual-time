import { authorize } from "$lib/server/controller";
import prisma from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const PUT = (async ({ request, params }) => {
  const { userId, errResp } = await authorize(request);
  if (errResp) return errResp;

  const body = await request.json();
  const { name, color, startDate, endDate, active } = body;

  // let query = "UPDATE tasks SET ";
  // if (name !== undefined) query += "name = $1, ";
  // if (color !== undefined) query += "color = $2, ";
  // if (startDate !== undefined) query += "start_date = $3, ";
  // if (endDate !== undefined) query += "end_date = $4, ";
  // if (active !== undefined) query += "active = $5, ";
  // if (query.endsWith("SET ")) {
  //   return new Response("No fields to update", { status: 400 });
  // }
  // query = query.slice(0, -2);
  // query += " WHERE user_id = $6 AND id = $7 RETURNING *";
  //
  // const result = await db.query(query, [
  //   name,
  //   color,
  //   parseInt(startDate),
  //   parseInt(endDate),
  //   active,
  //   user_id,
  //   params.id,
  // ]);

  const result = await prisma.task.update({
    where: {
      id: parseInt(params.id),
      userId,
    },
    data: {
      name,
      color,
      startDate: parseInt(startDate),
      endDate: parseInt(endDate),
      active,
    },
  });

  return new Response(JSON.stringify(result));
}) satisfies RequestHandler;

export const DELETE = (async ({ request, params }) => {
  const { userId, errResp } = await authorize(request);
  if (errResp) return errResp;

  try {
    // await db.query("DELETE FROM tasks WHERE user_id = $1 AND id = $2", [user_id, params.id]);
    await prisma.task.delete({
      where: {
        id: parseInt(params.id),
        userId,
      },
    });
    return new Response();
  } catch (e) {
    return new Response(e instanceof Error ? e.message : "", { status: 500 });
  }
}) satisfies RequestHandler;
