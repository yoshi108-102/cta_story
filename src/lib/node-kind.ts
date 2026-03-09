import { NodeKind } from "../types/tree";

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
];

const nodeKindValues = nodeKindMetaList.map((item) => item.value);

const legacyKindMap: Record<string, NodeKind> = {
  problem: "task_step",
  why: "cognitive_demand",
  factor: "cue_signal",
};

export const nodeKinds = nodeKindValues;

export const nodeKindOptions = nodeKindMetaList;

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

export const getAllowedChildKinds = (parentKind: NodeKind): NodeKind[] => {
  switch (parentKind) {
    case "task_step":
      return ["cognitive_demand"];
    case "cognitive_demand":
      return ["cue_signal", "expert_strategy", "novice_error"];
    default:
      return [];
  }
};

export const isChildKindAllowed = (parentKind: NodeKind, childKind: NodeKind): boolean => {
  return getAllowedChildKinds(parentKind).includes(childKind);
};
