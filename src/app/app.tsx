import { AdminPage } from "../pages/admin-page";
import { PublicPage } from "../pages/public-page";
import { PublicRootPage } from "../pages/public-root-page";
import { parseAppRoute } from "../lib/routes";

export const App = () => {
  const route = parseAppRoute(window.location.pathname);

  if (route.kind === "admin") {
    return <AdminPage />;
  }

  if (route.kind === "public-root") {
    return <PublicRootPage treeId={route.treeId} rootId={route.rootId} />;
  }

  return <PublicPage />;
};
