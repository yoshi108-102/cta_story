import { getBranchNodeLabel, ProbeFlowNode } from "../lib/probe-playbook-flow";
import { getProbeDefinition } from "../lib/probe-playbook";

interface ProbeNodeDetailProps {
  node: ProbeFlowNode | null;
}

const kindLabels = {
  probe: "Probe",
  branch: "Branch",
  prompt: "Prompt",
  handoff: "Handoff",
} as const;

export const ProbeNodeDetail = ({ node }: ProbeNodeDetailProps) => {
  if (!node) {
    return (
      <div className="card">
        <h3>ノード詳細</h3>
        <p className="muted">フロー内のノードを選択してください。</p>
      </div>
    );
  }

  const probe = getProbeDefinition(node.data.probeId);
  const branchLabel = node.data.branchId ? getBranchNodeLabel(node.data.branchId) : null;

  return (
    <div className="card stack">
      <div className="row-between">
        <h3>ノード詳細</h3>
        <span className="kind">{kindLabels[node.data.kind]}</span>
      </div>
      <div className="focus-node">
        <p className="muted">Probe</p>
        <h4>{probe.label}</h4>
        {branchLabel ? (
          <>
            <p className="muted">Branch</p>
            <p>{branchLabel}</p>
          </>
        ) : null}
        <p className="muted">Title</p>
        <p>{node.data.title}</p>
        {node.data.description ? (
          <>
            <p className="muted">Description</p>
            <p className="note">{node.data.description}</p>
          </>
        ) : null}
        {node.data.captures?.length ? (
          <div className="stack">
            <p className="muted">Captures</p>
            <div className="probe-pill-row">
              {node.data.captures.map((capture) => (
                <span key={capture} className="probe-capture-pill">
                  {capture}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
