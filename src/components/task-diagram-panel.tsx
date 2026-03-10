import { FormEvent, useState } from "react";
import { getNodeKindLabel, getSeedTypeLabel, seedTypes } from "../lib/node-kind";
import { getTreeSchema } from "../lib/tree-schema";
import { SeedType, TreeDraft, TreeNode } from "../types/tree";

interface TaskDiagramPanelProps {
  tree: TreeDraft;
  roots: TreeNode[];
  startRootId: string;
  selectedNodeId: string;
  onSelectStartRoot: (rootNodeId: string) => void;
  onFocusRoot: (rootNodeId: string) => void;
  onAddRoot: (input: { label: string; note: string; seedType?: SeedType | null }) => void;
}

export const TaskDiagramPanel = ({
  tree,
  roots,
  startRootId,
  selectedNodeId,
  onSelectStartRoot,
  onFocusRoot,
  onAddRoot,
}: TaskDiagramPanelProps) => {
  const schema = getTreeSchema(tree.schemaId);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [seedType, setSeedType] = useState<SeedType>("question");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAddRoot({
      label,
      note,
      seedType: tree.schemaId === "progressive_inquiry" ? seedType : null,
    });
    setLabel("");
    setNote("");
    setSeedType("question");
  };

  return (
    <section className="card stack">
      <div>
        <h3>{schema.rootCollectionLabel}</h3>
        <p className="muted">{schema.rootHelperText}</p>
        <p className="muted">
          {schema.label}: {schema.description}
        </p>
      </div>

      {roots.length === 0 ? (
        <p className="error">root {getNodeKindLabel(schema.rootKind)} がありません。まず1件追加してください。</p>
      ) : (
        <>
          <label>
            開始ルート
            <select value={startRootId} onChange={(event) => onSelectStartRoot(event.target.value)}>
              {roots.map((root) => (
                <option key={root.id} value={root.id}>
                  {root.label}
                </option>
              ))}
            </select>
          </label>

          <div className="task-root-list">
            {roots.map((root) => {
              const isSelected = selectedNodeId === root.id;
              const isStartRoot = startRootId === root.id;

              return (
                <button
                  key={root.id}
                  type="button"
                  className={`task-root-item ${isSelected ? "selected" : ""}`}
                  onClick={() => onFocusRoot(root.id)}
                >
                  <span className="task-root-main">
                    <span>{root.label}</span>
                    <span className="muted">
                      {root.kind === "seed" && root.seedType
                        ? getSeedTypeLabel(root.seedType)
                        : getNodeKindLabel(root.kind)}
                    </span>
                  </span>
                  <span className="task-root-tags">
                    {isStartRoot ? <span className="badge">開始</span> : null}
                    {isSelected ? <span className="badge">編集中</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <form className="form" onSubmit={submit}>
        <h4>{getNodeKindLabel(schema.rootKind)} を追加</h4>
        {tree.schemaId === "progressive_inquiry" ? (
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
        <button type="submit" className="secondary">
          {getNodeKindLabel(schema.rootKind)} を追加
        </button>
      </form>
    </section>
  );
};
