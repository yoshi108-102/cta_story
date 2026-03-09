import { FormEvent, useEffect, useMemo, useState } from "react";
import { TreeNode } from "../types/tree";

interface AttachNodeFormProps {
  nodes: TreeNode[];
  onSubmit: (targetNodeId: string) => void;
}

export const AttachNodeForm = ({ nodes, onSubmit }: AttachNodeFormProps) => {
  const defaultNodeId = useMemo(() => nodes[0]?.id ?? "", [nodes]);
  const [targetNodeId, setTargetNodeId] = useState(defaultNodeId);

  useEffect(() => {
    setTargetNodeId(defaultNodeId);
  }, [defaultNodeId]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!targetNodeId) {
      return;
    }
    onSubmit(targetNodeId);
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h3>未接続ノードを接続</h3>
      {nodes.length === 0 ? (
        <p className="muted">未接続ノードはありません。</p>
      ) : (
        <>
          <label>
            接続先ノード
            <select value={targetNodeId} onChange={(event) => setTargetNodeId(event.target.value)}>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">選択ノードの子として接続</button>
        </>
      )}
    </form>
  );
};
