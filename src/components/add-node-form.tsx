import { FormEvent, useState } from "react";
import { NodeKind } from "../types/tree";

interface AddNodeFormProps {
  parentId: string;
  onSubmit: (input: { parentId: string; kind: NodeKind; label: string; note: string }) => void;
}

const kinds: NodeKind[] = ["why", "factor", "problem"];

export const AddNodeForm = ({ parentId, onSubmit }: AddNodeFormProps) => {
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<NodeKind>("why");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      parentId,
      kind,
      label,
      note,
    });
    setLabel("");
    setNote("");
    setKind("why");
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h3>子ノードを追加</h3>
      <label>
        種別
        <select value={kind} onChange={(event) => setKind(event.target.value as NodeKind)}>
          {kinds.map((value) => (
            <option key={value} value={value}>
              {value}
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
    </form>
  );
};
