import { authorize } from "$lib/server/controller";
import db from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const PUT = (async ({ request, url, params }) => {
  const { user_id, errResp } = await authorize(request);
  if (errResp) return errResp;

  const body = await request.json();
  const { name, color, startDate, endDate, active } = body;

  let query = "UPDATE tasks SET ";
  if (name !== undefined) query += "name = $1, ";
  if (color !== undefined) query += "color = $2, ";
  if (startDate !== undefined) query += "start_date = $3, ";
  if (endDate !== undefined) query += "end_date = $4, ";
  if (active !== undefined) query += "active = $5, ";
  if (query.endsWith("SET ")) {
    return new Response("No fields to update", { status: 400 });
  }
  query = query.slice(0, -2);
  query += " WHERE user_id = $6 AND id = $7 RETURNING *";

  const result = await db.query(query, [
    name,
    color,
    parseInt(startDate),
    parseInt(endDate),
    active,
    user_id,
    params.id,
  ]);

  return new Response(JSON.stringify(result.rows));
}) satisfies RequestHandler;
