import { NodeKind, SeedType, TreeNode } from "../types/tree";

interface NodeKindMeta {
  value: NodeKind;
  label: string;
  description: string;
}

const nodeKindMetaList: NodeKindMeta[] = [
  {
    value: "task_step",
    label: "Task Step",
    description: "作業工程・局面",
  },
  {
    value: "cognitive_demand",
    label: "Cognitive Demand",
    description: "判断が難しいポイント",
  },
  {
    value: "cue_signal",
    label: "Cue / Signal",
    description: "判断に使う兆候・手掛かり",
  },
  {
    value: "expert_strategy",
    label: "Expert Strategy",
    description: "熟練者の戦略・コツ",
  },
  {
    value: "novice_error",
    label: "Novice Error",
    description: "初学者の典型的な誤り",
  },
  {
    value: "seed",
    label: "Seed",
    description: "探究の発火点",
  },
  {
    value: "problem",
    label: "Problem",
    description: "説明したい問い・論点",
  },
  {
    value: "working_theory",
    label: "Working Theory",
    description: "いまの説明・仮説",
  },
  {
    value: "mismatch",
    label: "Mismatch",
    description: "まだ説明できない点",
  },
  {
    value: "evidence",
    label: "Evidence",
    description: "根拠・実行結果・資料",
  },
  {
    value: "synthesis",
    label: "Synthesis",
    description: "改善された説明・暫定合意",
  },
];

const nodeKindValues = nodeKindMetaList.map((item) => item.value);

const legacyKindMap: Record<string, NodeKind> = {
  problem: "task_step",
  why: "cognitive_demand",
  factor: "cue_signal",
};

const seedTypeLabels: Record<SeedType, string> = {
  question: "Question Seed",
  idea: "Idea Seed",
  anomaly: "Anomaly Seed",
};

export const nodeKinds = nodeKindValues;

export const nodeKindOptions = nodeKindMetaList;

export const seedTypes = Object.keys(seedTypeLabels) as SeedType[];

export const isNodeKind = (value: unknown): value is NodeKind => {
  return typeof value === "string" && nodeKindValues.includes(value as NodeKind);
};

export const coerceNodeKind = (value: unknown): NodeKind | null => {
  if (isNodeKind(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  return legacyKindMap[value] ?? null;
};

export const getNodeKindLabel = (kind: NodeKind): string => {
  return nodeKindMetaList.find((item) => item.value === kind)?.label ?? kind;
};

export const getNodeKindDescription = (kind: NodeKind): string => {
  return nodeKindMetaList.find((item) => item.value === kind)?.description ?? "";
};

export const getNodeKindOption = (kind: NodeKind): NodeKindMeta => {
  return (
    nodeKindMetaList.find((item) => item.value === kind) ?? {
      value: kind,
      label: kind,
      description: "",
    }
  );
};

export const isSeedType = (value: unknown): value is SeedType => {
  return typeof value === "string" && seedTypes.includes(value as SeedType);
};

export const coerceSeedType = (value: unknown): SeedType | null => {
  if (!isSeedType(value)) {
    return null;
  }

  return value;
};

export const getSeedTypeLabel = (seedType: SeedType): string => {
  return seedTypeLabels[seedType];
};

export const getTreeNodeKindLabel = (node: TreeNode): string => {
  if (node.kind === "seed" && node.seedType) {
    return getSeedTypeLabel(node.seedType);
  }

  return getNodeKindLabel(node.kind);
};
