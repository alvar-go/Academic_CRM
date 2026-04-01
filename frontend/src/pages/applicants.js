import {
  getNodeKindOptions,
  getPipelineNodeByStageValue,
  getTransitionDirectionOptions,
  isApplicantInStageFilter,
} from "../config/applicant-pipeline.js";

let activeI18n = {
  t: (_key, _values, fallback = "") => fallback,
  formatDate: (value) => String(value),
  formatNumber: (value) => String(value),
  localizeApplicantStatus: (value) => value,
  localizeDirection: (value) => value,
  localizeNodeKind: (value) => value,
};

function setActiveI18n(i18n) {
  if (i18n) {
    activeI18n = i18n;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalize(value) {
  return String(value ?? "").toLowerCase().trim();
}

function scoreBand(score) {
  if (score >= 90) {
    return "high";
  }
  if (score >= 80) {
    return "medium";
  }
  return "emerging";
}

function statusTone(status) {
  const tones = {
    "In Review": "review",
    "Offer Ready": "offer",
    "Awaiting Documents": "documents",
  };

  return tones[status] ?? "default";
}

function stageIcon(kind) {
  return kind === "stage" ? "bi-signpost-2" : "bi-node-plus";
}

function transitionIcon(direction) {
  const icons = {
    forward: "bi-arrow-right-circle",
    branch: "bi-bezier2",
    backward: "bi-arrow-counterclockwise",
    lateral: "bi-arrow-left-right",
  };

  return icons[direction] ?? "bi-arrow-right-circle";
}

function summaryIcon(type) {
  const icons = {
    applicants: "bi-people",
    nodes: "bi-diagram-3",
    branches: "bi-bezier2",
    rules: "bi-sign-turn-right",
  };

  return icons[type] ?? "bi-dot";
}

function formatStageLabel(stageValue, pipeline) {
  return getPipelineNodeByStageValue(stageValue, pipeline)?.pathLabel ?? stageValue;
}

function renderTransitionBadge(transition) {
  return `
    <span class="direction-pill badge badge-sm direction-${escapeHtml(transition.direction)}">
      <i class="bi ${transitionIcon(transition.direction)}" aria-hidden="true"></i>
      ${escapeHtml(activeI18n.localizeDirection(transition.direction))}
    </span>
  `;
}

function renderTransitionCards(transitions, targetKey, emptyCopy) {
  if (!transitions.length) {
    return `<div class="rule-card empty">${escapeHtml(emptyCopy)}</div>`;
  }

  return transitions
    .map((transition) => {
      const targetNode = targetKey === "toNode" ? transition.toNode : transition.fromNode;
      const targetLabel = targetNode?.pathLabel ?? targetNode?.label ?? "Unmapped node";

      return `
        <article class="rule-card">
          <div class="rule-card-top">
            ${renderTransitionBadge(transition)}
            <strong>${escapeHtml(targetLabel)}</strong>
          </div>
          <span class="rule-name">${escapeHtml(transition.label)}</span>
          <p>${escapeHtml(transition.condition)}</p>
        </article>
      `;
    })
    .join("");
}

function renderNodeRouteList(transitions, targetKey, emptyCopy) {
  if (!transitions.length) {
    return `<div class="graph-link empty">${escapeHtml(emptyCopy)}</div>`;
  }

  return transitions
    .map((transition) => {
      const targetNode = targetKey === "toNode" ? transition.toNode : transition.fromNode;
      const targetLabel = targetNode?.pathLabel ?? targetNode?.label ?? "Unmapped node";

      return `
        <article class="graph-link">
          <div class="graph-link-top">
            ${renderTransitionBadge(transition)}
            <strong>${escapeHtml(targetLabel)}</strong>
          </div>
          <span class="graph-link-name">${escapeHtml(transition.label)}</span>
          <small>${escapeHtml(transition.condition)}</small>
        </article>
      `;
    })
    .join("");
}

function getNodeApplicantCounts(applicants, pipeline) {
  const counts = new Map(pipeline.nodes.map((node) => [node.id, 0]));

  for (const applicant of applicants) {
    const node = getPipelineNodeByStageValue(applicant.stage, pipeline);
    if (node) {
      counts.set(node.id, (counts.get(node.id) ?? 0) + 1);
    }
  }

  return counts;
}

function splitLabel(label, lineLength = 16) {
  const words = String(label).split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= lineLength) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 2);
}

function compactText(value, maxLength = 20) {
  const text = String(value ?? "").trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function summarizeEdgeLabel(transitions) {
  if (transitions.length <= 1) {
    return compactText(transitions[0]?.label ?? "", 18);
  }

  return activeI18n.t("pipeline.preview.rulesCount", {
    count: activeI18n.formatNumber(transitions.length),
  });
}

function laneOffset(index, total, spacing = 14) {
  if (total <= 1) {
    return 0;
  }

  return (index - (total - 1) / 2) * spacing;
}

function buildGraphScene(pipeline, applicants, expandedStageIds) {
  const MAX_CANVAS_WIDTH = 4200;
  const MAX_CANVAS_HEIGHT = 2200;
  const stageCount = Math.max(pipeline.stageNodes.length, 1);
  const stageWidth = 284;
  const collapsedStageHeight = 120;
  const expandedHeaderHeight = 132;
  const childWidth = stageWidth - 28;
  const childHeight = 64;
  const childGap = 14;
  const gutter = 156;
  const nodeCounts = getNodeApplicantCounts(applicants, pipeline);
  const positions = new Map();
  const nodes = [];
  const stageContainers = [];
  const computedHeights = pipeline.stageNodes.map((stageNode) =>
    expandedStageIds.has(stageNode.id)
      ? expandedHeaderHeight + stageNode.children.length * childHeight + Math.max(0, stageNode.children.length - 1) * childGap + 18
      : collapsedStageHeight
  );
  const contentHeight = Math.max(...computedHeights, collapsedStageHeight);
  const preferredWidth = stageCount * (stageWidth + gutter) + 100;
  const preferredHeight = contentHeight + 120;
  const viewWidth = Math.min(MAX_CANVAS_WIDTH, Math.max(1120, preferredWidth));
  const viewHeight = Math.min(MAX_CANVAS_HEIGHT, Math.max(460, preferredHeight));
  const columnWidth = stageCount > 1 ? (viewWidth - 100) / stageCount : viewWidth - 100;

  pipeline.stageNodes.forEach((stageNode, stageIndex) => {
    const isExpanded = expandedStageIds.has(stageNode.id);
    const familyCount = [stageNode, ...stageNode.children].reduce(
      (total, node) => total + (nodeCounts.get(node.id) ?? 0),
      0
    );
    const stageHeight = isExpanded
      ? expandedHeaderHeight +
        stageNode.children.length * childHeight +
        Math.max(0, stageNode.children.length - 1) * childGap +
        18
      : collapsedStageHeight;
    const x = 50 + stageIndex * columnWidth + columnWidth / 2;
    const y = 64;
    const stageContainer = {
      id: stageNode.id,
      node: stageNode,
      x,
      y,
      width: stageWidth,
      height: stageHeight,
      activeCount: familyCount,
      substageCount: stageNode.children.length,
      isExpanded,
    };

    stageContainers.push(stageContainer);
    const stagePosition = {
      id: stageNode.id,
      node: stageNode,
      x,
      y: y + 38,
      width: stageWidth - 24,
      height: 64,
      activeCount: nodeCounts.get(stageNode.id) ?? 0,
    };

    positions.set(stageNode.id, stagePosition);
    nodes.push(stagePosition);

    if (!isExpanded) {
      for (const child of stageNode.children) {
        positions.set(child.id, stagePosition);
      }
      return;
    }

    stageNode.children.forEach((child, childIndex) => {
      const childPosition = {
        id: child.id,
        node: child,
        x,
        y: y + expandedHeaderHeight + childIndex * (childHeight + childGap) + childHeight / 2,
        width: childWidth,
        height: childHeight,
        activeCount: nodeCounts.get(child.id) ?? 0,
      };

      positions.set(child.id, childPosition);
      nodes.push(childPosition);
    });
  });

  const edgeGroups = new Map();

  for (const transition of pipeline.transitions) {
    const fromPosition = positions.get(transition.from);
    const toPosition = positions.get(transition.to);

    if (!fromPosition || !toPosition || fromPosition.id === toPosition.id) {
      continue;
    }

    const groupKey = `${fromPosition.id}:${toPosition.id}:${transition.direction}`;
    const existingGroup = edgeGroups.get(groupKey);

    if (existingGroup) {
      existingGroup.transitions.push(transition);
      continue;
    }

    edgeGroups.set(groupKey, {
      fromPosition,
      toPosition,
      direction: transition.direction,
      transitions: [transition],
    });
  }

  const outgoingGroups = new Map();
  const incomingGroups = new Map();

  for (const group of edgeGroups.values()) {
    const outgoing = outgoingGroups.get(group.fromPosition.id) ?? [];
    const incoming = incomingGroups.get(group.toPosition.id) ?? [];
    outgoing.push(group);
    incoming.push(group);
    outgoingGroups.set(group.fromPosition.id, outgoing);
    incomingGroups.set(group.toPosition.id, incoming);
  }

  for (const groups of outgoingGroups.values()) {
    groups.sort((left, right) => {
      if (left.toPosition.x !== right.toPosition.x) {
        return left.toPosition.x - right.toPosition.x;
      }

      return left.toPosition.y - right.toPosition.y;
    });
  }

  for (const groups of incomingGroups.values()) {
    groups.sort((left, right) => {
      if (left.fromPosition.x !== right.fromPosition.x) {
        return left.fromPosition.x - right.fromPosition.x;
      }

      return left.fromPosition.y - right.fromPosition.y;
    });
  }

  const edges = Array.from(edgeGroups.values())
    .map((group) => {
      const fromPosition = group.fromPosition;
      const toPosition = group.toPosition;
      const horizontalDirection = Math.sign(toPosition.x - fromPosition.x) || 1;
      const isMostlyHorizontal = Math.abs(toPosition.x - fromPosition.x) > Math.abs(toPosition.y - fromPosition.y);
      const sourceLaneIndex = (outgoingGroups.get(fromPosition.id) ?? []).findIndex(
        (candidate) => candidate === group
      );
      const targetLaneIndex = (incomingGroups.get(toPosition.id) ?? []).findIndex(
        (candidate) => candidate === group
      );
      const sourceLane = laneOffset(
        sourceLaneIndex,
        outgoingGroups.get(fromPosition.id)?.length ?? 1
      );
      const targetLane = laneOffset(
        targetLaneIndex,
        incomingGroups.get(toPosition.id)?.length ?? 1
      );
      const labelText = summarizeEdgeLabel(group.transitions);
      const labelWidth = Math.max(58, Math.min(108, labelText.length * 7 + 18));

      let startX;
      let startY;
      let endX;
      let endY;
      let path;
      let labelX;
      let labelY;

      if (isMostlyHorizontal) {
        startX = fromPosition.x + horizontalDirection * (fromPosition.width / 2);
        startY = fromPosition.y + sourceLane;
        endX = toPosition.x - horizontalDirection * (toPosition.width / 2);
        endY = toPosition.y + targetLane;

        const turnX = startX + (endX - startX) * 0.5;
        path = `M ${startX} ${startY} L ${turnX} ${startY} L ${turnX} ${endY} L ${endX} ${endY}`;
        labelX = turnX;
        labelY =
          Math.abs(endY - startY) > 26
            ? startY + (endY - startY) / 2
            : startY - 18 - sourceLaneIndex * 12;
      } else {
        startX = fromPosition.x + sourceLane;
        startY = fromPosition.y + fromPosition.height / 2;
        endX = toPosition.x + targetLane;
        endY = toPosition.y - toPosition.height / 2;

        const turnY = startY + (endY - startY) * 0.5;
        path = `M ${startX} ${startY} L ${startX} ${turnY} L ${endX} ${turnY} L ${endX} ${endY}`;
        labelX = startX + (endX - startX) / 2;
        labelY = turnY - 14;
      }

      return {
        ...group,
        path,
        labelText,
        labelWidth,
        labelX,
        labelY,
      };
    })
    .filter(Boolean);

  return {
    viewWidth,
    viewHeight,
    stageContainers,
    nodes,
    edges,
  };
}

function renderPipelineSvg(pipeline, applicants, expandedStageIds) {
  const scene = buildGraphScene(pipeline, applicants, expandedStageIds);

  return `
    <div class="pipeline-map-frame">
      <svg
        class="pipeline-map"
        viewBox="0 0 ${scene.viewWidth} ${scene.viewHeight}"
        width="${scene.viewWidth}"
        height="${scene.viewHeight}"
        role="img"
        aria-label="${escapeHtml(activeI18n.t("pipeline.preview.ariaLabel"))}"
      >
        <defs>
          <marker
            id="pipeline-arrow"
            markerWidth="10"
            markerHeight="10"
            refX="6"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="currentColor"></path>
          </marker>
        </defs>

        ${scene.edges
          .map(
            (edge) => `
              <g class="pipeline-edge direction-${escapeHtml(edge.direction)}">
                <path d="${edge.path}" marker-end="url(#pipeline-arrow)"></path>
                <g class="pipeline-edge-label" transform="translate(${edge.labelX} ${edge.labelY})">
                  <rect
                    x="${-(edge.labelWidth / 2)}"
                    y="-12"
                    width="${edge.labelWidth}"
                    height="24"
                    rx="7"
                  ></rect>
                  <text y="4">${escapeHtml(edge.labelText)}</text>
                </g>
              </g>
            `
          )
          .join("")}

        ${scene.stageContainers
          .map((stage) => {
            const toggleY = stage.y + 90;
            const toggleLabel = stage.isExpanded
              ? activeI18n.t("pipeline.preview.hideSubstages")
              : activeI18n.t("pipeline.preview.showSubstages");
            const toggleSymbol = stage.isExpanded ? "-" : "+";

            return `
              <g class="pipeline-stage-shell ${stage.isExpanded ? "is-expanded" : "is-collapsed"}">
                <rect
                  class="pipeline-stage-frame"
                  x="${stage.x - stage.width / 2}"
                  y="${stage.y}"
                  width="${stage.width}"
                  height="${stage.height}"
                  rx="7"
                  ry="7"
                ></rect>
                <text class="pipeline-stage-meta" x="${stage.x - stage.width / 2 + 20}" y="${stage.y + 24}">
                  ${escapeHtml(activeI18n.t("pipeline.preview.stageMeta"))}
                </text>
                <text class="pipeline-stage-count" x="${stage.x + stage.width / 2 - 22}" y="${stage.y + 25}">
                  ${stage.activeCount}
                </text>
                <g class="pipeline-stage-toggle" data-graph-stage-toggle="${escapeHtml(stage.id)}" tabindex="0" role="button" aria-label="${escapeHtml(toggleLabel)}">
                  <rect x="${stage.x - stage.width / 2 + 18}" y="${toggleY}" width="150" height="28" rx="7"></rect>
                  <text x="${stage.x - stage.width / 2 + 34}" y="${toggleY + 19}">${toggleSymbol}</text>
                  <text x="${stage.x - stage.width / 2 + 54}" y="${toggleY + 19}">
                    ${escapeHtml(
                      stage.isExpanded
                        ? activeI18n.t("pipeline.preview.substageCount", {
                            count: activeI18n.formatNumber(stage.substageCount),
                          })
                        : activeI18n.t("pipeline.preview.expandCount", {
                            count: activeI18n.formatNumber(stage.substageCount),
                          })
                    )}
                  </text>
                </g>
              </g>
            `;
          })
          .join("")}

        ${scene.nodes
          .map((item) => {
            const labelLines = splitLabel(item.node.label);
            const isStage = item.node.kind === "stage";
            const firstLineY = isStage
              ? item.y + (labelLines.length > 1 ? -2 : 6)
              : item.y + (labelLines.length > 1 ? 0 : 8);
            const activeBadgeY = item.y - item.height / 2 + 22;

            return `
              <g class="pipeline-node ${item.node.kind === "stage" ? "is-stage" : "is-substage"}">
                <rect
                  x="${item.x - item.width / 2}"
                  y="${item.y - item.height / 2}"
                  width="${item.width}"
                  height="${item.height}"
                  rx="7"
                  ry="7"
                ></rect>
                <text class="pipeline-node-kicker" x="${item.x}" y="${item.y - item.height / 2 + 14}">
                  ${escapeHtml(
                    item.node.kind === "stage"
                      ? activeI18n.t("pipeline.preview.primaryNode")
                      : activeI18n.t("pipeline.preview.subStage")
                  )}
                </text>
                ${labelLines
                  .map(
                    (line, index) => `
                      <text class="pipeline-node-label" x="${item.x}" y="${firstLineY + index * 18}">
                        ${escapeHtml(line)}
                      </text>
                    `
                  )
                  .join("")}
                ${
                  isStage
                    ? ""
                    : `
                        <g class="pipeline-node-badge">
                          <rect x="${item.x + item.width / 2 - 46}" y="${activeBadgeY - 14}" width="34" height="24" rx="7"></rect>
                          <text x="${item.x + item.width / 2 - 29}" y="${activeBadgeY + 3}">
                            ${item.activeCount}
                          </text>
                        </g>
                      `
                }
              </g>
            `;
          })
          .join("")}
      </svg>
    </div>
  `;
}

function renderStudioStageCatalog(pipeline) {
  if (!pipeline.stageNodes.length) {
    return `
      <article class="applicant-empty compact-empty">
        <span class="section-caption">${activeI18n.t("pipeline.studio.emptyGraph.kicker")}</span>
        <h3>${activeI18n.t("pipeline.studio.emptyGraph.title")}</h3>
        <p>${activeI18n.t("pipeline.studio.emptyGraph.copy")}</p>
      </article>
    `;
  }

  return pipeline.stageNodes
    .map(
      (stageNode) => `
        <article class="stage-family-card">
          <div class="stage-family-head">
            <div>
              <span class="section-caption">${activeI18n.t("pipeline.family.title")}</span>
              <h3><i class="bi bi-signpost-2" aria-hidden="true"></i>${escapeHtml(stageNode.label)}</h3>
            </div>
            <button
              class="ghost-button compact-button"
              type="button"
              data-pipeline-remove-node="${escapeHtml(stageNode.id)}"
            >
              <i class="bi bi-trash3" aria-hidden="true"></i>
              ${activeI18n.t("pipeline.actions.remove")}
            </button>
          </div>
          <p class="stage-family-copy">
            ${escapeHtml(stageNode.description || activeI18n.t("pipeline.family.noDescription"))}
          </p>
          <div class="substage-stack">
            ${
              stageNode.children.length
                ? stageNode.children
                    .map(
                      (child) => `
                        <article class="substage-card">
                          <div class="substage-card-head">
                            <div>
                              <span class="section-caption">${activeI18n.t("pipeline.domain.substage")}</span>
                              <strong><i class="bi bi-node-plus" aria-hidden="true"></i>${escapeHtml(child.label)}</strong>
                            </div>
                            <button
                              class="ghost-button compact-button"
                              type="button"
                              data-pipeline-remove-node="${escapeHtml(child.id)}"
                            >
                              <i class="bi bi-trash3" aria-hidden="true"></i>
                              ${activeI18n.t("pipeline.actions.remove")}
                            </button>
                          </div>
                          <p>${escapeHtml(child.description || activeI18n.t("pipeline.node.noDescription"))}</p>
                        </article>
                      `
                    )
                    .join("")
                : `
                    <div class="rule-card empty">
                      ${activeI18n.t("pipeline.family.noSubstages")}
                    </div>
                  `
            }
          </div>
        </article>
      `
    )
    .join("");
}

function renderStudioRuleCatalog(pipeline) {
  if (!pipeline.transitions.length) {
    return `
      <article class="applicant-empty compact-empty">
        <span class="section-caption">${activeI18n.t("pipeline.studio.emptyRules.kicker")}</span>
        <h3>${activeI18n.t("pipeline.studio.emptyRules.title")}</h3>
        <p>${activeI18n.t("pipeline.studio.emptyRules.copy")}</p>
      </article>
    `;
  }

  return pipeline.transitions
    .map(
      (transition) => `
        <article class="studio-rule-card">
          <div class="studio-rule-card-top">
            ${renderTransitionBadge(transition)}
            <button
              class="ghost-button compact-button"
              type="button"
              data-pipeline-remove-transition="${escapeHtml(transition.id)}"
            >
              <i class="bi bi-trash3" aria-hidden="true"></i>
              ${activeI18n.t("pipeline.actions.remove")}
            </button>
          </div>
          <strong>${escapeHtml(transition.label)}</strong>
          <span class="mono-inline">
            ${escapeHtml(transition.fromNode?.pathLabel ?? transition.from)} ->
            ${escapeHtml(transition.toNode?.pathLabel ?? transition.to)}
          </span>
          <p>${escapeHtml(transition.condition)}</p>
        </article>
      `
    )
    .join("");
}

function applicantMatchesFilters(applicant, filters, pipeline) {
  const searchTarget = normalize(
    `${applicant.full_name} ${applicant.email} ${applicant.program} ${applicant.stage} ${applicant.status} ${formatStageLabel(applicant.stage, pipeline)}`
  );
  const matchesSearch = !filters.search || searchTarget.includes(normalize(filters.search));
  const matchesStage = isApplicantInStageFilter(applicant.stage, filters.stage, pipeline);
  const matchesStatus = filters.status === "all" || applicant.status === filters.status;

  return matchesSearch && matchesStage && matchesStatus;
}

export function filterApplicants(applicants, filters, pipeline) {
  return applicants.filter((applicant) => applicantMatchesFilters(applicant, filters, pipeline));
}

export function renderApplicantSummary(root, applicants, filteredApplicants, pipeline, i18n) {
  setActiveI18n(i18n);
  const activeNodes = new Set(filteredApplicants.map((applicant) => normalize(applicant.stage))).size;
  const scopeCopy = pipeline.isProgramSpecific
    ? activeI18n.t("applicants.summary.scope.program", {
        count: activeI18n.formatNumber(applicants.length),
        program: pipeline.activeProgramLabel,
      })
    : activeI18n.t("applicants.summary.scope.global", {
        count: activeI18n.formatNumber(applicants.length),
      });

  root.innerHTML = `
    <article class="summary-chip">
      <span><i class="bi ${summaryIcon("applicants")}" aria-hidden="true"></i>${activeI18n.t(
        "applicants.summary.visible"
      )}</span>
      <strong>${activeI18n.formatNumber(filteredApplicants.length)}</strong>
      <small>${escapeHtml(scopeCopy)}</small>
    </article>
    <article class="summary-chip">
      <span><i class="bi ${summaryIcon("nodes")}" aria-hidden="true"></i>${activeI18n.t(
        "applicants.summary.activeNodes"
      )}</span>
      <strong>${activeI18n.formatNumber(activeNodes)}</strong>
      <small>${activeI18n.t("applicants.summary.nodesConfigured", {
        count: activeI18n.formatNumber(pipeline.nodes.length),
      })}</small>
    </article>
    <article class="summary-chip">
      <span><i class="bi ${summaryIcon("branches")}" aria-hidden="true"></i>${activeI18n.t(
        "applicants.summary.branchPoints"
      )}</span>
      <strong>${activeI18n.formatNumber(pipeline.branchingNodes.length)}</strong>
      <small>${activeI18n.t("applicants.summary.branchNodes")}</small>
    </article>
    <article class="summary-chip">
      <span><i class="bi ${summaryIcon("rules")}" aria-hidden="true"></i>${activeI18n.t(
        "applicants.summary.configuredRules"
      )}</span>
      <strong>${activeI18n.formatNumber(pipeline.transitions.length)}</strong>
      <small>${activeI18n.t("applicants.summary.ruleLogic")}</small>
    </article>
  `;
}

export function renderApplicantList(root, applicants, selectedId, pipeline, i18n) {
  setActiveI18n(i18n);
  if (!applicants.length) {
    root.innerHTML = `
      <article class="applicant-empty">
        <span class="section-caption">${activeI18n.t("applicants.empty.noMatch.kicker")}</span>
        <h3>${activeI18n.t("applicants.empty.noMatch.title")}</h3>
        <p>${activeI18n.t("applicants.empty.noMatch.copy")}</p>
      </article>
    `;
    return;
  }

  root.innerHTML = applicants
    .map((applicant) => {
      const isSelected = applicant.id === selectedId;
      const tone = statusTone(applicant.status);
      const band = scoreBand(applicant.score);

      return `
        <button
          type="button"
          class="applicant-card${isSelected ? " is-selected" : ""}"
          data-applicant-select="${applicant.id}"
        >
          <div class="applicant-card-top">
            <span class="applicant-program badge badge-md">${escapeHtml(applicant.program)}</span>
            <span class="score-pill badge badge-sm score-${band}">${activeI18n.formatNumber(
              applicant.score
            )}</span>
          </div>
          <div class="applicant-card-head">
            <strong>${escapeHtml(applicant.full_name)}</strong>
            <span class="mono-inline">${escapeHtml(applicant.email)}</span>
            <span class="applicant-card-trigger" aria-hidden="true">
              <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
            </span>
          </div>
          <div class="applicant-card-meta">
            <span class="status-pill badge badge-sm tone-${tone}">${escapeHtml(
              activeI18n.localizeApplicantStatus(applicant.status)
            )}</span>
            <span class="stage-pill badge badge-sm">${escapeHtml(formatStageLabel(applicant.stage, pipeline))}</span>
          </div>
        </button>
      `;
    })
    .join("");
}

export function renderApplicantSpotlight(root, applicant, pipeline, i18n) {
  setActiveI18n(i18n);
  if (!applicant) {
    root.innerHTML = `
      <div class="panel-kicker">${activeI18n.t("applicants.spotlight.kicker")}</div>
      <h2>${activeI18n.t("applicants.spotlight.emptyTitle")}</h2>
      <p class="control-note">
        ${activeI18n.t("applicants.spotlight.emptyCopy")}
      </p>
    `;
    return;
  }

  const currentNode = getPipelineNodeByStageValue(applicant.stage, pipeline);
  const outgoingTransitions = currentNode ? pipeline.transitionsByFrom.get(currentNode.id) ?? [] : [];
  const incomingTransitions = currentNode ? pipeline.transitionsByTo.get(currentNode.id) ?? [] : [];
  const stageFamily =
    currentNode?.parent?.label ??
    currentNode?.label ??
    activeI18n.t("applicants.spotlight.unmappedStage");
  const spotlightCopy = currentNode
    ? currentNode.description ||
      activeI18n.t("applicants.spotlight.nodeNeedsDescription")
    : activeI18n.t("applicants.spotlight.unmappedNodeCopy");

  root.innerHTML = `
    <div class="panel-kicker">${activeI18n.t("applicants.spotlight.kicker")}</div>
    <span class="spotlight-program badge badge-md">${escapeHtml(applicant.program)}</span>
    <h2>${escapeHtml(applicant.full_name)}</h2>
    <p class="spotlight-copy">
      ${escapeHtml(spotlightCopy)}
    </p>

    <div class="spotlight-metrics">
      <article>
        <span>${activeI18n.t("applicants.spotlight.stage")}</span>
        <strong>${escapeHtml(formatStageLabel(applicant.stage, pipeline))}</strong>
      </article>
      <article>
        <span>${activeI18n.t("applicants.spotlight.stageFamily")}</span>
        <strong>${escapeHtml(stageFamily)}</strong>
      </article>
      <article>
        <span>${activeI18n.t("applicants.spotlight.status")}</span>
        <strong>${escapeHtml(activeI18n.localizeApplicantStatus(applicant.status))}</strong>
      </article>
      <article>
        <span>${activeI18n.t("applicants.spotlight.score")}</span>
        <strong class="mono-inline">${activeI18n.formatNumber(applicant.score)}</strong>
      </article>
      <article>
        <span>${activeI18n.t("applicants.spotlight.email")}</span>
        <strong class="mono-inline">${escapeHtml(applicant.email)}</strong>
      </article>
      <article>
        <span>${activeI18n.t("applicants.spotlight.created")}</span>
        <strong>${escapeHtml(activeI18n.formatDate(applicant.created_at))}</strong>
      </article>
    </div>

    <div class="route-cluster-grid">
      <article class="route-cluster">
        <span class="section-caption"><i class="bi bi-arrow-right-circle" aria-hidden="true"></i>${activeI18n.t(
          "applicants.spotlight.nextSteps"
        )}</span>
        <div class="rule-card-stack">
          ${renderTransitionCards(
            outgoingTransitions,
            "toNode",
            activeI18n.t("pipeline.node.noOutgoing")
          )}
        </div>
      </article>
      <article class="route-cluster">
        <span class="section-caption"><i class="bi bi-arrow-down-left-circle" aria-hidden="true"></i>${activeI18n.t(
          "applicants.spotlight.arriveFrom"
        )}</span>
        <div class="rule-card-stack">
          ${renderTransitionCards(
            incomingTransitions,
            "fromNode",
            activeI18n.t("pipeline.node.noInbound")
          )}
        </div>
      </article>
    </div>
  `;
}

export function renderApplicantPipeline(root, applicants, pipeline, i18n, options = {}) {
  setActiveI18n(i18n);
  if (!pipeline.nodes.length) {
    root.innerHTML = `
      <article class="applicant-empty">
        <span class="section-caption">${activeI18n.t("applicants.empty.graph.kicker")}</span>
        <h3>${activeI18n.t("applicants.empty.graph.title")}</h3>
        <p>${activeI18n.t("applicants.empty.graph.copy")}</p>
      </article>
    `;
    return;
  }

  const activeNodeCounts = getNodeApplicantCounts(applicants, pipeline);
  const expandedStageIds = options.expandedStageIds ?? new Set();
  const directionSet = [];
  const programOptions = pipeline.programVersions
    .map(
      (programVersion) => `
        <option value="${escapeHtml(programVersion.id)}"${
          programVersion.id === pipeline.activeProgramId ? " selected" : ""
        }>
          ${escapeHtml(programVersion.label)}
        </option>
      `
    )
    .join("");
  const versionScopeCopy = pipeline.isProgramSpecific
    ? activeI18n.t("pipeline.preview.scope.program", {
        program: pipeline.activeProgramLabel,
      })
    : activeI18n.t("pipeline.preview.scope.global");

  for (const transition of pipeline.transitions) {
    if (!directionSet.includes(transition.direction)) {
      directionSet.push(transition.direction);
    }
  }

  root.innerHTML = `
    <section class="pipeline-visual-shell">
      <div class="pipeline-map-header">
        <div class="pipeline-map-copy">
          <span class="section-caption">${activeI18n.t("pipeline.preview.kicker")}</span>
          <h3><i class="bi bi-diagram-3" aria-hidden="true"></i>${activeI18n.t(
            "pipeline.preview.title"
          )}</h3>
          <p>
            ${activeI18n.t("pipeline.preview.copy")}
          </p>
          <div class="version-note">
            <i class="bi bi-folder2-open" aria-hidden="true"></i>
            ${escapeHtml(versionScopeCopy)}
          </div>
        </div>
        <div class="pipeline-map-controls">
          <label class="field pipeline-program-switcher">
            ${activeI18n.t("pipeline.preview.flowVersion")}
            <select data-pipeline-program-select>
              ${programOptions}
            </select>
          </label>
          <div class="pipeline-legend">
          <span class="legend-pill badge badge-sm"><i class="bi bi-signpost-2" aria-hidden="true"></i>${activeI18n.t("pipeline.preview.topLevelStage")}</span>
          <span class="legend-pill badge badge-sm"><i class="bi bi-node-plus" aria-hidden="true"></i>${activeI18n.t("pipeline.preview.subStage")}</span>
          <span class="legend-pill badge badge-sm"><i class="bi bi-person-badge" aria-hidden="true"></i>${activeI18n.t("pipeline.preview.badgeApplicants")}</span>
          </div>
        </div>
      </div>
      ${renderPipelineSvg(pipeline, applicants, expandedStageIds)}
      <div class="pipeline-direction-legend">
        ${directionSet
          .map((direction) => {
            const label = activeI18n.localizeDirection(direction);

            return `
              <span class="direction-pill badge badge-sm direction-${escapeHtml(direction)}">
                <i class="bi ${transitionIcon(direction)}" aria-hidden="true"></i>
                ${escapeHtml(label)}
              </span>
            `;
          })
          .join("")}
      </div>
    </section>

    <section class="pipeline-family-accordion">
      ${pipeline.stageNodes
        .map((stageNode) => {
          const familyApplicants = applicants.filter((applicant) =>
            stageNode.familyLabelKeys.has(normalize(applicant.stage))
          );
          const familyNodes = [stageNode, ...stageNode.children];
          const familyRuleCount = familyNodes.reduce(
            (total, node) => total + (pipeline.transitionsByFrom.get(node.id) ?? []).length,
            0
          );

          return `
            <details class="pipeline-family" data-family-id="${escapeHtml(stageNode.id)}">
              <summary class="pipeline-family-summary">
                <div class="pipeline-family-summary-main">
                  <div class="pipeline-family-summary-icon">
                    <i class="bi bi-signpost-2" aria-hidden="true"></i>
                  </div>
                  <div class="pipeline-family-summary-copy">
                    <span class="section-caption">${activeI18n.t("pipeline.family.title")}</span>
                    <h3>${escapeHtml(stageNode.label)}</h3>
                    <p>${escapeHtml(
                      stageNode.description || activeI18n.t("pipeline.family.noDescription")
                    )}</p>
                  </div>
                </div>
                <div class="pipeline-family-badges">
                  <span class="legend-pill badge badge-sm"><i class="bi bi-people" aria-hidden="true"></i>${activeI18n.t("pipeline.status.active", { count: activeI18n.formatNumber(familyApplicants.length) })}</span>
                  <span class="legend-pill badge badge-sm"><i class="bi bi-layers" aria-hidden="true"></i>${activeI18n.t("pipeline.status.nodes", { count: activeI18n.formatNumber(familyNodes.length) })}</span>
                  <span class="legend-pill badge badge-sm"><i class="bi bi-sign-turn-right" aria-hidden="true"></i>${activeI18n.t("pipeline.status.rules", { count: activeI18n.formatNumber(familyRuleCount) })}</span>
                  <span class="family-toggle"><i class="bi bi-chevron-down" aria-hidden="true"></i></span>
                </div>
              </summary>

              <div class="pipeline-family-body">
                <div class="pipeline-family-grid">
                  ${familyNodes
                    .map((node) => {
                      const exactApplicants = activeNodeCounts.get(node.id) ?? 0;
                      const outgoingTransitions = pipeline.transitionsByFrom.get(node.id) ?? [];
                      const incomingTransitions = pipeline.transitionsByTo.get(node.id) ?? [];

                      return `
                        <article class="graph-node${node.kind === "stage" ? " is-stage" : ""}${
                          outgoingTransitions.length > 1 ? " is-branching" : ""
                        }">
                          <div class="graph-node-head">
                            <div>
                              <span class="section-caption">
                                <i class="bi ${stageIcon(node.kind)}" aria-hidden="true"></i>
                                ${activeI18n.localizeNodeKind(node.kind)}
                              </span>
                              <h4>${escapeHtml(node.label)}</h4>
                            </div>
                            <strong>${activeI18n.formatNumber(exactApplicants)}</strong>
                          </div>
                          <p class="graph-node-copy">
                            ${escapeHtml(node.description || activeI18n.t("pipeline.node.noDescription"))}
                          </p>
                          <div class="graph-node-meta">
                            <span><i class="bi bi-arrow-down-left-circle" aria-hidden="true"></i>${activeI18n.t("pipeline.node.inCount", { count: activeI18n.formatNumber(incomingTransitions.length) })}</span>
                            <span><i class="bi bi-arrow-right-circle" aria-hidden="true"></i>${activeI18n.t("pipeline.node.outCount", { count: activeI18n.formatNumber(outgoingTransitions.length) })}</span>
                            <span><i class="bi bi-person-badge" aria-hidden="true"></i>${activeI18n.t("pipeline.node.activeCount", { count: activeI18n.formatNumber(exactApplicants) })}</span>
                          </div>
                          <div class="graph-route-group">
                            <span class="section-caption">${activeI18n.t("pipeline.node.routesOut")}</span>
                            <div class="graph-link-stack">
                              ${renderNodeRouteList(
                                outgoingTransitions,
                                "toNode",
                                activeI18n.t("pipeline.node.noOutgoing")
                              )}
                            </div>
                          </div>
                          <div class="graph-route-group">
                            <span class="section-caption">${activeI18n.t("pipeline.node.routesIn")}</span>
                            <div class="graph-link-stack">
                              ${renderNodeRouteList(
                                incomingTransitions,
                                "fromNode",
                                activeI18n.t("pipeline.node.noInbound")
                              )}
                            </div>
                          </div>
                        </article>
                      `;
                    })
                    .join("")}
                </div>
              </div>
            </details>
          `;
        })
        .join("")}
    </section>
  `;
}

export function renderApplicantPipelineStudio(root, pipeline, i18n) {
  setActiveI18n(i18n);
  const nodeKindOptions = getNodeKindOptions(activeI18n);
  const transitionDirectionOptions = getTransitionDirectionOptions(activeI18n);
  const stageParentOptions = pipeline.stageNodes
    .map(
      (stageNode) => `
        <option value="${escapeHtml(stageNode.id)}">${escapeHtml(stageNode.label)}</option>
      `
    )
    .join("");
  const nodeOptions = pipeline.applicantStageOptions
    .map(
      (option) => `
        <option value="${escapeHtml(option.nodeId)}">${escapeHtml(option.label)}</option>
      `
    )
    .join("");
  const sourceProgramOptions = pipeline.programVersions
    .map(
      (programVersion) => `
        <option value="${escapeHtml(programVersion.id)}">
          ${escapeHtml(programVersion.label)}
        </option>
      `
    )
    .join("");
  const versionCards = pipeline.programVersions
    .map(
      (programVersion) => `
        <button
          class="version-card${programVersion.id === pipeline.activeProgramId ? " is-active" : ""}"
          type="button"
          data-pipeline-select-program="${escapeHtml(programVersion.id)}"
          aria-pressed="${programVersion.id === pipeline.activeProgramId ? "true" : "false"}"
        >
          <span class="section-caption">${
            programVersion.type === "global"
              ? `<i class="bi bi-diagram-3" aria-hidden="true"></i>${activeI18n.t(
                  "pipeline.studio.globalDefault"
                )}`
              : `<i class="bi bi-buildings" aria-hidden="true"></i>${activeI18n.t(
                  "pipeline.studio.programVersion"
                )}`
          }</span>
          <strong>${escapeHtml(programVersion.label)}</strong>
          <small>
            ${activeI18n.t("pipeline.studio.statsSummary", {
              stages: activeI18n.formatNumber(programVersion.stageCount),
              rules: activeI18n.formatNumber(programVersion.transitionCount),
              nodes: activeI18n.formatNumber(programVersion.nodeCount),
            })}
          </small>
        </button>
      `
    )
    .join("");
  const versionCopy = pipeline.isProgramSpecific
    ? activeI18n.t("pipeline.studio.version.program", {
        program: pipeline.activeProgramLabel,
      })
    : activeI18n.t("pipeline.studio.version.global");

  root.innerHTML = `
    <details class="subpanel pipeline-studio-shell">
      <summary class="pipeline-studio-summary">
        <div class="pipeline-studio-summary-copy">
          <span class="panel-kicker">${activeI18n.t("pipeline.studio.title")}</span>
          <h2><i class="bi bi-sliders2-vertical" aria-hidden="true"></i>${activeI18n.t(
            "pipeline.studio.editTitle"
          )}</h2>
          <p>
            ${activeI18n.t("pipeline.studio.editCopy")}
          </p>
        </div>
        <div class="pipeline-family-badges">
          <span class="legend-pill badge badge-sm"><i class="bi bi-layers" aria-hidden="true"></i>${activeI18n.t("pipeline.status.nodes", { count: activeI18n.formatNumber(pipeline.nodes.length) })}</span>
          <span class="legend-pill badge badge-sm"><i class="bi bi-sign-turn-right" aria-hidden="true"></i>${activeI18n.t("pipeline.status.rules", { count: activeI18n.formatNumber(pipeline.transitions.length) })}</span>
          <span class="family-toggle"><i class="bi bi-chevron-down" aria-hidden="true"></i></span>
        </div>
      </summary>

      <div class="pipeline-studio-content">
        <div class="panel-header">
          <div>
            <span class="panel-kicker">${activeI18n.t("pipeline.studio.title")}</span>
            <h2>${activeI18n.t("pipeline.studio.graphConfiguration")}</h2>
          </div>
          <button class="ghost-button" type="button" data-pipeline-reset>
            <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
            ${activeI18n.t("pipeline.studio.resetAllVersions")}
          </button>
        </div>

        <p class="control-note">
          ${activeI18n.t("pipeline.studio.graphCopy")}
        </p>
        <p class="control-note">${escapeHtml(versionCopy)}</p>

        <div class="studio-version-grid">
          <article class="studio-catalog">
            <div class="section-caption">${activeI18n.t("pipeline.studio.flowVersions")}</div>
            <div class="version-card-grid">
              ${versionCards}
            </div>
          </article>

          <form class="studio-form" data-pipeline-form="program">
            <div class="section-caption">${activeI18n.t("pipeline.studio.createProgramVersion")}</div>
            <label>
              ${activeI18n.t("pipeline.studio.programName")}
              <input
                name="program_name"
                type="text"
                placeholder="MBA"
                required
              />
            </label>
            <label>
              ${activeI18n.t("pipeline.studio.cloneFrom")}
              <select name="source_program_id">
                ${sourceProgramOptions}
              </select>
            </label>
            <button class="primary-button" type="submit">
              <i class="bi bi-diagram-2" aria-hidden="true"></i>
              ${activeI18n.t("pipeline.studio.createVersion")}
            </button>
          </form>
        </div>

        <div class="studio-form-grid">
          <form class="studio-form" data-pipeline-form="node">
            <div class="section-caption">${activeI18n.t("pipeline.studio.addStageNode")}</div>
            <label>
              ${activeI18n.t("pipeline.studio.label")}
              <input
                name="label"
                type="text"
                placeholder="${escapeHtml(activeI18n.t("pipeline.studio.placeholder.nodeLabel"))}"
                required
              />
            </label>
            <label>
              ${activeI18n.t("pipeline.studio.nodeType")}
              <select name="kind">
                ${nodeKindOptions
                  .map(
                    (item) => `
                      <option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>
                    `
                  )
                  .join("")}
              </select>
            </label>
            <label>
              ${activeI18n.t("pipeline.studio.parentStage")}
              <select name="parent_id">
                <option value="">${activeI18n.t("pipeline.studio.chooseParentStage")}</option>
                ${stageParentOptions}
              </select>
            </label>
            <label>
              ${activeI18n.t("pipeline.studio.description")}
              <input
                name="description"
                type="text"
                placeholder="${escapeHtml(activeI18n.t("pipeline.studio.placeholder.description"))}"
              />
            </label>
            <button class="primary-button" type="submit">
              <i class="bi bi-plus-circle" aria-hidden="true"></i>
              ${activeI18n.t("pipeline.studio.addNode")}
            </button>
          </form>

          <form class="studio-form" data-pipeline-form="transition">
            <div class="section-caption">${activeI18n.t("pipeline.studio.addRule")}</div>
            <label>
              ${activeI18n.t("pipeline.studio.ruleLabel")}
              <input
                name="label"
                type="text"
                placeholder="${escapeHtml(activeI18n.t("pipeline.studio.placeholder.ruleLabel"))}"
                required
              />
            </label>
            <label>
              ${activeI18n.t("pipeline.studio.sourceNode")}
              <select name="from" ${nodeOptions ? "" : "disabled"}>
                <option value="">${activeI18n.t("pipeline.studio.chooseSourceNode")}</option>
                ${nodeOptions}
              </select>
            </label>
            <label>
              ${activeI18n.t("pipeline.studio.destinationNode")}
              <select name="to" ${nodeOptions ? "" : "disabled"}>
                <option value="">${activeI18n.t("pipeline.studio.chooseDestinationNode")}</option>
                ${nodeOptions}
              </select>
            </label>
            <label>
              ${activeI18n.t("pipeline.studio.direction")}
              <select name="direction">
                ${transitionDirectionOptions
                  .map(
                    (item) => `
                      <option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>
                    `
                  )
                  .join("")}
              </select>
            </label>
            <label>
              ${activeI18n.t("pipeline.studio.condition")}
              <input
                name="condition"
                type="text"
                placeholder="${escapeHtml(activeI18n.t("pipeline.studio.placeholder.condition"))}"
                required
              />
            </label>
            <button class="primary-button" type="submit">
              <i class="bi bi-sign-turn-right" aria-hidden="true"></i>
              ${activeI18n.t("pipeline.studio.addRuleAction")}
            </button>
          </form>
        </div>

        <p id="pipeline-config-message" class="form-message" data-tone="muted" aria-live="polite">
          ${activeI18n.t("pipeline.messages.default")}
        </p>

        <div class="studio-catalog-grid">
          <article class="studio-catalog">
            <div class="section-caption">${activeI18n.t("pipeline.studio.stageFamilies")}</div>
            <div class="stage-family-stack">
              ${renderStudioStageCatalog(pipeline)}
            </div>
          </article>
          <article class="studio-catalog">
            <div class="section-caption">${activeI18n.t("pipeline.studio.transitionRules")}</div>
            <div class="studio-rule-stack">
              ${renderStudioRuleCatalog(pipeline)}
            </div>
          </article>
        </div>
      </div>
    </details>
  `;
}
