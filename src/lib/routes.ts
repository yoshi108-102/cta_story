const decodePathSegment = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export type AppRoute =
  | { kind: "admin" }
  | { kind: "question-seed-board" }
  | { kind: "question-seed-detail"; templateId: string }
  | { kind: "question-seed-add"; templateId: string }
  | { kind: "probe-board" }
  | { kind: "probe-detail"; probeId: string }
  | { kind: "probe-add"; probeId: string }
  | { kind: "public-overview" }
  | { kind: "public-root"; treeId: string; rootId: string };

export const parseAppRoute = (pathname: string): AppRoute => {
  if (pathname.startsWith("/admin")) {
    return { kind: "admin" };
  }

  if (pathname === "/question-seeds" || pathname === "/question-seeds/") {
    return { kind: "question-seed-board" };
  }

  const questionSeedAddMatch = pathname.match(/^\/question-seeds\/([^/]+)\/add\/?$/);
  if (questionSeedAddMatch) {
    return {
      kind: "question-seed-add",
      templateId: decodePathSegment(questionSeedAddMatch[1]),
    };
  }

  const questionSeedMatch = pathname.match(/^\/question-seeds\/([^/]+)\/?$/);
  if (questionSeedMatch) {
    return {
      kind: "question-seed-detail",
      templateId: decodePathSegment(questionSeedMatch[1]),
    };
  }

  if (pathname === "/probes" || pathname === "/probes/") {
    return { kind: "probe-board" };
  }

  const probeAddMatch = pathname.match(/^\/probes\/([^/]+)\/add\/?$/);
  if (probeAddMatch) {
    return {
      kind: "probe-add",
      probeId: decodePathSegment(probeAddMatch[1]),
    };
  }

  const probeMatch = pathname.match(/^\/probes\/([^/]+)\/?$/);
  if (probeMatch) {
    return {
      kind: "probe-detail",
      probeId: decodePathSegment(probeMatch[1]),
    };
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

export const getProbeBoardPath = (): string => "/probes";

export const getProbeDetailPath = (probeId: string): string => {
  return `/probes/${encodeURIComponent(probeId)}`;
};

export const getProbeAddPath = (probeId: string): string => {
  return `/probes/${encodeURIComponent(probeId)}/add`;
};

export const getQuestionSeedBoardPath = (): string => "/question-seeds";

export const getQuestionSeedDetailPath = (templateId: string): string => {
  return `/question-seeds/${encodeURIComponent(templateId)}`;
};

export const getQuestionSeedAddPath = (templateId: string): string => {
  return `/question-seeds/${encodeURIComponent(templateId)}/add`;
};
