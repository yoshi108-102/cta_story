import { ProbePromptComposer } from "../components/probe-prompt-composer";
import { getProbeDefinition, isProbeId } from "../lib/probe-playbook";
import { getProbeBoardPath, getProbeDetailPath } from "../lib/routes";

interface ProbeAddPageProps {
  probeId: string;
}

export const ProbeAddPage = ({ probeId }: ProbeAddPageProps) => {
  if (!isProbeId(probeId)) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <h1>Probe が見つかりません</h1>
            <p className="muted">追加画面を開くための Probe ID が無効です。</p>
          </div>
          <nav className="nav-links">
            <a href={getProbeBoardPath()}>Probe Board へ</a>
          </nav>
        </header>
      </div>
    );
  }

  const probe = getProbeDefinition(probeId);
  const params = new URLSearchParams(window.location.search);
  const branchId = params.get("branch");

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{probe.label} 追加画面</h1>
          <p className="muted">
            probe ごとの branch を見ながら、質問候補を作ります。現時点では playbook 定義の preview までです。
          </p>
        </div>
        <nav className="nav-links">
          <a href={getProbeBoardPath()}>Probe Board へ</a>
          <a href={getProbeDetailPath(probeId)}>ツリーへ戻る</a>
        </nav>
      </header>

      <ProbePromptComposer probeId={probeId} initialBranchId={branchId} />
    </div>
  );
};
