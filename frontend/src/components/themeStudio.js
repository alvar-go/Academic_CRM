import {
  colorFields,
  colorModeCatalog,
  designDecision,
  resolveDesignConfig,
  themePresets,
  typographyCatalog,
} from "../config/design-system.js";

function buildOptions(options, selectedValue) {
  return options
    .map(
      (option) =>
        `<option value="${option.value}"${
          option.value === selectedValue ? " selected" : ""
        }>${option.label}</option>`
    )
    .join("");
}

function buildCatalogOptions(catalog, selectedValue) {
  return Object.entries(catalog)
    .map(
      ([value, option]) =>
        `<option value="${value}"${value === selectedValue ? " selected" : ""}>${option.label}</option>`
    )
    .join("");
}

function buildPresetOptions(selectedValue) {
  return Object.entries(themePresets)
    .map(
      ([value, preset]) =>
        `<option value="${value}"${value === selectedValue ? " selected" : ""}>${preset.label}</option>`
    )
    .join("");
}

export function renderThemeStudio({
  overviewRoot,
  controlsRoot,
  config,
  i18n,
  locale,
  localeOptions,
}) {
  const resolved = resolveDesignConfig(config);
  const colorModeOptions = Object.values(colorModeCatalog).map((option) => ({
    value: option.value,
    label: i18n.t(`configuration.mode.${option.value}`),
  }));

  overviewRoot.innerHTML = `
    <div class="panel-kicker">${i18n.t("configuration.foundation.kicker")}</div>
    <div class="decision-badge">${designDecision.framework}</div>
    <h2>${i18n.t("configuration.foundation.title")}</h2>
    <p class="overview-copy">
      ${i18n.t("configuration.foundation.copy")}
    </p>
    <p class="framework-line">${i18n.t("configuration.framework.summary")}</p>

    <div class="token-strip">
      <span class="token-pill">${i18n.t("configuration.token.topDown")}</span>
      <span class="token-pill">${i18n.t("configuration.token.theme")}</span>
      <span class="token-pill">${i18n.t("configuration.token.semantic")}</span>
    </div>

    <div class="palette-strip">
      <article class="swatch-card">
        <span>${i18n.t("configuration.palette.primary")}</span>
        <strong>${resolved.colors.primary}</strong>
      </article>
      <article class="swatch-card">
        <span>${i18n.t("configuration.palette.secondary")}</span>
        <strong>${resolved.colors.secondary}</strong>
      </article>
      <article class="swatch-card">
        <span>${i18n.t("configuration.palette.accent")}</span>
        <strong>${resolved.colors.accent}</strong>
      </article>
    </div>

    <div class="specimen-grid">
      <article class="specimen-card">
        <span class="specimen-label">${i18n.t("configuration.specimen.display")}</span>
        <strong class="specimen-name">${resolved.typographyMeta.display.label}</strong>
        <p class="specimen-sample specimen-display">${i18n.t(
          "configuration.specimen.displaySample"
        )}</p>
      </article>
      <article class="specimen-card">
        <span class="specimen-label">${i18n.t("configuration.specimen.body")}</span>
        <strong class="specimen-name">${resolved.typographyMeta.body.label}</strong>
        <p class="specimen-sample specimen-body">
          ${i18n.t("configuration.specimen.bodySample")}
        </p>
      </article>
      <article class="specimen-card">
        <span class="specimen-label">${i18n.t("configuration.specimen.data")}</span>
        <strong class="specimen-name">${resolved.typographyMeta.mono.label}</strong>
        <p class="specimen-sample specimen-mono">${i18n.t(
          "configuration.specimen.dataSample"
        )}</p>
      </article>
    </div>

    <div class="sample-actions">
      <button class="primary-button" type="button">
        <i class="bi bi-stars" aria-hidden="true"></i>
        ${i18n.t("configuration.sample.primary")}
      </button>
      <button class="ghost-button" type="button">
        <i class="bi bi-layout-text-sidebar-reverse" aria-hidden="true"></i>
        ${i18n.t("configuration.sample.secondary")}
      </button>
    </div>
  `;

  controlsRoot.innerHTML = `
    <div class="panel-kicker">${i18n.t("configuration.kicker")}</div>
    <h2>${i18n.t("configuration.title")}</h2>
    <p class="control-note">
      ${i18n.t("configuration.description")}
    </p>

    <div class="config-section">
      <div class="section-caption">${i18n.t("configuration.section.experience")}</div>
      <div class="control-grid">
        <label class="field">
          ${i18n.t("configuration.language.label")}
          <select data-config-locale>
            ${buildOptions(localeOptions, locale)}
          </select>
        </label>
        <label class="field">
          ${i18n.t("configuration.mode.label")}
          <select data-config-mode>
            ${buildOptions(colorModeOptions, resolved.mode)}
          </select>
        </label>
        <label class="field">
          ${i18n.t("configuration.preset.label")}
          <select data-config-preset>
            ${buildPresetOptions(resolved.preset)}
          </select>
        </label>
      </div>
      <p class="preset-description">${i18n.t(resolved.presetMeta.descriptionKey)}</p>
    </div>

    <div class="config-section">
      <div class="section-caption">${i18n.t("configuration.typography.title")}</div>
      <div class="control-grid">
        <label class="field">
          ${i18n.t("configuration.typography.display")}
          <select data-config-font="display">
            ${buildCatalogOptions(typographyCatalog.display, resolved.typography.display)}
          </select>
        </label>
        <label class="field">
          ${i18n.t("configuration.typography.body")}
          <select data-config-font="body">
            ${buildCatalogOptions(typographyCatalog.body, resolved.typography.body)}
          </select>
        </label>
        <label class="field">
          ${i18n.t("configuration.typography.mono")}
          <select data-config-font="mono">
            ${buildCatalogOptions(typographyCatalog.mono, resolved.typography.mono)}
          </select>
        </label>
      </div>
    </div>

    <div class="config-section">
      <div class="section-caption">${i18n.t("configuration.color.title")}</div>
      <div class="color-grid">
        ${colorFields
          .map(
            (field) => `
              <label class="color-field">
                <span>${i18n.t(`configuration.color.${field.key}`)}</span>
                <input type="color" value="${resolved.colors[field.key]}" data-config-color="${field.key}" />
              </label>
            `
          )
          .join("")}
      </div>
    </div>

    <div class="config-actions">
      <button class="ghost-button" type="button" data-action="reset-theme">
        <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
        ${i18n.t("configuration.actions.restoreDefaults")}
      </button>
    </div>
  `;
}

export function bindThemeStudio(root, handlers) {
  root.addEventListener("change", (event) => {
    const localeSelect = event.target.closest("[data-config-locale]");

    if (localeSelect) {
      handlers.onLocaleChange(localeSelect.value);
      return;
    }

    const modeSelect = event.target.closest("[data-config-mode]");

    if (modeSelect) {
      handlers.onModeChange(modeSelect.value);
      return;
    }

    const preset = event.target.closest("[data-config-preset]");

    if (preset) {
      handlers.onPresetChange(preset.value);
      return;
    }

    const fontSelect = event.target.closest("[data-config-font]");

    if (fontSelect) {
      handlers.onFontChange(fontSelect.dataset.configFont, fontSelect.value);
      return;
    }

    const colorInput = event.target.closest("[data-config-color]");

    if (colorInput) {
      handlers.onColorChange(colorInput.dataset.configColor, colorInput.value);
    }
  });

  root.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action='reset-theme']");

    if (actionButton) {
      handlers.onReset();
    }
  });
}
