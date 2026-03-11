import { useMemo, useState } from "react";
import { getQuestionSeedTemplate, QuestionSeedTemplateId } from "../lib/question-seed-playbook";

interface QuestionSeedComposerProps {
  templateId: QuestionSeedTemplateId;
}

const compact = (value: string): string => value.trim();

export const QuestionSeedComposer = ({ templateId }: QuestionSeedComposerProps) => {
  const template = getQuestionSeedTemplate(templateId);
  const [title, setTitle] = useState("");
  const [material, setMaterial] = useState("");
  const [process, setProcess] = useState("");
  const [condition, setCondition] = useState("");
  const [expectation, setExpectation] = useState("");
  const [actual, setActual] = useState("");
  const [friction, setFriction] = useState("");

  const compactSituation = useMemo(() => {
    const parts = [
      compact(material) ? `材料: ${compact(material)}` : "",
      compact(process) ? `工程: ${compact(process)}` : "",
      compact(condition) ? `条件: ${compact(condition)}` : "",
    ].filter(Boolean);

    return parts.join(" / ");
  }, [condition, material, process]);

  const story = useMemo(() => {
    const pieces = [
      compactSituation ? `${compactSituation} の場面で` : "",
      compact(expectation) ? `${compact(expectation)} になると思っていたが` : "",
      compact(actual) ? `実際は ${compact(actual)}` : "",
    ].filter(Boolean);

    return pieces.join(" ");
  }, [actual, compactSituation, expectation]);

  const preview = useMemo(
    () => ({
      title: compact(title) || "Question Seed candidate",
      situation: {
        material: compact(material),
        process: compact(process),
        condition: compact(condition),
        compact: compactSituation,
      },
      expectation: compact(expectation),
      actual: compact(actual),
      friction: compact(friction),
      story,
    }),
    [actual, compactSituation, condition, expectation, friction, material, process, story, title],
  );

  return (
    <div className="probe-add-grid">
      <section className="card stack">
        <div>
          <h3>{template.label}</h3>
          <p className="muted">{template.goal}</p>
        </div>

        <label>
          タイトル
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例: 材料が固い時に削りが跳ねる"
          />
        </label>

        <label>
          材料 / 対象
          <input
            value={material}
            onChange={(event) => setMaterial(event.target.value)}
            placeholder="例: 固めの丸棒"
          />
        </label>

        <label>
          工程 / タイミング
          <input
            value={process}
            onChange={(event) => setProcess(event.target.value)}
            placeholder="例: 切り返し直前の削り"
          />
        </label>

        <label>
          条件 / 状態
          <textarea
            rows={3}
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
            placeholder="例: いつもより抵抗感が強く、乾いた音がしていた"
          />
        </label>

        <label>
          予想
          <textarea
            rows={3}
            value={expectation}
            onChange={(event) => setExpectation(event.target.value)}
            placeholder="例: このまま均一に削れていくと思っていた"
          />
        </label>

        <label>
          実際
          <textarea
            rows={3}
            value={actual}
            onChange={(event) => setActual(event.target.value)}
            placeholder="例: 表面が跳ねて一部だけ深く削れた"
          />
        </label>

        <label>
          引っかかりメモ
          <textarea
            rows={3}
            value={friction}
            onChange={(event) => setFriction(event.target.value)}
            placeholder="例: なぜこの材料だと手応えが急に変わるのか"
          />
        </label>
      </section>

      <section className="stack">
        <article className="card stack">
          <div className="row-between">
            <h3>Preview</h3>
            <span className="badge">Question Seed</span>
          </div>
          <div className="focus-node">
            <p className="muted">状況</p>
            <p>{compactSituation || "(未入力)"}</p>
            <p className="muted">予想</p>
            <p>{preview.expectation || "(未入力)"}</p>
            <p className="muted">実際</p>
            <p>{preview.actual || "(未入力)"}</p>
            {preview.friction ? (
              <>
                <p className="muted">引っかかり</p>
                <p className="note">{preview.friction}</p>
              </>
            ) : null}
          </div>
          <article className="card stack question-seed-story-card">
            <h4>コンパクトな一文</h4>
            <p>{story || "状況・予想・実際を入れるとここに一文が出ます。"}</p>
          </article>
          <pre className="probe-code-block">{JSON.stringify(preview, null, 2)}</pre>
        </article>

        <article className="card stack">
          <h3>最小で取りたいもの</h3>
          <ul className="probe-existing-list">
            <li>
              <p>状況</p>
              <p className="muted">材料と工程が入っていれば十分。条件は短く補足するだけでよい。</p>
            </li>
            <li>
              <p>予想</p>
              <p className="muted">どうなると思っていたかを一文で書ければ十分。</p>
            </li>
            <li>
              <p>実際</p>
              <p className="muted">実際どうなったか、どこで止まったかを一文で書ければ十分。</p>
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
};
