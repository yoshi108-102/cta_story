import { FormEvent, useState } from "react";
import { TreeNode } from "../types/tree";

interface TaskDiagramPanelProps {
  roots: TreeNode[];
  startRootId: string;
  selectedNodeId: string;
  onSelectStartRoot: (rootNodeId: string) => void;
  onFocusRoot: (rootNodeId: string) => void;
  onAddRoot: (input: { label: string; note: string }) => void;
}

export const TaskDiagramPanel = ({
  roots,
  startRootId,
  selectedNodeId,
  onSelectStartRoot,
  onFocusRoot,
  onAddRoot,
}: TaskDiagramPanelProps) => {
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAddRoot({ label, note });
    setLabel("");
    setNote("");
  };

  return (
    <section className="card stack">
      <div>
        <h3>Task Diagram</h3>
        <p className="muted">ルート Task Step を追加し、開始ルートを選択します。</p>
      </div>

      {roots.length === 0 ? (
        <p className="error">root Task Step がありません。まず1件追加してください。</p>
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
                  <span>{root.label}</span>
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
        <h4>Task Step を追加</h4>
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
          Task Step を追加
        </button>
      </form>
    </section>
  );
};
