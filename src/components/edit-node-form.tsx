import { FormEvent, useEffect, useMemo, useState } from "react";
import { nodeKindOptions } from "../lib/node-kind";
import { NodeKind, TreeNode } from "../types/tree";

interface EditNodeFormProps {
  node: TreeNode | null;
  editableKinds: NodeKind[];
  onSubmit: (input: { nodeId: string; kind: NodeKind; label: string; note: string }) => void;
}

export const EditNodeForm = ({ node, editableKinds, onSubmit }: EditNodeFormProps) => {
  const selectableKinds = useMemo(
    () => nodeKindOptions.filter((option) => editableKinds.includes(option.value)),
    [editableKinds],
  );
  const effectiveOptions = useMemo(() => {
    if (!node) {
      return [];
    }

    if (selectableKinds.length > 0) {
      return selectableKinds;
    }

    return nodeKindOptions.filter((option) => option.value === node.kind);
  }, [node, selectableKinds]);
  const [kind, setKind] = useState<NodeKind | "">("");
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!node) {
      setKind("");
      setLabel("");
      setNote("");
      return;
    }

    if (effectiveOptions.some((option) => option.value === node.kind)) {
      setKind(node.kind);
    } else {
      setKind(effectiveOptions[0]?.value ?? "");
    }
    setLabel(node.label);
    setNote(node.note);
  }, [effectiveOptions, node?.id, node?.kind, node?.label, node?.note]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!node || !kind) {
      return;
    }

    onSubmit({
      nodeId: node.id,
      kind,
      label,
      note,
    });
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h3>選択ノードを編集</h3>
      {!node ? (
        <p className="muted">ノードを選択してください。</p>
      ) : (
        <>
          {selectableKinds.length === 0 ? (
            <p className="muted">このノードはCTAルール上、種別変更できません。ラベル/注記のみ更新できます。</p>
          ) : null}
          <label>
            種別
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as NodeKind)}
              disabled={selectableKinds.length === 0}
            >
              {effectiveOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.description})
                </option>
              ))}
            </select>
          </label>
          <label>
            ラベル (120文字)
            <input
              type="text"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              maxLength={120}
              required
            />
          </label>
          <label>
            注記 (1000文字)
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              maxLength={1000}
            />
          </label>
          <button type="submit">選択ノードを更新</button>
        </>
      )}
    </form>
  );
};
