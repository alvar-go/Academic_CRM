const STORAGE_KEY = "academic-crm.design-config.v3";
const SYSTEM_COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export const designDecision = {
  framework: "Custom CSS Tokens + Modular JavaScript",
};

export const colorModeCatalog = {
  system: { value: "system" },
  light: { value: "light" },
  dark: { value: "dark" },
};

export const typographyCatalog = {
  display: {
    fraunces: { label: "Fraunces", stack: '"Fraunces", Georgia, serif' },
    plusJakartaSans: {
      label: "Plus Jakarta Sans",
      stack: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    },
    rubik: { label: "Rubik", stack: '"Rubik", "Trebuchet MS", sans-serif' },
    sora: { label: "Sora", stack: '"Sora", "Trebuchet MS", sans-serif' },
  },
  body: {
    manrope: { label: "Manrope", stack: '"Manrope", "Segoe UI", sans-serif' },
    plusJakartaSans: {
      label: "Plus Jakarta Sans",
      stack: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    },
    rubik: { label: "Rubik", stack: '"Rubik", "Trebuchet MS", sans-serif' },
    sourceSans3: {
      label: "Source Sans 3",
      stack: '"Source Sans 3", "Segoe UI", sans-serif',
    },
  },
  mono: {
    googleSansCode: {
      label: "Google Sans Code",
      stack: '"Google Sans Code", "IBM Plex Mono", Consolas, monospace',
    },
    ibmPlexMono: {
      label: "IBM Plex Mono",
      stack: '"IBM Plex Mono", Consolas, monospace',
    },
  },
};

export const colorFields = [
  { key: "bg" },
  { key: "bgAlt" },
  { key: "surface" },
  { key: "text" },
  { key: "muted" },
  { key: "line" },
  { key: "primary" },
  { key: "secondary" },
  { key: "accent" },
];

export const themePresets = {
  royalAcademic: {
    label: "Royal Academic",
    descriptionKey: "configuration.preset.royalAcademic",
    colors: {
      bg: "#f6f4fb",
      bgAlt: "#ebe8f4",
      surface: "#ffffff",
      text: "#171327",
      muted: "#5d6275",
      line: "#a6a6a6",
      primary: "#4f007c",
      secondary: "#0047ab",
      accent: "#9b1c31",
    },
  },
  andesWarm: {
    label: "Andes Warm",
    descriptionKey: "configuration.preset.andesWarm",
    colors: {
      bg: "#f5efe6",
      bgAlt: "#e9ddcb",
      surface: "#fff8ef",
      text: "#1d2430",
      muted: "#617083",
      line: "#c7b49a",
      primary: "#aa5331",
      secondary: "#116f69",
      accent: "#c89434",
    },
  },
  slateLibrary: {
    label: "Slate Library",
    descriptionKey: "configuration.preset.slateLibrary",
    colors: {
      bg: "#eef1f5",
      bgAlt: "#d8dfe8",
      surface: "#ffffff",
      text: "#18202c",
      muted: "#5d6a7b",
      line: "#aeb8c6",
      primary: "#8d4f3d",
      secondary: "#225f85",
      accent: "#5f8a58",
    },
  },
  campusSignal: {
    label: "Campus Signal",
    descriptionKey: "configuration.preset.campusSignal",
    colors: {
      bg: "#f3f5ef",
      bgAlt: "#e2e9d9",
      surface: "#fcfdf8",
      text: "#172120",
      muted: "#5d6d69",
      line: "#b9c8bf",
      primary: "#d15d43",
      secondary: "#237771",
      accent: "#8d7f2f",
    },
  },
};

export const defaultDesignConfig = {
  preset: "royalAcademic",
  mode: "system",
  typography: {
    display: "plusJakartaSans",
    body: "rubik",
    mono: "googleSansCode",
  },
  colors: {},
};

function cloneDefaultConfig() {
  return JSON.parse(JSON.stringify(defaultDesignConfig));
}

function sanitizeConfig(rawConfig) {
  const safeConfig = cloneDefaultConfig();

  if (!rawConfig || typeof rawConfig !== "object") {
    return safeConfig;
  }

  if (rawConfig.preset in themePresets) {
    safeConfig.preset = rawConfig.preset;
  }

  if (rawConfig.mode in colorModeCatalog) {
    safeConfig.mode = rawConfig.mode;
  }

  if (rawConfig.typography && typeof rawConfig.typography === "object") {
    if (rawConfig.typography.display in typographyCatalog.display) {
      safeConfig.typography.display = rawConfig.typography.display;
    }
    if (rawConfig.typography.body in typographyCatalog.body) {
      safeConfig.typography.body = rawConfig.typography.body;
    }
    if (rawConfig.typography.mono in typographyCatalog.mono) {
      safeConfig.typography.mono = rawConfig.typography.mono;
    }
  }

  if (rawConfig.colors && typeof rawConfig.colors === "object") {
    for (const field of colorFields) {
      const value = rawConfig.colors[field.key];

      if (typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)) {
        safeConfig.colors[field.key] = value;
      }
    }
  }

  return safeConfig;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (value) =>
    Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixHex(baseHex, mixHexValue, amount) {
  const base = hexToRgb(baseHex);
  const blend = hexToRgb(mixHexValue);
  const ratio = Math.max(0, Math.min(1, amount));

  return rgbToHex({
    r: base.r + (blend.r - base.r) * ratio,
    g: base.g + (blend.g - base.g) * ratio,
    b: base.b + (blend.b - base.b) * ratio,
  });
}

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getSystemMode() {
  return window.matchMedia(SYSTEM_COLOR_SCHEME_QUERY).matches ? "dark" : "light";
}

function deriveDarkPalette(lightColors) {
  return {
    bg: "#0f1220",
    bgAlt: "#171b2d",
    surface: "#1d2235",
    text: "#eef2ff",
    muted: "#9da7c2",
    line: mixHex(lightColors.line, "#7a88a7", 0.58),
    primary: mixHex(lightColors.primary, "#ffffff", 0.28),
    secondary: mixHex(lightColors.secondary, "#ffffff", 0.3),
    accent: mixHex(lightColors.accent, "#ffffff", 0.24),
  };
}

function resolveMode(mode) {
  return mode === "system" ? getSystemMode() : mode;
}

export function getInitialDesignConfig() {
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return cloneDefaultConfig();
  }

  try {
    return sanitizeConfig(JSON.parse(stored));
  } catch {
    return cloneDefaultConfig();
  }
}

export function saveDesignConfig(config) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeConfig(config)));
}

export function resetDesignConfig() {
  window.localStorage.removeItem(STORAGE_KEY);
  return cloneDefaultConfig();
}

export function resolveDesignConfig(config) {
  const safeConfig = sanitizeConfig(config);
  const preset = themePresets[safeConfig.preset];
  const actualMode = resolveMode(safeConfig.mode);
  const baseColors =
    actualMode === "dark" ? deriveDarkPalette(preset.colors) : { ...preset.colors };
  const colors = {
    ...baseColors,
    ...safeConfig.colors,
  };

  return {
    ...safeConfig,
    actualMode,
    presetMeta: preset,
    colors,
    typographyMeta: {
      display: typographyCatalog.display[safeConfig.typography.display],
      body: typographyCatalog.body[safeConfig.typography.body],
      mono: typographyCatalog.mono[safeConfig.typography.mono],
    },
  };
}

export function isUsingSystemMode(config) {
  return sanitizeConfig(config).mode === "system";
}

export function subscribeToSystemColorScheme(handler) {
  const media = window.matchMedia(SYSTEM_COLOR_SCHEME_QUERY);
  const listener = () => handler(getSystemMode());

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }

  media.addListener(listener);
  return () => media.removeListener(listener);
}

export function applyDesignConfig(config) {
  const resolved = resolveDesignConfig(config);
  const root = document.documentElement;
  const { colors, typographyMeta, actualMode } = resolved;
  const isDark = actualMode === "dark";
  const shadowColor = isDark ? "#000000" : colors.text;
  const surfaceTint = mixHex(colors.surface, colors.bgAlt, isDark ? 0.72 : 0.44);
  const primarySurface = mixHex(colors.surface, colors.primary, isDark ? 0.2 : 0.08);
  const secondarySurface = mixHex(colors.surface, colors.secondary, isDark ? 0.22 : 0.1);
  const accentSurface = mixHex(colors.surface, colors.accent, isDark ? 0.16 : 0.08);

  const variables = {
    "--font-display": typographyMeta.display.stack,
    "--font-body": typographyMeta.body.stack,
    "--font-mono": typographyMeta.mono.stack,
    "--bg": colors.bg,
    "--bg-alt": colors.bgAlt,
    "--surface": colors.surface,
    "--surface-soft": withAlpha(colors.surface, isDark ? 0.88 : 0.82),
    "--surface-strong": withAlpha(colors.surface, isDark ? 0.96 : 0.94),
    "--surface-muted": withAlpha(surfaceTint, isDark ? 0.94 : 0.78),
    "--surface-muted-strong": withAlpha(surfaceTint, isDark ? 0.98 : 0.94),
    "--surface-primary": withAlpha(primarySurface, isDark ? 0.92 : 0.92),
    "--surface-secondary": withAlpha(secondarySurface, isDark ? 0.94 : 0.9),
    "--surface-accent": withAlpha(accentSurface, isDark ? 0.92 : 0.9),
    "--text": colors.text,
    "--muted": colors.muted,
    "--line": withAlpha(colors.line, isDark ? 0.28 : 0.38),
    "--line-strong": withAlpha(colors.line, isDark ? 0.46 : 0.72),
    "--primary": colors.primary,
    "--secondary": colors.secondary,
    "--accent": colors.accent,
    "--primary-soft": withAlpha(colors.primary, isDark ? 0.22 : 0.16),
    "--secondary-soft": withAlpha(colors.secondary, isDark ? 0.22 : 0.16),
    "--accent-soft": withAlpha(colors.accent, isDark ? 0.22 : 0.18),
    "--ambient-left": withAlpha(colors.primary, isDark ? 0.26 : 0.22),
    "--ambient-right": withAlpha(colors.secondary, isDark ? 0.22 : 0.18),
    "--shadow-lg": `0 24px 50px ${withAlpha(shadowColor, isDark ? 0.26 : 0.08)}`,
    "--shadow-md": `0 16px 34px ${withAlpha(shadowColor, isDark ? 0.2 : 0.05)}`,
    "--shadow-sm": `0 12px 24px ${withAlpha(shadowColor, isDark ? 0.16 : 0.05)}`,
    "--shadow-inset": `inset 0 1px 0 ${withAlpha("#ffffff", isDark ? 0.08 : 0.46)}`,
    "--accent-ink": colors.text,
    "--accent-gold": colors.accent,
    "--accent-cyan": colors.secondary,
    "--accent-salmon": colors.primary,
    "--on-primary": "#ffffff",
    "--chrome-gradient-start": withAlpha(colors.bg, isDark ? 0.94 : 0.92),
    "--chrome-gradient-mid": withAlpha(colors.bg, isDark ? 0.8 : 0.62),
    "--nav-surface": withAlpha(colors.surface, isDark ? 0.72 : 0.62),
    "--shell-separator": withAlpha(colors.muted, isDark ? 0.26 : 0.18),
    "--control-border": withAlpha(colors.primary, isDark ? 0.18 : 0.08),
    "--control-border-secondary": withAlpha(colors.secondary, isDark ? 0.2 : 0.08),
    "--control-highlight": withAlpha("#ffffff", isDark ? 0.08 : 0.5),
    "--primary-shadow": withAlpha(colors.primary, isDark ? 0.26 : 0.12),
    "--selection-ring": withAlpha(colors.secondary, isDark ? 0.18 : 0.08),
    "--canvas-gradient-top": withAlpha(mixHex(colors.surface, colors.bgAlt, 0.2), isDark ? 0.86 : 0.52),
    "--canvas-gradient-bottom": withAlpha(mixHex(colors.surface, colors.primary, isDark ? 0.12 : 0.06), isDark ? 0.96 : 0.78),
    "--canvas-accent-left": withAlpha(colors.primary, isDark ? 0.08 : 0.025),
    "--canvas-accent-right": withAlpha(colors.secondary, isDark ? 0.08 : 0.025),
    "--canvas-inset-highlight": withAlpha("#ffffff", isDark ? 0.06 : 0.48),
    "--graph-label-bg": withAlpha(mixHex(colors.bg, colors.surface, isDark ? 0.34 : 0.14), 0.94),
    "--graph-stage-shell": withAlpha(mixHex(colors.surface, colors.secondary, isDark ? 0.18 : 0.08), isDark ? 0.86 : 0.78),
    "--graph-stage-shell-strong": withAlpha(mixHex(colors.surface, colors.secondary, isDark ? 0.24 : 0.12), isDark ? 0.96 : 0.96),
    "--graph-stage-toggle-bg": withAlpha(mixHex(colors.surface, colors.bgAlt, isDark ? 0.18 : 0.02), isDark ? 0.96 : 0.88),
    "--graph-stage-toggle-active-bg": withAlpha(mixHex(colors.surface, colors.secondary, isDark ? 0.18 : 0.06), 0.98),
    "--graph-node-bg": withAlpha(colors.surface, isDark ? 0.94 : 0.9),
    "--graph-node-stage-bg": withAlpha(mixHex(colors.surface, colors.primary, isDark ? 0.18 : 0.08), 0.96),
    "--graph-shadow-soft": `drop-shadow(0 10px 16px ${withAlpha(shadowColor, isDark ? 0.24 : 0.06)})`,
    "--graph-shadow-strong": `drop-shadow(0 16px 24px ${withAlpha(shadowColor, isDark ? 0.2 : 0.04)})`,
    "--card-soft-bg": withAlpha(colors.surface, isDark ? 0.9 : 0.82),
  };

  root.dataset.colorMode = actualMode;
  root.style.colorScheme = actualMode;

  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value);
  }

  return resolved;
}
