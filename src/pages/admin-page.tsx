import { useCallback, useEffect, useState } from "react";
import { AddNodeForm } from "../components/add-node-form";
import { AttachNodeForm } from "../components/attach-node-form";
import { AuthPanel } from "../components/auth-panel";
import { NodeDetail } from "../components/node-detail";
import { TreeOutline } from "../components/tree-outline";
import { useEditorAuth } from "../hooks/use-editor-auth";
import { getAncestors, getUnattachedNodes, addNode, attachExistingNode } from "../lib/tree-ops";
import { getOrCreateDraft, publishDraft, saveDraft } from "../lib/tree-store";
import { TreeDraft } from "../types/tree";

export const AdminPage = () => {
  const { user, loading: authLoading, error: authError, login, logout, isMock } = useEditorAuth();
  const [treeId, setTreeId] = useState("marubou-001");
  const [tree, setTree] = useState<TreeDraft | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canLoad = isMock || !!user;

  const loadDraft = useCallback(async () => {
    if (!canLoad) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const nextTree = await getOrCreateDraft(treeId);
      setTree(nextTree);
      setSelectedNodeId(nextTree.rootNodeId);
      setExpandedNodeIds(new Set([nextTree.rootNodeId]));
      setDirty(false);
    } catch (error) {
      const text = error instanceof Error ? error.message : "draftの読み込みに失敗しました。";
      setMessage(text);
      setTree(null);
    } finally {
      setLoading(false);
    }
  }, [canLoad, treeId]);

  useEffect(() => {
    void loadDraft();
  }, [loadDraft]);

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

  const selectNode = (nodeId: string) => {
    if (!tree) {
      return;
    }

    setSelectedNodeId(nodeId);
    const ancestors = getAncestors(tree, nodeId).map((node) => node.id);
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      next.add(nodeId);
      for (const ancestorId of ancestors) {
        next.add(ancestorId);
      }
      return next;
    });
  };

  const handleAddNode = (input: {
    parentId: string;
    kind: "problem" | "why" | "factor";
    label: string;
    note: string;
  }) => {
    if (!tree) {
      return;
    }

    try {
      const nextTree = addNode(tree, input);
      setTree(nextTree);
      setDirty(true);
      setMessage("ノードを追加しました。保存するとdraftに反映されます。");
      setExpandedNodeIds((prev) => new Set(prev).add(input.parentId));
    } catch (error) {
      const text = error instanceof Error ? error.message : "ノード追加に失敗しました。";
      setMessage(text);
    }
  };

  const handleAttachNode = (targetNodeId: string) => {
    if (!tree) {
      return;
    }

    try {
      const nextTree = attachExistingNode(tree, selectedNodeId, targetNodeId);
      setTree(nextTree);
      setDirty(true);
      setMessage("未接続ノードを接続しました。保存するとdraftに反映されます。");
      setExpandedNodeIds((prev) => new Set(prev).add(selectedNodeId));
    } catch (error) {
      const text = error instanceof Error ? error.message : "接続に失敗しました。";
      setMessage(text);
    }
  };

  const handleSave = async () => {
    if (!tree || !canLoad) {
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      await saveDraft(tree.treeId, tree, user?.uid ?? "local-editor");
      setDirty(false);
      setMessage("draftを保存しました。");
    } catch (error) {
      const text = error instanceof Error ? error.message : "保存に失敗しました。";
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    if (!tree || !canLoad) {
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      if (dirty) {
        await saveDraft(tree.treeId, tree, user?.uid ?? "local-editor");
      }
      await publishDraft(tree.treeId, user?.uid ?? "local-editor");
      setDirty(false);
      setMessage("publishedを更新しました。");
    } catch (error) {
      const text = error instanceof Error ? error.message : "公開処理に失敗しました。";
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const unattachedNodes = tree ? getUnattachedNodes(tree) : [];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>管理画面</h1>
          <p className="muted">ノード追加 / エッジ追加のみの最小エディタです。</p>
        </div>
        <nav>
          <a href="/">公開ビューへ</a>
        </nav>
      </header>

      <AuthPanel
        user={user}
        loading={authLoading}
        error={authError}
        isMock={isMock}
        onLogin={login}
        onLogout={logout}
      />

      <section className="card form-inline">
        <label>
          treeId
          <input value={treeId} onChange={(event) => setTreeId(event.target.value)} />
        </label>
        <button type="button" className="secondary" onClick={() => void loadDraft()} disabled={!canLoad || busy}>
          draft再読込
        </button>
        <button type="button" onClick={() => void handleSave()} disabled={!canLoad || busy || !tree}>
          draft保存
        </button>
        <button type="button" onClick={() => void handlePublish()} disabled={!canLoad || busy || !tree}>
          published反映
        </button>
        {dirty ? <span className="badge">未保存の変更あり</span> : null}
      </section>

      {loading ? <p className="muted">読み込み中...</p> : null}
      {message ? <p className="muted">{message}</p> : null}

      {tree ? (
        <main className="editor-grid">
          <TreeOutline
            tree={tree}
            selectedNodeId={selectedNodeId}
            expandedNodeIds={expandedNodeIds}
            onSelect={selectNode}
            onToggle={toggleExpand}
          />
          <NodeDetail tree={tree} selectedNodeId={selectedNodeId} />
          <div className="stack">
            <AddNodeForm parentId={selectedNodeId} onSubmit={handleAddNode} />
            <AttachNodeForm nodes={unattachedNodes} onSubmit={handleAttachNode} />
          </div>
        </main>
      ) : null}
    </div>
  );
};
