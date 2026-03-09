import { useCallback, useEffect, useState } from "react";
import { TreeOutline } from "../components/tree-outline";
import { backendMode, getBackendWarning } from "../lib/firebase";
import { getOrCreateDraft, getTreeVersion, publishDraft } from "../lib/tree-store";
import { TreeDraft } from "../types/tree";

export const PublicPage = () => {
  const [treeId, setTreeId] = useState("marubou-001");
  const [tree, setTree] = useState<TreeDraft | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
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
      setSelectedNodeId(published.rootNodeId);
      setExpandedNodeIds(new Set([published.rootNodeId]));
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

  const toggleExpand = (nodeId: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>公開ビューア</h1>
          <p className="muted">`/` は published を表示します。編集は `/admin` から行います。</p>
          {getBackendWarning() ? <p className="badge">{getBackendWarning()}</p> : null}
        </div>
        <nav>
          <a href="/admin">管理画面へ</a>
        </nav>
      </header>

      <section className="card form-inline">
        <label>
          treeId
          <input value={treeId} onChange={(event) => setTreeId(event.target.value)} />
        </label>
        <button type="button" onClick={() => void loadPublished()}>
          published再読込
        </button>
      </section>

      {loading ? <p className="muted">読み込み中...</p> : null}
      {message ? <p className="muted">{message}</p> : null}

      {tree ? (
        <TreeOutline
          tree={tree}
          selectedNodeId={selectedNodeId}
          expandedNodeIds={expandedNodeIds}
          onSelect={(nodeId) => setSelectedNodeId(nodeId)}
          onToggle={toggleExpand}
        />
      ) : null}
    </div>
  );
};
