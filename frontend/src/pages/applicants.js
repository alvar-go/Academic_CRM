const STAGE_ORDER = ["Document Review", "Interview", "Committee"];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalize(value) {
  return String(value).toLowerCase().trim();
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

function stageIndex(stage) {
  return Math.max(STAGE_ORDER.indexOf(stage), 0);
}

function applicantMatchesFilters(applicant, filters) {
  const searchTarget = normalize(
    `${applicant.full_name} ${applicant.email} ${applicant.program} ${applicant.stage} ${applicant.status}`
  );
  const matchesSearch = !filters.search || searchTarget.includes(normalize(filters.search));
  const matchesStage = filters.stage === "all" || applicant.stage === filters.stage;
  const matchesStatus = filters.status === "all" || applicant.status === filters.status;

  return matchesSearch && matchesStage && matchesStatus;
}

export function filterApplicants(applicants, filters) {
  return applicants.filter((applicant) => applicantMatchesFilters(applicant, filters));
}

export function renderApplicantSummary(root, applicants, filteredApplicants) {
  const readyCount = filteredApplicants.filter((applicant) => applicant.status === "Offer Ready").length;
  const interviewCount = filteredApplicants.filter((applicant) => applicant.stage === "Interview").length;
  const avgScore = filteredApplicants.length
    ? Math.round(
        filteredApplicants.reduce((total, applicant) => total + applicant.score, 0) /
          filteredApplicants.length
      )
    : 0;

  root.innerHTML = `
    <article class="summary-chip">
      <span>Visible Applicants</span>
      <strong>${filteredApplicants.length}</strong>
      <small>${applicants.length} total in repository</small>
    </article>
    <article class="summary-chip">
      <span>Interview Load</span>
      <strong>${interviewCount}</strong>
      <small>Applicants currently in interview</small>
    </article>
    <article class="summary-chip">
      <span>Average Score</span>
      <strong>${avgScore}</strong>
      <small>Across current filtered view</small>
    </article>
    <article class="summary-chip">
      <span>Offer Ready</span>
      <strong>${readyCount}</strong>
      <small>Applicants ready for decision</small>
    </article>
  `;
}

export function renderApplicantList(root, applicants, selectedId) {
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
            <span class="stage-pill">${escapeHtml(applicant.stage)}</span>
          </div>
        </button>
      `;
    })
    .join("");
}

export function renderApplicantSpotlight(root, applicant) {
  if (!applicant) {
    root.innerHTML = `
      <div class="panel-kicker">Spotlight</div>
      <h2>Applicant focus</h2>
      <p class="control-note">Select an applicant from the queue to inspect the current stage narrative.</p>
    `;
    return;
  }

  const currentStageIndex = stageIndex(applicant.stage);

  root.innerHTML = `
    <div class="panel-kicker">Spotlight</div>
    <span class="spotlight-program">${escapeHtml(applicant.program)}</span>
    <h2>${escapeHtml(applicant.full_name)}</h2>
    <p class="spotlight-copy">
      Current status is <strong>${escapeHtml(applicant.status)}</strong> with a score of
      <strong>${applicant.score}</strong>. Use this area as the future detail panel for review notes,
      committee inputs and communication history.
    </p>

    <div class="spotlight-metrics">
      <article>
        <span>Stage</span>
        <strong>${escapeHtml(applicant.stage)}</strong>
      </article>
      <article>
        <span>Status</span>
        <strong>${escapeHtml(applicant.status)}</strong>
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

    <div class="trajectory">
      ${STAGE_ORDER.map((stage, index) => {
        let state = "upcoming";
        if (index < currentStageIndex) {
          state = "completed";
        }
        if (index === currentStageIndex) {
          state = "current";
        }

        return `
          <div class="trajectory-step ${state}">
            <span>${index + 1}</span>
            <div>
              <strong>${stage}</strong>
              <p>${stage === applicant.stage ? "Current decision context" : "Stage available in the journey"}</p>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

export function renderApplicantPipeline(root, applicants) {
  root.innerHTML = STAGE_ORDER.map((stage) => {
    const applicantsInStage = applicants
      .filter((applicant) => applicant.stage === stage)
      .sort((left, right) => right.score - left.score);

    return `
      <article class="pipeline-lane">
        <div class="lane-head">
          <div>
            <span class="section-caption">Stage</span>
            <h3>${stage}</h3>
          </div>
          <strong>${applicantsInStage.length}</strong>
        </div>
        <div class="lane-cards">
          ${
            applicantsInStage.length
              ? applicantsInStage
                  .map(
                    (applicant) => `
                      <div class="mini-applicant">
                        <span>${escapeHtml(applicant.full_name)}</span>
                        <strong>${applicant.score}</strong>
                        <small>${escapeHtml(applicant.status)}</small>
                      </div>
                    `
                  )
                  .join("")
              : '<div class="mini-applicant empty">No applicants in this stage.</div>'
          }
        </div>
      </article>
    `;
  }).join("");
}
