import { useMemo } from "react";
import { TreeDraft, TreeNode } from "../types/tree";

interface TreeOutlineProps {
  tree: TreeDraft;
  selectedNodeId: string;
  expandedNodeIds: Set<string>;
  onSelect: (nodeId: string) => void;
  onToggle: (nodeId: string) => void;
}

export const TreeOutline = ({
  tree,
  selectedNodeId,
  expandedNodeIds,
  onSelect,
  onToggle,
}: TreeOutlineProps) => {
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

  const renderNode = (node: TreeNode, depth: number) => {
    const children = childrenMap.get(node.id) ?? [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodeIds.has(node.id);
    const isSelected = selectedNodeId === node.id;

    return (
      <li key={node.id}>
        <div
          className={`node-row ${isSelected ? "selected" : ""}`}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          <button
            type="button"
            className="toggle"
            onClick={() => onToggle(node.id)}
            disabled={!hasChildren}
            aria-label={hasChildren ? "toggle" : "leaf"}
          >
            {hasChildren ? (isExpanded ? "-" : "+") : "•"}
          </button>
          <button type="button" className="node-label" onClick={() => onSelect(node.id)}>
            <span className="kind">{node.kind}</span>
            {node.label}
          </button>
        </div>
        {hasChildren && isExpanded ? <ul>{children.map((child) => renderNode(child, depth + 1))}</ul> : null}
      </li>
    );
  };

  const root = tree.nodes.find((node) => node.id === tree.rootNodeId);

  if (!root) {
    return <p className="error">root nodeが見つかりません。</p>;
  }

  return (
    <div className="card">
      <h3>ツリー一覧</h3>
      <ul className="outline-list">{renderNode(root, 0)}</ul>
    </div>
  );
};
