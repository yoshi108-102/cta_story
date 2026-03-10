import { NodeKind, SchemaId, SeedType, TreeDraft, TreeNode } from "../types/tree";
import { coerceNodeKind, coerceSeedType, isNodeKind } from "./node-kind";
import {
  defaultSchemaId,
  getAllowedChildKinds,
  getNodeKindsForSchema,
  getRootKind,
  isChildKindAllowed,
  isSchemaId,
} from "./tree-schema";

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
  seedType?: SeedType | null;
}

export interface AddRootNodeInput {
  label: string;
  note: string;
  seedType?: SeedType | null;
}

const createCtaTree = (treeId: string): TreeDraft => {
  const now = new Date().toISOString();

  return {
    treeId,
    title: "丸棒矯正 CTA",
    schemaId: "cta",
    rootNodeId: "n-root",
    nodes: [
      {
        id: "n-root",
        parentId: null,
        kind: "task_step",
        seedType: null,
        label: "矯正前確認",
        note: "Task Diagram: Step 1",
        createdAt: now,
      },
      {
        id: "n-root-2",
        parentId: null,
        kind: "task_step",
        seedType: null,
        label: "矯正条件設定",
        note: "Task Diagram: Step 2",
        createdAt: now,
      },
      {
        id: "n-101",
        parentId: "n-root",
        kind: "cognitive_demand",
        seedType: null,
        label: "曲がりの異常兆候を早期検知する必要がある",
        note: "見逃すと後工程で不良化する",
        createdAt: now,
      },
    ],
  };
};

const createInquiryTree = (treeId: string): TreeDraft => {
  const now = new Date().toISOString();

  return {
    treeId,
    title: "コード説明探究",
    schemaId: "progressive_inquiry",
    rootNodeId: "n-root",
    nodes: [
      {
        id: "n-root",
        parentId: null,
        kind: "seed",
        seedType: "question",
        label: "なぜこのループは最後の要素を処理しないのか",
        note: "Question Seed",
        createdAt: now,
      },
      {
        id: "n-101",
        parentId: "n-root",
        kind: "problem",
        seedType: null,
        label: "どの条件が最後の要素を落としているのか",
        note: "説明したい論点を明確にする。",
        createdAt: now,
      },
      {
        id: "n-102",
        parentId: "n-root",
        kind: "working_theory",
        seedType: null,
        label: "境界条件が length - 1 になっているから",
        note: "まずの説明を仮置きする。",
        createdAt: now,
      },
      {
        id: "n-103",
        parentId: "n-102",
        kind: "mismatch",
        seedType: null,
        label: "empty array と break 条件の説明がまだ抜けている",
        note: "この theory がまだ説明できない点。",
        createdAt: now,
      },
      {
        id: "n-104",
        parentId: "n-103",
        kind: "evidence",
        seedType: null,
        label: "実行トレースで条件式の真偽を確認する",
        note: "i と arr.length の変化を追う。",
        createdAt: now,
      },
    ],
  };
};

export const createDefaultTree = (
  treeId: string,
  schemaId: SchemaId = defaultSchemaId,
): TreeDraft => {
  if (schemaId === "cta") {
    return createCtaTree(treeId);
  }

  return createInquiryTree(treeId);
};

const toNodeId = (): string => {
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const sanitizeText = (value: string, maxLength: number): string => {
  return value.trim().slice(0, maxLength);
};

const normalizeSeedType = (kind: NodeKind, seedType: SeedType | null | undefined): SeedType | null => {
  if (kind !== "seed") {
    return null;
  }

  return seedType ?? "question";
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

const validateParentChildKind = (tree: TreeDraft, parent: TreeNode, childKind: NodeKind): void => {
  if (!isChildKindAllowed(tree.schemaId, parent.kind, childKind)) {
    throw new Error("このスキーマでは、その親ノードにその種別は接続できません。");
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

  if (input.kind === getRootKind(tree.schemaId)) {
    throw new Error("root 種別は root 追加フォームからのみ作成できます。");
  }

  validateParentChildKind(tree, parent, input.kind);

  const label = sanitizeText(input.label, NODE_LABEL_MAX);
  const note = sanitizeText(input.note, NODE_NOTE_MAX);

  if (!label) {
    throw new Error("Label is required.");
  }

  const newNode: TreeNode = {
    id: toNodeId(),
    parentId: input.parentId,
    kind: input.kind,
    seedType: null,
    label,
    note,
    createdAt: new Date().toISOString(),
  };

  return {
    ...tree,
    nodes: [...tree.nodes, newNode],
  };
};

export const addRootNode = (tree: TreeDraft, input: AddRootNodeInput): TreeDraft => {
  const label = sanitizeText(input.label, NODE_LABEL_MAX);
  const note = sanitizeText(input.note, NODE_NOTE_MAX);

  if (!label) {
    throw new Error("Label is required.");
  }

  const rootKind = getRootKind(tree.schemaId);
  const newNode: TreeNode = {
    id: toNodeId(),
    parentId: null,
    kind: rootKind,
    seedType: normalizeSeedType(rootKind, input.seedType),
    label,
    note,
    createdAt: new Date().toISOString(),
  };

  return {
    ...tree,
    rootNodeId: tree.rootNodeId || newNode.id,
    nodes: [...tree.nodes, newNode],
  };
};

export const setStartRootNode = (tree: TreeDraft, rootNodeId: string): TreeDraft => {
  const node = getNodeById(tree, rootNodeId);
  if (!node) {
    throw new Error("Root node was not found.");
  }

  const rootKind = getRootKind(tree.schemaId);
  if (node.parentId !== null || node.kind !== rootKind) {
    throw new Error("開始ノードには root ノードを指定してください。");
  }

  return {
    ...tree,
    rootNodeId,
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

  const rootKind = getRootKind(tree.schemaId);
  const isRootNode = target.parentId === null && target.kind === rootKind;

  if (isRootNode && input.kind !== rootKind) {
    throw new Error("root ノードは種別変更できません。");
  }

  if (target.parentId !== null && input.kind === rootKind) {
    throw new Error("root 種別は親を持てません。");
  }

  const parent = target.parentId ? getNodeById(tree, target.parentId) : null;
  if (parent) {
    validateParentChildKind(tree, parent, input.kind);
  }

  const children = tree.nodes.filter((node) => node.parentId === target.id);
  const invalidChild = children.find((node) => !isChildKindAllowed(tree.schemaId, input.kind, node.kind));
  if (invalidChild) {
    throw new Error("この種別に変更すると、既存の子ノード関係がスキーマに違反します。");
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
        seedType: normalizeSeedType(input.kind, input.seedType ?? node.seedType ?? null),
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

  if (target.parentId === null && target.kind === getRootKind(tree.schemaId)) {
    throw new Error("root ノードは接続先として変更できません。");
  }

  if (target.parentId) {
    throw new Error("Target node is already attached.");
  }

  if (hasCycle(tree, parentId, targetNodeId)) {
    throw new Error("This operation creates a cycle.");
  }

  validateParentChildKind(tree, parent, target.kind);

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
  const rootKind = getRootKind(tree.schemaId);

  return tree.nodes
    .filter((node) => node.parentId === null && node.kind !== rootKind)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

export const getRootNodes = (tree: TreeDraft): TreeNode[] => {
  const rootKind = getRootKind(tree.schemaId);

  return tree.nodes
    .filter((node) => node.parentId === null && node.kind === rootKind)
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

  return getAllowedChildKinds(tree.schemaId, parent.kind);
};

export const getEditableKinds = (tree: TreeDraft, nodeId: string): NodeKind[] => {
  const node = getNodeById(tree, nodeId);
  if (!node) {
    return [];
  }

  const parent = node.parentId ? getNodeById(tree, node.parentId) : null;
  const children = tree.nodes.filter((item) => item.parentId === node.id);
  const rootKind = getRootKind(tree.schemaId);
  const isRootNode = node.parentId === null && node.kind === rootKind;

  return getNodeKindsForSchema(tree.schemaId).filter((candidate) => {
    if (isRootNode && candidate !== rootKind) {
      return false;
    }

    if (!isRootNode && candidate === rootKind) {
      return false;
    }

    if (parent && !isChildKindAllowed(tree.schemaId, parent.kind, candidate)) {
      return false;
    }

    return children.every((child) => isChildKindAllowed(tree.schemaId, candidate, child.kind));
  });
};

const isTreeNode = (value: unknown): value is TreeNode => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const node = value as Record<string, unknown>;
  const seedType = coerceSeedType(node.seedType);

  return (
    typeof node.id === "string" &&
    (typeof node.parentId === "string" || node.parentId === null) &&
    isNodeKind(node.kind) &&
    (seedType !== null || node.seedType === null || node.seedType === undefined) &&
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
    isSchemaId(tree.schemaId) &&
    typeof tree.rootNodeId === "string" &&
    Array.isArray(tree.nodes) &&
    tree.nodes.every((node) => isTreeNode(node))
  );
};

export const parseTreeDraft = (value: unknown): TreeDraft | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const tree = value as Record<string, unknown>;
  const schemaId = isSchemaId(tree.schemaId) ? tree.schemaId : "cta";

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
    const seedType = normalizeSeedType(kind ?? "seed", coerceSeedType(node.seedType));

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
      seedType: kind === "seed" ? seedType : null,
      label: node.label,
      note: node.note,
      createdAt: node.createdAt,
    });
  }

  const rootKind = getRootKind(schemaId);
  const rootFromPayload = nodes.find(
    (node) => node.id === tree.rootNodeId && node.parentId === null && node.kind === rootKind,
  );
  const firstRoot = nodes.find((node) => node.parentId === null && node.kind === rootKind);
  const effectiveRootNodeId = rootFromPayload?.id ?? firstRoot?.id;

  if (!effectiveRootNodeId) {
    if (schemaId !== "cta") {
      return null;
    }

    const fallbackRoot =
      nodes.find((node) => node.id === tree.rootNodeId) ?? nodes.find((node) => node.parentId === null);
    if (!fallbackRoot) {
      return null;
    }

    const normalizedNodes = nodes.map((node) => {
      if (node.id !== fallbackRoot.id) {
        return node;
      }

      return {
        ...node,
        parentId: null,
        kind: "task_step" as NodeKind,
        seedType: null,
      };
    });

    return {
      treeId: tree.treeId,
      title: tree.title,
      schemaId,
      rootNodeId: fallbackRoot.id,
      nodes: normalizedNodes,
    };
  }

  return {
    treeId: tree.treeId,
    title: tree.title,
    schemaId,
    rootNodeId: effectiveRootNodeId,
    nodes,
  };
};

// Legacy exports kept while the UI shifts from CTA-only wording.
export const createSeedTree = createDefaultTree;
export const addRootTaskStep = addRootNode;
export const getRootTaskSteps = getRootNodes;
