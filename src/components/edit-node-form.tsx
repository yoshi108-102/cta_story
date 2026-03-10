import { FormEvent, useEffect, useMemo, useState } from "react";
import { getNodeKindOptionsForSchema } from "../lib/tree-schema";
import { getSeedTypeLabel, seedTypes } from "../lib/node-kind";
import { NodeKind, SchemaId, SeedType, TreeNode } from "../types/tree";

interface EditNodeFormProps {
  schemaId: SchemaId;
  node: TreeNode | null;
  editableKinds: NodeKind[];
  onSubmit: (input: {
    nodeId: string;
    kind: NodeKind;
    label: string;
    note: string;
    seedType?: SeedType | null;
  }) => void;
}

export const EditNodeForm = ({ schemaId, node, editableKinds, onSubmit }: EditNodeFormProps) => {
  const selectableKinds = useMemo(
    () => getNodeKindOptionsForSchema(schemaId).filter((option) => editableKinds.includes(option.value)),
    [editableKinds, schemaId],
  );
  const effectiveOptions = useMemo(() => {
    if (!node) {
      return [];
    }

    if (selectableKinds.length > 0) {
      return selectableKinds;
    }

    return getNodeKindOptionsForSchema(schemaId).filter((option) => option.value === node.kind);
  }, [node, schemaId, selectableKinds]);
  const [kind, setKind] = useState<NodeKind | "">("");
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [seedType, setSeedType] = useState<SeedType>("question");

  useEffect(() => {
    if (!node) {
      setKind("");
      setLabel("");
      setNote("");
      setSeedType("question");
      return;
    }

    if (effectiveOptions.some((option) => option.value === node.kind)) {
      setKind(node.kind);
    } else {
      setKind(effectiveOptions[0]?.value ?? "");
    }
    setLabel(node.label);
    setNote(node.note);
    setSeedType(node.seedType ?? "question");
  }, [effectiveOptions, node?.id, node?.kind, node?.label, node?.note, node?.seedType]);

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
      seedType: kind === "seed" ? seedType : null,
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
            <p className="muted">このノードは現在のスキーマ上、種別変更できません。ラベル/注記のみ更新できます。</p>
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
          {kind === "seed" ? (
            <label>
              Seed Type
              <select value={seedType} onChange={(event) => setSeedType(event.target.value as SeedType)}>
                {seedTypes.map((option) => (
                  <option key={option} value={option}>
                    {getSeedTypeLabel(option)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
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
