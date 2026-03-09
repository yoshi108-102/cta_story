import {
  DocumentData,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { backendMode, firebaseServices } from "./firebase";
import { createSeedTree, isTreeDraft } from "./tree-ops";
import { TreeDraft, TreeVersion } from "../types/tree";

interface StoredTreePayload {
  status: TreeVersion;
  tree: TreeDraft;
  updatedAt: unknown;
  updatedBy: string;
}

const localStorageKey = (treeId: string, version: TreeVersion): string => {
  return `cta_story:${treeId}:${version}`;
};

const parsePayload = (payload: DocumentData | unknown): TreeDraft | null => {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const record = payload as Record<string, unknown>;

  if (isTreeDraft(record)) {
    return record;
  }

  if (isTreeDraft(record.tree)) {
    return record.tree;
  }

  return null;
};

const readLocalTree = (treeId: string, version: TreeVersion): TreeDraft | null => {
  const raw = window.localStorage.getItem(localStorageKey(treeId, version));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsePayload(parsed);
  } catch {
    return null;
  }
};

const writeLocalTree = (
  treeId: string,
  version: TreeVersion,
  tree: TreeDraft,
  updatedBy: string,
): void => {
  const payload: StoredTreePayload = {
    status: version,
    tree,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  window.localStorage.setItem(localStorageKey(treeId, version), JSON.stringify(payload));
};

const firestoreVersionDoc = (treeId: string, version: TreeVersion) => {
  if (!firebaseServices.db) {
    throw new Error("Firestore is not available.");
  }

  return doc(firebaseServices.db, "trees", treeId, "versions", version);
};

export const getTreeVersion = async (
  treeId: string,
  version: TreeVersion,
): Promise<TreeDraft | null> => {
  if (backendMode === "mock") {
    return readLocalTree(treeId, version);
  }

  const snapshot = await getDoc(firestoreVersionDoc(treeId, version));
  if (!snapshot.exists()) {
    return null;
  }

  return parsePayload(snapshot.data());
};

export const getOrCreateDraft = async (treeId: string): Promise<TreeDraft> => {
  const draft = await getTreeVersion(treeId, "draft");
  if (draft) {
    return draft;
  }

  const seed = createSeedTree(treeId);

  if (backendMode === "mock") {
    writeLocalTree(treeId, "draft", seed, "system");
    const published = await getTreeVersion(treeId, "published");
    if (!published) {
      writeLocalTree(treeId, "published", seed, "system");
    }
    return seed;
  }

  await saveDraft(treeId, seed, "system");
  return seed;
};

export const saveDraft = async (
  treeId: string,
  tree: TreeDraft,
  userId: string,
): Promise<void> => {
  if (backendMode === "mock") {
    writeLocalTree(treeId, "draft", tree, userId);
    return;
  }

  await setDoc(
    firestoreVersionDoc(treeId, "draft"),
    {
      status: "draft",
      tree,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const publishDraft = async (treeId: string, userId: string): Promise<void> => {
  const draft = await getTreeVersion(treeId, "draft");

  if (!draft) {
    throw new Error("Draft does not exist.");
  }

  if (backendMode === "mock") {
    writeLocalTree(treeId, "published", draft, userId);
    return;
  }

  await setDoc(
    firestoreVersionDoc(treeId, "published"),
    {
      status: "published",
      tree: draft,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};
