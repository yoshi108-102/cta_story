import { Edge, Node } from "@xyflow/react";
import {
  getBranchSequence,
  getCaptureSlotLabel,
  getProbeBranchDefinition,
} from "./probe-playbook";
import {
  ProbeBranchContent,
  ProbeBranchId,
  ProbeHandoff,
  ProbeId,
  ProbePlaybook,
} from "../types/probe-playbook";

export type ProbeFlowNodeKind = "probe" | "branch" | "prompt" | "handoff";

export interface ProbeFlowNodeData extends Record<string, unknown> {
  kind: ProbeFlowNodeKind;
  title: string;
  description?: string;
  probeId: ProbeId;
  branchId?: ProbeBranchId;
  captures?: string[];
  targetLabel?: string;
}

export type ProbeFlowNode = Node<ProbeFlowNodeData>;

export interface ProbeFlowGraph {
  nodes: ProbeFlowNode[];
  edges: Edge[];
}

const ROOT_Y = 24;
const BRANCH_Y = 220;
const LEAF_Y = 430;
const BRANCH_X_STEP = 300;
const LEAF_Y_STEP = 160;

const getHandoffDescription = (playbook: ProbePlaybook, handoff: ProbeHandoff): string | undefined => {
  if (handoff.kind === "probe" && handoff.targetProbeId) {
    const targetProbe = playbook.probes.find((probe) => probe.id === handoff.targetProbeId);
    return `次の Probe: ${targetProbe?.label ?? handoff.targetProbeId}`;
  }

  return handoff.condition;
};

const getLeafRows = (playbook: ProbePlaybook, content: ProbeBranchContent): Array<
  | {
      id: string;
      kind: "prompt";
      title: string;
      description?: string;
      captures: string[];
    }
  | {
      id: string;
      kind: "handoff";
      title: string;
      description?: string;
    }
> => {
  const promptRows = content.prompts.map((item) => ({
    id: item.id,
    kind: "prompt" as const,
    title: item.text,
    description: item.note,
    captures: item.captures.map((slot) => getCaptureSlotLabel(slot)),
  }));

  const handoffRows = (content.handoffs ?? []).map((item, index) => ({
    id: `handoff-${index}-${item.kind}-${item.targetProbeId ?? "none"}`,
    kind: "handoff" as const,
    title: item.label,
    description: getHandoffDescription(playbook, item),
  }));

  return [...promptRows, ...handoffRows];
};

export const buildProbeFlowGraph = (
  playbook: ProbePlaybook,
  probeId: ProbeId,
): ProbeFlowGraph => {
  const probe = playbook.probes.find((item) => item.id === probeId);

  if (!probe) {
    throw new Error(`Unknown probe: ${probeId}`);
  }

  const branches = getBranchSequence(probe);
  const rootId = `probe:${probe.id}`;

  const nodes: ProbeFlowNode[] = [
    {
      id: rootId,
      position: { x: 0, y: ROOT_Y },
      data: {
        kind: "probe",
        title: probe.label,
        description: probe.description,
        probeId: probe.id,
      },
    },
  ];

  const edges: Edge[] = [];
  const centerIndex = (branches.length - 1) / 2;

  branches.forEach((branch, branchIndex) => {
    const content = probe.branchContent[branch.id];

    if (!content) {
      return;
    }

    const branchId = `branch:${probe.id}:${branch.id}`;
    const branchX = (branchIndex - centerIndex) * BRANCH_X_STEP;

    nodes.push({
      id: branchId,
      position: { x: branchX, y: BRANCH_Y },
      data: {
        kind: "branch",
        title: branch.label,
        description: branch.description,
        probeId: probe.id,
        branchId: branch.id,
      },
    });

    edges.push({
      id: `edge:${rootId}:${branchId}`,
      source: rootId,
      target: branchId,
    });

    const leafRows = getLeafRows(playbook, content);

    leafRows.forEach((leaf, leafIndex) => {
      const leafId = `${branchId}:${leaf.id}`;

      nodes.push({
        id: leafId,
        position: { x: branchX, y: LEAF_Y + leafIndex * LEAF_Y_STEP },
        data: {
          kind: leaf.kind,
          title: leaf.title,
          description: leaf.description,
          probeId: probe.id,
          branchId: branch.id,
          captures: leaf.kind === "prompt" ? leaf.captures : undefined,
        },
      });

      edges.push({
        id: `edge:${branchId}:${leafId}`,
        source: branchId,
        target: leafId,
      });
    });
  });

  return { nodes, edges };
};

export const buildAllProbeFlowGraphs = (playbook: ProbePlaybook): Record<ProbeId, ProbeFlowGraph> => {
  return playbook.probes.reduce(
    (acc, probe) => {
      acc[probe.id] = buildProbeFlowGraph(playbook, probe.id);
      return acc;
    },
    {} as Record<ProbeId, ProbeFlowGraph>,
  );
};

export const getProbeBranchContent = (
  playbook: ProbePlaybook,
  probeId: ProbeId,
  branchId: ProbeBranchId,
): ProbeBranchContent | null => {
  const probe = playbook.probes.find((item) => item.id === probeId);

  if (!probe) {
    return null;
  }

  return probe.branchContent[branchId] ?? null;
};

export const getBranchNodeLabel = (branchId: ProbeBranchId): string => {
  return getProbeBranchDefinition(branchId).label;
};
