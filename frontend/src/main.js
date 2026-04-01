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
  isUsingSystemMode,
  getInitialDesignConfig,
  resetDesignConfig,
  saveDesignConfig,
  subscribeToSystemColorScheme,
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
import {
  createI18n,
  getInitialLocalePreference,
  getLocaleOptions,
  saveLocalePreference,
} from "./config/i18n.js";
import { bindThemeStudio, renderThemeStudio } from "./components/themeStudio.js";

const routeEyebrow = document.querySelector("#route-eyebrow");
const routeTitle = document.querySelector("#route-title");
const routeCopy = document.querySelector("#route-copy");
const routeLinks = Array.from(document.querySelectorAll("[data-route-link]"));
const routeSections = Array.from(document.querySelectorAll("[data-route-section]"));
const topbarNavRow = document.querySelector(".topbar-nav-row");
const sessionMenu = document.querySelector(".session-menu");
const moduleBarToggleButtons = Array.from(
  document.querySelectorAll("[data-toggle-module-bar]")
);
const statsRoot = document.querySelector("#stats");
const tasksRoot = document.querySelector("#tasks-list");
const refreshButton = document.querySelector("#refresh-applicants");
const applicantForm = document.querySelector("#applicant-form");
const applicantProgramField = applicantForm?.elements.namedItem("program");
const applicantStatusField = applicantForm?.elements.namedItem("status");
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
const SHELL_PREFERENCES_KEY = "academic-crm-shell-preferences:v1";

const ROUTES = {
  overview: {
    key: "overview",
    path: "/",
    eyebrowKey: "routes.overview.eyebrow",
    titleKey: "routes.overview.title",
    copyKey: "routes.overview.copy",
    needsDashboard: true,
  },
  configuration: {
    key: "configuration",
    path: "/configuration",
    eyebrowKey: "routes.configuration.eyebrow",
    titleKey: "routes.configuration.title",
    copyKey: "routes.configuration.copy",
    needsDashboard: false,
  },
  applicants: {
    key: "applicants",
    path: "/applicants",
    eyebrowKey: "routes.applicants.eyebrow",
    titleKey: "routes.applicants.title",
    copyKey: "routes.applicants.copy",
    needsDashboard: true,
  },
};

let designConfig = getInitialDesignConfig();
let locale = getInitialLocalePreference();
let i18n = createI18n(locale);
let applicantPipelineConfig = getInitialApplicantPipelineConfig();
let pipelineMessage = {
  tone: "muted",
  key: "pipeline.messages.default",
};
let dashboardState = {
  stats: [],
  tasks: [],
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
let shellPreferences = getInitialShellPreferences();

function getInitialShellPreferences() {
  try {
    const savedPreferences = JSON.parse(
      window.localStorage.getItem(SHELL_PREFERENCES_KEY) ?? "{}"
    );

    return {
      hideModuleBar: Boolean(savedPreferences.hideModuleBar),
    };
  } catch {
    return {
      hideModuleBar: false,
    };
  }
}

function saveShellPreferences() {
  window.localStorage.setItem(SHELL_PREFERENCES_KEY, JSON.stringify(shellPreferences));
}

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

function getApplicantStatusOptions({ includeAll = false } = {}) {
  const options = [];

  if (includeAll) {
    options.push({
      value: "all",
      label: i18n.t("applicants.controls.allStatuses"),
    });
  }

  options.push(
    {
      value: "In Review",
      label: i18n.localizeApplicantStatus("In Review"),
    },
    {
      value: "Offer Ready",
      label: i18n.localizeApplicantStatus("Offer Ready"),
    },
    {
      value: "Awaiting Documents",
      label: i18n.localizeApplicantStatus("Awaiting Documents"),
    }
  );

  return options;
}

function localizeMessage(error) {
  if (!error) {
    return i18n.t("app.status.requestFailed");
  }

  if (typeof error.code === "string") {
    return i18n.t(error.code, {}, error.message ?? error.code);
  }

  if (typeof error.message === "string" && error.message.startsWith("pipeline.")) {
    return i18n.t(error.message, {}, error.message);
  }

  return error.message ?? i18n.t("app.status.requestFailed");
}

function syncStaticTranslations() {
  document.documentElement.lang = locale;

  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = i18n.t(element.dataset.i18n);
  }

  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    element.setAttribute("placeholder", i18n.t(element.dataset.i18nPlaceholder));
  }

  for (const element of document.querySelectorAll("[data-i18n-aria-label]")) {
    element.setAttribute("aria-label", i18n.t(element.dataset.i18nAriaLabel));
  }
}

function applyPipelineMessage() {
  const messageRoot = document.querySelector("#pipeline-config-message");

  if (!messageRoot) {
    return;
  }

  messageRoot.textContent = i18n.t(pipelineMessage.key, pipelineMessage.values ?? {});
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

function syncShellChrome() {
  const hideModuleBar = Boolean(shellPreferences.hideModuleBar);

  if (topbarNavRow) {
    topbarNavRow.hidden = hideModuleBar;
  }

  document.body.dataset.moduleNavHidden = hideModuleBar ? "true" : "false";

  for (const button of moduleBarToggleButtons) {
    const icon = button.querySelector("i");
    const label = button.querySelector("[data-module-bar-label]");

    if (icon) {
      icon.className = `bi ${hideModuleBar ? "bi-eye" : "bi-eye-slash"}`;
    }

    if (label) {
      label.textContent = hideModuleBar
        ? i18n.t("shell.actions.showModuleBar")
        : i18n.t("shell.actions.hideModuleBar");
    }

    button.setAttribute("aria-pressed", String(hideModuleBar));
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
  const eyebrow = i18n.t(activeRoute.eyebrowKey);
  const title = i18n.t(activeRoute.titleKey);
  const copy = i18n.t(activeRoute.copyKey);

  document.title = `Academic CRM | ${eyebrow.replace(/ Module$| Módulo$/, "")}`;
  document.body.dataset.route = activeRoute.key;
  routeEyebrow.textContent = eyebrow;
  routeTitle.textContent = title;
  routeCopy.textContent = copy;

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
  syncStaticTranslations();
  renderThemeStudio({
    overviewRoot: designOverviewRoot,
    controlsRoot: designConfiguratorRoot,
    config: designConfig,
    i18n,
    locale,
    localeOptions: getLocaleOptions(i18n),
  });
  saveDesignConfig(designConfig);
}

function resolvePipeline() {
  return resolveApplicantPipelineConfig(applicantPipelineConfig);
}

function syncApplicantStageControls(pipeline) {
  const filterOptions = [
    { value: "all", label: i18n.t("applicants.controls.allStageFamilies") },
    ...pipeline.stageFilterOptions,
  ];
  populateSelect(applicantStageFilter, filterOptions);

  if (!filterOptions.some((option) => option.value === applicantsState.filters.stage)) {
    applicantsState.filters.stage = "all";
  }

  applicantStageFilter.value = applicantsState.filters.stage;

  if (applicantStatusFilter) {
    populateSelect(applicantStatusFilter, getApplicantStatusOptions({ includeAll: true }));
    applicantStatusFilter.value = applicantsState.filters.status;
  }

  if (applicantStatusField) {
    const currentStatus = applicantStatusField.value;
    const statusOptions = getApplicantStatusOptions();
    populateSelect(applicantStatusField, statusOptions);
    applicantStatusField.value = statusOptions.some((option) => option.value === currentStatus)
      ? currentStatus
      : statusOptions[0].value;
  }

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
        label: i18n.t("applicants.capture.placeholder.stage"),
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

  renderApplicantPipelineStudio(pipelineStudioRoot, pipeline, i18n);
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
    pipeline,
    i18n
  );
  renderApplicantList(
    applicantsListRoot,
    filteredApplicants,
    applicantsState.selectedId,
    pipeline,
    i18n
  );
  renderApplicantSpotlight(applicantSpotlightRoot, selectedApplicant, pipeline, i18n);
  renderApplicantPipeline(applicantPipelineRoot, filteredApplicants, pipeline, i18n, {
    expandedStageIds: validExpandedStageIds,
  });
  restoreOpenPipelineFamilyIds(openFamilyIds);
}

function updatePipelineConfig(nextConfig, messageText) {
  applicantPipelineConfig = nextConfig;
  saveApplicantPipelineConfig(applicantPipelineConfig);
  pipelineMessage = {
    tone: "success",
    key: messageText,
  };
  syncPipelineStudio();
  syncApplicantsModule();
}

function syncDashboardContent() {
  if (!dashboardLoaded) {
    return;
  }

  renderStatCards(statsRoot, dashboardState.stats, i18n);
  renderTaskCards(tasksRoot, dashboardState.tasks, i18n);
}

async function loadDashboard({ force = false } = {}) {
  if (dashboardLoaded && !force) {
    return;
  }

  const payload = await fetchDashboard();

  dashboardState = {
    stats: payload.stats,
    tasks: payload.tasks,
  };
  renderStatCards(statsRoot, payload.stats, i18n);
  applicantsState.items = payload.applicants;
  syncApplicantsModule();
  renderTaskCards(tasksRoot, payload.tasks, i18n);
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

  formMessage.textContent = i18n.t("app.status.savingApplicant");

  try {
    await createApplicant(payload);
    applicantForm.reset();
    syncApplicantStageControls(resolvePipeline());
    formMessage.textContent = i18n.t("app.status.applicantCreated");
    await loadDashboard({ force: true });
  } catch (error) {
    formMessage.textContent = localizeMessage(error);
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
        "pipeline.messages.programCreated"
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
        "pipeline.messages.nodeAdded"
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
        "pipeline.messages.ruleAdded"
      );
    }
  } catch (error) {
    pipelineMessage = {
      tone: "error",
      key: error.code ?? error.message ?? "app.status.requestFailed",
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
    updatePipelineConfig(resetApplicantPipelineConfig(), "pipeline.messages.graphReset");
    return;
  }

  if (selectProgramButton) {
    updatePipelineConfig(
      setActiveProgramPipeline(applicantPipelineConfig, selectProgramButton.dataset.pipelineSelectProgram),
      "pipeline.messages.versionChanged"
    );
    return;
  }

  if (removeNodeButton) {
    updatePipelineConfig(
      removePipelineNode(applicantPipelineConfig, removeNodeButton.dataset.pipelineRemoveNode),
      "pipeline.messages.nodeRemoved"
    );
    return;
  }

  if (removeTransitionButton) {
    updatePipelineConfig(
      removePipelineTransition(
        applicantPipelineConfig,
        removeTransitionButton.dataset.pipelineRemoveTransition
      ),
      "pipeline.messages.ruleRemoved"
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
    "pipeline.messages.versionChanged"
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

function handleShellChromeClick(event) {
  const moduleBarToggle = event.target.closest?.("[data-toggle-module-bar]");

  if (moduleBarToggle) {
    shellPreferences = {
      ...shellPreferences,
      hideModuleBar: !shellPreferences.hideModuleBar,
    };
    saveShellPreferences();
    syncShellChrome();
    sessionMenu?.removeAttribute("open");
    return;
  }

  if (event.target.closest?.(".dropdown-item")) {
    sessionMenu?.removeAttribute("open");
    return;
  }

  if (sessionMenu?.open && !event.target.closest(".session-menu")) {
    sessionMenu.removeAttribute("open");
  }
}

bindThemeStudio(designConfiguratorRoot, {
  onLocaleChange(value) {
    locale = value;
    i18n = createI18n(locale);
    saveLocalePreference(locale);
    syncDesignSystem();
    syncShellChrome();
    syncPipelineStudio();
    syncApplicantsModule();
    syncDashboardContent();
    syncRouteShell();
  },
  onModeChange(value) {
    designConfig = {
      ...designConfig,
      mode: value,
    };
    syncDesignSystem();
  },
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

subscribeToSystemColorScheme(() => {
  if (isUsingSystemMode(designConfig)) {
    syncDesignSystem();
  }
});

syncDesignSystem();
syncPipelineStudio();
syncShellChrome();
const activeRoute = syncRouteShell();
refreshButton.addEventListener("click", reloadApplicants);
applicantForm.addEventListener("submit", handleSubmit);
pipelineStudioRoot.addEventListener("submit", handlePipelineStudioSubmit);
pipelineStudioRoot.addEventListener("click", handlePipelineStudioClick);
pipelineStudioRoot.addEventListener("change", handlePipelineProgramChange);
applicantPipelineRoot.addEventListener("click", handleApplicantPipelineClick);
applicantPipelineRoot.addEventListener("keydown", handleApplicantPipelineKeydown);
applicantPipelineRoot.addEventListener("change", handlePipelineProgramChange);
document.addEventListener("click", handleShellChromeClick);
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
    formMessage.textContent = localizeMessage(error);
  });
}
