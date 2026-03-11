export type ProbeId = "process_timing" | "material" | "body_operation";

export type ProbeBranchId =
  | "identify"
  | "difference"
  | "change"
  | "criteria"
  | "impact"
  | "handoff";

export type CaptureSlot =
  | "situation"
  | "expectation"
  | "actual"
  | "friction"
  | "criteria"
  | "next_check";

export type ProbeHandoffKind = "problem" | "mismatch" | "working_theory" | "probe";

export interface ProbePlaybook {
  version: 1;
  branches: ProbeBranchDefinition[];
  probes: ProbeDefinition[];
}

export interface ProbeBranchDefinition {
  id: ProbeBranchId;
  label: string;
  description: string;
  order: number;
}

export interface ProbeDefinition {
  id: ProbeId;
  label: string;
  description: string;
  branchOrder?: ProbeBranchId[];
  branchContent: Partial<Record<ProbeBranchId, ProbeBranchContent>>;
}

export interface ProbeBranchContent {
  prompts: ProbePromptDefinition[];
  handoffs?: ProbeHandoff[];
}

export interface ProbePromptDefinition {
  id: string;
  text: string;
  captures: CaptureSlot[];
  note?: string;
}

export interface ProbeHandoff {
  kind: ProbeHandoffKind;
  label: string;
  targetProbeId?: ProbeId;
  condition?: string;
}
