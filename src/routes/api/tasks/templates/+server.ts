import { authorize } from "$lib/server/controller";
import type { RequestHandler } from "./$types";
import db from "$lib/server/db";

export const GET = (async ({ request, url }) => {
  // const { user_id, errResp } = await authorize(request);
  // if (errResp) return errResp;
  const user_id = "5JZAz4dyS3NQsjZ49HSYMDqCMSo1";

  const query =
    "SELECT name, color FROM tasks WHERE user_id = $1 GROUP BY name, color ORDER BY COUNT(*)";

  const result = await db.query(query, [user_id]);

  return new Response(JSON.stringify(result.rows));
}) satisfies RequestHandler;
