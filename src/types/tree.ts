export type SchemaId = "cta" | "progressive_inquiry";

export type SeedType = "question" | "idea" | "anomaly";

export type NodeKind =
  | "task_step"
  | "cognitive_demand"
  | "cue_signal"
  | "expert_strategy"
  | "novice_error"
  | "seed"
  | "problem"
  | "working_theory"
  | "mismatch"
  | "evidence"
  | "synthesis";

export interface TreeNode {
  id: string;
  parentId: string | null;
  kind: NodeKind;
  seedType?: SeedType | null;
  label: string;
  note: string;
  createdAt: string;
}

export interface TreeDraft {
  treeId: string;
  title: string;
  schemaId: SchemaId;
  rootNodeId: string;
  nodes: TreeNode[];
}

export type TreeVersion = "draft" | "published";

export interface EditorUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}
