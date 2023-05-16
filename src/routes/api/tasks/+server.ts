import { authorize } from "$lib/server/controller";
import db from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const GET = (async ({ request, url }) => {
  const { user_id, errResp } = await authorize(request);
  if (errResp) return errResp;

  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  let query =
    'SELECT user_id as "userId", id, name, color, start_date as "startDate", end_date as "endDate", active FROM tasks WHERE user_id = $1';
  if (from) {
    query += " AND end_date >= $2";
    // from = parseInt(from);
  }
  if (to) {
    query += " AND start_date <= $3";
    // to = parseInt(to);
  }
  query += " ORDER BY start_date DESC";
  const result = await db.query(query, [user_id, from, to]);

  return new Response(JSON.stringify(result.rows));
}) satisfies RequestHandler;

export const POST = (async ({ request, url }) => {
  const { user_id, errResp } = await authorize(request);
  if (errResp) return errResp;

  const body = await request.json();
  const { name, color, startDate, endDate, active } = body;
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

  const result = await db.query(
    "INSERT INTO tasks (user_id, name, color, start_date, end_date, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [user_id, name, color, parseInt(startDate), parseInt(endDate), active]
  );

  return new Response(JSON.stringify(result.rows[0]));
}) satisfies RequestHandler;
