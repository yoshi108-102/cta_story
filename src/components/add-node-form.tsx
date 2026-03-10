import { FormEvent, useEffect, useMemo, useState } from "react";
import { getNodeKindOptionsForSchema } from "../lib/tree-schema";
import { NodeKind, SchemaId } from "../types/tree";

interface AddNodeFormProps {
  schemaId: SchemaId;
  parentId: string;
  allowedKinds: NodeKind[];
  onSubmit: (input: { parentId: string; kind: NodeKind; label: string; note: string }) => void;
}

export const AddNodeForm = ({ schemaId, parentId, allowedKinds, onSubmit }: AddNodeFormProps) => {
  const selectableKinds = useMemo(
    () => getNodeKindOptionsForSchema(schemaId).filter((option) => allowedKinds.includes(option.value)),
    [allowedKinds, schemaId],
  );
  const defaultKind = selectableKinds[0]?.value ?? null;
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<NodeKind | "">("");

  useEffect(() => {
    setKind(defaultKind ?? "");
  }, [defaultKind, parentId]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!kind) {
      return;
    }

    onSubmit({
      parentId,
      kind,
      label,
      note,
    });
    setLabel("");
    setNote("");
    setKind(defaultKind ?? "");
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h3>子ノードを追加</h3>
      {selectableKinds.length === 0 ? (
        <p className="muted">選択中ノードには、このスキーマ上で追加できる子ノード種別がありません。</p>
      ) : (
        <>
          <label>
            種別
            <select value={kind} onChange={(event) => setKind(event.target.value as NodeKind)}>
              {selectableKinds.map((option) => (
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
          <button type="submit">選択ノードの子として追加</button>
        </>
      )}
    </form>
  );
};
