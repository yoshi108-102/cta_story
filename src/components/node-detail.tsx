import { getNodeKindDescription, getTreeNodeKindLabel } from "../lib/node-kind";
import { getTreeSchema } from "../lib/tree-schema";
import { getAncestors, getChildren, getNode } from "../lib/tree-ops";
import { TreeDraft } from "../types/tree";

interface NodeDetailProps {
  tree: TreeDraft;
  selectedNodeId: string;
  title?: string;
  onSelectNode?: (nodeId: string) => void;
}

export const NodeDetail = ({ tree, selectedNodeId, title, onSelectNode }: NodeDetailProps) => {
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
  const schema = getTreeSchema(tree.schemaId);

  return (
    <div className="card">
      <h3>{title ?? `${schema.label} ノード詳細`}</h3>
      <div className="crumbs">
        {ancestors.map((ancestor) => (
          <span key={ancestor.id} className="crumb">
            {ancestor.label}
          </span>
        ))}
        <span className="crumb active">{node.label}</span>
      </div>
      <div className="focus-node">
        <p className="kind">{getTreeNodeKindLabel(node)}</p>
        <p className="muted">{getNodeKindDescription(node.kind)}</p>
        <h4>{node.label}</h4>
        <p className="note">{node.note || "(noteなし)"}</p>
      </div>
      <div className="child-list">
        <h4>直下の子ノード</h4>
        {children.length === 0 ? (
          <p className="muted">子ノードはありません。</p>
        ) : (
          <ul className={onSelectNode ? "transition-list" : undefined}>
            {children.map((child) => (
              <li key={child.id}>
                {onSelectNode ? (
                  <button type="button" className="transition-button" onClick={() => onSelectNode(child.id)}>
                    <span className="kind">{getTreeNodeKindLabel(child)}</span>
                    <span>{child.label}</span>
                  </button>
                ) : (
                  <>
                    <span className="kind">{getTreeNodeKindLabel(child)}</span>
                    {child.label}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
