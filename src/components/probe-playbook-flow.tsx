import { useMemo } from "react";
import {
  Background,
  Controls,
  Edge,
  Handle,
  MarkerType,
  Node,
  NodeProps,
  Position,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { buildProbeFlowGraph, ProbeFlowNodeData } from "../lib/probe-playbook-flow";
import { probePlaybook } from "../lib/probe-playbook";
import { ProbeId } from "../types/probe-playbook";

interface ProbePlaybookFlowProps {
  probeId: ProbeId;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

type ProbeCanvasNode = Node<ProbeFlowNodeData, "probeNode">;

const nodeKindLabel: Record<ProbeFlowNodeData["kind"], string> = {
  probe: "Probe",
  branch: "Branch",
  prompt: "Prompt",
  handoff: "Handoff",
};

const ProbeFlowCard = ({ data, selected }: NodeProps<ProbeCanvasNode>) => {
  return (
    <div className={`probe-flow-node ${data.kind} ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Top} isConnectable={false} className="tree-flow-handle" />
      <div className="probe-flow-kind-row">
        <div className="probe-flow-kind">{nodeKindLabel[data.kind]}</div>
        {data.branchId ? <div className="probe-flow-branch-tag">{data.branchId}</div> : null}
      </div>
      <div className="probe-flow-label">{data.title}</div>
      {data.description ? <p className="probe-flow-description">{data.description}</p> : null}
      {data.captures?.length ? (
        <div className="probe-flow-captures">
          {data.captures.map((capture) => (
            <span key={capture} className="probe-flow-capture-pill">
              {capture}
            </span>
          ))}
        </div>
      ) : null}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className="tree-flow-handle"
      />
    </div>
  );
};

const nodeTypes = {
  probeNode: ProbeFlowCard,
};

export const ProbePlaybookFlow = ({
  probeId,
  selectedNodeId,
  onSelectNode,
}: ProbePlaybookFlowProps) => {
  const { nodes, edges } = useMemo(() => {
    const graph = buildProbeFlowGraph(probePlaybook, probeId);

    const nextNodes: ProbeCanvasNode[] = graph.nodes.map((node) => ({
      ...node,
      type: "probeNode",
      selected: node.id === selectedNodeId,
      draggable: false,
      selectable: true,
    }));

    const nextEdges: Edge[] = graph.edges.map((edge) => ({
      ...edge,
      type: "smoothstep",
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#b08b75",
        width: 18,
        height: 18,
      },
      style: {
        stroke: "#b08b75",
        strokeWidth: 2,
      },
    }));

    return {
      nodes: nextNodes,
      edges: nextEdges,
    };
  }, [probeId, selectedNodeId]);

  return (
    <div className="tree-flow-canvas probe-flow-canvas">
      <ReactFlow
        key={probeId}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.28, minZoom: 0.2 }}
        minZoom={0.15}
        maxZoom={1.8}
        nodeOrigin={[0.5, 0]}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        onNodeClick={(_, node) => onSelectNode(node.id)}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#eadfd4" gap={24} size={1} />
        <Controls position="top-right" showInteractive={false} />
      </ReactFlow>
    </div>
  );
};
