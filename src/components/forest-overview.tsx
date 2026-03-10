import { useMemo } from "react";
import { getTreeNodeKindLabel } from "../lib/node-kind";
import { getTreeSchema } from "../lib/tree-schema";
import { getRootNodes, getUnattachedNodes } from "../lib/tree-ops";
import { TreeDraft, TreeNode } from "../types/tree";

interface ForestOverviewProps {
  tree: TreeDraft;
  buildRootHref: (rootId: string) => string;
}

interface BranchStats {
  nodeCount: number;
  maxDepth: number;
}

export const ForestOverview = ({ tree, buildRootHref }: ForestOverviewProps) => {
  const schema = getTreeSchema(tree.schemaId);
  const roots = getRootNodes(tree);
  const unattachedNodes = getUnattachedNodes(tree);

  const childrenMap = useMemo(() => {
    const map = new Map<string, TreeNode[]>();

    for (const node of tree.nodes) {
      if (!node.parentId) {
        continue;
      }

      const siblings = map.get(node.parentId) ?? [];
      siblings.push(node);
      map.set(node.parentId, siblings);
    }

    for (const entry of map.values()) {
      entry.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    return map;
  }, [tree.nodes]);

  const getBranchStats = (rootId: string): BranchStats => {
    const walk = (nodeId: string, depth: number): BranchStats => {
      const children = childrenMap.get(nodeId) ?? [];
      if (children.length === 0) {
        return {
          nodeCount: 1,
          maxDepth: depth,
        };
      }

      let nodeCount = 1;
      let maxDepth = depth;

      for (const child of children) {
        const childStats = walk(child.id, depth + 1);
        nodeCount += childStats.nodeCount;
        maxDepth = Math.max(maxDepth, childStats.maxDepth);
      }

      return {
        nodeCount,
        maxDepth,
      };
    };

    return walk(rootId, 0);
  };

  const renderNode = (node: TreeNode, depth: number) => {
    const children = childrenMap.get(node.id) ?? [];

    return (
      <li key={node.id} className="overview-item">
        <div className={`overview-node-row ${depth === 0 ? "root" : ""}`}>
          <span className="depth-pill">{depth === 0 ? "ROOT" : `Lv.${depth}`}</span>
          <span className="kind">{getTreeNodeKindLabel(node)}</span>
          <span className="overview-node-label">{node.label}</span>
          <span className="node-meta">{children.length > 0 ? `${children.length}遷移` : "終点"}</span>
        </div>
        {children.length > 0 ? (
          <ul className="overview-children">{children.map((child) => renderNode(child, depth + 1))}</ul>
        ) : null}
      </li>
    );
  };

  return (
    <section className="stack">
      <div className="card">
        <h3>Forest Overview</h3>
        <p className="muted">
          {schema.label} の全 root をまとめて表示します。開始ルートは強調表示し、詳細は root ごとの拡大ページで確認します。
        </p>
      </div>

      <div className="forest-grid">
        {roots.map((root) => {
          const stats = getBranchStats(root.id);
          const isStartRoot = root.id === tree.rootNodeId;

          return (
            <article
              key={root.id}
              className={`card overview-root-card ${isStartRoot ? "overview-root-card-start" : ""}`}
            >
              <div className="row-between overview-root-header">
                <div className="stack">
                  <div className="overview-root-title">
                    <span className="kind">{getTreeNodeKindLabel(root)}</span>
                    <h4>{root.label}</h4>
                  </div>
                  <p className="muted">
                    {stats.nodeCount} nodes / depth {stats.maxDepth}
                  </p>
                </div>
                <div className="task-root-tags">
                  {isStartRoot ? <span className="badge">開始ルート</span> : null}
                  <a className="button-link" href={buildRootHref(root.id)}>
                    拡大表示
                  </a>
                </div>
              </div>
              <p className="muted">{root.note || "(noteなし)"}</p>
              <ul className="overview-tree">{renderNode(root, 0)}</ul>
            </article>
          );
        })}
      </div>

      {unattachedNodes.length > 0 ? (
        <div className="card">
          <h3>未接続ノード</h3>
          <p className="muted">published 内に親を持たない非 root ノードがあります。公開構造としては整理対象です。</p>
          <ul className="orphan-list">
            {unattachedNodes.map((node) => (
              <li key={node.id}>
                <span className="kind">{getTreeNodeKindLabel(node)}</span>
                {node.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
};
