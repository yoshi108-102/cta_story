import { useState } from "react";
import { ForestOverview } from "../components/forest-overview";
import { usePublishedTree } from "../hooks/use-published-tree";
import { getBackendWarning } from "../lib/firebase";
import { getRootDetailPath } from "../lib/routes";
import { getTreeSchema } from "../lib/tree-schema";
import { getRootNodes } from "../lib/tree-ops";

export const PublicPage = () => {
  const [treeId, setTreeId] = useState("inquiry-001");
  const { tree, loading, message, reload } = usePublishedTree(treeId);
  const schema = tree ? getTreeSchema(tree.schemaId) : null;
  const roots = tree ? getRootNodes(tree) : [];
  const startRoot = tree ? roots.find((root) => root.id === tree.rootNodeId) ?? null : null;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>公開 overview</h1>
          <p className="muted">`/` は published の forest 全体を表示します。各 root は別ページで拡大表示します。</p>
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
        <button type="button" onClick={() => void reload()}>
          published再読込
        </button>
      </section>

      {loading ? <p className="muted">読み込み中...</p> : null}
      {message ? <p className="muted">{message}</p> : null}

      {tree ? (
        <>
          <section className="card overview-summary">
            <div>
              <h3>{schema?.label ?? "Tree"} Summary</h3>
              <p className="muted">
                roots {roots.length} 件 / nodes {tree.nodes.length} 件
              </p>
            </div>
            {startRoot ? (
              <div className="stack">
                <span className="badge">開始ルート</span>
                <a className="button-link" href={getRootDetailPath(tree.treeId, startRoot.id)}>
                  {startRoot.label}
                </a>
              </div>
            ) : null}
          </section>
          <ForestOverview
            tree={tree}
            buildRootHref={(rootId) => getRootDetailPath(tree.treeId, rootId)}
          />
        </>
      ) : null}
    </div>
  );
};
