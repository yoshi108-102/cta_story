import { AdminPage } from "../pages/admin-page";
import { PublicPage } from "../pages/public-page";

const currentPath = window.location.pathname;

export const App = () => {
  if (currentPath.startsWith("/admin")) {
    return <AdminPage />;
  }

  return <PublicPage />;
};
