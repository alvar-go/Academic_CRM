function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderTaskCards(root, tasks, i18n) {
  root.innerHTML = tasks
    .map(
      (task) => `
        <article class="task-card ${task.status.toLowerCase().replace(/\s+/g, "-")}">
          <div>
            <span class="task-label">${escapeHtml(task.program)}</span>
            <h3>${escapeHtml(task.student_name)}</h3>
          </div>
          <p>${escapeHtml(task.owner)} - ${i18n.t("dashboard.dueDate", {
            date: i18n.formatDate(task.due_date),
          })}</p>
          <strong>${i18n.t("dashboard.priority", {
            priority: i18n.localizePriority(task.priority),
          })}</strong>
          <span class="task-status">${i18n.localizeTaskStatus(task.status)}</span>
        </article>
      `
    )
    .join("");
}
