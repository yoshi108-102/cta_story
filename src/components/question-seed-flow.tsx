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
import {
  buildQuestionSeedFlowGraph,
  QuestionSeedFlowNodeData,
  QuestionSeedTemplateId,
} from "../lib/question-seed-playbook";

interface QuestionSeedFlowProps {
  templateId: QuestionSeedTemplateId;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

type QuestionSeedCanvasNode = Node<QuestionSeedFlowNodeData, "questionSeedNode">;

const kindLabels: Record<QuestionSeedFlowNodeData["kind"], string> = {
  template: "Question Seed",
  slot: "Slot",
};

const QuestionSeedNodeCard = ({ data, selected }: NodeProps<QuestionSeedCanvasNode>) => {
  return (
    <div className={`question-seed-flow-node ${data.kind} ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Top} isConnectable={false} className="tree-flow-handle" />
      <div className="probe-flow-kind-row">
        <div className="probe-flow-kind">{kindLabels[data.kind]}</div>
        {data.slotId ? <div className="probe-flow-branch-tag">{data.slotId}</div> : null}
      </div>
      <div className="probe-flow-label">{data.title}</div>
      <p className="probe-flow-description">{data.description}</p>
      {data.hints?.length ? (
        <div className="probe-flow-captures">
          {data.hints.map((hint) => (
            <span key={hint} className="probe-flow-capture-pill">
              {hint}
            </span>
          ))}
        </div>
      ) : null}
      <Handle type="source" position={Position.Bottom} isConnectable={false} className="tree-flow-handle" />
    </div>
  );
};

const nodeTypes = {
  questionSeedNode: QuestionSeedNodeCard,
};

export const QuestionSeedFlow = ({ templateId, selectedNodeId, onSelectNode }: QuestionSeedFlowProps) => {
  const { nodes, edges } = useMemo(() => {
    const graph = buildQuestionSeedFlowGraph(templateId);

    const nextNodes: QuestionSeedCanvasNode[] = graph.nodes.map((node) => ({
      ...node,
      type: "questionSeedNode",
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

    return { nodes: nextNodes, edges: nextEdges };
  }, [templateId, selectedNodeId]);

  return (
    <div className="tree-flow-canvas question-seed-flow-canvas">
      <ReactFlow
        key={templateId}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.24, minZoom: 0.2 }}
        minZoom={0.18}
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
