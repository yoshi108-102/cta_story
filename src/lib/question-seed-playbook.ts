import { Edge, Node } from "@xyflow/react";

export type QuestionSeedTemplateId = "compact_capture";
export type QuestionSeedSlotId = "situation" | "expectation" | "actual";

export interface QuestionSeedSlotDefinition {
  id: QuestionSeedSlotId;
  label: string;
  description: string;
  hints: string[];
}

export interface QuestionSeedTemplate {
  id: QuestionSeedTemplateId;
  label: string;
  description: string;
  goal: string;
  slots: QuestionSeedSlotDefinition[];
}

export interface QuestionSeedFlowNodeData extends Record<string, unknown> {
  kind: "template" | "slot";
  title: string;
  description: string;
  hints?: string[];
  slotId?: QuestionSeedSlotId;
}

export type QuestionSeedFlowNode = Node<QuestionSeedFlowNodeData>;

export interface QuestionSeedFlowGraph {
  nodes: QuestionSeedFlowNode[];
  edges: Edge[];
}

export const questionSeedTemplates: QuestionSeedTemplate[] = [
  {
    id: "compact_capture",
    label: "Compact Question Seed",
    description: "状況、予想、実際だけを短くそろえて Question Seed を立ち上げる。",
    goal: "材料と工程のある一場面について、何を想定し、実際どうなったかをコンパクトに取る。",
    slots: [
      {
        id: "situation",
        label: "状況",
        description: "何の材料で、どの工程・タイミングで、どんな条件だったかを短く固定する。",
        hints: ["何の材料だったか", "どの工程 / タイミングだったか", "条件や状態はどうだったか"],
      },
      {
        id: "expectation",
        label: "予想",
        description: "その場面で、どうなると思っていたか、どんな結果を見込んでいたかを書く。",
        hints: ["どうなると思っていたか", "何を狙っていたか", "何が起きるはずだったか"],
      },
      {
        id: "actual",
        label: "実際",
        description: "実際にどうなったか、どこで止まったか、何が気になったかを書く。",
        hints: ["実際どうなったか", "どこで止まったか", "何が引っかかったか"],
      },
    ],
  },
];

export const getQuestionSeedTemplate = (templateId: QuestionSeedTemplateId): QuestionSeedTemplate => {
  const template = questionSeedTemplates.find((item) => item.id === templateId);

  if (!template) {
    throw new Error(`Unknown question seed template: ${templateId}`);
  }

  return template;
};

export const isQuestionSeedTemplateId = (value: string): value is QuestionSeedTemplateId => {
  return questionSeedTemplates.some((template) => template.id === value);
};

export const buildQuestionSeedFlowGraph = (templateId: QuestionSeedTemplateId): QuestionSeedFlowGraph => {
  const template = getQuestionSeedTemplate(templateId);
  const rootId = `template:${template.id}`;
  const slotX = [-320, 0, 320];

  const nodes: QuestionSeedFlowNode[] = [
    {
      id: rootId,
      position: { x: 0, y: 36 },
      data: {
        kind: "template",
        title: template.label,
        description: template.goal,
      },
    },
    ...template.slots.map((slot, index) => ({
      id: `slot:${template.id}:${slot.id}`,
      position: { x: slotX[index] ?? index * 320, y: 260 },
      data: {
        kind: "slot" as const,
        title: slot.label,
        description: slot.description,
        hints: slot.hints,
        slotId: slot.id,
      },
    })),
  ];

  const edges: Edge[] = template.slots.map((slot) => ({
    id: `edge:${rootId}:${slot.id}`,
    source: rootId,
    target: `slot:${template.id}:${slot.id}`,
  }));

  return { nodes, edges };
};
