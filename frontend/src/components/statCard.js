export function renderStatCards(root, stats, i18n) {
  root.innerHTML = stats
    .map(
      (stat, index) => `
        <article class="stat-card" style="--stat-accent:${stat.accent}; --delay:${index * 80}ms">
          <span>${i18n.localizeStatLabel(stat.label)}</span>
          <strong>${i18n.formatNumber(stat.value)}</strong>
        </article>
      `
    )
    .join("");
}
