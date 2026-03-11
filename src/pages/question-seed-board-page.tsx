import { getQuestionSeedTemplate, questionSeedTemplates } from "../lib/question-seed-playbook";
import { getQuestionSeedAddPath, getQuestionSeedDetailPath } from "../lib/routes";

export const QuestionSeedBoardPage = () => {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Question Seed Board</h1>
          <p className="muted">
            まずは Question Seed に限定して、状況・予想・実際をコンパクトに取る UI を置く。
          </p>
        </div>
        <nav className="nav-links">
          <a href="/">公開ビューへ</a>
          <a href="/admin">管理画面へ</a>
        </nav>
      </header>

      <section className="probe-board-grid">
        {questionSeedTemplates.map((template) => {
          const fullTemplate = getQuestionSeedTemplate(template.id);

          return (
            <article key={template.id} className="card probe-board-card stack">
              <div className="probe-board-title">
                <span className="kind">Question Seed</span>
                <h3>{template.label}</h3>
              </div>
              <p className="muted">{template.description}</p>

              <div className="probe-pill-row">
                {fullTemplate.slots.map((slot) => (
                  <span key={slot.id} className="probe-branch-pill">
                    {slot.label}
                  </span>
                ))}
              </div>

              <div className="question-seed-goal-card">
                <span className="muted">Goal</span>
                <p>{template.goal}</p>
              </div>

              <div className="row-between">
                <a className="button-link" href={getQuestionSeedDetailPath(template.id)}>
                  全体を見る
                </a>
                <a className="button-link secondary-link" href={getQuestionSeedAddPath(template.id)}>
                  取得画面へ
                </a>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};
