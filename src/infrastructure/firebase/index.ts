import * as admin from "firebase-admin";

import * as serviceAccount from "./firebase.cert.json";

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export const firebaseDB = admin.firestore(app);
export const firebaseAuth: admin.auth.Auth = admin.auth(app);
export type UserRecord = admin.auth.UpdateRequest;
