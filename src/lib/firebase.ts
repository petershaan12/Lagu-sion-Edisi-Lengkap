import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase } from "firebase/database";

export const firebaseConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

let connection: Promise<{ db: ReturnType<typeof getDatabase>; uid: string }> | undefined;

export function connectFirebase() {
  if (!firebaseConfigured) throw new Error("Firebase belum dikonfigurasi.");
  connection ??= (async () => {
    const app = getApps().length ? getApp() : initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
    const auth = getAuth(app);
    await auth.authStateReady();
    const user = auth.currentUser || (await signInAnonymously(auth)).user;
    return { db: getDatabase(app), uid: user.uid };
  })().catch((error) => { connection = undefined; throw error; });
  return connection;
}
