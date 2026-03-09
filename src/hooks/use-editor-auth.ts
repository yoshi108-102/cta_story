import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { backendMode, firebaseServices } from "../lib/firebase";
import { EditorUser } from "../types/tree";

interface UseEditorAuthResult {
  user: EditorUser | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isMock: boolean;
}

const MOCK_USER: EditorUser = {
  uid: "local-editor",
  email: "local@example.com",
  displayName: "Local Editor",
};

export const useEditorAuth = (): UseEditorAuthResult => {
  const isMock = backendMode === "mock";
  const [user, setUser] = useState<EditorUser | null>(isMock ? MOCK_USER : null);
  const [loading, setLoading] = useState<boolean>(!isMock);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isMock) {
      return;
    }

    if (!firebaseServices.auth) {
      setLoading(false);
      setError("Firebase Authを初期化できませんでした。");
      return;
    }

    return onAuthStateChanged(firebaseServices.auth, (nextUser) => {
      if (!nextUser) {
        setUser(null);
      } else {
        setUser({
          uid: nextUser.uid,
          email: nextUser.email,
          displayName: nextUser.displayName,
        });
      }
      setLoading(false);
    });
  }, [isMock]);

  const login = useMemo(() => {
    return async () => {
      if (isMock) {
        setUser(MOCK_USER);
        return;
      }

      if (!firebaseServices.auth || !firebaseServices.googleProvider) {
        setError("Firebase Authが未設定です。");
        return;
      }

      setError(null);

      try {
        await signInWithPopup(firebaseServices.auth, firebaseServices.googleProvider);
      } catch (err) {
        const message = err instanceof Error ? err.message : "ログインに失敗しました。";
        setError(message);
      }
    };
  }, [isMock]);

  const logout = useMemo(() => {
    return async () => {
      if (isMock) {
        setUser(MOCK_USER);
        return;
      }

      if (!firebaseServices.auth) {
        return;
      }

      await signOut(firebaseServices.auth);
    };
  }, [isMock]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    isMock,
  };
};
