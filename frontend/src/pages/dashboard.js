export function renderApplicantsTable(root, applicants) {
  root.innerHTML = applicants
    .map(
      (applicant) => `
        <tr>
          <td>${applicant.full_name}</td>
          <td>${applicant.program}</td>
          <td><span class="pill">${applicant.status}</span></td>
          <td>${applicant.stage}</td>
          <td>${applicant.score}</td>
        </tr>
      `
    )
    .join("");
}

export function renderTaskCards(root, tasks) {
  root.innerHTML = tasks
    .map(
      (task) => `
        <article class="task-card ${task.status.toLowerCase().replace(/\s+/g, "-")}">
          <div>
            <span class="task-label">${task.program}</span>
            <h3>${task.student_name}</h3>
          </div>
          <p>${task.owner} · due ${task.due_date}</p>
          <strong>${task.priority} priority</strong>
          <span class="task-status">${task.status}</span>
        </article>
      `
    )
    .join("");
}
