export function renderStatCards(root, stats) {
  root.innerHTML = stats
    .map(
      (stat, index) => `
        <article class="stat-card" style="--stat-accent:${stat.accent}; --delay:${index * 80}ms">
          <span>${stat.label}</span>
          <strong>${stat.value}</strong>
        </article>
      `
    )
    .join("");
}
