import { useEffect, useMemo, useState } from "react";
import { QuestionSeedFlow } from "../components/question-seed-flow";
import { QuestionSeedNodeDetail } from "../components/question-seed-node-detail";
import {
  buildQuestionSeedFlowGraph,
  getQuestionSeedTemplate,
  isQuestionSeedTemplateId,
} from "../lib/question-seed-playbook";
import { getQuestionSeedAddPath, getQuestionSeedBoardPath } from "../lib/routes";

interface QuestionSeedDetailPageProps {
  templateId: string;
}

export const QuestionSeedDetailPage = ({ templateId }: QuestionSeedDetailPageProps) => {
  if (!isQuestionSeedTemplateId(templateId)) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <h1>Question Seed が見つかりません</h1>
            <p className="muted">指定されたテンプレートは存在しません。</p>
          </div>
          <nav className="nav-links">
            <a href={getQuestionSeedBoardPath()}>Question Seed Board へ</a>
          </nav>
        </header>
      </div>
    );
  }

  const template = getQuestionSeedTemplate(templateId);
  const graph = useMemo(() => buildQuestionSeedFlowGraph(templateId), [templateId]);
  const [selectedNodeId, setSelectedNodeId] = useState(`template:${templateId}`);

  useEffect(() => {
    setSelectedNodeId(`template:${templateId}`);
  }, [templateId]);

  const selectedNode = graph.nodes.find((node) => node.id === selectedNodeId) ?? graph.nodes[0] ?? null;

  return (
    <div className="page page-wide">
      <header className="page-header tree-focus-header">
        <div>
          <h1>{template.label}</h1>
          <p className="muted">{template.goal}</p>
          <div className="probe-pill-row">
            {template.slots.map((slot) => (
              <span key={slot.id} className="probe-branch-pill">
                {slot.label}
              </span>
            ))}
          </div>
        </div>
        <nav className="nav-links">
          <a href={getQuestionSeedBoardPath()}>Question Seed Board へ</a>
          <a href={getQuestionSeedAddPath(template.id)}>取得画面へ</a>
          <a href="/">公開ビューへ</a>
        </nav>
      </header>

      <main className="probe-viewer-grid">
        <section className="tree-focus-stage">
          <QuestionSeedFlow templateId={template.id} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />
        </section>
        <div className="stack">
          <QuestionSeedNodeDetail node={selectedNode} />
          <section className="card stack">
            <h3>この画面で見たいこと</h3>
            <ul className="probe-existing-list">
              <li>
                <p>状況</p>
                <p className="muted">材料と工程が固定できればよい。条件は短く付く程度でよい。</p>
              </li>
              <li>
                <p>予想</p>
                <p className="muted">どうなると思っていたかを一文で持つ。</p>
              </li>
              <li>
                <p>実際</p>
                <p className="muted">実際どうなったか、どこで引っかかったかを一文で持つ。</p>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};
