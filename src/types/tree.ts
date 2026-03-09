export type NodeKind = "problem" | "why" | "factor";

export interface TreeNode {
  id: string;
  parentId: string | null;
  kind: NodeKind;
  label: string;
  note: string;
  createdAt: string;
}

export interface TreeDraft {
  treeId: string;
  title: string;
  rootNodeId: string;
  nodes: TreeNode[];
}

export type TreeVersion = "draft" | "published";

export interface EditorUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}
