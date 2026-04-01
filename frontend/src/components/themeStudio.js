import {
  colorFields,
  designDecision,
  resolveDesignConfig,
  themePresets,
  typographyCatalog,
} from "../config/design-system.js";

function buildOptions(options, selectedValue) {
  return Object.entries(options)
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

export function renderThemeStudio({ overviewRoot, controlsRoot, config }) {
  const resolved = resolveDesignConfig(config);

  overviewRoot.innerHTML = `
    <div class="panel-kicker">Visual Foundation</div>
    <div class="decision-badge">${designDecision.framework}</div>
    <h2>Readable, configurable and institutional without looking generic.</h2>
    <p class="overview-copy">
      The design base now prioritizes semantic tokens, editorial hierarchy and runtime
      theming. Business modules can inherit this layer without fixing brand colors inside each component.
    </p>
    <p class="framework-line">${designDecision.summary}</p>

    <div class="token-strip">
      <span class="token-pill">Top-down UI first</span>
      <span class="token-pill">Runtime theme presets</span>
      <span class="token-pill">Semantic color tokens</span>
    </div>

    <div class="palette-strip">
      <article class="swatch-card">
        <span>Primary</span>
        <strong>${resolved.colors.primary}</strong>
      </article>
      <article class="swatch-card">
        <span>Secondary</span>
        <strong>${resolved.colors.secondary}</strong>
      </article>
      <article class="swatch-card">
        <span>Accent</span>
        <strong>${resolved.colors.accent}</strong>
      </article>
    </div>

    <div class="specimen-grid">
      <article class="specimen-card">
        <span class="specimen-label">Display</span>
        <strong class="specimen-name">${resolved.typographyMeta.display.label}</strong>
        <p class="specimen-sample specimen-display">Admissions and advising with hierarchy.</p>
      </article>
      <article class="specimen-card">
        <span class="specimen-label">Body</span>
        <strong class="specimen-name">${resolved.typographyMeta.body.label}</strong>
        <p class="specimen-sample specimen-body">
          Use this layer for dense operational text, form labels and contextual help.
        </p>
      </article>
      <article class="specimen-card">
        <span class="specimen-label">Data</span>
        <strong class="specimen-name">${resolved.typographyMeta.mono.label}</strong>
        <p class="specimen-sample specimen-mono">Applicant score 91.0 - Task due 2026-04-07</p>
      </article>
    </div>

    <div class="sample-actions">
      <button class="primary-button" type="button">Primary Action</button>
      <button class="ghost-button" type="button">Secondary Action</button>
    </div>
  `;

  controlsRoot.innerHTML = `
    <div class="panel-kicker">Configuration Module</div>
    <h2>Theme Tokens</h2>
    <p class="control-note">
      Presets define the base direction. User overrides are stored locally so palette changes can be tested before business modules exist.
    </p>

    <div class="config-section">
      <label class="field">
        Theme preset
        <select data-config-preset>
          ${buildPresetOptions(resolved.preset)}
        </select>
      </label>
      <p class="preset-description">${resolved.presetMeta.description}</p>
    </div>

    <div class="config-section">
      <div class="section-caption">Typography</div>
      <div class="control-grid">
        <label class="field">
          Display font
          <select data-config-font="display">
            ${buildOptions(typographyCatalog.display, resolved.typography.display)}
          </select>
        </label>
        <label class="field">
          Body font
          <select data-config-font="body">
            ${buildOptions(typographyCatalog.body, resolved.typography.body)}
          </select>
        </label>
        <label class="field">
          Mono font
          <select data-config-font="mono">
            ${buildOptions(typographyCatalog.mono, resolved.typography.mono)}
          </select>
        </label>
      </div>
    </div>

    <div class="config-section">
      <div class="section-caption">Color Tokens</div>
      <div class="color-grid">
        ${colorFields
          .map(
            (field) => `
              <label class="color-field">
                <span>${field.label}</span>
                <input type="color" value="${resolved.colors[field.key]}" data-config-color="${field.key}" />
              </label>
            `
          )
          .join("")}
      </div>
    </div>

    <div class="config-actions">
      <button class="ghost-button" type="button" data-action="reset-theme">Restore Defaults</button>
    </div>
  `;
}

export function bindThemeStudio(root, handlers) {
  root.addEventListener("change", (event) => {
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
