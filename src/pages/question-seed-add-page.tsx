import { QuestionSeedComposer } from "../components/question-seed-composer";
import { getQuestionSeedTemplate, isQuestionSeedTemplateId } from "../lib/question-seed-playbook";
import { getQuestionSeedBoardPath, getQuestionSeedDetailPath } from "../lib/routes";

interface QuestionSeedAddPageProps {
  templateId: string;
}

export const QuestionSeedAddPage = ({ templateId }: QuestionSeedAddPageProps) => {
  if (!isQuestionSeedTemplateId(templateId)) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <h1>Question Seed が見つかりません</h1>
            <p className="muted">取得画面を開くためのテンプレート ID が無効です。</p>
          </div>
          <nav className="nav-links">
            <a href={getQuestionSeedBoardPath()}>Question Seed Board へ</a>
          </nav>
        </header>
      </div>
    );
  }

  const template = getQuestionSeedTemplate(templateId);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{template.label} 取得画面</h1>
          <p className="muted">
            材料と工程を含む状況、予想、実際を短くそろえて Question Seed 候補を作る。
          </p>
        </div>
        <nav className="nav-links">
          <a href={getQuestionSeedBoardPath()}>Question Seed Board へ</a>
          <a href={getQuestionSeedDetailPath(template.id)}>全体画面へ</a>
        </nav>
      </header>

      <QuestionSeedComposer templateId={template.id} />
    </div>
  );
};
