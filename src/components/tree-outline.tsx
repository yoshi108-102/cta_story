import { useMemo } from "react";
import { getNodeKindLabel } from "../lib/node-kind";
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

  const parentMap = useMemo(() => {
    const map = new Map<string, string | null>();

    for (const node of tree.nodes) {
      map.set(node.id, node.parentId);
    }

    return map;
  }, [tree.nodes]);

  const selectedPathIds = useMemo(() => {
    const path = new Set<string>();
    let currentId: string | null = selectedNodeId;

    while (currentId) {
      path.add(currentId);
      currentId = parentMap.get(currentId) ?? null;
    }

    return path;
  }, [parentMap, selectedNodeId]);

  const renderNode = (node: TreeNode, depth: number) => {
    const children = childrenMap.get(node.id) ?? [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodeIds.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const isInSelectedPath = selectedPathIds.has(node.id);
    const toggleAriaLabel = hasChildren
      ? isExpanded
        ? "子ノードを折りたたむ"
        : "子ノードを展開する"
      : "子ノードなし";

    return (
      <li key={node.id} className="outline-item">
        <div
          className={`node-row ${isSelected ? "selected" : ""} ${isInSelectedPath ? "path-active" : ""}`}
        >
          <button
            type="button"
            className="toggle"
            onClick={() => onToggle(node.id)}
            disabled={!hasChildren}
            aria-label={toggleAriaLabel}
          >
            {hasChildren ? (isExpanded ? "▾" : "▸") : "•"}
          </button>
          <button type="button" className="node-label" onClick={() => onSelect(node.id)}>
            <span className="depth-pill">{depth === 0 ? "ROOT" : `Lv.${depth}`}</span>
            <span className="kind">{getNodeKindLabel(node.kind)}</span>
            <span>{node.label}</span>
          </button>
          <span className="node-meta">{hasChildren ? `${children.length}遷移` : "終点"}</span>
        </div>
        {hasChildren && isExpanded ? (
          <ul className="outline-children">{children.map((child) => renderNode(child, depth + 1))}</ul>
        ) : null}
      </li>
    );
  };

  const root = tree.nodes.find((node) => node.id === tree.rootNodeId);

  if (!root) {
    return <p className="error">root nodeが見つかりません。</p>;
  }

  return (
    <div className="card">
      <h3>樹形図</h3>
      <p className="muted">上から下に進む構造です。行の末尾に、次の遷移先件数を表示します。</p>
      <ul className="outline-list">{renderNode(root, 0)}</ul>
    </div>
  );
};
