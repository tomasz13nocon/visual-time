import { initializeApp, type App, getApps, getApp, cert } from "firebase-admin/app";
// import { credential } from 'firebase-admin/auth';
import { PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY } from "$env/static/private";
import { getAuth } from "firebase-admin/auth";

let app: App;
if (getApps().length === 0) {
  app = initializeApp({
    credential: cert({
      projectId: PROJECT_ID,
      clientEmail: CLIENT_EMAIL,
      privateKey: PRIVATE_KEY,
    }),
  });
} else {
  app = getApp() as App;
}

export const auth = getAuth(app);
