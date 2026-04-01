import {
  getPipelineNodeByStageValue,
  isApplicantInStageFilter,
  nodeKindCatalog,
  transitionDirectionCatalog,
} from "../config/applicant-pipeline.js";

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
    <span class="direction-pill direction-${escapeHtml(transition.direction)}">
      <i class="bi ${transitionIcon(transition.direction)}" aria-hidden="true"></i>
      ${escapeHtml(transition.directionLabel)}
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

  return `${transitions.length} rules`;
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
        aria-label="Applicants pipeline graph map"
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
                    rx="12"
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
            const toggleLabel = stage.isExpanded ? "Hide sub-stages" : "Show sub-stages";
            const toggleSymbol = stage.isExpanded ? "-" : "+";

            return `
              <g class="pipeline-stage-shell ${stage.isExpanded ? "is-expanded" : "is-collapsed"}">
                <rect
                  class="pipeline-stage-frame"
                  x="${stage.x - stage.width / 2}"
                  y="${stage.y}"
                  width="${stage.width}"
                  height="${stage.height}"
                  rx="18"
                  ry="18"
                ></rect>
                <text class="pipeline-stage-meta" x="${stage.x - stage.width / 2 + 20}" y="${stage.y + 24}">
                  STAGE
                </text>
                <text class="pipeline-stage-count" x="${stage.x + stage.width / 2 - 22}" y="${stage.y + 25}">
                  ${stage.activeCount}
                </text>
                <g class="pipeline-stage-toggle" data-graph-stage-toggle="${escapeHtml(stage.id)}" tabindex="0" role="button" aria-label="${escapeHtml(toggleLabel)}">
                  <rect x="${stage.x - stage.width / 2 + 18}" y="${toggleY}" width="150" height="28" rx="10"></rect>
                  <text x="${stage.x - stage.width / 2 + 34}" y="${toggleY + 19}">${toggleSymbol}</text>
                  <text x="${stage.x - stage.width / 2 + 54}" y="${toggleY + 19}">
                    ${stage.isExpanded ? `${stage.substageCount} sub-stages` : `expand ${stage.substageCount}`}
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
                  rx="14"
                  ry="14"
                ></rect>
                <text class="pipeline-node-kicker" x="${item.x}" y="${item.y - item.height / 2 + 14}">
                  ${item.node.kind === "stage" ? "Primary node" : "Sub-stage"}
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
                          <rect x="${item.x + item.width / 2 - 46}" y="${activeBadgeY - 14}" width="34" height="24" rx="9"></rect>
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
        <span class="section-caption">No graph yet</span>
        <h3>Add the first stage family.</h3>
        <p>Start with a top-level stage, then add sub-stages and transition rules.</p>
      </article>
    `;
  }

  return pipeline.stageNodes
    .map(
      (stageNode) => `
        <article class="stage-family-card">
          <div class="stage-family-head">
            <div>
              <span class="section-caption">Stage family</span>
              <h3><i class="bi bi-signpost-2" aria-hidden="true"></i>${escapeHtml(stageNode.label)}</h3>
            </div>
            <button
              class="ghost-button compact-button"
              type="button"
              data-pipeline-remove-node="${escapeHtml(stageNode.id)}"
            >
              <i class="bi bi-trash3" aria-hidden="true"></i>
              Remove
            </button>
          </div>
          <p class="stage-family-copy">
            ${escapeHtml(stageNode.description || "No description yet for this stage family.")}
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
                              <span class="section-caption">Sub-stage</span>
                              <strong><i class="bi bi-node-plus" aria-hidden="true"></i>${escapeHtml(child.label)}</strong>
                            </div>
                            <button
                              class="ghost-button compact-button"
                              type="button"
                              data-pipeline-remove-node="${escapeHtml(child.id)}"
                            >
                              <i class="bi bi-trash3" aria-hidden="true"></i>
                              Remove
                            </button>
                          </div>
                          <p>${escapeHtml(child.description || "No description yet for this sub-stage.")}</p>
                        </article>
                      `
                    )
                    .join("")
                : `
                    <div class="rule-card empty">
                      This stage family has no sub-stages yet.
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
        <span class="section-caption">No rules yet</span>
        <h3>Add the first transition rule.</h3>
        <p>Rules define when applicants branch, advance, loop back or converge.</p>
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
              Remove
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

export function renderApplicantSummary(root, applicants, filteredApplicants, pipeline) {
  const activeNodes = new Set(filteredApplicants.map((applicant) => normalize(applicant.stage))).size;
  const scopeCopy = pipeline.isProgramSpecific
    ? `${applicants.length} applicants in ${pipeline.activeProgramLabel}`
    : `${applicants.length} total in current scope`;

  root.innerHTML = `
    <article class="summary-chip">
      <span><i class="bi ${summaryIcon("applicants")}" aria-hidden="true"></i>Visible Applicants</span>
      <strong>${filteredApplicants.length}</strong>
      <small>${escapeHtml(scopeCopy)}</small>
    </article>
    <article class="summary-chip">
      <span><i class="bi ${summaryIcon("nodes")}" aria-hidden="true"></i>Active Nodes</span>
      <strong>${activeNodes}</strong>
      <small>${pipeline.nodes.length} configured in the graph</small>
    </article>
    <article class="summary-chip">
      <span><i class="bi ${summaryIcon("branches")}" aria-hidden="true"></i>Branch Points</span>
      <strong>${pipeline.branchingNodes.length}</strong>
      <small>Nodes with more than one outgoing rule</small>
    </article>
    <article class="summary-chip">
      <span><i class="bi ${summaryIcon("rules")}" aria-hidden="true"></i>Configured Rules</span>
      <strong>${pipeline.transitions.length}</strong>
      <small>Reusable transition logic across the pipeline</small>
    </article>
  `;
}

export function renderApplicantList(root, applicants, selectedId, pipeline) {
  if (!applicants.length) {
    root.innerHTML = `
      <article class="applicant-empty">
        <span class="section-caption">No match</span>
        <h3>No applicants match the current filters.</h3>
        <p>Adjust the search term or filter values to recover the broader list.</p>
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
            <span class="applicant-program">${escapeHtml(applicant.program)}</span>
            <span class="score-pill score-${band}">${applicant.score}</span>
          </div>
          <div class="applicant-card-head">
            <strong>${escapeHtml(applicant.full_name)}</strong>
            <span class="mono-inline">${escapeHtml(applicant.email)}</span>
          </div>
          <div class="applicant-card-meta">
            <span class="status-pill tone-${tone}">${escapeHtml(applicant.status)}</span>
            <span class="stage-pill">${escapeHtml(formatStageLabel(applicant.stage, pipeline))}</span>
          </div>
        </button>
      `;
    })
    .join("");
}

export function renderApplicantSpotlight(root, applicant, pipeline) {
  if (!applicant) {
    root.innerHTML = `
      <div class="panel-kicker">Spotlight</div>
      <h2>Applicant focus</h2>
      <p class="control-note">
        Select an applicant from the queue to inspect the current node, eligible next steps and incoming rules.
      </p>
    `;
    return;
  }

  const currentNode = getPipelineNodeByStageValue(applicant.stage, pipeline);
  const outgoingTransitions = currentNode ? pipeline.transitionsByFrom.get(currentNode.id) ?? [] : [];
  const incomingTransitions = currentNode ? pipeline.transitionsByTo.get(currentNode.id) ?? [] : [];
  const stageFamily = currentNode?.parent?.label ?? currentNode?.label ?? "Unmapped stage";
  const spotlightCopy = currentNode
    ? currentNode.description ||
      "This node exists in the graph but still needs a richer operational description."
    : "This applicant currently sits on a stage label that is not mapped in the graph yet.";

  root.innerHTML = `
    <div class="panel-kicker">Spotlight</div>
    <span class="spotlight-program">${escapeHtml(applicant.program)}</span>
    <h2>${escapeHtml(applicant.full_name)}</h2>
    <p class="spotlight-copy">
      ${escapeHtml(spotlightCopy)}
    </p>

    <div class="spotlight-metrics">
      <article>
        <span>Stage</span>
        <strong>${escapeHtml(formatStageLabel(applicant.stage, pipeline))}</strong>
      </article>
      <article>
        <span>Stage Family</span>
        <strong>${escapeHtml(stageFamily)}</strong>
      </article>
      <article>
        <span>Status</span>
        <strong>${escapeHtml(applicant.status)}</strong>
      </article>
      <article>
        <span>Score</span>
        <strong class="mono-inline">${applicant.score}</strong>
      </article>
      <article>
        <span>Email</span>
        <strong class="mono-inline">${escapeHtml(applicant.email)}</strong>
      </article>
      <article>
        <span>Created</span>
        <strong>${escapeHtml(applicant.created_at)}</strong>
      </article>
    </div>

    <div class="route-cluster-grid">
      <article class="route-cluster">
        <span class="section-caption"><i class="bi bi-arrow-right-circle" aria-hidden="true"></i>Eligible Next Steps</span>
        <div class="rule-card-stack">
          ${renderTransitionCards(
            outgoingTransitions,
            "toNode",
            "No outgoing rules are configured for this node yet."
          )}
        </div>
      </article>
      <article class="route-cluster">
        <span class="section-caption"><i class="bi bi-arrow-down-left-circle" aria-hidden="true"></i>Can Arrive From</span>
        <div class="rule-card-stack">
          ${renderTransitionCards(
            incomingTransitions,
            "fromNode",
            "No inbound rules are configured for this node yet."
          )}
        </div>
      </article>
    </div>
  `;
}

export function renderApplicantPipeline(root, applicants, pipeline, options = {}) {
  if (!pipeline.nodes.length) {
    root.innerHTML = `
      <article class="applicant-empty">
        <span class="section-caption">Graph empty</span>
        <h3>No pipeline nodes are configured.</h3>
        <p>Add at least one top-level stage in the studio to define how applicants move.</p>
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
    ? `Viewing the ${pipeline.activeProgramLabel} flow version and applicants scoped to that program.`
    : "Viewing the global default flow version across all programs.";

  for (const transition of pipeline.transitions) {
    if (!directionSet.includes(transition.direction)) {
      directionSet.push(transition.direction);
    }
  }

  root.innerHTML = `
    <section class="pipeline-visual-shell">
      <div class="pipeline-map-header">
        <div class="pipeline-map-copy">
          <span class="section-caption">Graph Preview</span>
          <h3><i class="bi bi-diagram-3" aria-hidden="true"></i>Applicant Flow Map</h3>
          <p>
            This view emphasizes how stage families branch, converge and loop back. The SVG map is a quick
            structural read; use each stage toggle inside the canvas to reveal sub-stages and the accordions
            below for the detailed rule inventory.
          </p>
          <div class="version-note">
            <i class="bi bi-folder2-open" aria-hidden="true"></i>
            ${escapeHtml(versionScopeCopy)}
          </div>
        </div>
        <div class="pipeline-map-controls">
          <label class="field pipeline-program-switcher">
            Flow Version
            <select data-pipeline-program-select>
              ${programOptions}
            </select>
          </label>
          <div class="pipeline-legend">
          <span class="legend-pill"><i class="bi bi-signpost-2" aria-hidden="true"></i>Top-level stage</span>
          <span class="legend-pill"><i class="bi bi-node-plus" aria-hidden="true"></i>Sub-stage</span>
          <span class="legend-pill"><i class="bi bi-person-badge" aria-hidden="true"></i>Badge = active applicants</span>
          </div>
        </div>
      </div>
      ${renderPipelineSvg(pipeline, applicants, expandedStageIds)}
      <div class="pipeline-direction-legend">
        ${directionSet
          .map((direction) => {
            const label =
              transitionDirectionCatalog.find((item) => item.value === direction)?.label ?? direction;

            return `
              <span class="direction-pill direction-${escapeHtml(direction)}">
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
                    <span class="section-caption">Stage family</span>
                    <h3>${escapeHtml(stageNode.label)}</h3>
                    <p>${escapeHtml(
                      stageNode.description || "No description yet for this stage family."
                    )}</p>
                  </div>
                </div>
                <div class="pipeline-family-badges">
                  <span class="legend-pill"><i class="bi bi-people" aria-hidden="true"></i>${familyApplicants.length} active</span>
                  <span class="legend-pill"><i class="bi bi-layers" aria-hidden="true"></i>${familyNodes.length} nodes</span>
                  <span class="legend-pill"><i class="bi bi-sign-turn-right" aria-hidden="true"></i>${familyRuleCount} rules</span>
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
                                ${node.kind === "stage" ? "Stage" : "Sub-stage"}
                              </span>
                              <h4>${escapeHtml(node.label)}</h4>
                            </div>
                            <strong>${exactApplicants}</strong>
                          </div>
                          <p class="graph-node-copy">
                            ${escapeHtml(node.description || "No description yet for this node.")}
                          </p>
                          <div class="graph-node-meta">
                            <span><i class="bi bi-arrow-down-left-circle" aria-hidden="true"></i>${incomingTransitions.length} in</span>
                            <span><i class="bi bi-arrow-right-circle" aria-hidden="true"></i>${outgoingTransitions.length} out</span>
                            <span><i class="bi bi-person-badge" aria-hidden="true"></i>${exactApplicants} active</span>
                          </div>
                          <div class="graph-route-group">
                            <span class="section-caption">Routes Out</span>
                            <div class="graph-link-stack">
                              ${renderNodeRouteList(
                                outgoingTransitions,
                                "toNode",
                                "No outgoing rules yet."
                              )}
                            </div>
                          </div>
                          <div class="graph-route-group">
                            <span class="section-caption">Routes In</span>
                            <div class="graph-link-stack">
                              ${renderNodeRouteList(
                                incomingTransitions,
                                "fromNode",
                                "No inbound rules yet."
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

export function renderApplicantPipelineStudio(root, pipeline) {
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
            programVersion.type === "global" ? "Global default" : "Program version"
          }</span>
          <strong>${escapeHtml(programVersion.label)}</strong>
          <small>
            ${programVersion.stageCount} stages / ${programVersion.transitionCount} rules /
            ${programVersion.nodeCount} nodes
          </small>
        </button>
      `
    )
    .join("");
  const versionCopy = pipeline.isProgramSpecific
    ? `You are editing the program-specific version for ${pipeline.activeProgramLabel}.`
    : "You are editing the global default flow that programs can clone and specialize.";

  root.innerHTML = `
    <details class="subpanel pipeline-studio-shell">
      <summary class="pipeline-studio-summary">
        <div class="pipeline-studio-summary-copy">
          <span class="panel-kicker">Pipeline Studio</span>
          <h2><i class="bi bi-sliders2-vertical" aria-hidden="true"></i>Edit graph configuration</h2>
          <p>
            Full-width editing panel for stages, sub-stages and transition rules. Collapse it when you want
            to focus only on the flow view.
          </p>
        </div>
        <div class="pipeline-family-badges">
          <span class="legend-pill"><i class="bi bi-layers" aria-hidden="true"></i>${pipeline.nodes.length} nodes</span>
          <span class="legend-pill"><i class="bi bi-sign-turn-right" aria-hidden="true"></i>${pipeline.transitions.length} rules</span>
          <span class="family-toggle"><i class="bi bi-chevron-down" aria-hidden="true"></i></span>
        </div>
      </summary>

      <div class="pipeline-studio-content">
        <div class="panel-header">
          <div>
            <span class="panel-kicker">Pipeline Studio</span>
            <h2>Graph configuration</h2>
          </div>
          <button class="ghost-button" type="button" data-pipeline-reset>
            <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
            Reset all versions
          </button>
        </div>

        <p class="control-note">
          The pipeline is modeled as a graph. Stages, sub-stages and rule-based transitions can branch,
          converge or move backward without forcing a linear order, and each program can own its own version.
        </p>
        <p class="control-note">${escapeHtml(versionCopy)}</p>

        <div class="studio-version-grid">
          <article class="studio-catalog">
            <div class="section-caption">Flow Versions</div>
            <div class="version-card-grid">
              ${versionCards}
            </div>
          </article>

          <form class="studio-form" data-pipeline-form="program">
            <div class="section-caption">Create Program Version</div>
            <label>
              Program name
              <input
                name="program_name"
                type="text"
                placeholder="MBA"
                required
              />
            </label>
            <label>
              Clone from
              <select name="source_program_id">
                ${sourceProgramOptions}
              </select>
            </label>
            <button class="primary-button" type="submit">
              <i class="bi bi-diagram-2" aria-hidden="true"></i>
              Create version
            </button>
          </form>
        </div>

        <div class="studio-form-grid">
          <form class="studio-form" data-pipeline-form="node">
            <div class="section-caption">Add Stage Node</div>
            <label>
              Label
              <input name="label" type="text" placeholder="Scholarship Review" required />
            </label>
            <label>
              Node type
              <select name="kind">
                ${nodeKindCatalog
                  .map(
                    (item) => `
                      <option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>
                    `
                  )
                  .join("")}
              </select>
            </label>
            <label>
              Parent stage
              <select name="parent_id">
                <option value="">Choose a parent stage</option>
                ${stageParentOptions}
              </select>
            </label>
            <label>
              Description
              <input
                name="description"
                type="text"
                placeholder="Operational context for this node"
              />
            </label>
            <button class="primary-button" type="submit">
              <i class="bi bi-plus-circle" aria-hidden="true"></i>
              Add node
            </button>
          </form>

          <form class="studio-form" data-pipeline-form="transition">
            <div class="section-caption">Add Rule</div>
            <label>
              Rule label
              <input name="label" type="text" placeholder="Escalate to committee" required />
            </label>
            <label>
              Source node
              <select name="from" ${nodeOptions ? "" : "disabled"}>
                <option value="">Choose the source node</option>
                ${nodeOptions}
              </select>
            </label>
            <label>
              Destination node
              <select name="to" ${nodeOptions ? "" : "disabled"}>
                <option value="">Choose the destination node</option>
                ${nodeOptions}
              </select>
            </label>
            <label>
              Direction
              <select name="direction">
                ${transitionDirectionCatalog
                  .map(
                    (item) => `
                      <option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>
                    `
                  )
                  .join("")}
              </select>
            </label>
            <label>
              Condition
              <input
                name="condition"
                type="text"
                placeholder="Explain the decision rule or trigger"
                required
              />
            </label>
            <button class="primary-button" type="submit">
              <i class="bi bi-sign-turn-right" aria-hidden="true"></i>
              Add rule
            </button>
          </form>
        </div>

        <p id="pipeline-config-message" class="form-message" data-tone="muted" aria-live="polite">
          Configure the graph and the rest of the module will inherit it.
        </p>

        <div class="studio-catalog-grid">
          <article class="studio-catalog">
            <div class="section-caption">Stage Families</div>
            <div class="stage-family-stack">
              ${renderStudioStageCatalog(pipeline)}
            </div>
          </article>
          <article class="studio-catalog">
            <div class="section-caption">Transition Rules</div>
            <div class="studio-rule-stack">
              ${renderStudioRuleCatalog(pipeline)}
            </div>
          </article>
        </div>
      </div>
    </details>
  `;
}
