import { fetchDashboard, createApplicant } from "./services/api.js";
import { renderStatCards } from "./components/statCard.js";
import {
  filterApplicants,
  renderApplicantList,
  renderApplicantPipeline,
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
const formMessage = document.querySelector("#form-message");
const designOverviewRoot = document.querySelector("#design-overview");
const designConfiguratorRoot = document.querySelector("#design-configurator");
const applicantSummaryRoot = document.querySelector("#applicant-summary");
const applicantsListRoot = document.querySelector("#applicants-list");
const applicantSpotlightRoot = document.querySelector("#applicant-spotlight");
const applicantPipelineRoot = document.querySelector("#applicant-pipeline");
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
    title: "Admissions queue, stage visibility and applicant capture.",
    copy:
      "This module concentrates search, triage, spotlight context and pipeline state. It is the base surface before we deepen the endpoints and schema.",
    needsDashboard: true,
  },
};

let designConfig = getInitialDesignConfig();
let applicantsState = {
  items: [],
  filters: {
    search: "",
    stage: "all",
    status: "all",
  },
  selectedId: null,
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

function syncApplicantsModule() {
  const filteredApplicants = filterApplicants(applicantsState.items, applicantsState.filters);

  if (!filteredApplicants.some((applicant) => applicant.id === applicantsState.selectedId)) {
    applicantsState.selectedId = filteredApplicants[0]?.id ?? null;
  }

  const selectedApplicant =
    filteredApplicants.find((applicant) => applicant.id === applicantsState.selectedId) ?? null;

  renderApplicantSummary(applicantSummaryRoot, applicantsState.items, filteredApplicants);
  renderApplicantList(applicantsListRoot, filteredApplicants, applicantsState.selectedId);
  renderApplicantSpotlight(applicantSpotlightRoot, selectedApplicant);
  renderApplicantPipeline(applicantPipelineRoot, filteredApplicants);
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
    formMessage.textContent = "Applicant created.";
    await loadDashboard({ force: true });
  } catch (error) {
    formMessage.textContent = error.message;
  }
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
const activeRoute = syncRouteShell();
refreshButton.addEventListener("click", reloadApplicants);
applicantForm.addEventListener("submit", handleSubmit);
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
