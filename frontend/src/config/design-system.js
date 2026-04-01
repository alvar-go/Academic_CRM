const STORAGE_KEY = "academic-crm.design-config.v2";

export const designDecision = {
  framework: "Custom CSS Tokens + Modular JavaScript",
  summary:
    "Bootstrap and Tailwind stay out of the foundation layer so the visual language remains fully configurable at runtime.",
};

export const typographyCatalog = {
  display: {
    fraunces: {
      label: "Fraunces",
      stack: '"Fraunces", Georgia, serif',
    },
    plusJakartaSans: {
      label: "Plus Jakarta Sans",
      stack: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    },
    rubik: {
      label: "Rubik",
      stack: '"Rubik", "Trebuchet MS", sans-serif',
    },
    sora: {
      label: "Sora",
      stack: '"Sora", "Trebuchet MS", sans-serif',
    },
  },
  body: {
    manrope: {
      label: "Manrope",
      stack: '"Manrope", "Segoe UI", sans-serif',
    },
    plusJakartaSans: {
      label: "Plus Jakarta Sans",
      stack: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    },
    rubik: {
      label: "Rubik",
      stack: '"Rubik", "Trebuchet MS", sans-serif',
    },
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
  { key: "bg", label: "Background" },
  { key: "bgAlt", label: "Background Alt" },
  { key: "surface", label: "Surface" },
  { key: "text", label: "Text" },
  { key: "muted", label: "Muted" },
  { key: "line", label: "Line" },
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
];

export const themePresets = {
  royalAcademic: {
    label: "Royal Academic",
    description: "Violet, cobalt and restrained red over neutral silver support.",
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
    description: "Editorial, warm and grounded.",
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
    description: "Cooler and more institutional.",
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
    description: "Brighter and more contemporary.",
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

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function resetDesignConfig() {
  window.localStorage.removeItem(STORAGE_KEY);
  return cloneDefaultConfig();
}

export function resolveDesignConfig(config) {
  const safeConfig = sanitizeConfig(config);
  const preset = themePresets[safeConfig.preset];
  const colors = {
    ...preset.colors,
    ...safeConfig.colors,
  };

  return {
    ...safeConfig,
    presetMeta: preset,
    colors,
    typographyMeta: {
      display: typographyCatalog.display[safeConfig.typography.display],
      body: typographyCatalog.body[safeConfig.typography.body],
      mono: typographyCatalog.mono[safeConfig.typography.mono],
    },
  };
}

export function applyDesignConfig(config) {
  const resolved = resolveDesignConfig(config);
  const root = document.documentElement;
  const { colors, typographyMeta } = resolved;

  const variables = {
    "--font-display": typographyMeta.display.stack,
    "--font-body": typographyMeta.body.stack,
    "--font-mono": typographyMeta.mono.stack,
    "--bg": colors.bg,
    "--bg-alt": colors.bgAlt,
    "--surface": colors.surface,
    "--surface-soft": withAlpha(colors.surface, 0.82),
    "--surface-strong": withAlpha(colors.surface, 0.94),
    "--text": colors.text,
    "--muted": colors.muted,
    "--line": withAlpha(colors.line, 0.38),
    "--line-strong": withAlpha(colors.line, 0.72),
    "--primary": colors.primary,
    "--secondary": colors.secondary,
    "--accent": colors.accent,
    "--primary-soft": withAlpha(colors.primary, 0.16),
    "--secondary-soft": withAlpha(colors.secondary, 0.16),
    "--accent-soft": withAlpha(colors.accent, 0.18),
    "--ambient-left": withAlpha(colors.primary, 0.22),
    "--ambient-right": withAlpha(colors.secondary, 0.18),
    "--shadow-lg": `0 24px 50px ${withAlpha(colors.text, 0.08)}`,
    "--shadow-sm": `0 12px 24px ${withAlpha(colors.text, 0.05)}`,
    "--accent-ink": colors.text,
    "--accent-gold": colors.accent,
    "--accent-cyan": colors.secondary,
    "--accent-salmon": colors.primary,
  };

  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value);
  }

  return resolved;
}
