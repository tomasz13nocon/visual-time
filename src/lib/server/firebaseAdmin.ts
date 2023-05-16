import admin from "firebase-admin";
import { getApps, getApp } from "firebase-admin/app";
import { PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY } from "$env/static/private";

let app: admin.app.App;
if (getApps().length === 0) {
  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: PROJECT_ID,
      clientEmail: CLIENT_EMAIL,
      privateKey: PRIVATE_KEY,
    }),
  });
} else {
  app = getApp() as admin.app.App;
}

export default app;
