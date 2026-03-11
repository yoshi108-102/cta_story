import {
  CaptureSlot,
  ProbeBranchDefinition,
  ProbeBranchContent,
  ProbeBranchId,
  ProbeDefinition,
  ProbeHandoff,
  ProbeId,
  ProbePlaybook,
  ProbePromptDefinition,
} from "../types/probe-playbook";

const prompt = (
  id: string,
  text: string,
  captures: CaptureSlot[],
  note?: string,
): ProbePromptDefinition => ({
  id,
  text,
  captures,
  note,
});

const handoff = (
  kind: ProbeHandoff["kind"],
  label: string,
  options?: Pick<ProbeHandoff, "targetProbeId" | "condition">,
): ProbeHandoff => ({
  kind,
  label,
  ...options,
});

export const captureSlotLabels: Record<CaptureSlot, string> = {
  situation: "Situation",
  expectation: "Expectation",
  actual: "Actual",
  friction: "Friction",
  criteria: "Criteria",
  next_check: "Next Check",
};

export const probeBranches: ProbeBranchDefinition[] = [
  {
    id: "identify",
    label: "特定",
    description: "何のことか、どの場面か、どの対象かを固定する。",
    order: 0,
  },
  {
    id: "difference",
    label: "差分",
    description: "いつもと何が違うか、予想と何が違うかを見る。",
    order: 1,
  },
  {
    id: "change",
    label: "変化",
    description: "前後でどう変わったか、途中で切り替わったかを見る。",
    order: 2,
  },
  {
    id: "criteria",
    label: "判断基準",
    description: "何を見て OK / NG / 危険 と見ていたかを掘る。",
    order: 3,
  },
  {
    id: "impact",
    label: "影響",
    description: "その要因が結果や次の操作にどう効いたかを見る。",
    order: 4,
  },
  {
    id: "handoff",
    label: "移送",
    description: "problem / mismatch / 別 Probe への次遷移を決める。",
    order: 5,
  },
];

const processTimingProbe: ProbeDefinition = {
  id: "process_timing",
  label: "工程 / タイミング",
  description: "どの処理の時だったか、どの順番だったか、どの切り替わり点だったかを掘る。",
  branchContent: {
    identify: {
      prompts: [
        prompt("process_timing_identify_1", "どの工程の時だったか", ["situation"]),
        prompt("process_timing_identify_2", "前後どの作業の間だったか", ["situation"]),
        prompt("process_timing_identify_3", "開始直後か、終盤か、切り返し前後か", ["situation"]),
      ],
    },
    difference: {
      prompts: [
        prompt("process_timing_difference_1", "いつもの順番と何が違ったか", ["actual", "friction"]),
        prompt(
          "process_timing_difference_2",
          "予想していたタイミングとの差は何か",
          ["expectation", "actual", "friction"],
        ),
        prompt("process_timing_difference_3", "本来ここで起きるはずのことは何か", ["expectation"]),
      ],
    },
    change: {
      prompts: [
        prompt("process_timing_change_1", "どの瞬間で様子が変わったか", ["actual", "friction"]),
        prompt("process_timing_change_2", "途中で手順を変えたか", ["actual", "friction"]),
        prompt("process_timing_change_3", "どこが境目だったか", ["actual", "friction"]),
      ],
    },
    criteria: {
      prompts: [
        prompt("process_timing_criteria_1", "次の工程へ進めると何で判断したか", ["criteria"]),
        prompt("process_timing_criteria_2", "まだ早い / 遅いを何で見ていたか", ["criteria"]),
        prompt("process_timing_criteria_3", "タイミングの良し悪しを何で見ていたか", ["criteria"]),
      ],
    },
    impact: {
      prompts: [
        prompt("process_timing_impact_1", "そのタイミングの違いで何が起きたか", ["actual", "friction"]),
        prompt("process_timing_impact_2", "後続工程にどう影響したか", ["actual", "friction"]),
        prompt("process_timing_impact_3", "その時点で戻せたのか、戻せなかったのか", ["actual", "next_check"]),
      ],
    },
    handoff: {
      prompts: [
        prompt(
          "process_timing_handoff_1",
          "このズレは手順理解の問題か、別要因の問題か",
          ["next_check"],
        ),
        prompt(
          "process_timing_handoff_2",
          "次に材料や身体を見た方がよいか",
          ["next_check"],
        ),
      ],
      handoffs: [
        handoff("problem", "手順理解の problem へ"),
        handoff("mismatch", "工程間のズレを mismatch にする"),
        handoff("probe", "材料 Probe へ", { targetProbeId: "material" }),
        handoff("probe", "身体 / 操作 Probe へ", { targetProbeId: "body_operation" }),
      ],
    },
  },
};

const materialProbe: ProbeDefinition = {
  id: "material",
  label: "材料",
  description: "対象の材質、状態、個体差、条件差がどう効いたかを掘る。",
  branchContent: {
    identify: {
      prompts: [
        prompt("material_identify_1", "何の材料だったか", ["situation"]),
        prompt("material_identify_2", "材質、太さ、状態はどうだったか", ["situation"]),
        prompt("material_identify_3", "いつも使うものと同じだったか", ["situation"]),
      ],
    },
    difference: {
      prompts: [
        prompt("material_difference_1", "いつもの材料と何が違ったか", ["actual", "friction"]),
        prompt(
          "material_difference_2",
          "予想していた材料特性との差は何か",
          ["expectation", "actual", "friction"],
        ),
        prompt("material_difference_3", "個体差はあったか", ["actual", "friction"]),
      ],
    },
    change: {
      prompts: [
        prompt("material_change_1", "途中で状態は変わったか", ["actual", "friction"]),
        prompt("material_change_2", "温度や湿り気で変化したか", ["actual"]),
        prompt("material_change_3", "作業中に抵抗感や見え方が変わったか", ["actual", "friction"]),
      ],
    },
    criteria: {
      prompts: [
        prompt("material_criteria_1", "その材料状態を何で見分けたか", ["criteria"]),
        prompt("material_criteria_2", "良い / 危ないを何で判断したか", ["criteria"]),
        prompt("material_criteria_3", "触感、見た目、音などの手がかりは何か", ["criteria"]),
      ],
    },
    impact: {
      prompts: [
        prompt("material_impact_1", "材料差が結果にどう効いたか", ["actual", "friction"]),
        prompt("material_impact_2", "操作の仕方を変える必要があったか", ["actual", "next_check"]),
        prompt("material_impact_3", "別の手順や道具選択に影響したか", ["actual", "next_check"]),
      ],
    },
    handoff: {
      prompts: [
        prompt("material_handoff_1", "材料差を単独で説明できそうか", ["next_check"]),
        prompt("material_handoff_2", "次に身体や工程を見た方がよいか", ["next_check"]),
      ],
      handoffs: [
        handoff("problem", "材料理解の problem へ"),
        handoff("mismatch", "材料差の説明不能点を mismatch にする"),
        handoff("probe", "工程 / タイミング Probe へ", { targetProbeId: "process_timing" }),
        handoff("probe", "身体 / 操作 Probe へ", { targetProbeId: "body_operation" }),
      ],
    },
  },
};

const bodyOperationProbe: ProbeDefinition = {
  id: "body_operation",
  label: "身体 / 操作",
  description: "姿勢、力加減、手順、感覚、操作の切り替えを掘る。",
  branchContent: {
    identify: {
      prompts: [
        prompt("body_operation_identify_1", "どの姿勢、どの持ち方、どの手順だったか", ["situation"]),
        prompt("body_operation_identify_2", "どの動作をしていた瞬間か", ["situation"]),
        prompt("body_operation_identify_3", "どの部位に意識を置いていたか", ["situation"]),
      ],
    },
    difference: {
      prompts: [
        prompt("body_operation_difference_1", "いつもの動かし方と何が違ったか", ["actual", "friction"]),
        prompt(
          "body_operation_difference_2",
          "予想した手応えとの差は何か",
          ["expectation", "actual", "friction"],
        ),
        prompt(
          "body_operation_difference_3",
          "思っていた力加減との差は何か",
          ["expectation", "actual", "friction"],
        ),
      ],
    },
    change: {
      prompts: [
        prompt("body_operation_change_1", "途中で力の入り方は変わったか", ["actual", "friction"]),
        prompt("body_operation_change_2", "どこで手の使い方を変えたか", ["actual", "friction"]),
        prompt(
          "body_operation_change_3",
          "身体感覚が切り替わった瞬間はどこか",
          ["actual", "friction"],
        ),
      ],
    },
    criteria: {
      prompts: [
        prompt("body_operation_criteria_1", "うまくできている感覚を何で見ていたか", ["criteria"]),
        prompt("body_operation_criteria_2", "危ないと感じる手応えは何か", ["criteria"]),
        prompt("body_operation_criteria_3", "次に進める身体感覚の基準は何か", ["criteria"]),
      ],
    },
    impact: {
      prompts: [
        prompt("body_operation_impact_1", "その操作差で結果はどう変わったか", ["actual", "friction"]),
        prompt("body_operation_impact_2", "他の工程や道具選択に影響したか", ["actual", "next_check"]),
        prompt("body_operation_impact_3", "やり直しや補正が必要になったか", ["actual", "next_check"]),
      ],
    },
    handoff: {
      prompts: [
        prompt("body_operation_handoff_1", "操作理解の問題として整理した方がよいか", ["next_check"]),
        prompt("body_operation_handoff_2", "材料や工程を見ると切り分けが進みそうか", ["next_check"]),
      ],
      handoffs: [
        handoff("problem", "操作理解の problem へ"),
        handoff("mismatch", "手応えの説明不能点を mismatch にする"),
        handoff("probe", "工程 / タイミング Probe へ", { targetProbeId: "process_timing" }),
        handoff("probe", "材料 Probe へ", { targetProbeId: "material" }),
      ],
    },
  },
};

export const probePlaybook: ProbePlaybook = {
  version: 1,
  branches: probeBranches,
  probes: [processTimingProbe, materialProbe, bodyOperationProbe],
};

export const probeIds = probePlaybook.probes.map((probe) => probe.id);

export const isProbeId = (value: unknown): value is ProbeId => {
  return typeof value === "string" && probeIds.includes(value as ProbeId);
};

export const getCaptureSlotLabel = (slot: CaptureSlot): string => {
  return captureSlotLabels[slot];
};

export const getProbeBranchDefinition = (branchId: ProbeBranchId): ProbeBranchDefinition => {
  const branch = probeBranches.find((item) => item.id === branchId);

  if (!branch) {
    throw new Error(`Unknown probe branch: ${branchId}`);
  }

  return branch;
};

export const getProbeDefinition = (probeId: ProbeId): ProbeDefinition => {
  const probe = probePlaybook.probes.find((item) => item.id === probeId);

  if (!probe) {
    throw new Error(`Unknown probe: ${probeId}`);
  }

  return probe;
};

export const getBranchSequence = (probe: ProbeDefinition): ProbeBranchDefinition[] => {
  const branchIds = probe.branchOrder ?? probeBranches.map((branch) => branch.id);

  return branchIds
    .filter((branchId) => !!probe.branchContent[branchId])
    .map((branchId) => getProbeBranchDefinition(branchId));
};

export const getProbeBranchContent = (
  probeId: ProbeId,
  branchId: ProbeBranchId,
): ProbeBranchContent | null => {
  const probe = probePlaybook.probes.find((item) => item.id === probeId);

  if (!probe) {
    return null;
  }

  return probe.branchContent[branchId] ?? null;
};
