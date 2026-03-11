import { useMemo, useState } from "react";
import {
  captureSlotLabels,
  getBranchSequence,
  getProbeBranchContent,
  getProbeDefinition,
} from "../lib/probe-playbook";
import { CaptureSlot, ProbeBranchId, ProbeId, ProbePromptDefinition, ProbeHandoff } from "../types/probe-playbook";

interface ProbePromptComposerProps {
  probeId: ProbeId;
  initialBranchId?: string | null;
}

const captureSlots = Object.keys(captureSlotLabels) as CaptureSlot[];

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);
};

export const ProbePromptComposer = ({ probeId, initialBranchId }: ProbePromptComposerProps) => {
  const probe = getProbeDefinition(probeId);
  const branchSequence = getBranchSequence(probe);
  const defaultBranchId =
    branchSequence.find((branch) => branch.id === initialBranchId)?.id ?? branchSequence[0]?.id ?? "identify";

  const [branchId, setBranchId] = useState<ProbeBranchId>(defaultBranchId);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [captures, setCaptures] = useState<CaptureSlot[]>(["situation"]);

  const branch = getProbeBranchContent(probeId, branchId);

  const previewId = useMemo(() => {
    const slug = slugify(text);
    return `${probeId}_${branchId}_${slug || "new_prompt"}`;
  }, [branchId, probeId, text]);

  const previewObject = useMemo(
    () => ({
      id: previewId,
      text: text || "質問文を入力するとここに preview が出ます。",
      captures,
      ...(note.trim() ? { note: note.trim() } : {}),
    }),
    [captures, note, previewId, text],
  );

  const toggleCapture = (slot: CaptureSlot) => {
    setCaptures((prev) => {
      if (prev.includes(slot)) {
        return prev.length === 1 ? prev : prev.filter((item) => item !== slot);
      }

      return [...prev, slot];
    });
  };

  return (
    <div className="probe-add-grid">
      <section className="card stack">
        <div>
          <h3>質問候補を追加</h3>
          <p className="muted">
            ここでは保存せず、branch ごとの質問候補を作りながら preview を確認します。
          </p>
        </div>

        <label>
          Branch
          <select value={branchId} onChange={(event) => setBranchId(event.target.value as ProbeBranchId)}>
            {branchSequence.map((branchOption) => (
              <option key={branchOption.id} value={branchOption.id}>
                {branchOption.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          質問文
          <textarea
            rows={4}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="例: その材料なら、最初はどんな手応えになると思っていたか"
          />
        </label>

        <label>
          補足メモ
          <textarea
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="狙い、想定文脈、似た質問との違いなど"
          />
        </label>

        <div className="stack">
          <p>Captures</p>
          <div className="probe-checkbox-grid">
            {captureSlots.map((slot) => (
              <label key={slot} className="probe-checkbox-card">
                <input
                  type="checkbox"
                  checked={captures.includes(slot)}
                  onChange={() => toggleCapture(slot)}
                />
                <span>{captureSlotLabels[slot]}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="stack">
        <article className="card stack">
          <div className="row-between">
            <h3>Preview</h3>
            <span className="badge">{branchSequence.find((branchOption) => branchOption.id === branchId)?.label}</span>
          </div>
          <div className="focus-node">
            <p className="muted">Probe</p>
            <p>{probe.label}</p>
            <p className="muted">Prompt ID</p>
            <p>{previewId}</p>
            <p className="muted">Prompt</p>
            <p>{previewObject.text}</p>
            <p className="muted">Captures</p>
            <div className="probe-pill-row">
              {captures.map((capture) => (
                <span key={capture} className="probe-capture-pill">
                  {captureSlotLabels[capture]}
                </span>
              ))}
            </div>
            {note.trim() ? (
              <>
                <p className="muted">Note</p>
                <p className="note">{note.trim()}</p>
              </>
            ) : null}
          </div>
          <pre className="probe-code-block">{JSON.stringify(previewObject, null, 2)}</pre>
        </article>

        <article className="card stack">
          <h3>この Branch にある既存 prompt</h3>
          {branch?.prompts.length ? (
            <ul className="probe-existing-list">
              {branch.prompts.map((promptItem: ProbePromptDefinition) => (
                <li key={promptItem.id}>
                  <p>{promptItem.text}</p>
                  <div className="probe-pill-row">
                    {promptItem.captures.map((capture: CaptureSlot) => (
                      <span key={capture} className="probe-capture-pill">
                        {captureSlotLabels[capture]}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">この Branch にはまだ prompt がありません。</p>
          )}
          {branch?.handoffs?.length ? (
            <div className="stack">
                <h4>既存 handoff</h4>
                <ul className="probe-existing-list">
                  {branch.handoffs.map((handoffItem: ProbeHandoff) => (
                    <li key={`${handoffItem.kind}-${handoffItem.label}`}>
                      <p>{handoffItem.label}</p>
                      <p className="muted">{handoffItem.condition ?? handoffItem.targetProbeId ?? handoffItem.kind}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
        </article>
      </section>
    </div>
  );
};
