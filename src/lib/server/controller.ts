import app from "$lib/server/firebaseAdmin";

export async function authorize(request: Request) {
  let token = request.headers.get("Authorization");
  if (!token || !token.startsWith("Bearer ")) {
    return { errResp: new Response("Access denied", { status: 401 }) };
  }
  token = token.slice(7);

  const { user_id: userId } = await app.auth().verifyIdToken(token);
  // TODO check if invalid

  return { userId };
}
