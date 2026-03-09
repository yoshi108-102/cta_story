import { NodeKind, TreeDraft, TreeNode } from "../types/tree";
import {
  coerceNodeKind,
  getAllowedChildKinds,
  isChildKindAllowed,
  isNodeKind,
  nodeKinds,
} from "./node-kind";

const NODE_LABEL_MAX = 120;
const NODE_NOTE_MAX = 1000;

export interface AddNodeInput {
  parentId: string;
  kind: NodeKind;
  label: string;
  note: string;
}

export interface UpdateNodeInput {
  nodeId: string;
  kind: NodeKind;
  label: string;
  note: string;
}

export const createSeedTree = (treeId: string): TreeDraft => {
  const now = new Date().toISOString();

  return {
    treeId,
    title: "丸棒矯正 CTA",
    rootNodeId: "n-root",
    nodes: [
      {
        id: "n-root",
        parentId: null,
        kind: "task_step",
        label: "矯正前確認",
        note: "Task Diagram: Step 1",
        createdAt: now,
      },
      {
        id: "n-101",
        parentId: "n-root",
        kind: "cognitive_demand",
        label: "曲がりの異常兆候を早期検知する必要がある",
        note: "見逃すと後工程で不良化する",
        createdAt: now,
      },
      {
        id: "n-102",
        parentId: null,
        kind: "cognitive_demand",
        label: "入口材曲がり評価が担当者依存になっている",
        note: "未接続サンプル。root配下へ接続可能",
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

const validateParentChildKind = (parent: TreeNode, childKind: NodeKind): void => {
  if (!isChildKindAllowed(parent.kind, childKind)) {
    throw new Error("CTAフォーマット上、この親ノードにその種別は接続できません。");
  }
};

export const addNode = (tree: TreeDraft, input: AddNodeInput): TreeDraft => {
  const parent = getNodeById(tree, input.parentId);
  if (!parent) {
    throw new Error("Parent node was not found.");
  }

  if (!isNodeKind(input.kind)) {
    throw new Error("Node kind is invalid.");
  }

  validateParentChildKind(parent, input.kind);

  const label = sanitizeText(input.label, NODE_LABEL_MAX);
  const note = sanitizeText(input.note, NODE_NOTE_MAX);

  if (!label) {
    throw new Error("Label is required.");
  }

  const newNode: TreeNode = {
    id: toNodeId(),
    parentId: input.parentId,
    kind: input.kind,
    label,
    note,
    createdAt: new Date().toISOString(),
  };

  return {
    ...tree,
    nodes: [...tree.nodes, newNode],
  };
};

export const updateNode = (tree: TreeDraft, input: UpdateNodeInput): TreeDraft => {
  const target = getNodeById(tree, input.nodeId);
  if (!target) {
    throw new Error("Node was not found.");
  }

  if (!isNodeKind(input.kind)) {
    throw new Error("Node kind is invalid.");
  }

  if (target.id === tree.rootNodeId && input.kind !== "task_step") {
    throw new Error("Root node must be task_step.");
  }

  const parent = target.parentId ? getNodeById(tree, target.parentId) : null;
  if (parent) {
    validateParentChildKind(parent, input.kind);
  }

  const children = tree.nodes.filter((node) => node.parentId === target.id);
  const invalidChild = children.find((node) => !isChildKindAllowed(input.kind, node.kind));
  if (invalidChild) {
    throw new Error("この種別に変更すると、既存の子ノード関係がCTAフォーマットに違反します。");
  }

  const label = sanitizeText(input.label, NODE_LABEL_MAX);
  const note = sanitizeText(input.note, NODE_NOTE_MAX);

  if (!label) {
    throw new Error("Label is required.");
  }

  return {
    ...tree,
    nodes: tree.nodes.map((node) => {
      if (node.id !== input.nodeId) {
        return node;
      }

      return {
        ...node,
        kind: input.kind,
        label,
        note,
      };
    }),
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

  validateParentChildKind(parent, target.kind);

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

export const getAddableKinds = (tree: TreeDraft, parentNodeId: string): NodeKind[] => {
  const parent = getNodeById(tree, parentNodeId);
  if (!parent) {
    return [];
  }

  return getAllowedChildKinds(parent.kind);
};

export const getEditableKinds = (tree: TreeDraft, nodeId: string): NodeKind[] => {
  const node = getNodeById(tree, nodeId);
  if (!node) {
    return [];
  }

  const parent = node.parentId ? getNodeById(tree, node.parentId) : null;
  const children = tree.nodes.filter((item) => item.parentId === node.id);

  return nodeKinds.filter((candidate) => {
    if (node.id === tree.rootNodeId && candidate !== "task_step") {
      return false;
    }

    if (parent && !isChildKindAllowed(parent.kind, candidate)) {
      return false;
    }

    return children.every((child) => isChildKindAllowed(candidate, child.kind));
  });
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

export const parseTreeDraft = (value: unknown): TreeDraft | null => {
  if (isTreeDraft(value)) {
    return value;
  }

  if (typeof value !== "object" || value === null) {
    return null;
  }

  const tree = value as Record<string, unknown>;
  if (
    typeof tree.treeId !== "string" ||
    typeof tree.title !== "string" ||
    typeof tree.rootNodeId !== "string" ||
    !Array.isArray(tree.nodes)
  ) {
    return null;
  }

  const nodes: TreeNode[] = [];
  for (const item of tree.nodes) {
    if (typeof item !== "object" || item === null) {
      return null;
    }

    const node = item as Record<string, unknown>;
    const kind = coerceNodeKind(node.kind);

    if (
      typeof node.id !== "string" ||
      (typeof node.parentId !== "string" && node.parentId !== null) ||
      !kind ||
      typeof node.label !== "string" ||
      typeof node.note !== "string" ||
      typeof node.createdAt !== "string"
    ) {
      return null;
    }

    nodes.push({
      id: node.id,
      parentId: node.parentId,
      kind,
      label: node.label,
      note: node.note,
      createdAt: node.createdAt,
    });
  }

  if (!nodes.some((node) => node.id === tree.rootNodeId)) {
    return null;
  }

  return {
    treeId: tree.treeId,
    title: tree.title,
    rootNodeId: tree.rootNodeId,
    nodes,
  };
};
