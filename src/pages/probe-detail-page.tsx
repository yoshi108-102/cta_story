import { useEffect, useMemo, useState } from "react";
import { ProbeNodeDetail } from "../components/probe-node-detail";
import { ProbePlaybookFlow } from "../components/probe-playbook-flow";
import { buildProbeFlowGraph } from "../lib/probe-playbook-flow";
import { getBranchSequence, getProbeDefinition, isProbeId, probePlaybook } from "../lib/probe-playbook";
import { getProbeAddPath, getProbeBoardPath } from "../lib/routes";

interface ProbeDetailPageProps {
  probeId: string;
}

export const ProbeDetailPage = ({ probeId }: ProbeDetailPageProps) => {
  if (!isProbeId(probeId)) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <h1>Probe が見つかりません</h1>
            <p className="muted">指定された Probe ID は playbook に存在しません。</p>
          </div>
          <nav className="nav-links">
            <a href={getProbeBoardPath()}>Probe Board へ</a>
          </nav>
        </header>
      </div>
    );
  }

  const probe = getProbeDefinition(probeId);
  const graph = useMemo(() => buildProbeFlowGraph(probePlaybook, probeId), [probeId]);
  const [selectedNodeId, setSelectedNodeId] = useState(`probe:${probeId}`);

  useEffect(() => {
    setSelectedNodeId(`probe:${probeId}`);
  }, [probeId]);

  const selectedNode = graph.nodes.find((node) => node.id === selectedNodeId) ?? graph.nodes[0] ?? null;
  const promptCount = getBranchSequence(probe).reduce(
    (acc, branch) => acc + (probe.branchContent[branch.id]?.prompts.length ?? 0),
    0,
  );
  const selectedBranchId = selectedNode?.data.branchId;
  const addHref = selectedBranchId
    ? `${getProbeAddPath(probeId)}?branch=${encodeURIComponent(selectedBranchId)}`
    : getProbeAddPath(probeId);

  return (
    <div className="page page-wide">
      <header className="page-header tree-focus-header">
        <div>
          <h1>{probe.label}</h1>
          <p className="muted">{probe.description}</p>
          <div className="probe-pill-row">
            <span className="badge">{getBranchSequence(probe).length} branches</span>
            <span className="badge">{promptCount} prompts</span>
          </div>
        </div>
        <nav className="nav-links">
          <a href={getProbeBoardPath()}>Probe Board へ</a>
          <a href={addHref}>追加画面へ</a>
          <a href="/">公開ビューへ</a>
        </nav>
      </header>

      <main className="probe-viewer-grid">
        <section className="tree-focus-stage">
          <ProbePlaybookFlow probeId={probeId} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />
        </section>
        <div className="stack">
          <ProbeNodeDetail node={selectedNode} />
          <section className="card stack">
            <h3>Branch 一覧</h3>
            <div className="probe-existing-list">
              {getBranchSequence(probe).map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  className="transition-button"
                  onClick={() => setSelectedNodeId(`branch:${probeId}:${branch.id}`)}
                >
                  <span className="kind">{branch.label}</span>
                  <span>{branch.description}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
