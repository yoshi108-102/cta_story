const decodePathSegment = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export type AppRoute =
  | { kind: "admin" }
  | { kind: "public-overview" }
  | { kind: "public-root"; treeId: string; rootId: string };

export const parseAppRoute = (pathname: string): AppRoute => {
  if (pathname.startsWith("/admin")) {
    return { kind: "admin" };
  }

  const rootMatch = pathname.match(/^\/tree\/([^/]+)\/root\/([^/]+)\/?$/);
  if (rootMatch) {
    return {
      kind: "public-root",
      treeId: decodePathSegment(rootMatch[1]),
      rootId: decodePathSegment(rootMatch[2]),
    };
  }

  return { kind: "public-overview" };
};

export const getRootDetailPath = (treeId: string, rootId: string): string => {
  return `/tree/${encodeURIComponent(treeId)}/root/${encodeURIComponent(rootId)}`;
};
