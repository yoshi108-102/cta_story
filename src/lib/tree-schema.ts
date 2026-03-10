import { getNodeKindOption } from "./node-kind";
import { NodeKind, SchemaId } from "../types/tree";

interface TreeSchema {
  id: SchemaId;
  label: string;
  description: string;
  rootKind: NodeKind;
  rootCollectionLabel: string;
  rootHelperText: string;
  availableKinds: NodeKind[];
  allowedChildKinds: Partial<Record<NodeKind, NodeKind[]>>;
}

const treeSchemas: Record<SchemaId, TreeSchema> = {
  cta: {
    id: "cta",
    label: "CTA",
    description: "Task Step から CTA の認知要素を掘り下げるスキーマ。",
    rootKind: "task_step",
    rootCollectionLabel: "Task Diagram",
    rootHelperText: "root Task Step を追加し、開始ルートを選択します。",
    availableKinds: [
      "task_step",
      "cognitive_demand",
      "cue_signal",
      "expert_strategy",
      "novice_error",
    ],
    allowedChildKinds: {
      task_step: ["cognitive_demand"],
      cognitive_demand: ["cue_signal", "expert_strategy", "novice_error"],
    },
  },
  progressive_inquiry: {
    id: "progressive_inquiry",
    label: "Progressive Inquiry",
    description: "Seed から問い・仮説・ミスマッチを育てる探究スキーマ。",
    rootKind: "seed",
    rootCollectionLabel: "Seed Roots",
    rootHelperText: "Question / Idea / Anomaly の seed を追加し、開始 root を選択します。",
    availableKinds: [
      "seed",
      "problem",
      "working_theory",
      "mismatch",
      "evidence",
      "synthesis",
    ],
    allowedChildKinds: {
      seed: ["problem", "working_theory", "mismatch", "evidence", "synthesis"],
      problem: ["working_theory", "evidence", "synthesis"],
      working_theory: ["problem", "mismatch", "evidence", "working_theory"],
      mismatch: ["problem", "working_theory", "evidence"],
    },
  },
};

export const defaultSchemaId: SchemaId = "progressive_inquiry";

export const schemaIds = Object.keys(treeSchemas) as SchemaId[];

export const isSchemaId = (value: unknown): value is SchemaId => {
  return typeof value === "string" && schemaIds.includes(value as SchemaId);
};

export const getTreeSchema = (schemaId: SchemaId): TreeSchema => {
  return treeSchemas[schemaId];
};

export const getRootKind = (schemaId: SchemaId): NodeKind => {
  return treeSchemas[schemaId].rootKind;
};

export const getNodeKindsForSchema = (schemaId: SchemaId): NodeKind[] => {
  return treeSchemas[schemaId].availableKinds;
};

export const getNodeKindOptionsForSchema = (schemaId: SchemaId) => {
  return treeSchemas[schemaId].availableKinds.map((kind) => getNodeKindOption(kind));
};

export const getAllowedChildKinds = (schemaId: SchemaId, parentKind: NodeKind): NodeKind[] => {
  return treeSchemas[schemaId].allowedChildKinds[parentKind] ?? [];
};

export const isChildKindAllowed = (
  schemaId: SchemaId,
  parentKind: NodeKind,
  childKind: NodeKind,
): boolean => {
  return getAllowedChildKinds(schemaId, parentKind).includes(childKind);
};
