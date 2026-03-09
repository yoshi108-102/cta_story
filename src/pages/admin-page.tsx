import { useCallback, useEffect, useState } from "react";
import { AddNodeForm } from "../components/add-node-form";
import { AttachNodeForm } from "../components/attach-node-form";
import { EditNodeForm } from "../components/edit-node-form";
import { AuthPanel } from "../components/auth-panel";
import { NodeDetail } from "../components/node-detail";
import { TaskDiagramPanel } from "../components/task-diagram-panel";
import { TreeOutline } from "../components/tree-outline";
import { useEditorAuth } from "../hooks/use-editor-auth";
import {
  addRootTaskStep,
  getAncestors,
  getAddableKinds,
  getEditableKinds,
  getNode,
  getRootTaskSteps,
  getUnattachedNodes,
  addNode,
  attachExistingNode,
  setStartRootNode,
  updateNode,
} from "../lib/tree-ops";
import { getOrCreateDraft, publishDraft, saveDraft } from "../lib/tree-store";
import { NodeKind, TreeDraft } from "../types/tree";

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
    kind: NodeKind;
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

  const handleUpdateNode = (input: {
    nodeId: string;
    kind: NodeKind;
    label: string;
    note: string;
  }) => {
    if (!tree) {
      return;
    }

    try {
      const nextTree = updateNode(tree, input);
      setTree(nextTree);
      setDirty(true);
      setMessage("ノードを更新しました。保存するとdraftに反映されます。");
    } catch (error) {
      const text = error instanceof Error ? error.message : "ノード更新に失敗しました。";
      setMessage(text);
    }
  };

  const handleAddRootTaskStep = (input: { label: string; note: string }) => {
    if (!tree) {
      return;
    }

    try {
      const nextTree = addRootTaskStep(tree, input);
      const addedNode = nextTree.nodes[nextTree.nodes.length - 1];
      setTree(nextTree);
      setDirty(true);
      setMessage("Task Step を追加しました。保存するとdraftに反映されます。");
      if (addedNode) {
        setSelectedNodeId(addedNode.id);
        setExpandedNodeIds((prev) => new Set(prev).add(addedNode.id));
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "Task Step 追加に失敗しました。";
      setMessage(text);
    }
  };

  const handleSelectStartRoot = (rootNodeId: string) => {
    if (!tree) {
      return;
    }

    try {
      const nextTree = setStartRootNode(tree, rootNodeId);
      setTree(nextTree);
      setDirty(true);
      setSelectedNodeId(rootNodeId);
      setExpandedNodeIds((prev) => new Set(prev).add(rootNodeId));
      setMessage("開始ルートを更新しました。保存するとdraftに反映されます。");
    } catch (error) {
      const text = error instanceof Error ? error.message : "開始ルートの更新に失敗しました。";
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

  const selectedNode = tree ? getNode(tree, selectedNodeId) ?? null : null;
  const rootTaskSteps = tree ? getRootTaskSteps(tree) : [];
  const addableKinds = tree && selectedNode ? getAddableKinds(tree, selectedNode.id) : [];
  const editableKinds = tree && selectedNode ? getEditableKinds(tree, selectedNode.id) : [];
  const unattachedNodes = tree ? getUnattachedNodes(tree) : [];
  const attachableUnattachedNodes = unattachedNodes.filter((node) => addableKinds.includes(node.kind));

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>管理画面</h1>
          <p className="muted">CTAフォーマット準拠。Task Diagram の root Task Step を管理できます。</p>
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
        <>
          <TaskDiagramPanel
            roots={rootTaskSteps}
            startRootId={tree.rootNodeId}
            selectedNodeId={selectedNodeId}
            onSelectStartRoot={handleSelectStartRoot}
            onFocusRoot={selectNode}
            onAddRoot={handleAddRootTaskStep}
          />
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
              <EditNodeForm node={selectedNode} editableKinds={editableKinds} onSubmit={handleUpdateNode} />
              <AddNodeForm parentId={selectedNodeId} allowedKinds={addableKinds} onSubmit={handleAddNode} />
              <AttachNodeForm
                nodes={attachableUnattachedNodes}
                onSubmit={handleAttachNode}
                emptyMessage="接続可能な未接続ノードはありません。"
              />
            </div>
          </main>
        </>
      ) : null}
    </div>
  );
};
