import { initializeApp, cert } from "firebase-admin/app";

import { getFirestore } from "firebase-admin/firestore";

export const app = initializeApp({
  credential: cert({
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY,
  }),
});

// Import the functions you need from the SDKs you need

export const firestoreDB = getFirestore(app);
