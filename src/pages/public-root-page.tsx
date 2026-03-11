import { useEffect, useMemo, useState } from "react";
import { RootTreeFlow } from "../components/root-tree-flow";
import { getBackendWarning } from "../lib/firebase";
import { getRootNodes } from "../lib/tree-ops";
import { usePublishedTree } from "../hooks/use-published-tree";
interface PublicRootPageProps {
  treeId: string;
  rootId: string;
}

export const PublicRootPage = ({ treeId, rootId }: PublicRootPageProps) => {
  const { tree, loading, message, reload } = usePublishedTree(treeId);
  const [selectedNodeId, setSelectedNodeId] = useState("");

  const roots = useMemo(() => (tree ? getRootNodes(tree) : []), [tree]);
  const focusRoot = useMemo(() => roots.find((node) => node.id === rootId) ?? null, [rootId, roots]);

  useEffect(() => {
    if (!tree || !focusRoot) {
      setSelectedNodeId("");
      return;
    }

    setSelectedNodeId(focusRoot.id);
  }, [focusRoot?.id, tree]);

  return (
    <div className="page page-wide">
      <header className="page-header tree-focus-header">
        <div>
          <h1>{focusRoot?.label ?? "root 詳細ビュー"}</h1>
          <p className="muted">拡大ページは subtree だけを表示します。root の切り替えは overview から行います。</p>
          {getBackendWarning() ? <p className="badge">{getBackendWarning()}</p> : null}
        </div>
        <nav className="nav-links">
          <a href="/">全体 overview へ</a>
          <a href="/question-seeds">Question Seed へ</a>
          <a href="/admin">管理画面へ</a>
          <button type="button" className="secondary" onClick={() => void reload()}>
            再読込
          </button>
        </nav>
      </header>

      {loading ? <p className="muted">読み込み中...</p> : null}
      {message ? <p className="muted">{message}</p> : null}

      {tree && focusRoot ? (
        <>
          <main className="tree-focus-stage">
            <RootTreeFlow
              tree={tree}
              rootNodeId={focusRoot.id}
              selectedNodeId={selectedNodeId || focusRoot.id}
              onSelectNode={setSelectedNodeId}
            />
          </main>
        </>
      ) : null}

      {tree && !focusRoot && !loading ? (
        <section className="card stack">
          <h3>指定した root が見つかりません</h3>
          <p className="muted">overview に戻って、存在する root から詳細ページを開いてください。</p>
        </section>
      ) : null}
    </div>
  );
};
