export function renderTaskCards(root, tasks) {
  root.innerHTML = tasks
    .map(
      (task) => `
        <article class="task-card ${task.status.toLowerCase().replace(/\s+/g, "-")}">
          <div>
            <span class="task-label">${task.program}</span>
            <h3>${task.student_name}</h3>
          </div>
          <p>${task.owner} - due ${task.due_date}</p>
          <strong>${task.priority} priority</strong>
          <span class="task-status">${task.status}</span>
        </article>
      `
    )
    .join("");
}
