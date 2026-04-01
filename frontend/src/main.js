import { fetchApplicants, fetchDashboard, createApplicant } from "./services/api.js";
import { renderStatCards } from "./components/statCard.js";
import { renderApplicantsTable, renderTaskCards } from "./pages/dashboard.js";

const statsRoot = document.querySelector("#stats");
const applicantsRoot = document.querySelector("#applicants-table");
const tasksRoot = document.querySelector("#tasks-list");
const refreshButton = document.querySelector("#refresh-applicants");
const applicantForm = document.querySelector("#applicant-form");
const formMessage = document.querySelector("#form-message");

async function loadDashboard() {
  const payload = await fetchDashboard();
  renderStatCards(statsRoot, payload.stats);
  renderApplicantsTable(applicantsRoot, payload.applicants);
  renderTaskCards(tasksRoot, payload.tasks);
}

async function reloadApplicants() {
  const applicants = await fetchApplicants();
  renderApplicantsTable(applicantsRoot, applicants);
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
    await loadDashboard();
  } catch (error) {
    formMessage.textContent = error.message;
  }
}

refreshButton.addEventListener("click", reloadApplicants);
applicantForm.addEventListener("submit", handleSubmit);

loadDashboard().catch((error) => {
  formMessage.textContent = error.message;
});
