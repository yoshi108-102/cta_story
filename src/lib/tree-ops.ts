import { NodeKind, TreeDraft, TreeNode } from "../types/tree";

const NODE_LABEL_MAX = 120;
const NODE_NOTE_MAX = 1000;

const validKinds: NodeKind[] = ["problem", "why", "factor"];

export interface AddNodeInput {
  parentId: string;
  kind: NodeKind;
  label: string;
  note: string;
}

export const createSeedTree = (treeId: string): TreeDraft => {
  const now = new Date().toISOString();

  return {
    treeId,
    title: "丸棒矯正 なぜなぜ問答",
    rootNodeId: "n-root",
    nodes: [
      {
        id: "n-root",
        parentId: null,
        kind: "problem",
        label: "矯正後の丸棒で真直度 NG が発生した",
        note: "起点ノード",
        createdAt: now,
      },
      {
        id: "n-101",
        parentId: "n-root",
        kind: "why",
        label: "入側材の曲がり把握が不足していた",
        note: "測定タイミングが遅れた",
        createdAt: now,
      },
      {
        id: "n-102",
        parentId: null,
        kind: "why",
        label: "未接続ノード",
        note: "エッジ追加で接続する",
        createdAt: now,
      },
    ],
  };
};

const toNodeId = (): string => {
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const sanitizeText = (value: string, maxLength: number): string => {
  return value.trim().slice(0, maxLength);
};

const getNodeById = (tree: TreeDraft, nodeId: string): TreeNode | undefined => {
  return tree.nodes.find((node) => node.id === nodeId);
};

const hasCycle = (tree: TreeDraft, parentId: string, targetId: string): boolean => {
  let currentId: string | null = parentId;

  while (currentId) {
    if (currentId === targetId) {
      return true;
    }
    currentId = getNodeById(tree, currentId)?.parentId ?? null;
  }

  return false;
};

export const addNode = (tree: TreeDraft, input: AddNodeInput): TreeDraft => {
  const parent = getNodeById(tree, input.parentId);
  if (!parent) {
    throw new Error("Parent node was not found.");
  }

  const label = sanitizeText(input.label, NODE_LABEL_MAX);
  const note = sanitizeText(input.note, NODE_NOTE_MAX);

  if (!label) {
    throw new Error("Label is required.");
  }

  const newNode: TreeNode = {
    id: toNodeId(),
    parentId: input.parentId,
    kind: validKinds.includes(input.kind) ? input.kind : "why",
    label,
    note,
    createdAt: new Date().toISOString(),
  };

  return {
    ...tree,
    nodes: [...tree.nodes, newNode],
  };
};

export const attachExistingNode = (
  tree: TreeDraft,
  parentId: string,
  targetNodeId: string,
): TreeDraft => {
  if (parentId === targetNodeId) {
    throw new Error("source and target cannot be the same node.");
  }

  const parent = getNodeById(tree, parentId);
  const target = getNodeById(tree, targetNodeId);

  if (!parent || !target) {
    throw new Error("Node was not found.");
  }

  if (target.id === tree.rootNodeId) {
    throw new Error("Root node cannot be attached.");
  }

  if (target.parentId) {
    throw new Error("Target node is already attached.");
  }

  if (hasCycle(tree, parentId, targetNodeId)) {
    throw new Error("This operation creates a cycle.");
  }

  return {
    ...tree,
    nodes: tree.nodes.map((node) => {
      if (node.id !== targetNodeId) {
        return node;
      }
      return {
        ...node,
        parentId,
      };
    }),
  };
};

export const getChildren = (tree: TreeDraft, parentId: string): TreeNode[] => {
  return tree.nodes
    .filter((node) => node.parentId === parentId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

export const getUnattachedNodes = (tree: TreeDraft): TreeNode[] => {
  return tree.nodes
    .filter((node) => node.parentId === null && node.id !== tree.rootNodeId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

export const getAncestors = (tree: TreeDraft, nodeId: string): TreeNode[] => {
  const ancestors: TreeNode[] = [];
  let current = getNodeById(tree, nodeId);

  while (current?.parentId) {
    const parent = getNodeById(tree, current.parentId);
    if (!parent) {
      break;
    }
    ancestors.unshift(parent);
    current = parent;
  }

  return ancestors;
};

export const getNode = (tree: TreeDraft, nodeId: string): TreeNode | undefined => {
  return getNodeById(tree, nodeId);
};

const isNodeKind = (value: unknown): value is NodeKind => {
  return typeof value === "string" && validKinds.includes(value as NodeKind);
};

const isTreeNode = (value: unknown): value is TreeNode => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const node = value as Record<string, unknown>;
  return (
    typeof node.id === "string" &&
    (typeof node.parentId === "string" || node.parentId === null) &&
    isNodeKind(node.kind) &&
    typeof node.label === "string" &&
    typeof node.note === "string" &&
    typeof node.createdAt === "string"
  );
};

export const isTreeDraft = (value: unknown): value is TreeDraft => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const tree = value as Record<string, unknown>;

  return (
    typeof tree.treeId === "string" &&
    typeof tree.title === "string" &&
    typeof tree.rootNodeId === "string" &&
    Array.isArray(tree.nodes) &&
    tree.nodes.every((node) => isTreeNode(node))
  );
};
