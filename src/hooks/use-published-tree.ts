import { useCallback, useEffect, useState } from "react";
import { backendMode } from "../lib/firebase";
import { getOrCreateDraft, getTreeVersion, publishDraft } from "../lib/tree-store";
import { TreeDraft } from "../types/tree";

interface UsePublishedTreeResult {
  tree: TreeDraft | null;
  loading: boolean;
  message: string | null;
  reload: () => Promise<void>;
}

export const usePublishedTree = (treeId: string): UsePublishedTreeResult => {
  const [tree, setTree] = useState<TreeDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadPublished = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      let published = await getTreeVersion(treeId, "published");
      if (!published) {
        if (backendMode === "mock") {
          const draft = await getOrCreateDraft(treeId);
          await publishDraft(treeId, "system");
          published = draft;
          setMessage("published が未作成だったため、初期draftを公開版として作成しました。");
        } else {
          setMessage("published が見つかりません。管理画面で公開してください。");
          setTree(null);
          return;
        }
      }

      setTree(published);
    } catch (error) {
      const text = error instanceof Error ? error.message : "公開データの読み込みに失敗しました。";
      setMessage(text);
      setTree(null);
    } finally {
      setLoading(false);
    }
  }, [treeId]);

  useEffect(() => {
    void loadPublished();
  }, [loadPublished]);

  return {
    tree,
    loading,
    message,
    reload: loadPublished,
  };
};
