import { FirebaseApp, FirebaseOptions, initializeApp } from "firebase/app";
import { Auth, GoogleAuthProvider, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

export type BackendMode = "firebase" | "mock";

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredKeys: Array<keyof FirebaseOptions> = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId",
];

const hasRequiredConfig = requiredKeys.every((key) => {
  return typeof firebaseConfig[key] === "string" && firebaseConfig[key]?.trim();
});

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (hasRequiredConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
}

export const backendMode: BackendMode = hasRequiredConfig ? "firebase" : "mock";

export const firebaseServices = {
  app,
  auth,
  db,
  googleProvider,
};

export const getBackendWarning = (): string | null => {
  if (backendMode === "firebase") {
    return null;
  }

  return "Firebase設定が未入力のため、localStorageを使うmockモードで動作しています。";
};
