const STORAGE_KEY = "academic-crm.applicant-pipeline.v1";
const GLOBAL_PROGRAM_ID = "global-default";

export const nodeKindCatalog = [
  { value: "stage", label: "Stage" },
  { value: "substage", label: "Sub-stage" },
];

export const transitionDirectionCatalog = [
  { value: "forward", label: "Forward" },
  { value: "branch", label: "Branch" },
  { value: "backward", label: "Backward" },
  { value: "lateral", label: "Lateral" },
];

export function getNodeKindOptions(i18n) {
  return nodeKindCatalog.map((item) => ({
    value: item.value,
    label: i18n.localizeNodeKind(item.value),
  }));
}

export function getTransitionDirectionOptions(i18n) {
  return transitionDirectionCatalog.map((item) => ({
    value: item.value,
    label: i18n.localizeDirection(item.value),
  }));
}

const allowedNodeKinds = new Set(nodeKindCatalog.map((item) => item.value));
const allowedTransitionDirections = new Set(
  transitionDirectionCatalog.map((item) => item.value)
);

const defaultApplicantPipelineGraph = {
  version: 1,
  nodes: [
    {
      id: "document-review",
      label: "Document Review",
      kind: "stage",
      parentId: null,
      description: "Initial intake and completeness validation before the case opens further.",
    },
    {
      id: "document-audit",
      label: "Document Audit",
      kind: "substage",
      parentId: "document-review",
      description: "Operational checkpoint for missing, expired or inconsistent evidence.",
    },
    {
      id: "eligibility-check",
      label: "Eligibility Check",
      kind: "substage",
      parentId: "document-review",
      description: "Confirm minimum academic and program-specific requirements.",
    },
    {
      id: "interview",
      label: "Interview",
      kind: "stage",
      parentId: null,
      description: "Human evaluation for fit, readiness and communication.",
    },
    {
      id: "interview-scheduling",
      label: "Interview Scheduling",
      kind: "substage",
      parentId: "interview",
      description: "Coordinate availability, panel composition and applicant readiness.",
    },
    {
      id: "panel-interview",
      label: "Panel Interview",
      kind: "substage",
      parentId: "interview",
      description: "Structured assessment with faculty or admissions reviewers.",
    },
    {
      id: "committee",
      label: "Committee",
      kind: "stage",
      parentId: null,
      description: "Decision forum where offer, waitlist or rejection paths are shaped.",
    },
    {
      id: "decision-desk",
      label: "Decision Desk",
      kind: "substage",
      parentId: "committee",
      description: "Formalize the committee motion and prepare the outbound action.",
    },
  ],
  transitions: [
    {
      id: "rule-docs-ready",
      from: "document-review",
      to: "interview",
      label: "Ready for interview",
      condition: "Required documents are complete and baseline review is positive.",
      direction: "forward",
    },
    {
      id: "rule-missing-docs",
      from: "document-review",
      to: "document-audit",
      label: "Request corrections",
      condition: "At least one mandatory document is missing, expired or inconsistent.",
      direction: "branch",
    },
    {
      id: "rule-eligibility-check",
      from: "document-review",
      to: "eligibility-check",
      label: "Confirm baseline fit",
      condition: "The dossier is complete but still needs minimum-criteria validation.",
      direction: "lateral",
    },
    {
      id: "rule-audit-return",
      from: "document-audit",
      to: "document-review",
      label: "Re-open intake review",
      condition: "Corrections were received and the file can return to intake review.",
      direction: "backward",
    },
    {
      id: "rule-eligibility-forward",
      from: "eligibility-check",
      to: "interview-scheduling",
      label: "Schedule interview",
      condition: "Minimum criteria are satisfied and the case is interview-worthy.",
      direction: "forward",
    },
    {
      id: "rule-scheduling-to-panel",
      from: "interview-scheduling",
      to: "panel-interview",
      label: "Panel confirmed",
      condition: "Panel, agenda and candidate availability are confirmed.",
      direction: "forward",
    },
    {
      id: "rule-panel-to-committee",
      from: "panel-interview",
      to: "committee",
      label: "Escalate to committee",
      condition: "Interview feedback supports committee review.",
      direction: "forward",
    },
    {
      id: "rule-interview-backtrack",
      from: "panel-interview",
      to: "document-review",
      label: "Clarify dossier",
      condition: "Interview surfaced issues that require returning to document review.",
      direction: "backward",
    },
    {
      id: "rule-committee-desk",
      from: "committee",
      to: "decision-desk",
      label: "Draft final decision",
      condition: "Committee reached a motion and the case is ready for final packaging.",
      direction: "forward",
    },
    {
      id: "rule-committee-loop",
      from: "committee",
      to: "interview",
      label: "Re-open interview path",
      condition: "Committee requires another interview or additional context.",
      direction: "backward",
    },
  ],
};

export const defaultApplicantPipelineConfig = {
  version: 2,
  activeProgramId: GLOBAL_PROGRAM_ID,
  programs: [
    {
      id: GLOBAL_PROGRAM_ID,
      type: "global",
      label: "Global Default",
      programName: "",
      pipeline: defaultApplicantPipelineGraph,
    },
  ],
};

function createEmptyGraph() {
  return {
    version: 1,
    nodes: [],
    transitions: [],
  };
}

function cloneConfig(config) {
  return JSON.parse(JSON.stringify(config));
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeKey(value) {
  return normalizeText(value).toLowerCase();
}

function sanitizeDescription(value) {
  return normalizeText(value).slice(0, 220);
}

function sanitizeId(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function makeUniqueId(base, usedIds) {
  const safeBase = sanitizeId(base) || "node";

  if (!usedIds.has(safeBase)) {
    return safeBase;
  }

  let index = 2;
  let candidate = `${safeBase}-${index}`;

  while (usedIds.has(candidate)) {
    index += 1;
    candidate = `${safeBase}-${index}`;
  }

  return candidate;
}

function makePipelineError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function sanitizeGraph(rawGraph) {
  const safeGraph = createEmptyGraph();

  if (!rawGraph || typeof rawGraph !== "object") {
    return safeGraph;
  }

  const rawNodes = Array.isArray(rawGraph.nodes) ? rawGraph.nodes : [];
  const rawTransitions = Array.isArray(rawGraph.transitions) ? rawGraph.transitions : [];
  const seenIds = new Set();
  const seenLabels = new Set();

  for (const rawNode of rawNodes) {
    if (!rawNode || typeof rawNode !== "object" || rawNode.kind !== "stage") {
      continue;
    }

    const label = normalizeText(rawNode.label).slice(0, 60);
    const labelKey = normalizeKey(label);
    const id = sanitizeId(rawNode.id || label);

    if (!label || !id || seenIds.has(id) || seenLabels.has(labelKey)) {
      continue;
    }

    seenIds.add(id);
    seenLabels.add(labelKey);
    safeGraph.nodes.push({
      id,
      label,
      kind: "stage",
      parentId: null,
      description: sanitizeDescription(rawNode.description),
    });
  }

  const stageIds = new Set(safeGraph.nodes.map((node) => node.id));

  for (const rawNode of rawNodes) {
    if (!rawNode || typeof rawNode !== "object" || rawNode.kind !== "substage") {
      continue;
    }

    const label = normalizeText(rawNode.label).slice(0, 60);
    const labelKey = normalizeKey(label);
    const id = sanitizeId(rawNode.id || label);
    const parentId = sanitizeId(rawNode.parentId);

    if (
      !label ||
      !id ||
      !parentId ||
      seenIds.has(id) ||
      seenLabels.has(labelKey) ||
      !stageIds.has(parentId)
    ) {
      continue;
    }

    seenIds.add(id);
    seenLabels.add(labelKey);
    safeGraph.nodes.push({
      id,
      label,
      kind: "substage",
      parentId,
      description: sanitizeDescription(rawNode.description),
    });
  }

  const nodeIds = new Set(safeGraph.nodes.map((node) => node.id));
  const seenTransitionIds = new Set();

  for (const rawTransition of rawTransitions) {
    if (!rawTransition || typeof rawTransition !== "object") {
      continue;
    }

    const from = sanitizeId(rawTransition.from);
    const to = sanitizeId(rawTransition.to);
    const label = normalizeText(rawTransition.label).slice(0, 80);
    const condition = normalizeText(rawTransition.condition).slice(0, 180);
    const direction = normalizeText(rawTransition.direction).toLowerCase();
    const id = sanitizeId(rawTransition.id || `${from}-${to}-${label}`);

    if (
      !from ||
      !to ||
      !label ||
      !condition ||
      !id ||
      from === to ||
      !nodeIds.has(from) ||
      !nodeIds.has(to) ||
      !allowedTransitionDirections.has(direction) ||
      seenTransitionIds.has(id)
    ) {
      continue;
    }

    seenTransitionIds.add(id);
    safeGraph.transitions.push({
      id,
      from,
      to,
      label,
      condition,
      direction,
    });
  }

  return safeGraph;
}

function sanitizeRegistry(rawConfig) {
  const baseConfig = cloneConfig(defaultApplicantPipelineConfig);

  if (!rawConfig || typeof rawConfig !== "object") {
    return baseConfig;
  }

  if (Array.isArray(rawConfig.nodes) || Array.isArray(rawConfig.transitions)) {
    return {
      version: 2,
      activeProgramId: GLOBAL_PROGRAM_ID,
      programs: [
        {
          id: GLOBAL_PROGRAM_ID,
          type: "global",
          label: "Global Default",
          programName: "",
          pipeline: sanitizeGraph(rawConfig),
        },
      ],
    };
  }

  const rawPrograms = Array.isArray(rawConfig.programs) ? rawConfig.programs : [];
  const safePrograms = [];
  const usedIds = new Set();
  const usedProgramKeys = new Set();

  for (const rawProgram of rawPrograms) {
    if (!rawProgram || typeof rawProgram !== "object") {
      continue;
    }

    const isGlobal =
      rawProgram.type === "global" ||
      sanitizeId(rawProgram.id) === GLOBAL_PROGRAM_ID ||
      normalizeKey(rawProgram.label) === "global default";

    if (isGlobal) {
      if (usedIds.has(GLOBAL_PROGRAM_ID)) {
        continue;
      }

      usedIds.add(GLOBAL_PROGRAM_ID);
      safePrograms.push({
        id: GLOBAL_PROGRAM_ID,
        type: "global",
        label: "Global Default",
        programName: "",
        pipeline: sanitizeGraph(rawProgram.pipeline ?? rawProgram),
      });
      continue;
    }

    const programName = normalizeText(rawProgram.programName || rawProgram.label).slice(0, 80);
    const programKey = normalizeKey(programName);

    if (programName.length < 2 || usedProgramKeys.has(programKey)) {
      continue;
    }

    const id = makeUniqueId(rawProgram.id || programName, usedIds);
    usedIds.add(id);
    usedProgramKeys.add(programKey);
    safePrograms.push({
      id,
      type: "program",
      label: programName,
      programName,
      pipeline: sanitizeGraph(rawProgram.pipeline ?? rawProgram),
    });
  }

  if (!safePrograms.some((program) => program.id === GLOBAL_PROGRAM_ID)) {
    safePrograms.unshift({
      id: GLOBAL_PROGRAM_ID,
      type: "global",
      label: "Global Default",
      programName: "",
      pipeline: sanitizeGraph(defaultApplicantPipelineGraph),
    });
  }

  const activeProgramId = safePrograms.some((program) => program.id === rawConfig.activeProgramId)
    ? rawConfig.activeProgramId
    : GLOBAL_PROGRAM_ID;

  return {
    version: 2,
    activeProgramId,
    programs: safePrograms,
  };
}

function getStoredConfig() {
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return sanitizeRegistry(JSON.parse(stored));
  } catch {
    return null;
  }
}

function resolveGraph(graphConfig) {
  const safeGraph = sanitizeGraph(graphConfig);
  const baseNodeMap = new Map(safeGraph.nodes.map((node) => [node.id, node]));
  const childMap = new Map(safeGraph.nodes.map((node) => [node.id, []]));

  for (const node of safeGraph.nodes) {
    if (node.parentId && childMap.has(node.parentId)) {
      childMap.get(node.parentId).push(node.id);
    }
  }

  const resolvedNodes = safeGraph.nodes.map((node) => {
    const parent = node.parentId ? baseNodeMap.get(node.parentId) ?? null : null;

    return {
      ...node,
      labelKey: normalizeKey(node.label),
      parent,
      pathLabel: parent ? `${parent.label} / ${node.label}` : node.label,
      familyId: parent ? parent.id : node.id,
    };
  });

  const nodeMap = new Map(resolvedNodes.map((node) => [node.id, node]));
  const transitionsByFrom = new Map(resolvedNodes.map((node) => [node.id, []]));
  const transitionsByTo = new Map(resolvedNodes.map((node) => [node.id, []]));
  const resolvedTransitions = safeGraph.transitions.map((transition) => {
    const fromNode = nodeMap.get(transition.from) ?? null;
    const toNode = nodeMap.get(transition.to) ?? null;

    return {
      ...transition,
      fromNode,
      toNode,
    };
  });

  for (const transition of resolvedTransitions) {
    transitionsByFrom.get(transition.from)?.push(transition);
    transitionsByTo.get(transition.to)?.push(transition);
  }

  const stageNodes = resolvedNodes
    .filter((node) => node.kind === "stage")
    .map((stageNode) => {
      const children = (childMap.get(stageNode.id) ?? [])
        .map((childId) => nodeMap.get(childId))
        .filter(Boolean);

      return {
        ...stageNode,
        children,
        familyLabelKeys: new Set([stageNode.labelKey, ...children.map((child) => child.labelKey)]),
      };
    });

  const branchingNodes = resolvedNodes.filter(
    (node) => (transitionsByFrom.get(node.id) ?? []).length > 1
  );

  return {
    ...safeGraph,
    nodes: resolvedNodes,
    nodeMap,
    nodeLabelMap: new Map(resolvedNodes.map((node) => [node.labelKey, node])),
    transitions: resolvedTransitions,
    transitionsByFrom,
    transitionsByTo,
    stageNodes,
    branchingNodes,
    stageFilterOptions: stageNodes.flatMap((stageNode) => [
      { value: `family:${stageNode.id}`, label: stageNode.label },
      ...stageNode.children.map((child) => ({
        value: `node:${child.id}`,
        label: child.pathLabel,
      })),
    ]),
    applicantStageOptions: stageNodes.flatMap((stageNode) => [
      { value: stageNode.label, label: stageNode.label, nodeId: stageNode.id },
      ...stageNode.children.map((child) => ({
        value: child.label,
        label: child.pathLabel,
        nodeId: child.id,
      })),
    ]),
  };
}

function updateActiveProgramPipeline(config, updater) {
  const safeConfig = sanitizeRegistry(config);

  return sanitizeRegistry({
    ...safeConfig,
    programs: safeConfig.programs.map((program) =>
      program.id === safeConfig.activeProgramId
        ? {
            ...program,
            pipeline: updater(program.pipeline),
          }
        : program
    ),
  });
}

export function getInitialApplicantPipelineConfig() {
  return getStoredConfig() ?? cloneConfig(defaultApplicantPipelineConfig);
}

export function saveApplicantPipelineConfig(config) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeRegistry(config)));
}

export function resetApplicantPipelineConfig() {
  window.localStorage.removeItem(STORAGE_KEY);
  return cloneConfig(defaultApplicantPipelineConfig);
}

export function resolveApplicantPipelineConfig(config) {
  const safeConfig = sanitizeRegistry(config);
  const activeProgram =
    safeConfig.programs.find((program) => program.id === safeConfig.activeProgramId) ??
    safeConfig.programs[0];
  const resolvedGraph = resolveGraph(activeProgram.pipeline);

  return {
    ...resolvedGraph,
    registry: safeConfig,
    activeProgramId: activeProgram.id,
    activeProgramLabel: activeProgram.label,
    activeProgramName: activeProgram.programName,
    activeProgramKey: normalizeKey(activeProgram.programName),
    activeProgramType: activeProgram.type,
    isProgramSpecific: activeProgram.type === "program",
    programVersions: safeConfig.programs.map((program) => {
      const programGraph = sanitizeGraph(program.pipeline);
      const stageCount = programGraph.nodes.filter((node) => node.kind === "stage").length;

      return {
        id: program.id,
        label: program.label,
        type: program.type,
        programName: program.programName,
        nodeCount: programGraph.nodes.length,
        stageCount,
        transitionCount: programGraph.transitions.length,
      };
    }),
  };
}

export function getPipelineNodeByStageValue(stageValue, pipeline) {
  return pipeline.nodeLabelMap.get(normalizeKey(stageValue)) ?? null;
}

export function isApplicantInStageFilter(stageValue, filterValue, pipeline) {
  if (!filterValue || filterValue === "all") {
    return true;
  }

  if (filterValue.startsWith("family:")) {
    const familyId = sanitizeId(filterValue.slice("family:".length));
    const family = pipeline.stageNodes.find((stageNode) => stageNode.id === familyId);

    if (!family) {
      return false;
    }

    return family.familyLabelKeys.has(normalizeKey(stageValue));
  }

  if (filterValue.startsWith("node:")) {
    const nodeId = sanitizeId(filterValue.slice("node:".length));
    return pipeline.nodeMap.get(nodeId)?.labelKey === normalizeKey(stageValue);
  }

  return normalizeKey(stageValue) === normalizeKey(filterValue);
}

export function isApplicantInActiveProgramScope(programValue, pipeline) {
  if (!pipeline.isProgramSpecific) {
    return true;
  }

  return normalizeKey(programValue) === pipeline.activeProgramKey;
}

export function setActiveProgramPipeline(config, programId) {
  const safeConfig = sanitizeRegistry(config);

  if (!safeConfig.programs.some((program) => program.id === programId)) {
    return safeConfig;
  }

  return sanitizeRegistry({
    ...safeConfig,
    activeProgramId: programId,
  });
}

export function addProgramPipeline(config, draft) {
  const safeConfig = sanitizeRegistry(config);
  const programName = normalizeText(draft.programName).slice(0, 80);
  const programKey = normalizeKey(programName);
  const sourceProgramId = sanitizeId(draft.sourceProgramId) || safeConfig.activeProgramId;
  const sourceProgram =
    safeConfig.programs.find((program) => program.id === sourceProgramId) ?? safeConfig.programs[0];

  if (programName.length < 2) {
    throw makePipelineError("pipeline.errors.programNameTooShort");
  }

  const existingProgramKeys = new Set(
    safeConfig.programs
      .filter((program) => program.type === "program")
      .map((program) => normalizeKey(program.programName))
  );

  if (existingProgramKeys.has(programKey)) {
    throw makePipelineError("pipeline.errors.programExists");
  }

  const usedIds = new Set(safeConfig.programs.map((program) => program.id));
  const nextProgram = {
    id: makeUniqueId(programName, usedIds),
    type: "program",
    label: programName,
    programName,
    pipeline: cloneConfig(sourceProgram.pipeline),
  };

  return sanitizeRegistry({
    ...safeConfig,
    activeProgramId: nextProgram.id,
    programs: [...safeConfig.programs, nextProgram],
  });
}

export function addPipelineNode(config, draft) {
  return updateActiveProgramPipeline(config, (pipelineConfig) => {
    const safeConfig = sanitizeGraph(pipelineConfig);
    const label = normalizeText(draft.label).slice(0, 60);
    const labelKey = normalizeKey(label);
    const kind = normalizeText(draft.kind).toLowerCase();
    const description = sanitizeDescription(draft.description);
    const parentId = sanitizeId(draft.parentId);

    if (label.length < 2) {
      throw makePipelineError("pipeline.errors.stageLabelTooShort");
    }

    if (!allowedNodeKinds.has(kind)) {
      throw makePipelineError("pipeline.errors.invalidNodeKind");
    }

    const existingLabels = new Set(safeConfig.nodes.map((node) => normalizeKey(node.label)));
    if (existingLabels.has(labelKey)) {
      throw makePipelineError("pipeline.errors.duplicateStageLabel");
    }

    if (
      kind === "substage" &&
      !safeConfig.nodes.some((node) => node.id === parentId && node.kind === "stage")
    ) {
      throw makePipelineError("pipeline.errors.invalidSubstageParent");
    }

    const usedIds = new Set(safeConfig.nodes.map((node) => node.id));
    const nextNode = {
      id: makeUniqueId(label, usedIds),
      label,
      kind,
      parentId: kind === "substage" ? parentId : null,
      description,
    };

    return sanitizeGraph({
      ...safeConfig,
      nodes: [...safeConfig.nodes, nextNode],
    });
  });
}

export function removePipelineNode(config, nodeId) {
  return updateActiveProgramPipeline(config, (pipelineConfig) => {
    const safeConfig = sanitizeGraph(pipelineConfig);
    const targetId = sanitizeId(nodeId);
    const targetNode = safeConfig.nodes.find((node) => node.id === targetId);

    if (!targetNode) {
      return safeConfig;
    }

    const removableIds = new Set([targetId]);

    if (targetNode.kind === "stage") {
      for (const node of safeConfig.nodes) {
        if (node.parentId === targetId) {
          removableIds.add(node.id);
        }
      }
    }

    return sanitizeGraph({
      ...safeConfig,
      nodes: safeConfig.nodes.filter((node) => !removableIds.has(node.id)),
      transitions: safeConfig.transitions.filter(
        (transition) => !removableIds.has(transition.from) && !removableIds.has(transition.to)
      ),
    });
  });
}

export function addPipelineTransition(config, draft) {
  return updateActiveProgramPipeline(config, (pipelineConfig) => {
    const safeConfig = sanitizeGraph(pipelineConfig);
    const from = sanitizeId(draft.from);
    const to = sanitizeId(draft.to);
    const label = normalizeText(draft.label).slice(0, 80);
    const condition = normalizeText(draft.condition).slice(0, 180);
    const direction = normalizeText(draft.direction).toLowerCase();

    if (!from || !to) {
      throw makePipelineError("pipeline.errors.ruleNeedsEndpoints");
    }

    if (from === to) {
      throw makePipelineError("pipeline.errors.ruleSameDestination");
    }

    if (!safeConfig.nodes.some((node) => node.id === from)) {
      throw makePipelineError("pipeline.errors.ruleSourceMissing");
    }

    if (!safeConfig.nodes.some((node) => node.id === to)) {
      throw makePipelineError("pipeline.errors.ruleDestinationMissing");
    }

    if (label.length < 2) {
      throw makePipelineError("pipeline.errors.ruleLabelTooShort");
    }

    if (condition.length < 6) {
      throw makePipelineError("pipeline.errors.ruleConditionTooShort");
    }

    if (!allowedTransitionDirections.has(direction)) {
      throw makePipelineError("pipeline.errors.invalidDirection");
    }

    const duplicate = safeConfig.transitions.some(
      (transition) =>
        transition.from === from &&
        transition.to === to &&
        normalizeKey(transition.label) === normalizeKey(label)
    );

    if (duplicate) {
      throw makePipelineError("pipeline.errors.duplicateRule");
    }

    const usedIds = new Set(safeConfig.transitions.map((transition) => transition.id));
    const nextTransition = {
      id: makeUniqueId(`${from}-${to}-${label}`, usedIds),
      from,
      to,
      label,
      condition,
      direction,
    };

    return sanitizeGraph({
      ...safeConfig,
      transitions: [...safeConfig.transitions, nextTransition],
    });
  });
}

export function removePipelineTransition(config, transitionId) {
  return updateActiveProgramPipeline(config, (pipelineConfig) => {
    const safeConfig = sanitizeGraph(pipelineConfig);
    const targetId = sanitizeId(transitionId);

    return sanitizeGraph({
      ...safeConfig,
      transitions: safeConfig.transitions.filter((transition) => transition.id !== targetId),
    });
  });
}
