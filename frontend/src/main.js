import { fetchDashboard, createApplicant } from "./services/api.js";
import { renderStatCards } from "./components/statCard.js";
import {
  filterApplicants,
  renderApplicantList,
  renderApplicantPipeline,
  renderApplicantPipelineStudio,
  renderApplicantSpotlight,
  renderApplicantSummary,
} from "./pages/applicants.js";
import { renderTaskCards } from "./pages/dashboard.js";
import {
  applyDesignConfig,
  getInitialDesignConfig,
  resetDesignConfig,
  saveDesignConfig,
} from "./config/design-system.js";
import {
  addProgramPipeline,
  addPipelineNode,
  addPipelineTransition,
  getInitialApplicantPipelineConfig,
  isApplicantInActiveProgramScope,
  removePipelineNode,
  removePipelineTransition,
  resetApplicantPipelineConfig,
  resolveApplicantPipelineConfig,
  saveApplicantPipelineConfig,
  setActiveProgramPipeline,
} from "./config/applicant-pipeline.js";
import { bindThemeStudio, renderThemeStudio } from "./components/themeStudio.js";

const routeEyebrow = document.querySelector("#route-eyebrow");
const routeTitle = document.querySelector("#route-title");
const routeCopy = document.querySelector("#route-copy");
const routeLinks = Array.from(document.querySelectorAll("[data-route-link]"));
const routeSections = Array.from(document.querySelectorAll("[data-route-section]"));
const statsRoot = document.querySelector("#stats");
const tasksRoot = document.querySelector("#tasks-list");
const refreshButton = document.querySelector("#refresh-applicants");
const applicantForm = document.querySelector("#applicant-form");
const applicantProgramField = applicantForm?.elements.namedItem("program");
const applicantStageField = applicantForm?.elements.namedItem("stage");
const applicantSubmitButton = applicantForm?.querySelector('[type="submit"]');
const formMessage = document.querySelector("#form-message");
const designOverviewRoot = document.querySelector("#design-overview");
const designConfiguratorRoot = document.querySelector("#design-configurator");
const applicantSummaryRoot = document.querySelector("#applicant-summary");
const applicantsListRoot = document.querySelector("#applicants-list");
const applicantSpotlightRoot = document.querySelector("#applicant-spotlight");
const applicantPipelineRoot = document.querySelector("#applicant-pipeline");
const pipelineStudioRoot = document.querySelector("#pipeline-studio");
const applicantSearchInput = document.querySelector("#applicant-search");
const applicantStageFilter = document.querySelector("#applicant-stage-filter");
const applicantStatusFilter = document.querySelector("#applicant-status-filter");

const ROUTES = {
  overview: {
    key: "overview",
    path: "/",
    eyebrow: "Overview Module",
    title: "Operational overview across admissions and advising.",
    copy:
      "Use this shell as the landing layer. Configuration and Applicants now live as first-class modules with their own URLs and navigation state.",
    needsDashboard: true,
  },
  configuration: {
    key: "configuration",
    path: "/configuration",
    eyebrow: "Configuration Module",
    title: "Theme tokens, typography and visual defaults stay isolated.",
    copy:
      "This module owns palette, font selection and runtime presentation rules so business areas inherit visual decisions instead of redefining them.",
    needsDashboard: false,
  },
  applicants: {
    key: "applicants",
    path: "/applicants",
    eyebrow: "Applicants Module",
    title: "Admissions queue, graph rules and applicant capture.",
    copy:
      "Applicants move through a configurable graph, not a fixed list. Stages, sub-stages and rule-based transitions shape the shell before we persist the model in endpoints and schema.",
    needsDashboard: true,
  },
};

let designConfig = getInitialDesignConfig();
let applicantPipelineConfig = getInitialApplicantPipelineConfig();
let pipelineMessage = {
  tone: "muted",
  text: "Configure the graph and the rest of the module will inherit it.",
};
let applicantsState = {
  items: [],
  filters: {
    search: "",
    stage: "all",
    status: "all",
  },
  selectedId: null,
};
let pipelineViewState = {
  expandedStageIdsByProgram: {},
};
let dashboardLoaded = false;

function normalizePath(pathname) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function getActiveRoute() {
  const normalizedPath = normalizePath(window.location.pathname);

  return (
    Object.values(ROUTES).find((route) => route.path === normalizedPath) ?? ROUTES.overview
  );
}

function populateSelect(select, options) {
  select.replaceChildren();

  for (const option of options) {
    const element = document.createElement("option");
    element.value = option.value;
    element.textContent = option.label;

    if (option.disabled) {
      element.disabled = true;
    }

    select.append(element);
  }
}

function applyPipelineMessage() {
  const messageRoot = document.querySelector("#pipeline-config-message");

  if (!messageRoot) {
    return;
  }

  messageRoot.textContent = pipelineMessage.text;
  messageRoot.dataset.tone = pipelineMessage.tone;
}

function getOpenPipelineFamilyIds() {
  return new Set(
    Array.from(applicantPipelineRoot.querySelectorAll(".pipeline-family[open]")).map(
      (element) => element.dataset.familyId
    )
  );
}

function restoreOpenPipelineFamilyIds(openIds) {
  for (const detail of applicantPipelineRoot.querySelectorAll(".pipeline-family")) {
    if (openIds.has(detail.dataset.familyId)) {
      detail.setAttribute("open", "");
    }
  }
}

function isPipelineStudioOpen() {
  return Boolean(pipelineStudioRoot.querySelector(".pipeline-studio-shell")?.open);
}

function restorePipelineStudioOpenState(openState) {
  const studioDetails = pipelineStudioRoot.querySelector(".pipeline-studio-shell");

  if (!studioDetails) {
    return;
  }

  if (openState) {
    studioDetails.setAttribute("open", "");
  } else {
    studioDetails.removeAttribute("open");
  }
}

function getExpandedStageIds(programId) {
  return new Set(pipelineViewState.expandedStageIdsByProgram[programId] ?? []);
}

function setExpandedStageIds(programId, stageIds) {
  pipelineViewState.expandedStageIdsByProgram = {
    ...pipelineViewState.expandedStageIdsByProgram,
    [programId]: [...stageIds],
  };
}

function syncRouteShell() {
  const activeRoute = getActiveRoute();

  document.title = `Academic CRM | ${activeRoute.eyebrow.replace(" Module", "")}`;
  document.body.dataset.route = activeRoute.key;
  routeEyebrow.textContent = activeRoute.eyebrow;
  routeTitle.textContent = activeRoute.title;
  routeCopy.textContent = activeRoute.copy;

  for (const link of routeLinks) {
    const linkPath = normalizePath(link.getAttribute("href"));
    const isActive = linkPath === activeRoute.path;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }

  for (const section of routeSections) {
    const allowedRoutes = String(section.dataset.routeSection).split(/\s+/);
    section.hidden = !allowedRoutes.includes(activeRoute.key);
  }

  return activeRoute;
}

function syncDesignSystem() {
  applyDesignConfig(designConfig);
  renderThemeStudio({
    overviewRoot: designOverviewRoot,
    controlsRoot: designConfiguratorRoot,
    config: designConfig,
  });
  saveDesignConfig(designConfig);
}

function resolvePipeline() {
  return resolveApplicantPipelineConfig(applicantPipelineConfig);
}

function syncApplicantStageControls(pipeline) {
  const filterOptions = [
    { value: "all", label: "All stage families" },
    ...pipeline.stageFilterOptions,
  ];
  populateSelect(applicantStageFilter, filterOptions);

  if (!filterOptions.some((option) => option.value === applicantsState.filters.stage)) {
    applicantsState.filters.stage = "all";
  }

  applicantStageFilter.value = applicantsState.filters.stage;

  const currentStageValue = applicantStageField?.value ?? "";
  const applicantStageOptions = pipeline.applicantStageOptions;

  if (applicantProgramField) {
    if (pipeline.isProgramSpecific) {
      applicantProgramField.value = pipeline.activeProgramName;
      applicantProgramField.dataset.lockedProgram = pipeline.activeProgramName;
      applicantProgramField.readOnly = true;
      applicantProgramField.setAttribute("aria-readonly", "true");
    } else {
      const lockedProgram = applicantProgramField.dataset.lockedProgram;
      if (lockedProgram && applicantProgramField.value === lockedProgram) {
        applicantProgramField.value = "";
      }
      delete applicantProgramField.dataset.lockedProgram;
      applicantProgramField.readOnly = false;
      applicantProgramField.removeAttribute("aria-readonly");
    }
  }

  if (!applicantStageField || !applicantSubmitButton) {
    return;
  }

  if (!applicantStageOptions.length) {
    populateSelect(applicantStageField, [
      {
        value: "",
        label: "Configure a stage node first",
        disabled: true,
      },
    ]);
    applicantStageField.disabled = true;
    applicantSubmitButton.disabled = true;
    return;
  }

  populateSelect(applicantStageField, applicantStageOptions);
  applicantStageField.disabled = false;
  applicantSubmitButton.disabled = false;
  applicantStageField.value = applicantStageOptions.some(
    (option) => option.value === currentStageValue
  )
    ? currentStageValue
    : applicantStageOptions[0].value;
}

function syncPipelineStudio() {
  const pipeline = resolvePipeline();
  const shouldStayOpen = isPipelineStudioOpen();

  renderApplicantPipelineStudio(pipelineStudioRoot, pipeline);
  restorePipelineStudioOpenState(shouldStayOpen);
  syncApplicantStageControls(pipeline);
  applyPipelineMessage();
}

function syncApplicantsModule() {
  const pipeline = resolvePipeline();
  const openFamilyIds = getOpenPipelineFamilyIds();
  const validExpandedStageIds = new Set(
    [...getExpandedStageIds(pipeline.activeProgramId)].filter((stageId) =>
      pipeline.stageNodes.some((stageNode) => stageNode.id === stageId)
    )
  );
  setExpandedStageIds(pipeline.activeProgramId, validExpandedStageIds);
  const scopedApplicants = applicantsState.items.filter((applicant) =>
    isApplicantInActiveProgramScope(applicant.program, pipeline)
  );
  const filteredApplicants = filterApplicants(
    scopedApplicants,
    applicantsState.filters,
    pipeline
  );

  if (!filteredApplicants.some((applicant) => applicant.id === applicantsState.selectedId)) {
    applicantsState.selectedId = filteredApplicants[0]?.id ?? null;
  }

  const selectedApplicant =
    filteredApplicants.find((applicant) => applicant.id === applicantsState.selectedId) ?? null;

  renderApplicantSummary(
    applicantSummaryRoot,
    scopedApplicants,
    filteredApplicants,
    pipeline
  );
  renderApplicantList(applicantsListRoot, filteredApplicants, applicantsState.selectedId, pipeline);
  renderApplicantSpotlight(applicantSpotlightRoot, selectedApplicant, pipeline);
  renderApplicantPipeline(applicantPipelineRoot, filteredApplicants, pipeline, {
    expandedStageIds: validExpandedStageIds,
  });
  restoreOpenPipelineFamilyIds(openFamilyIds);
}

function updatePipelineConfig(nextConfig, messageText) {
  applicantPipelineConfig = nextConfig;
  saveApplicantPipelineConfig(applicantPipelineConfig);
  pipelineMessage = {
    tone: "success",
    text: messageText,
  };
  syncPipelineStudio();
  syncApplicantsModule();
}

async function loadDashboard({ force = false } = {}) {
  if (dashboardLoaded && !force) {
    return;
  }

  const payload = await fetchDashboard();

  renderStatCards(statsRoot, payload.stats);
  applicantsState.items = payload.applicants;
  syncApplicantsModule();
  renderTaskCards(tasksRoot, payload.tasks);
  dashboardLoaded = true;
}

async function reloadApplicants() {
  await loadDashboard({ force: true });
}

async function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(applicantForm);
  const payload = {
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    program: formData.get("program"),
    status: formData.get("status"),
    stage: formData.get("stage"),
    score: Number(formData.get("score")),
  };

  formMessage.textContent = "Saving applicant...";

  try {
    await createApplicant(payload);
    applicantForm.reset();
    syncApplicantStageControls(resolvePipeline());
    formMessage.textContent = "Applicant created.";
    await loadDashboard({ force: true });
  } catch (error) {
    formMessage.textContent = error.message;
  }
}

function handlePipelineStudioSubmit(event) {
  const form = event.target.closest("[data-pipeline-form]");

  if (!form) {
    return;
  }

  event.preventDefault();
  const formData = new FormData(form);

  try {
    if (form.dataset.pipelineForm === "program") {
      updatePipelineConfig(
        addProgramPipeline(applicantPipelineConfig, {
          programName: formData.get("program_name"),
          sourceProgramId: formData.get("source_program_id"),
        }),
        "Program-specific flow version created."
      );
      return;
    }

    if (form.dataset.pipelineForm === "node") {
      updatePipelineConfig(
        addPipelineNode(applicantPipelineConfig, {
          label: formData.get("label"),
          kind: formData.get("kind"),
          parentId: formData.get("parent_id"),
          description: formData.get("description"),
        }),
        "Pipeline node added."
      );
      return;
    }

    if (form.dataset.pipelineForm === "transition") {
      updatePipelineConfig(
        addPipelineTransition(applicantPipelineConfig, {
          from: formData.get("from"),
          to: formData.get("to"),
          label: formData.get("label"),
          direction: formData.get("direction"),
          condition: formData.get("condition"),
        }),
        "Transition rule added."
      );
    }
  } catch (error) {
    pipelineMessage = {
      tone: "error",
      text: error.message,
    };
    applyPipelineMessage();
  }
}

function handlePipelineStudioClick(event) {
  const resetButton = event.target.closest("[data-pipeline-reset]");
  const selectProgramButton = event.target.closest("[data-pipeline-select-program]");
  const removeNodeButton = event.target.closest("[data-pipeline-remove-node]");
  const removeTransitionButton = event.target.closest("[data-pipeline-remove-transition]");

  if (resetButton) {
    updatePipelineConfig(resetApplicantPipelineConfig(), "Pipeline graph reset to the default preset.");
    return;
  }

  if (selectProgramButton) {
    updatePipelineConfig(
      setActiveProgramPipeline(applicantPipelineConfig, selectProgramButton.dataset.pipelineSelectProgram),
      "Flow version changed."
    );
    return;
  }

  if (removeNodeButton) {
    updatePipelineConfig(
      removePipelineNode(applicantPipelineConfig, removeNodeButton.dataset.pipelineRemoveNode),
      "Pipeline node removed."
    );
    return;
  }

  if (removeTransitionButton) {
    updatePipelineConfig(
      removePipelineTransition(
        applicantPipelineConfig,
        removeTransitionButton.dataset.pipelineRemoveTransition
      ),
      "Transition rule removed."
    );
  }
}

function handlePipelineProgramChange(event) {
  const select = event.target.closest?.("[data-pipeline-program-select]");

  if (!select) {
    return;
  }

  updatePipelineConfig(
    setActiveProgramPipeline(applicantPipelineConfig, select.value),
    "Flow version changed."
  );
}

function handleApplicantPipelineClick(event) {
  const toggle = event.target.closest?.("[data-graph-stage-toggle]");

  if (!toggle) {
    return;
  }

  const stageId = toggle.dataset.graphStageToggle;

  if (!stageId) {
    return;
  }

  const pipeline = resolvePipeline();
  const expandedStageIds = getExpandedStageIds(pipeline.activeProgramId);

  if (expandedStageIds.has(stageId)) {
    expandedStageIds.delete(stageId);
  } else {
    expandedStageIds.add(stageId);
  }

  setExpandedStageIds(pipeline.activeProgramId, expandedStageIds);

  syncApplicantsModule();
}

function handleApplicantPipelineKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const toggle = event.target.closest?.("[data-graph-stage-toggle]");

  if (!toggle) {
    return;
  }

  event.preventDefault();
  toggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

bindThemeStudio(designConfiguratorRoot, {
  onPresetChange(preset) {
    designConfig = {
      ...designConfig,
      preset,
      colors: {},
    };
    syncDesignSystem();
  },
  onFontChange(slot, value) {
    designConfig = {
      ...designConfig,
      typography: {
        ...designConfig.typography,
        [slot]: value,
      },
    };
    syncDesignSystem();
  },
  onColorChange(token, value) {
    designConfig = {
      ...designConfig,
      colors: {
        ...designConfig.colors,
        [token]: value,
      },
    };
    syncDesignSystem();
  },
  onReset() {
    designConfig = resetDesignConfig();
    syncDesignSystem();
  },
});

syncDesignSystem();
syncPipelineStudio();
const activeRoute = syncRouteShell();
refreshButton.addEventListener("click", reloadApplicants);
applicantForm.addEventListener("submit", handleSubmit);
pipelineStudioRoot.addEventListener("submit", handlePipelineStudioSubmit);
pipelineStudioRoot.addEventListener("click", handlePipelineStudioClick);
pipelineStudioRoot.addEventListener("change", handlePipelineProgramChange);
applicantPipelineRoot.addEventListener("click", handleApplicantPipelineClick);
applicantPipelineRoot.addEventListener("keydown", handleApplicantPipelineKeydown);
applicantPipelineRoot.addEventListener("change", handlePipelineProgramChange);
applicantSearchInput.addEventListener("input", (event) => {
  applicantsState.filters.search = event.target.value;
  syncApplicantsModule();
});
applicantStageFilter.addEventListener("change", (event) => {
  applicantsState.filters.stage = event.target.value;
  syncApplicantsModule();
});
applicantStatusFilter.addEventListener("change", (event) => {
  applicantsState.filters.status = event.target.value;
  syncApplicantsModule();
});
applicantsListRoot.addEventListener("click", (event) => {
  const button = event.target.closest("[data-applicant-select]");

  if (!button) {
    return;
  }

  applicantsState.selectedId = Number(button.dataset.applicantSelect);
  syncApplicantsModule();
});

if (activeRoute.needsDashboard) {
  loadDashboard().catch((error) => {
    formMessage.textContent = error.message;
  });
}
