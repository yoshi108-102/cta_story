import { getNodeKindDescription, getNodeKindLabel } from "../lib/node-kind";
import { getAncestors, getChildren, getNode } from "../lib/tree-ops";
import { TreeDraft } from "../types/tree";

interface NodeDetailProps {
  tree: TreeDraft;
  selectedNodeId: string;
}

export const NodeDetail = ({ tree, selectedNodeId }: NodeDetailProps) => {
  const node = getNode(tree, selectedNodeId);

  if (!node) {
    return (
      <div className="card">
        <h3>ノード詳細</h3>
        <p className="muted">ノードを選択してください。</p>
      </div>
    );
  }

  const ancestors = getAncestors(tree, node.id);
  const children = getChildren(tree, node.id);

  return (
    <div className="card">
      <h3>CTAフォーカス詳細</h3>
      <div className="crumbs">
        {ancestors.map((ancestor) => (
          <span key={ancestor.id} className="crumb">
            {ancestor.label}
          </span>
        ))}
        <span className="crumb active">{node.label}</span>
      </div>
      <div className="focus-node">
        <p className="kind">{getNodeKindLabel(node.kind)}</p>
        <p className="muted">{getNodeKindDescription(node.kind)}</p>
        <h4>{node.label}</h4>
        <p className="note">{node.note || "(noteなし)"}</p>
      </div>
      <div className="child-list">
        <h4>直下の子ノード</h4>
        {children.length === 0 ? (
          <p className="muted">子ノードはありません。</p>
        ) : (
          <ul>
            {children.map((child) => (
              <li key={child.id}>
                <span className="kind">{getNodeKindLabel(child.kind)}</span>
                {child.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
