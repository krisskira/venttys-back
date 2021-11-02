import firebase from "firebase-admin";
import * as serviceAccount from "./firebase.cert.json";

const app = firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount as firebase.ServiceAccount),
});

export const firebaseDB = firebase.firestore(app);
