import { probePlaybook, getBranchSequence } from "../lib/probe-playbook";
import { getProbeAddPath, getProbeDetailPath } from "../lib/routes";

const getProbeStats = (probeId: (typeof probePlaybook.probes)[number]["id"]) => {
  const probe = probePlaybook.probes.find((item) => item.id === probeId);

  if (!probe) {
    return { branchCount: 0, promptCount: 0, handoffCount: 0 };
  }

  const branches = getBranchSequence(probe);
  const promptCount = branches.reduce((acc, branch) => acc + (probe.branchContent[branch.id]?.prompts.length ?? 0), 0);
  const handoffCount = branches.reduce((acc, branch) => acc + (probe.branchContent[branch.id]?.handoffs?.length ?? 0), 0);

  return {
    branchCount: branches.length,
    promptCount,
    handoffCount,
  };
};

export const ProbeBoardPage = () => {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Probe Board</h1>
          <p className="muted">
            Probe を根にした質問 playbook を一覧で見ます。各 probe から tree 全体と追加画面に進めます。
          </p>
        </div>
        <nav className="nav-links">
          <a href="/">公開ビューへ</a>
          <a href="/admin">管理画面へ</a>
        </nav>
      </header>

      <section className="probe-board-grid">
        {probePlaybook.probes.map((probe) => {
          const stats = getProbeStats(probe.id);

          return (
            <article key={probe.id} className="card probe-board-card stack">
              <div className="row-between">
                <div className="stack">
                  <div className="probe-board-title">
                    <span className="kind">Probe</span>
                    <h3>{probe.label}</h3>
                  </div>
                  <p className="muted">{probe.description}</p>
                </div>
              </div>

              <div className="probe-stat-grid">
                <div className="probe-stat-card">
                  <span className="muted">Branch</span>
                  <strong>{stats.branchCount}</strong>
                </div>
                <div className="probe-stat-card">
                  <span className="muted">Prompt</span>
                  <strong>{stats.promptCount}</strong>
                </div>
                <div className="probe-stat-card">
                  <span className="muted">Handoff</span>
                  <strong>{stats.handoffCount}</strong>
                </div>
              </div>

              <div className="probe-pill-row">
                {getBranchSequence(probe).map((branch) => (
                  <span key={branch.id} className="probe-branch-pill">
                    {branch.label}
                  </span>
                ))}
              </div>

              <div className="row-between">
                <a className="button-link" href={getProbeDetailPath(probe.id)}>
                  ツリーを見る
                </a>
                <a className="button-link secondary-link" href={getProbeAddPath(probe.id)}>
                  質問候補を追加
                </a>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};
