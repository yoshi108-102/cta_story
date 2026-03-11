import { QuestionSeedFlowNode } from "../lib/question-seed-playbook";

interface QuestionSeedNodeDetailProps {
  node: QuestionSeedFlowNode | null;
}

const kindLabels = {
  template: "Question Seed",
  slot: "Slot",
} as const;

export const QuestionSeedNodeDetail = ({ node }: QuestionSeedNodeDetailProps) => {
  if (!node) {
    return (
      <div className="card">
        <h3>ノード詳細</h3>
        <p className="muted">フロー内のノードを選択してください。</p>
      </div>
    );
  }

  return (
    <div className="card stack">
      <div className="row-between">
        <h3>ノード詳細</h3>
        <span className="kind">{kindLabels[node.data.kind]}</span>
      </div>
      <div className="focus-node">
        <p className="muted">Title</p>
        <h4>{node.data.title}</h4>
        <p className="muted">Description</p>
        <p className="note">{node.data.description}</p>
        {node.data.hints?.length ? (
          <div className="stack">
            <p className="muted">入れたい要素</p>
            <div className="probe-pill-row">
              {node.data.hints.map((hint) => (
                <span key={hint} className="probe-capture-pill">
                  {hint}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
