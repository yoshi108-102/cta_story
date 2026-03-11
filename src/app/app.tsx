import { AdminPage } from "../pages/admin-page";
import { ProbeAddPage } from "../pages/probe-add-page";
import { ProbeBoardPage } from "../pages/probe-board-page";
import { ProbeDetailPage } from "../pages/probe-detail-page";
import { QuestionSeedAddPage } from "../pages/question-seed-add-page";
import { QuestionSeedBoardPage } from "../pages/question-seed-board-page";
import { QuestionSeedDetailPage } from "../pages/question-seed-detail-page";
import { PublicPage } from "../pages/public-page";
import { PublicRootPage } from "../pages/public-root-page";
import { parseAppRoute } from "../lib/routes";

export const App = () => {
  const route = parseAppRoute(window.location.pathname);

  if (route.kind === "admin") {
    return <AdminPage />;
  }

  if (route.kind === "question-seed-board") {
    return <QuestionSeedBoardPage />;
  }

  if (route.kind === "question-seed-detail") {
    return <QuestionSeedDetailPage templateId={route.templateId} />;
  }

  if (route.kind === "question-seed-add") {
    return <QuestionSeedAddPage templateId={route.templateId} />;
  }

  if (route.kind === "probe-board") {
    return <ProbeBoardPage />;
  }

  if (route.kind === "probe-detail") {
    return <ProbeDetailPage probeId={route.probeId} />;
  }

  if (route.kind === "probe-add") {
    return <ProbeAddPage probeId={route.probeId} />;
  }

  if (route.kind === "public-root") {
    return <PublicRootPage treeId={route.treeId} rootId={route.rootId} />;
  }

  return <PublicPage />;
};
