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
import { getTreeNodeKindLabel } from "../lib/node-kind";
import { getChildren, getNode } from "../lib/tree-ops";
import { TreeDraft } from "../types/tree";

interface RootTreeFlowProps {
  tree: TreeDraft;
  rootNodeId: string;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

interface TreeFlowNodeData extends Record<string, unknown> {
  kindLabel: string;
  label: string;
  note: string;
}

type TreeFlowNode = Node<TreeFlowNodeData, "treeNode">;

const NODE_WIDTH = 264;
const HORIZONTAL_GAP = 72;
const VERTICAL_GAP = 164;
const X_STEP = NODE_WIDTH + HORIZONTAL_GAP;
const ROOT_PADDING_X = 180;
const ROOT_PADDING_Y = 36;

const TreeFlowNodeCard = ({ data, selected }: NodeProps<TreeFlowNode>) => {
  return (
    <div
      className={`tree-flow-node ${selected ? "selected" : ""}`}
      title={data.note || data.label}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} className="tree-flow-handle" />
      <div className="tree-flow-kind">{data.kindLabel}</div>
      <div className="tree-flow-label">{data.label}</div>
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
  treeNode: TreeFlowNodeCard,
};

interface LayoutResult {
  centerX: number;
  positions: Map<string, { x: number; y: number }>;
}

const computeTreeLayout = (tree: TreeDraft, rootNodeId: string): LayoutResult => {
  let leafIndex = 0;
  const positions = new Map<string, { x: number; y: number }>();

  const walk = (nodeId: string, depth: number): number => {
    const children = getChildren(tree, nodeId);

    if (children.length === 0) {
      const x = leafIndex * X_STEP;
      leafIndex += 1;
      positions.set(nodeId, { x, y: depth * VERTICAL_GAP });
      return x;
    }

    const childCenters = children.map((child) => walk(child.id, depth + 1));
    const centerX =
      childCenters.length === 1
        ? childCenters[0]
        : (childCenters[0] + childCenters[childCenters.length - 1]) / 2;

    positions.set(nodeId, { x: centerX, y: depth * VERTICAL_GAP });
    return centerX;
  };

  const centerX = walk(rootNodeId, 0);

  return {
    centerX,
    positions,
  };
};

export const RootTreeFlow = ({
  tree,
  rootNodeId,
  selectedNodeId,
  onSelectNode,
}: RootTreeFlowProps) => {
  const rootNode = getNode(tree, rootNodeId);

  const { nodes, edges } = useMemo(() => {
    if (!rootNode) {
      return {
        nodes: [] as TreeFlowNode[],
        edges: [] as Edge[],
      };
    }

    const { centerX, positions } = computeTreeLayout(tree, rootNodeId);
    const shiftX = ROOT_PADDING_X - centerX;

    const subtreeNodeIds = new Set(positions.keys());

    const nextNodes: TreeFlowNode[] = Array.from(subtreeNodeIds).map((nodeId) => {
      const node = getNode(tree, nodeId);
      const position = positions.get(nodeId);

      if (!node || !position) {
        throw new Error("Tree layout node was not found.");
      }

      return {
        id: node.id,
        type: "treeNode",
        position: {
          x: position.x + shiftX,
          y: position.y + ROOT_PADDING_Y,
        },
        data: {
          kindLabel: getTreeNodeKindLabel(node),
          label: node.label,
          note: node.note,
        },
        selected: node.id === selectedNodeId,
        draggable: false,
        selectable: true,
      };
    });

    const nextEdges: Edge[] = Array.from(subtreeNodeIds)
      .map((nodeId) => getNode(tree, nodeId))
      .filter((node): node is NonNullable<typeof node> => !!node && !!node.parentId && subtreeNodeIds.has(node.parentId))
      .map((node) => ({
        id: `e-${node.parentId}-${node.id}`,
        source: node.parentId as string,
        target: node.id,
        type: "smoothstep",
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#bf957e",
          width: 18,
          height: 18,
        },
        style: {
          stroke: "#bf957e",
          strokeWidth: 2,
        },
      }));

    return {
      nodes: nextNodes,
      edges: nextEdges,
    };
  }, [rootNode, rootNodeId, selectedNodeId, tree]);

  if (!rootNode) {
    return <p className="error">root nodeが見つかりません。</p>;
  }

  return (
    <div className="tree-flow-canvas">
      <ReactFlow
        key={rootNodeId}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, minZoom: 0.3 }}
        minZoom={0.2}
        maxZoom={1.8}
        nodeOrigin={[0.5, 0]}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        onNodeClick={(_, node) => onSelectNode(node.id)}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#bf957e",
            width: 18,
            height: 18,
          },
          style: {
            stroke: "#bf957e",
            strokeWidth: 2,
          },
        }}
      >
        <Background color="#eadfd4" gap={24} size={1} />
        <Controls position="top-right" showInteractive={false} />
      </ReactFlow>
    </div>
  );
};
