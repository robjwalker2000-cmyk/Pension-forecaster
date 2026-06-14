const DEFAULTS = {
  birthYear: 1964,
  currentYear: new Date().getFullYear(),
  planningAge: 95,
  lumpSumAllowance: 268275,
  taxFreeLumpSumsTaken: 0,
  taxFreeLumpSumsThisYear: 0,
  crystallisedPension: 200000,
  uncrystallisedPension: 180000,
  taxAllowance: 12570,
  higherRateThreshold: 50270,
  personalSavingsAllowance: 1000,
  basicTaxRate: 20,
  higherTaxRate: 40,
  bankBalance: 25000,
  bankInterestRate: 3.5,
  statePensionAmount: 12000,
  definedBenefitPayments: 20000,
  definedBenefitLumpSum: 0,
  targetEquivalentIncome: 80000,
  partnerWorkIncome: 0,
  partnerStatePension: 0,
  partnerWorkPension: 0,
  partnerSavings: 0,
  isaSource: 0,
  savingsSource: 0,
  premiumBondsSource: 0,
  billsAmount: 5000,
  billsFrequency: "monthly",
  holidaysAmount: 15000,
  holidaysFrequency: "annual",
  carAmount: 5000,
  carFrequency: "annual",
  growthRate: 6,
  inflationRate: 2.5,
};
const STORAGE_KEY = "retirementOptimizer.settings.v1";
const THEME_STORAGE_KEY = "retirementOptimizer.theme.v1";

const THEME_PRESETS = {
  original: {
    "--bg":            "#f4efe6",
    "--bg-2":          "#fffdf9",
    "--panel":         "rgba(255, 252, 247, 0.92)",
    "--panel-strong":  "#fffdf9",
    "--card":          "rgba(255, 252, 247, 0.97)",
    "--card-2":        "rgba(255, 246, 232, 0.93)",
    "--card-warn":     "rgba(255, 240, 240, 0.98)",
    "--card-warn-2":   "rgba(255, 226, 226, 0.94)",
    "--card-success":  "rgba(240, 255, 248, 0.98)",
    "--card-success-2":"rgba(220, 252, 236, 0.94)",
    "--input-bg":      "rgba(255, 255, 255, 0.72)",
    "--line":          "rgba(66, 50, 28, 0.14)",
    "--line-strong":   "rgba(66, 50, 28, 0.26)",
    "--text":          "#26190c",
    "--muted":         "#6c5b48",
    "--accent":        "#0f766e",
    "--accent-2":      "#b45309",
    "--accent-glow":   "rgba(15, 118, 110, 0.25)",
    "--danger":        "#b42318",
    "--success":       "#15803d",
    "--shadow":        "0 20px 50px rgba(56,35,7,0.12), 0 4px 12px rgba(56,35,7,0.08)",
    "--radius":        "22px",
    "--button-text":   "#ffffff",
  },
  dark: {
    "--bg":            "#1a2236",
    "--bg-2":          "#0e1322",
    "--panel":         "rgba(10, 14, 26, 0.88)",
    "--panel-strong":  "rgba(8, 12, 22, 0.97)",
    "--card":          "rgba(12, 16, 30, 0.97)",
    "--card-2":        "rgba(8, 12, 22, 0.95)",
    "--card-warn":     "rgba(30, 14, 14, 0.96)",
    "--card-warn-2":   "rgba(20, 10, 10, 0.9)",
    "--card-success":  "rgba(10, 30, 20, 0.96)",
    "--card-success-2":"rgba(8, 22, 16, 0.9)",
    "--input-bg":      "rgba(255, 255, 255, 0.04)",
    "--line":          "rgba(99, 179, 237, 0.13)",
    "--line-strong":   "rgba(99, 179, 237, 0.24)",
    "--text":          "#e8edf8",
    "--muted":         "#7a8fba",
    "--accent":        "#00d4b8",
    "--accent-2":      "#7c3aed",
    "--accent-glow":   "rgba(0, 212, 184, 0.28)",
    "--button-text":   "#0b0f1a",
    "--danger":        "#f87171",
    "--success":       "#34d399",
    "--shadow":        "0 2px 0px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.5), 0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.35)",
    "--radius":        "20px",
  },
  metallic: {
    "--bg":            "#131416",
    "--bg-2":          "#0e1012",
    "--panel":         "rgba(58, 62, 70, 0.92)",
    "--panel-strong":  "rgba(38, 40, 46, 0.98)",
    "--card":          "rgba(72, 76, 86, 0.97)",
    "--card-2":        "rgba(48, 51, 58, 0.95)",
    "--card-warn":     "rgba(70, 48, 44, 0.97)",
    "--card-warn-2":   "rgba(52, 34, 30, 0.95)",
    "--card-success":  "rgba(44, 62, 52, 0.97)",
    "--card-success-2":"rgba(32, 48, 38, 0.95)",
    "--input-bg":      "rgba(22, 24, 28, 0.75)",
    "--line":          "rgba(210, 218, 235, 0.16)",
    "--line-strong":   "rgba(220, 228, 245, 0.28)",
    "--text":          "#dde2ee",
    "--muted":         "#8890a4",
    "--accent":        "#7ab8d8",
    "--accent-2":      "#c8a060",
    "--accent-glow":   "rgba(122, 184, 216, 0.28)",
    "--button-text":   "#0e1012",
    "--danger":        "#e07878",
    "--success":       "#68c898",
    "--shadow":        "0 2px 0px rgba(240,245,255,0.1), 0 8px 24px rgba(0,0,0,0.65), 0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.5)",
    "--radius":        "20px",
  },
};

const ALL_THEME_VARS = [...new Set(Object.values(THEME_PRESETS).flatMap(Object.keys))];

let activeTheme = "dark";
let customBgHue = 175;
let customTileHue = 220;
let customCanvasHue = 220;
let customTextHue = 220;
const TAX_YEAR_MONTHS = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];
const MAX_PROJECTION_AGE = 120;

const form = document.querySelector("#optimizerForm");
const chart = document.querySelector("#projectionChart");
const ctx = chart.getContext("2d");
const moneyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("en-GB", {
  maximumFractionDigits: 2,
});
const PLAIN_NUMBER_FIELDS = new Set(["birthYear", "currentYear", "planningAge"]);
const FIELD_ALIASES = {
  birthYear: ["birthyear", "yearofbirth", "yob", "dobyear"],
  currentYear: ["currentyear", "taxyear", "taxyearstart", "taxyearstartingapril", "year", "startyear"],
  planningAge: ["planningage", "plantillage", "plantoage", "endage"],
  lumpSumAllowance: ["lumpsumallowance", "lsa", "lsalimit", "lumpsumlimit"],
  taxFreeLumpSumsTaken: ["taxfreelumpsumstaken", "tflstaken", "tflstakentodate", "taxfreecashtaken", "tfctaken", "tfctakentodate"],
  taxFreeLumpSumsThisYear: ["taxfreelumpsumsthisyear", "tflsthisyear", "taxfreecashthisyear", "tfcthisyear", "tfls", "tfc"],
  crystallisedPension: ["crystallisedpension", "crystallised", "crystallisedpot", "crystpot", "crystallizedpension", "crystallized", "crystallizedpot", "currentsavings"],
  uncrystallisedPension: ["uncrystallisedpension", "uncrystallised", "uncrystallisedpot", "uncrystpot", "uncrystallizedpension", "uncrystallized", "uncrystallizedpot"],
  taxAllowance: ["taxallowance", "personalallowance"],
  higherRateThreshold: ["higherratethreshold", "higherthreshold", "hrthreshold", "higherbandthreshold"],
  personalSavingsAllowance: ["personalsavingsallowance", "psa", "savingsallowance", "personalsavingsallowancebasic"],
  basicTaxRate: ["basictaxrate", "basicrate"],
  higherTaxRate: ["highertaxrate", "higherrate"],
  bankBalance: ["bankbalance", "bank", "cash", "cashbalance", "savingsbalance"],
  bankInterestRate: ["bankinterestrate", "interestrate", "savingsrate"],
  statePensionAmount: ["statepensionamount", "statepension", "statepensionincome", "fixedincome"],
  definedBenefitPayments: ["definedbenefitpayments", "definedbenefit", "dbpension", "dbincome", "workpension"],
  definedBenefitLumpSum: ["definedbenefitlumpsum", "dblumpsum", "workpensionlumpsum"],
  targetEquivalentIncome: ["targetequivalentincome", "grossincomerequired", "incomedesired", "desiredincome", "incomerequired", "targetincome", "annualspending"],
  partnerWorkIncome: ["partnerworkincome", "partnerwork", "partnerincome", "partneremploymentincome"],
  partnerStatePension: ["partnerstatepension", "partnersstatepension"],
  partnerWorkPension: ["partnerworkpension", "partnerdefinedbenefit", "partnerdbpension"],
  partnerSavings: ["partnersavings", "partnercontribution"],
  isaSource: ["isasource", "sourcedfromisa", "isa"],
  savingsSource: ["savingssource", "sourcedfromsavings", "savings"],
  premiumBondsSource: ["premiumbondssource", "sourcedfrompremiumbonds", "premiumbonds"],
  billsAmount: ["billsamount", "bills", "billspend"],
  billsFrequency: ["billsfrequency", "billsperiod"],
  holidaysAmount: ["holidaysamount", "holidays", "holidayamount", "holidayspend"],
  holidaysFrequency: ["holidaysfrequency", "holidaysperiod", "holidayfrequency"],
  carAmount: ["caramount", "car", "carspend"],
  carFrequency: ["carfrequency", "carperiod"],
  growthRate: ["growthrate", "investmentgrowth", "returnrate"],
  inflationRate: ["inflationrate", "inflation"],
};
const IMPORT_HELPER_ALIASES = {
  age: ["age", "currentage", "ageattaxyearstart", "ageinyear"],
  incomeNeeded: ["incomeneeded", "totalincomeneeded"],
  totalPot: ["totalpot", "pensionpot", "totalpension", "pensiontotal", "potleft"],
};

const fields = Object.keys(DEFAULTS).reduce((all, key) => {
  all[key] = document.querySelector(`#${key}`) || document.querySelector(`[name="${key}"]`);
  return all;
}, {});
const targetEquivalentIncomeExact = document.querySelector("#targetEquivalentIncomeExact");
const importSettingsFile = document.querySelector("#importSettingsFile");
const planYearSlider = document.querySelector("#planYearSlider");
const yearSliderBar = document.querySelector("#yearSliderBar");
const yearSliderMin = document.querySelector("#yearSliderMin");
const yearSliderMax = document.querySelector("#yearSliderMax");
const yearSliderCurrent = document.querySelector("#yearSliderCurrent");
const planChartSection = document.querySelector("#planChartSection");
const planStatusBadge = document.querySelector("#planStatusBadge");
const versionTag = document.querySelector("#versionTag");
let importedPlan = null;
let selectedPlanIndex = 0;
let versionTagTimer = null;
const isEmbeddedOptimiser = window.parent && window.parent !== window;
let planChartState = {
  showSavings: true,
  showIncome: true,
  showSpending: true,
  showPreRetirement: false,
  spendingFreeOnly: false,
  spendingMonthly: false,
  spendingRealTerms: true,
};

function buildCustomVars(bgHue, tileHue, canvasHue, textHue) {
  const cardL = 8;
  const bgL = 16;
  const textL = 90;
  const textS = 20;
  return {
    "--bg":            `hsl(${canvasHue}, 30%, ${bgL}%)`,
    "--bg-2":          `hsl(${canvasHue}, 30%, ${Math.max(4, bgL - 6)}%)`,
    "--panel":         `hsla(${tileHue}, 42%, ${cardL - 1}%, 0.88)`,
    "--panel-strong":  `hsla(${tileHue}, 42%, ${Math.max(2, cardL - 3)}%, 0.97)`,
    "--card":          `hsla(${tileHue}, 38%, ${cardL}%, 0.97)`,
    "--card-2":        `hsla(${tileHue}, 38%, ${Math.max(2, cardL - 2)}%, 0.95)`,
    "--card-warn":     `hsla(0, 45%, ${cardL}%, 0.96)`,
    "--card-warn-2":   `hsla(0, 45%, ${Math.max(2, cardL - 2)}%, 0.9)`,
    "--card-success":  `hsla(150, 45%, ${cardL}%, 0.96)`,
    "--card-success-2":`hsla(150, 45%, ${Math.max(2, cardL - 2)}%, 0.9)`,
    "--input-bg":      `hsla(${tileHue}, 30%, 18%, 0.6)`,
    "--line":          `hsla(${bgHue}, 60%, 65%, 0.13)`,
    "--line-strong":   `hsla(${bgHue}, 60%, 65%, 0.26)`,
    "--text":          `hsl(${textHue}, ${textS}%, ${textL}%)`,
    "--muted":         `hsl(${textHue}, 16%, 58%)`,
    "--accent":        `hsl(${bgHue}, 80%, 55%)`,
    "--accent-2":      `hsl(${(bgHue + 130) % 360}, 68%, 58%)`,
    "--accent-glow":   `hsla(${bgHue}, 80%, 55%, 0.3)`,
    "--button-text":   `hsl(${canvasHue}, 30%, 10%)`,
    "--danger":        "#f87171",
    "--success":       "#34d399",
    "--shadow":        "0 2px 0px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.5), 0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.35)",
    "--radius":        "20px",
  };
}

function buildCustomBackground(bgHue, tileHue) {
  const h2 = (bgHue + 130) % 360;
  const h3 = (bgHue + 200) % 360;
  return [
    `radial-gradient(ellipse 80% 50% at 20% -10%, hsla(${bgHue},80%,55%,0.28) 0%, transparent 60%)`,
    `radial-gradient(ellipse 60% 40% at 85% 10%, hsla(${h2},65%,58%,0.32) 0%, transparent 55%)`,
    `radial-gradient(ellipse 50% 60% at 50% 100%, hsla(${h3},70%,50%,0.22) 0%, transparent 60%)`,
    `radial-gradient(ellipse 30% 30% at 10% 80%, hsla(${bgHue},80%,55%,0.14) 0%, transparent 50%)`,
  ].join(", ");
}

function applyTheme(theme, bgHue, tileHue, canvasHue, textHue) {
  const root = document.documentElement;
  ALL_THEME_VARS.forEach((v) => root.style.removeProperty(v));

  const vars = theme === "custom"
    ? buildCustomVars(bgHue, tileHue, canvasHue, textHue)
    : THEME_PRESETS[theme] || THEME_PRESETS.dark;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

  if (theme === "original") {
    document.body.style.backgroundImage = [
      "radial-gradient(circle at top left, rgba(15,118,110,0.12), transparent 28%)",
      "radial-gradient(circle at top right, rgba(180,83,9,0.16), transparent 24%)",
      "linear-gradient(180deg, #fbf7f0 0%, #f4efe6 48%, #efe4d1 100%)",
    ].join(", ");
    document.body.style.backgroundColor = "#f4efe6";
  } else if (theme === "metallic") {
    document.body.style.backgroundImage = [
      "radial-gradient(ellipse 70% 45% at 20% 10%, rgba(200,215,240,0.055) 0%, transparent 60%)",
      "radial-gradient(ellipse 55% 40% at 80% 85%, rgba(180,195,220,0.04) 0%, transparent 55%)",
      "linear-gradient(180deg, #1a1c20 0%, #131416 45%, #0e1012 100%)",
    ].join(", ");
    document.body.style.backgroundColor = "#131416";
  } else if (theme === "custom") {
    document.body.style.backgroundImage = buildCustomBackground(bgHue, tileHue);
    document.body.style.backgroundColor = `hsl(${canvasHue}, 30%, 16%)`;
  } else {
    document.body.style.backgroundImage = "";
    document.body.style.backgroundColor = "";
  }

  root.setAttribute("data-theme", theme);

  document.querySelectorAll(".theme-chip").forEach((btn) => {
    btn.classList.toggle("theme-chip-active", btn.dataset.theme === theme);
  });
}

function saveThemePrefs() {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
      theme: activeTheme,
      bgHue: customBgHue,
      tileHue: customTileHue,
      canvasHue: customCanvasHue,
      textHue: customTextHue,
    }));
  } catch {
    // Some browsers block localStorage for local files or private sessions.
  }
}

function loadThemePrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || "{}");
    activeTheme = ["original", "dark", "metallic", "custom"].includes(saved.theme)
      ? saved.theme
      : "dark";
    customBgHue    = Number.isFinite(saved.bgHue)     ? saved.bgHue     : 175;
    customTileHue  = Number.isFinite(saved.tileHue)   ? saved.tileHue   : 220;
    customCanvasHue= Number.isFinite(saved.canvasHue) ? saved.canvasHue : 220;
    customTextHue  = Number.isFinite(saved.textHue)   ? saved.textHue   : 220;
  } catch {
    activeTheme = "dark";
  }
}

function syncSwatches() {
  document.querySelector("#bgHueSwatch").style.background     = `hsl(${customBgHue}, 80%, 55%)`;
  document.querySelector("#tileHueSwatch").style.background   = `hsl(${customTileHue}, 45%, 20%)`;
  document.querySelector("#canvasHueSwatch").style.background = `hsl(${customCanvasHue}, 30%, 20%)`;
  document.querySelector("#textHueSwatch").style.background   = `hsl(${customTextHue}, 22%, 88%)`;
}

function getChartColours() {
  const cs = getComputedStyle(document.documentElement);
  const get = (v) => cs.getPropertyValue(v).trim();
  return {
    accent:  get("--accent"),
    accent2: get("--accent-2"),
    muted:   get("--muted"),
    text:    get("--text"),
    line:    get("--line"),
    danger:  get("--danger"),
    bg:      get("--table-bg") || get("--panel") || get("--card") || "transparent",
  };
}

function setupNumberInputs() {
  Object.entries(fields).forEach(([key, field]) => {
    if (!field || field.type !== "number") {
      return;
    }

    field.type = "text";
    field.inputMode = PLAIN_NUMBER_FIELDS.has(key) ? "numeric" : "decimal";
    field.addEventListener("focus", () => {
      field.value = field.value.replaceAll(",", "");
    });
    field.addEventListener("blur", () => {
      field.value = formatNumberInput(key, field.value);
    });
  });

  targetEquivalentIncomeExact.type = "text";
  targetEquivalentIncomeExact.inputMode = "decimal";
  targetEquivalentIncomeExact.addEventListener("focus", () => {
    targetEquivalentIncomeExact.value = targetEquivalentIncomeExact.value.replaceAll(",", "");
  });
  targetEquivalentIncomeExact.addEventListener("blur", () => {
    syncExactIncomeToSlider();
    targetEquivalentIncomeExact.value = formatNumberInput("targetEquivalentIncome", targetEquivalentIncomeExact.value);
  });
  targetEquivalentIncomeExact.addEventListener("input", syncExactIncomeToSlider);
  targetEquivalentIncomeExact.addEventListener("input", () => {
    render();
    saveSettings();
  });
  fields.targetEquivalentIncome.addEventListener("input", () => {
    targetEquivalentIncomeExact.value = formatNumberInput("targetEquivalentIncome", fields.targetEquivalentIncome.value);
  });
}

function syncExactIncomeToSlider() {
  const slider = fields.targetEquivalentIncome;
  const exactValue = clamp(
    parseNumber(targetEquivalentIncomeExact.value),
    Number(slider.min),
    Number(slider.max)
  );

  if (Number.isFinite(exactValue)) {
    slider.value = exactValue;
  }
}

function resetFields() {
  Object.entries(DEFAULTS).forEach(([key, value]) => {
    setFieldValue(key, value);
  });
}

function getExportableSettings() {
  return Object.fromEntries(
    Object.keys(DEFAULTS).map((key) => [key, getFieldValue(key)])
  );
}

function applySettings(settings) {
  migrateSavedSettings(settings);

  Object.keys(DEFAULTS).forEach((key) => {
    const numericValue = parseNumber(settings[key]);
    if (typeof DEFAULTS[key] === "number" && Number.isFinite(numericValue)) {
      setFieldValue(key, numericValue);
    }

    if (typeof DEFAULTS[key] === "string" && typeof settings[key] === "string") {
      setFieldValue(key, settings[key]);
    }
  });
}

function loadSavedSettings() {
  try {
    const saved = JSON.parse(getSavedSettings());
    if (!saved || typeof saved !== "object") {
      return;
    }

    applySettings(saved);
  } catch {
    removeSavedSettings();
  }
}

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getExportableSettings()));
  } catch {
    // Some browsers block localStorage for local files or private sessions.
  }
}

function exportSettings() {
  const settings = {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: getExportableSettings(),
  };
  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `retirement-optimizer-${getFieldValue("currentYear")}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importSettings(file) {
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const imported = parseImportPackage(String(reader.result), file.name);
      if (imported.plan) {
        importedPlan = imported.plan;
        selectedPlanIndex = imported.plan.selectedIndex;
        updatePlanControls();
      } else {
        importedPlan = null;
        selectedPlanIndex = 0;
        updatePlanControls();
      }
      applySettings(imported.settings);
      render();
      saveSettings();
    } catch {
      window.alert("Could not import that file. Try a settings JSON export or a single-row CSV with headers.");
    } finally {
      importSettingsFile.value = "";
    }
  });
  reader.readAsText(file);
}

function parseImportPackage(text, sourceName = "") {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Empty import");
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (isForecasterPlanExport(parsed)) {
      const plan = getForecasterPlan(parsed);
      return {
        settings: coerceImportedSettings(getForecasterPlanRowSettings(parsed, plan.rows[plan.selectedIndex]), sourceName),
        plan,
      };
    }

    return {
      settings: coerceImportedSettings(getImportSource(parsed), sourceName),
      plan: null,
    };
  } catch (error) {
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      throw error;
    }
    const rows = parseCsv(trimmed);
    if (!rows.length) {
      throw new Error("No CSV rows");
    }
    return {
      settings: coerceImportedSettings(rows[0], sourceName),
      plan: null,
    };
  }
}

function parseImportedSettings(text, sourceName = "") {
  return parseImportPackage(text, sourceName).settings;
}

function getImportSource(parsed) {
  if (isForecasterYearExport(parsed)) {
    return {
      ...parsed.settings,
      ...getForecasterYearSettings(parsed),
    };
  }

  if (parsed.settings && typeof parsed.settings === "object") {
    return parsed.settings;
  }

  return Array.isArray(parsed) ? parsed[0] : parsed;
}

function isForecasterYearExport(parsed) {
  return parsed
    && typeof parsed === "object"
    && parsed.schema === "pension-forecaster-year-export"
    && parsed.projection
    && parsed.projection.year;
}

function isForecasterPlanExport(parsed) {
  return parsed
    && typeof parsed === "object"
    && parsed.schema === "pension-forecaster-plan-export"
    && parsed.projection
    && Array.isArray(parsed.projection.rows);
}

function getForecasterPlan(parsed) {
  return {
    assumptions: parsed.assumptions || {},
    name: getImportedPlanName(parsed),
    rows: parsed.projection.rows,
    preRetirementRows: parsed.projection.preRetirementRows || [],
    retirementYear: parsed.projection.rows[0]?.calendarYear || null,
    selectedIndex: 0,
  };
}

function getImportedPlanName(parsed) {
  return [
    parsed.planName,
    parsed.name,
    parsed.title,
    parsed.meta?.planName,
    parsed.meta?.name,
    parsed.meta?.title,
    parsed.assumptions?.plan?.planName,
    parsed.assumptions?.plan?.name,
    parsed.assumptions?.sourceState?.planName,
    parsed.assumptions?.sourceState?.name,
  ].find((value) => typeof value === "string" && value.trim())?.trim() || "";
}

function getForecasterYearSettings(parsed) {
  return getForecasterPlanRowSettings(parsed, parsed.projection.year);
}

function getForecasterPlanRowSettings(parsed, year) {
  const standardLsa = parsed.assumptions?.taxRules?.standardLumpSumAllowance || DEFAULTS.lumpSumAllowance;
  const planAssumptions = parsed.assumptions?.plan || {};
  const sourceState = parsed.assumptions?.sourceState || {};
  const savingsAssumptions = parsed.assumptions?.personalSavings || {};
  const growthAssumptions = parsed.assumptions?.growthAndInflation || {};
  const tflsTakenAtStart = Math.max(
    0,
    standardLsa - ((year.remainingLumpSumAllowance || 0) + (year.taxFreeCash || 0))
  );
  const taxRules = parsed.assumptions?.taxRules || {};
  const annualSpendTarget = Math.max(
    year.totalIncomeRequired || year.incomeRequired || 0,
    (year.householdBills || 0) + (year.holidays || 0) + (year.carCost || 0) + (year.estimatedTax || 0)
  );
  const settings = {
    optimizerTargetPrecalculated: true,
    birthYear: planAssumptions.yearOfBirth || sourceState.yearOfBirth,
    currentYear: year.calendarYear,
    planningAge: planAssumptions.planEndAge || planAssumptions.planToAge || sourceState.planToAge,
    lumpSumAllowance: standardLsa,
    taxFreeLumpSumsTaken: tflsTakenAtStart,
    taxFreeLumpSumsThisYear: year.taxFreeCash,
    crystallisedPension: year.openingCrystallisedFund,
    uncrystallisedPension: year.openingUncrystallisedPot,
    taxAllowance: year.assumedTaxAllowance,
    higherRateThreshold: taxRules.basicRateLimit,
    personalSavingsAllowance: year.personalSavingsAllowance,
    basicTaxRate: Number.isFinite(taxRules.basicRate) ? taxRules.basicRate * 100 : undefined,
    higherTaxRate: Number.isFinite(taxRules.higherRate) ? taxRules.higherRate * 100 : undefined,
    bankBalance: year.openingBankSavings,
    bankInterestRate: (savingsAssumptions.personalBankInterestRate ?? sourceState.personalBankInterestRate ?? 0) * 100,
    statePensionAmount: year.ownStatePension,
    definedBenefitPayments: year.definedBenefitIncome,
    definedBenefitLumpSum: year.definedBenefitLumpSum,
    targetEquivalentIncome: Math.max(0, annualSpendTarget - (year.carCost || 0)),
    partnerWorkIncome: year.partnerIncome,
    partnerStatePension: year.partnerStatePension,
    partnerWorkPension: year.partnerWorkPension,
    partnerSavings: year.partnerSavingsPlannedUse,
    isaSource: year.isaSavingsUsed,
    savingsSource: year.bankSavingsUsed,
    premiumBondsSource: year.premiumBondsUsed,
    billsAmount: year.householdBills,
    billsFrequency: "annual",
    holidaysAmount: year.holidays,
    holidaysFrequency: "annual",
    carAmount: year.carCost,
    carFrequency: "annual",
    growthRate: (growthAssumptions.postRetirementGrowthRateUsed ?? sourceState.postRetirementGrowthMid ?? 0) * 100,
    inflationRate: (growthAssumptions.cpiRate ?? sourceState.cpiRate ?? 0) * 100,
  };

  return Object.fromEntries(
    Object.entries(settings).filter(([, value]) => value !== undefined && value !== null)
  );
}

function coerceImportedSettings(source, sourceName = "") {
  if (!source || typeof source !== "object") {
    throw new Error("Import source is not an object");
  }

  const normalizedValues = new Map(
    Object.entries(source).map(([key, value]) => [normalizeImportKey(key), value])
  );
  const settings = {};

  Object.entries(DEFAULTS).forEach(([key, defaultValue]) => {
    const value = source[key] !== undefined
      ? source[key]
      : findImportedValue(normalizedValues, FIELD_ALIASES[key] || []);

    if (value === undefined || value === "") {
      return;
    }

    if (typeof defaultValue === "number") {
      const number = parseNumber(value);
      if (Number.isFinite(number)) {
        settings[key] = number;
      }
      return;
    }

    if (typeof defaultValue === "string") {
      const frequency = normalizeFrequency(value);
      if (frequency) {
        settings[key] = frequency;
      }
    }
  });

  const importedAge = parseNumber(findImportedValue(normalizedValues, IMPORT_HELPER_ALIASES.age));
  if (settings.birthYear === undefined && Number.isFinite(importedAge)) {
    const year = Number.isFinite(settings.currentYear) ? settings.currentYear : DEFAULTS.currentYear;
    settings.birthYear = year - importedAge;
  }

  const totalPot = parseNumber(findImportedValue(normalizedValues, IMPORT_HELPER_ALIASES.totalPot));
  if (
    Number.isFinite(totalPot)
      && settings.crystallisedPension === undefined
      && settings.uncrystallisedPension === undefined
  ) {
    settings.crystallisedPension = totalPot;
    settings.uncrystallisedPension = 0;
  }

  const incomeNeeded = parseNumber(findImportedValue(normalizedValues, IMPORT_HELPER_ALIASES.incomeNeeded));
  if (!source.optimizerTargetPrecalculated && Number.isFinite(incomeNeeded)) {
    settings.targetEquivalentIncome = Math.max(0, incomeNeeded - (settings.carAmount || 0));
  } else if (
    !source.optimizerTargetPrecalculated
      && normalizeImportKey(sourceName).includes("pensionforecaster")
      && Number.isFinite(settings.targetEquivalentIncome)
      && Number.isFinite(settings.carAmount)
  ) {
    settings.targetEquivalentIncome = Math.max(0, settings.targetEquivalentIncome - settings.carAmount);
  }

  return settings;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === "\"" && inQuotes && nextChar === "\"") {
      cell += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(cell.trim());
      if (row.some((value) => value !== "")) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some((value) => value !== "")) {
    rows.push(row);
  }

  const headers = rows.shift();
  if (!headers) {
    return [];
  }

  return rows.map((values) => Object.fromEntries(
    headers.map((header, index) => [header, values[index] || ""])
  ));
}

function findImportedValue(normalizedValues, aliases) {
  return aliases.reduce((found, alias) => {
    if (found !== undefined) {
      return found;
    }
    return normalizedValues.get(normalizeImportKey(alias));
  }, undefined);
}

function normalizeImportKey(key) {
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeFrequency(value) {
  const normalized = normalizeImportKey(value);
  if (["monthly", "month", "mo", "m"].includes(normalized)) {
    return "monthly";
  }
  if (["annual", "annually", "yearly", "year", "yr", "y"].includes(normalized)) {
    return "annual";
  }
  return null;
}

function updatePlanControls() {
  const hasPlan = importedPlan && importedPlan.rows.length > 0;
  yearSliderBar.hidden = !hasPlan;
  document.querySelector("#planChartsSection").hidden = !hasPlan;
  planStatusBadge.textContent = hasPlan
    ? `Plan Loaded${importedPlan.name ? `: ${importedPlan.name}` : ""}`
    : "No Plan Loaded";
  planStatusBadge.classList.toggle("loaded", hasPlan);

  if (!hasPlan) {
    return;
  }

  planYearSlider.min = "0";
  planYearSlider.max = String(importedPlan.rows.length - 1);
  planYearSlider.value = String(selectedPlanIndex);
  yearSliderMin.textContent = importedPlan.rows[0].calendarYear;
  yearSliderMax.textContent = importedPlan.rows[importedPlan.rows.length - 1].calendarYear;
  syncChartToggleChips();
  updatePlanYearLabel();
  renderPlanCharts();
}

function updatePlanYearLabel() {
  if (!importedPlan) {
    yearSliderCurrent.textContent = "-";
    return;
  }
  const row = importedPlan.rows[selectedPlanIndex];
  yearSliderCurrent.textContent = `${row.calendarYear} · Age ${row.age}`;
}

function getTodayMoneyValue(value) {
  if (!importedPlan) {
    return null;
  }

  const row = importedPlan.rows[selectedPlanIndex];
  const baseYear = importedPlan.assumptions?.plan?.currentYear
    || importedPlan.assumptions?.sourceState?.currentYear
    || row.calendarYear;
  const cpiRate = importedPlan.assumptions?.growthAndInflation?.cpiRate
    ?? importedPlan.assumptions?.sourceState?.cpiRate
    ?? 0;
  const yearsFromBase = Math.max(0, row.calendarYear - baseYear);
  const inflationFactor = Math.pow(1 + cpiRate / 12, 12 * yearsFromBase); // monthly compounding, matches spending chart

  if (!Number.isFinite(inflationFactor) || inflationFactor <= 0) {
    return null;
  }

  return value / inflationFactor;
}

function applySelectedPlanYear() {
  if (!importedPlan) {
    return;
  }

  const source = {
    schema: "pension-forecaster-plan-export",
    assumptions: importedPlan.assumptions,
    projection: { rows: importedPlan.rows },
  };
  const settings = coerceImportedSettings(
    getForecasterPlanRowSettings(source, importedPlan.rows[selectedPlanIndex]),
    "pension-forecaster-plan"
  );
  applySettings(settings);
  updatePlanYearLabel();
  render();
  setOptimizerReadonly();
  if (!isEmbeddedOptimiser) {
    saveSettings();
  }
}

function getActiveImportedYearRow(currentYear) {
  if (!importedPlan?.rows?.length) {
    return null;
  }

  const selectedRow = importedPlan.rows[selectedPlanIndex];
  if (selectedRow?.calendarYear === currentYear) {
    return selectedRow;
  }

  return importedPlan.rows.find((row) => row.calendarYear === currentYear) || null;
}

function getSavedSettings() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function removeSavedSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // If storage is blocked, there is nothing to clean up.
  }
}

function migrateSavedSettings(saved) {
  if (Number.isFinite(Number(saved.currentSavings)) && saved.crystallisedPension === undefined) {
    saved.crystallisedPension = saved.currentSavings;
    saved.uncrystallisedPension = 0;
  }

  if (Number.isFinite(Number(saved.fixedIncome)) && saved.statePensionAmount === undefined) {
    saved.statePensionAmount = saved.fixedIncome;
    saved.definedBenefitPayments = 0;
  }

  if (Number.isFinite(Number(saved.annualSpending)) && saved.billsAmount === undefined) {
    saved.billsAmount = saved.annualSpending;
    saved.billsFrequency = "annual";
    saved.holidaysAmount = 0;
    saved.carAmount = 0;
  }

  if (Number.isFinite(Number(saved.annualSpending)) && saved.targetEquivalentIncome === undefined) {
    saved.targetEquivalentIncome = saved.annualSpending;
  }

  if (Number.isFinite(Number(saved.partnerContribution)) && saved.partnerSavings === undefined) {
    saved.partnerSavings = saved.partnerContribution;
  }
}

function getFieldValue(key) {
  if (typeof DEFAULTS[key] === "string") {
    return document.querySelector(`[name="${key}"]:checked`)?.value || DEFAULTS[key];
  }

  if (key === "targetEquivalentIncome") {
    return parseNumber(targetEquivalentIncomeExact.value);
  }

  return parseNumber(fields[key].value);
}

function setFieldValue(key, value) {
  if (typeof DEFAULTS[key] === "string") {
    const option = document.querySelector(`[name="${key}"][value="${value}"]`);
    if (option) {
      option.checked = true;
    }
    return;
  }

  if (key === "targetEquivalentIncome") {
    const number = parseNumber(value);
    fields[key].value = clamp(number, Number(fields[key].min), Number(fields[key].max));
    targetEquivalentIncomeExact.value = formatNumberInput(key, number);
    return;
  }

  fields[key].value = fields[key].type === "range" ? value : formatNumberInput(key, value);
}

function currency(value) {
  return moneyFormatter.format(Math.round(value));
}

function annualMonthlyCurrency(value) {
  return `${currency(value)}/Yr ${currency(value / 12)}/Mth`;
}

function lastChangedLabel() {
  const changedAt = new Date(document.lastModified);

  if (Number.isNaN(changedAt.getTime())) {
    return "Changed: unknown";
  }

  return `Changed ${changedAt.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function showLastChanged() {
  const version = versionTag.dataset.version || versionTag.textContent;
  versionTag.dataset.version = version;
  versionTag.textContent = lastChangedLabel();

  window.clearTimeout(versionTagTimer);
  versionTagTimer = window.setTimeout(() => {
    versionTag.textContent = versionTag.dataset.version;
  }, 5000);
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) {
    return value;
  }

  return Math.min(max, Math.max(min, value));
}

function formatNumberInput(key, value) {
  const number = parseNumber(value);
  if (!Number.isFinite(number)) {
    return "";
  }

  return PLAIN_NUMBER_FIELDS.has(key) ? String(Math.round(number)) : numberFormatter.format(number);
}

function parseNumber(value) {
  const normalized = String(value)
    .trim()
    .replace(/^\((.*)\)$/, "-$1")
    .replace(/[£$€,\s%]/g, "");
  return Number(normalized);
}

function readInputs() {
  const inputs = Object.fromEntries(
    Object.entries(DEFAULTS).map(([key, defaultValue]) => [
      key,
      typeof defaultValue === "number" ? Number(getFieldValue(key)) : getFieldValue(key),
    ])
  );

  const annualBillsCost = annualize(inputs.billsAmount, inputs.billsFrequency);
  const annualHolidaysCost = annualize(inputs.holidaysAmount, inputs.holidaysFrequency);
  const annualCarCost = annualize(inputs.carAmount, inputs.carFrequency);
  const categorySpending = annualBillsCost + annualHolidaysCost + annualCarCost;
  inputs.annualBillsCost = annualBillsCost;
  inputs.annualHolidaysCost = annualHolidaysCost;
  inputs.categorySpending = categorySpending;
  inputs.annualCarCost = annualCarCost;
  inputs.annualSpending = inputs.targetEquivalentIncome + annualCarCost;
  inputs.spendingScale = categorySpending > 0 ? inputs.annualSpending / categorySpending : 0;
  inputs.startingAssets = inputs.crystallisedPension + inputs.uncrystallisedPension;
  inputs.startCrystallisedToDate = Math.max(
    inputs.crystallisedPension,
    inputs.taxFreeLumpSumsTaken / 0.25
  );
  const startingLsaRemaining = Math.max(0, inputs.lumpSumAllowance - inputs.taxFreeLumpSumsTaken);
  inputs.effectiveTaxFreeCashThisYear = Math.min(
    inputs.taxFreeLumpSumsThisYear,
    startingLsaRemaining,
    inputs.uncrystallisedPension * 0.25
  );
  inputs.lsaRemaining = Math.max(0, startingLsaRemaining - inputs.effectiveTaxFreeCashThisYear);
  inputs.availableTaxFreeCash = Math.min(
    inputs.lsaRemaining,
    Math.max(0, inputs.uncrystallisedPension - inputs.effectiveTaxFreeCashThisYear / 0.25) * 0.25
  );
  inputs.annualSavingsInterest = inputs.bankBalance * (inputs.bankInterestRate / 100);
  inputs.annualTaxableIncome = inputs.statePensionAmount
    + inputs.definedBenefitPayments;
  inputs.annualGrossIncome = inputs.annualTaxableIncome
    + inputs.definedBenefitLumpSum;
  inputs.partnerContribution = inputs.partnerWorkIncome
    + inputs.partnerStatePension
    + inputs.partnerWorkPension
    + inputs.partnerSavings;
  inputs.cashPartnerContribution = inputs.partnerContribution;
  inputs.taxNeutralFunding = inputs.partnerContribution
    + inputs.effectiveTaxFreeCashThisYear
    + inputs.isaSource
    + inputs.savingsSource
    + inputs.premiumBondsSource;
  inputs.portfolioDraw = Math.max(
    0,
    inputs.annualSpending
      - inputs.taxNeutralFunding
      - inputs.annualGrossIncome
  );
  inputs.taxEstimate = estimateTaxWithSavings(
    inputs.annualTaxableIncome + inputs.portfolioDraw,
    inputs.annualSavingsInterest,
    inputs.taxAllowance,
    inputs.higherRateThreshold,
    inputs.personalSavingsAllowance,
    inputs.basicTaxRate,
    inputs.higherTaxRate
  );
  inputs.annualNetIncome = Math.max(
    0,
    inputs.annualGrossIncome
      + inputs.portfolioDraw
      + inputs.cashPartnerContribution
      + inputs.effectiveTaxFreeCashThisYear
      + inputs.isaSource
      + inputs.savingsSource
      + inputs.premiumBondsSource
      - inputs.taxEstimate
  );

  const importedYear = getActiveImportedYearRow(inputs.currentYear);
  if (importedYear) {
    inputs.portfolioDraw = Math.max(0, importedYear.taxableWithdrawal || inputs.portfolioDraw);
    inputs.taxEstimate = Math.max(0, importedYear.estimatedTax || inputs.taxEstimate);
    inputs.importedFreeCash = Number.isFinite(importedYear.excessNet)
      ? importedYear.excessNet
      : null;
    inputs.cashPartnerContribution = Math.max(
      0,
      (importedYear.incomeTotal || 0)
        - inputs.annualGrossIncome
        - inputs.effectiveTaxFreeCashThisYear
    );
    inputs.annualNetIncome = Math.max(
      0,
      inputs.annualGrossIncome
        + inputs.portfolioDraw
        + inputs.cashPartnerContribution
        + inputs.effectiveTaxFreeCashThisYear
        + inputs.isaSource
        + inputs.savingsSource
        + inputs.premiumBondsSource
        - inputs.taxEstimate
    );
  }

  return inputs;
}

function availableTaxFreeCashLimit(inputs) {
  const startingLsaRemaining = Math.max(0, inputs.lumpSumAllowance - inputs.taxFreeLumpSumsTaken);
  return Math.min(startingLsaRemaining, inputs.uncrystallisedPension * 0.25);
}

function updateTaxFreeCashControl(inputs) {
  const availableTfc = availableTaxFreeCashLimit(inputs);
  const control = fields.taxFreeLumpSumsThisYear;
  control.max = String(Math.max(0, availableTfc));
  control.disabled = availableTfc <= 0;

  if (Number(control.value) > availableTfc) {
    control.value = availableTfc;
  }

  document.querySelector("#taxFreeLumpSumsThisYearNote").textContent = `Available TFC: ${currency(availableTfc)}`;
}

function annualize(amount, frequency) {
  return amount * (frequency === "monthly" ? 12 : 1);
}

function estimateTax(grossIncome, allowance, higherRateThreshold, basicRate, higherRate) {
  const taxableIncome = Math.max(0, grossIncome - allowance);
  return estimateTaxableIncomeTax(taxableIncome, allowance, higherRateThreshold, basicRate, higherRate);
}

function estimateTaxWithSavings(
  nonSavingsIncome,
  savingsInterest,
  allowance,
  higherRateThreshold,
  personalSavingsAllowance,
  basicRate,
  higherRate
) {
  const taxableNonSavings = Math.max(0, nonSavingsIncome - allowance);
  const remainingAllowance = Math.max(0, allowance - nonSavingsIncome);
  const savingsAfterAllowance = Math.max(0, savingsInterest - remainingAllowance);
  const taxableSavings = Math.max(0, savingsAfterAllowance - personalSavingsAllowance);
  return estimateTaxableIncomeTax(
    taxableNonSavings + taxableSavings,
    allowance,
    higherRateThreshold,
    basicRate,
    higherRate
  );
}

function estimateTaxableIncomeTax(taxableIncome, allowance, higherRateThreshold, basicRate, higherRate) {
  const basicBand = Math.max(0, higherRateThreshold - allowance);
  const basicTax = Math.min(taxableIncome, basicBand) * (basicRate / 100);
  const higherTax = Math.max(0, taxableIncome - basicBand) * (higherRate / 100);
  return basicTax + higherTax;
}

function solvePortfolioDraw(spending, grossIncome, allowance, higherRateThreshold, basicRate, higherRate) {
  if (
    grossIncome - estimateTax(grossIncome, allowance, higherRateThreshold, basicRate, higherRate)
      >= spending
  ) {
    return 0;
  }

  let low = 0;
  let high = Math.max(spending, 1);

  while (
    grossIncome + high - estimateTax(grossIncome + high, allowance, higherRateThreshold, basicRate, higherRate)
      < spending
  ) {
    high *= 2;
  }

  for (let i = 0; i < 32; i += 1) {
    const midpoint = (low + high) / 2;
    const netIncome = grossIncome
      + midpoint
      - estimateTax(grossIncome + midpoint, allowance, higherRateThreshold, basicRate, higherRate);
    if (netIncome >= spending) {
      high = midpoint;
    } else {
      low = midpoint;
    }
  }

  return high;
}

function buildTaxYearPlan(inputs) {
  const monthlySpend = inputs.annualSpending / 12;
  const monthlyBills = inputs.annualBillsCost / 12;
  const monthlyHolidays = inputs.annualHolidaysCost / 12;
  const monthlyIncome = inputs.annualGrossIncome / 12;
  const monthlyTax = inputs.taxEstimate / 12;
  const monthlyDraw = inputs.portfolioDraw / 12;
  const monthlyTaxFreeCash = inputs.effectiveTaxFreeCashThisYear / 12;
  const monthlyPartnerContribution = inputs.cashPartnerContribution / 12;
  const monthlyIsaSource = inputs.isaSource / 12;
  const monthlySavingsSource = inputs.savingsSource / 12;
  const monthlyPremiumBondsSource = inputs.premiumBondsSource / 12;
  const monthlyImportedFreeCash = Number.isFinite(inputs.importedFreeCash)
    ? inputs.importedFreeCash / 12
    : null;
  const monthlyBillsAndHolidays = (inputs.annualBillsCost + inputs.annualHolidaysCost) / 12;
  const monthlyPensionGrowth = Math.pow(1 + inputs.growthRate / 100, 1 / 12) - 1;
  let crystallised = inputs.crystallisedPension;
  let uncrystallised = inputs.uncrystallisedPension;
  const bank = inputs.bankBalance;
  let actualPortfolioDraw = 0;
  let fundsCrystallisedThisYear = 0;

  const months = TAX_YEAR_MONTHS.map((name, index) => {
    const year = index <= 8 ? inputs.currentYear : inputs.currentYear + 1;
    crystallised *= 1 + monthlyPensionGrowth;
    uncrystallised *= 1 + monthlyPensionGrowth;

    const requestedTaxFreeCash = Math.min(monthlyTaxFreeCash, uncrystallised * 0.25);
    const fundsCrystallisedForTaxFreeCash = requestedTaxFreeCash / 0.25;
    const taxFreeCash = fundsCrystallisedForTaxFreeCash * 0.25;
    fundsCrystallisedThisYear += fundsCrystallisedForTaxFreeCash;
    uncrystallised -= fundsCrystallisedForTaxFreeCash;
    crystallised += fundsCrystallisedForTaxFreeCash * 0.75;

    const crystallisedDraw = Math.min(crystallised, monthlyDraw);
    crystallised -= crystallisedDraw;
    actualPortfolioDraw += crystallisedDraw;

    return {
      label: `${name} ${year}`,
      spend: monthlySpend,
      income: monthlyIncome,
      bills: monthlyBills,
      holidays: monthlyHolidays,
      tax: monthlyTax,
      draw: crystallisedDraw,
      taxFreeCash,
      partnerContribution: monthlyPartnerContribution,
      isaSource: monthlyIsaSource,
      savingsSource: monthlySavingsSource,
      premiumBondsSource: monthlyPremiumBondsSource,
      freeCash: monthlyImportedFreeCash ?? (
        monthlyIncome
          + taxFreeCash
          + monthlyPartnerContribution
          + monthlyIsaSource
          + monthlySavingsSource
          + monthlyPremiumBondsSource
          + crystallisedDraw
          - monthlyBillsAndHolidays
          - monthlyTax
      ),
      potLeft: crystallised + uncrystallised,
    };
  });

  const endTflsTaken = inputs.taxFreeLumpSumsTaken + inputs.effectiveTaxFreeCashThisYear;
  const endLsa = Math.max(0, inputs.lumpSumAllowance - endTflsTaken);
  return {
    months,
    monthlySpend,
    yearSpend: inputs.annualSpending,
    yearBills: inputs.annualBillsCost,
    yearHolidays: inputs.annualHolidaysCost,
    taxEstimate: inputs.taxEstimate,
    portfolioDraw: actualPortfolioDraw,
    freeCash: Number.isFinite(inputs.importedFreeCash)
      ? inputs.importedFreeCash
      : inputs.annualGrossIncome
        + inputs.effectiveTaxFreeCashThisYear
        + inputs.cashPartnerContribution
        + inputs.isaSource
        + inputs.savingsSource
        + inputs.premiumBondsSource
        + actualPortfolioDraw
        - inputs.annualBillsCost
        - inputs.annualHolidaysCost
        - inputs.taxEstimate,
    endCrystallised: crystallised,
    endCrystallisedToDate: inputs.startCrystallisedToDate + fundsCrystallisedThisYear,
    endUncrystallised: uncrystallised,
    endBankBalance: bank,
    endPot: crystallised + uncrystallised,
    endTflsTaken,
    endLsa,
    endTaxFreeCash: Math.min(endLsa, uncrystallised * 0.25),
  };
}

function project(inputs) {
  if (importedPlan?.rows?.length) {
    return projectImportedPlan();
  }

  const years = [];
  let balance = inputs.startingAssets;
  const growth = inputs.growthRate / 100;
  const inflation = inputs.inflationRate / 100;
  const currentAge = inputs.currentYear - inputs.birthYear;
  const startingBalance = balance;
  let nextYearPortfolioNeed = 0;
  let exhaustedYear = null;

  for (let age = currentAge; age <= MAX_PROJECTION_AGE; age += 1) {
    const yearsFromNow = age - currentAge;
    const year = inputs.currentYear + yearsFromNow;
    const spending = inputs.annualSpending * Math.pow(1 + inflation, yearsFromNow);
    const grossIncome = inputs.annualTaxableIncome * Math.pow(1 + inflation * 0.45, yearsFromNow);
    const allowance = inputs.taxAllowance * Math.pow(1 + inflation * 0.45, yearsFromNow);
    const higherRateThreshold = inputs.higherRateThreshold * Math.pow(1 + inflation * 0.45, yearsFromNow);
    const portfolioNeed = solvePortfolioDraw(
      spending,
      grossIncome,
      allowance,
      higherRateThreshold,
      inputs.basicTaxRate,
      inputs.higherTaxRate
    );

    if (age === currentAge) {
      nextYearPortfolioNeed = portfolioNeed;
    }

    years.push({
      age,
      year,
      balance: Math.max(0, balance),
      spendingDraw: portfolioNeed,
    });

    balance = (balance - portfolioNeed) * (1 + growth);

    if (balance <= 0) {
      exhaustedYear = { age: age + 1, year: year + 1 };
      years.push({
        age: exhaustedYear.age,
        year: exhaustedYear.year,
        balance: 0,
        spendingDraw: portfolioNeed,
      });
      break;
    }
  }

  return {
    years,
    currentAge,
    startingBalance,
    nextYearPortfolioNeed,
    finalBalance: years.at(-1).balance,
    exhaustedYear,
    maxProjectionAge: MAX_PROJECTION_AGE,
    withdrawalRate: startingBalance > 0 ? nextYearPortfolioNeed / startingBalance : 0,
  };
}

function projectImportedPlan() {
  const rows = importedPlan.rows;
  const firstRow = rows[0];
  const years = rows.map((row) => ({
    age: row.age,
    year: row.calendarYear,
    balance: Math.max(0, row.openingPot || row.openingCrystallisedFund + row.openingUncrystallisedPot || 0),
    spendingDraw: Math.max(0, row.taxableWithdrawal || 0),
  }));
  const exhaustionRow = rows.find((row) => (
    Number.isFinite(row.totalPotAfterGrowth) && row.totalPotAfterGrowth <= 0
  ) || (
    Number.isFinite(row.uncrystallisedPot) && Number.isFinite(row.crystallisedFundLeft)
      && row.uncrystallisedPot + row.crystallisedFundLeft <= 0
  ));

  if (exhaustionRow && years.at(-1).balance > 0) {
    years.push({
      age: exhaustionRow.age + 1,
      year: exhaustionRow.calendarYear + 1,
      balance: 0,
      spendingDraw: Math.max(0, exhaustionRow.taxableWithdrawal || 0),
    });
  }

  const nextYearPortfolioNeed = Math.max(0, firstRow.taxableWithdrawal || 0);
  const startingBalance = years[0]?.balance || 0;

  return {
    years,
    currentAge: firstRow.age,
    startingBalance,
    nextYearPortfolioNeed,
    finalBalance: years.at(-1)?.balance || 0,
    exhaustedYear: exhaustionRow
      ? { age: exhaustionRow.age, year: exhaustionRow.calendarYear }
      : null,
    maxProjectionAge: rows.at(-1)?.age || MAX_PROJECTION_AGE,
    withdrawalRate: startingBalance > 0 ? nextYearPortfolioNeed / startingBalance : 0,
  };
}

function getChartScale(maxValue, tickCount = 4) {
  const paddedMax = Math.max(maxValue, 1) * 1.08;
  const rawStep = paddedMax / tickCount;
  const quantum = rawStep <= 50000
    ? 5000
    : rawStep <= 150000
      ? 10000
      : rawStep <= 500000
        ? 25000
        : 50000;
  const step = Math.max(quantum, Math.ceil(rawStep / quantum) * quantum);

  return {
    step,
    yMax: step * tickCount,
  };
}

// ── Shared chart style (reads CSS vars at draw time) ──────────────────────
function getChartStyle() {
  const style = getComputedStyle(document.documentElement);
  const get = (v) => style.getPropertyValue(v).trim();
  return {
    labelColor: get("--muted"),
    legendColor: get("--text"),
    gridColor: get("--line"),
    font: "12px Inter, system-ui, sans-serif",
    bg: get("--table-bg") || get("--panel") || get("--card") || "transparent",
  };
}

function formatCurrency(value) {
  return currency(value);
}

function makeHatchPattern(ctx, color) {
  const sz = 6;
  const pc = document.createElement("canvas");
  pc.width = sz; pc.height = sz;
  const px = pc.getContext("2d");
  px.strokeStyle = color;
  px.lineWidth = 1.5;
  px.beginPath(); px.moveTo(0, sz); px.lineTo(sz, 0); px.stroke();
  return ctx.createPattern(pc, "repeat");
}

function drawEventStar(ctx, cx, cy) {
  const spikes = 5, outerR = 6.5, innerR = 2.8;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.arc(0, 0, outerR + 3.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fill();
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fillStyle = "#fde047";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();
}

function drawChartTooltip(ctx, { x: hx, y: ty, lines, width, padLeft, padRight, plotTop, plotBottom, cs }) {
  const ttFont = cs.font;
  const ttBold = ttFont.replace("12px", "bold 12px");
  const lineH = 19, dotColW = 14, ttPadX = 12, ttPadY = 10;
  ctx.font = ttFont;
  const maxTextW = Math.max(...lines.map((l) => {
    ctx.font = l.bold ? ttBold : ttFont;
    return ctx.measureText(l.text).width;
  }));
  const ttW = maxTextW + dotColW + ttPadX * 2;
  const ttH = lines.length * lineH + ttPadY * 2;
  let tx = hx + 16;
  if (tx + ttW > width - padRight + 10) tx = hx - ttW - 16;
  let tyAdj = ty;
  if (tyAdj + ttH > plotBottom) tyAdj = plotBottom - ttH - 4;
  if (tyAdj < plotTop) tyAdj = plotTop;
  const r = 8;
  ctx.beginPath();
  ctx.moveTo(tx + r, tyAdj);
  ctx.lineTo(tx + ttW - r, tyAdj);
  ctx.arcTo(tx + ttW, tyAdj, tx + ttW, tyAdj + r, r);
  ctx.lineTo(tx + ttW, tyAdj + ttH - r);
  ctx.arcTo(tx + ttW, tyAdj + ttH, tx + ttW - r, tyAdj + ttH, r);
  ctx.lineTo(tx + r, tyAdj + ttH);
  ctx.arcTo(tx, tyAdj + ttH, tx, tyAdj + ttH - r, r);
  ctx.lineTo(tx, tyAdj + r);
  ctx.arcTo(tx, tyAdj, tx + r, tyAdj, r);
  ctx.closePath();
  ctx.fillStyle = "rgba(8,12,24,0.94)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();
  lines.forEach((line, i) => {
    const lineY = tyAdj + ttPadY + i * lineH + lineH / 2;
    const textX = tx + ttPadX + dotColW;
    if (line.sep) {
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx + 6, lineY - lineH / 2 - 1);
      ctx.lineTo(tx + ttW - 6, lineY - lineH / 2 - 1);
      ctx.stroke();
    }
    if (line.dot) {
      ctx.beginPath();
      ctx.arc(tx + ttPadX + 5, lineY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = line.dot;
      ctx.fill();
    }
    ctx.font = line.bold ? ttBold : ttFont;
    ctx.fillStyle = line.color || (line.bold ? "#e8edf8" : "rgba(180,195,220,0.9)");
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(line.text, textX, lineY);
  });
}

// ── Projection Trend: stacked area chart ─────────────────────────────────
function renderStackedSavingsChartCanvas({ canvas, rows, preRetirementRows = [], retirementYear = null, showPreRetirement = false, hoverX = null }) {
  if (!canvas || !rows?.length) return;
  const layers = [
    { key: "totalPotAfterGrowth", label: "Pension pot",   color: "#10b981", fill: "rgba(16,185,129,0.72)" },
    { key: "premiumBondsLeft",    label: "Premium Bonds", color: "#f59e0b", fill: "rgba(245,158,11,0.70)" },
    { key: "isaSavingsLeft",      label: "ISA",           color: "#3b82f6", fill: "rgba(59,130,246,0.70)" },
    { key: "bankSavingsLeft",     label: "Bank savings",  color: "#a855f7", fill: "rgba(168,85,247,0.70)" },
  ];
  const allRows = showPreRetirement && preRetirementRows.length
    ? [...preRetirementRows, ...rows]
    : rows;
  const retirementSplitIndex = showPreRetirement ? preRetirementRows.length : -1;
  if (allRows.some((r) => (r.partnerSavingsLeft || 0) > 0.5)) {
    layers.push({ key: "partnerSavingsLeft", label: "Partner savings", color: "#f43f5e", fill: "rgba(244,63,94,0.70)" });
  }
  const n = allRows.length;
  const stackTotals = allRows.map((row) => layers.reduce((s, l) => s + Math.max(0, row[l.key] || 0), 0));

  const cs = getChartStyle();
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width / dpr;
  const height = canvas.clientHeight || canvas.height / dpr;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = cs.bg;
  ctx.fillRect(0, 0, width, height);

  const pad = { top: 60, right: 22, bottom: 56, left: 70 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const axisStep = 100000;
  const rawMax = Math.max(...stackTotals, 0);
  const maxValue = Math.max(axisStep, Math.ceil(rawMax / axisStep) * axisStep);
  const xFor = (i) => pad.left + (n === 1 ? 0 : (i / (n - 1)) * plotWidth);
  const yFor = (v) => pad.top + plotHeight - (Math.max(0, v) / maxValue) * plotHeight;
  const yForBand = (base, top) => {
    const rawBase = yFor(base), rawTop = yFor(top);
    if (top <= base) return { yTop: rawBase, yBase: rawBase };
    const diff = rawBase - rawTop;
    return diff < 3 ? { yTop: rawBase - 3, yBase: rawBase } : { yTop: rawTop, yBase: rawBase };
  };

  ctx.font = cs.font;
  for (let v = 0; v <= maxValue; v += axisStep) {
    const y = yFor(v);
    ctx.strokeStyle = cs.gridColor; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
    ctx.fillStyle = cs.labelColor; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(formatCurrency(v), 8, y);
  }

  const baselines = new Array(n).fill(0);
  const allTops = [];
  layers.forEach((layer) => {
    const tops = allRows.map((row, i) => baselines[i] + Math.max(0, row[layer.key] || 0));
    allTops.push([...tops]);
    ctx.beginPath();
    tops.forEach((v, i) => {
      const { yTop } = yForBand(baselines[i], v);
      if (i === 0) ctx.moveTo(xFor(i), yTop); else ctx.lineTo(xFor(i), yTop);
    });
    for (let i = n - 1; i >= 0; i--) {
      const { yBase } = yForBand(baselines[i], tops[i]);
      ctx.lineTo(xFor(i), yBase);
    }
    ctx.closePath();
    ctx.fillStyle = layer.fill; ctx.fill();
    ctx.beginPath();
    tops.forEach((v, i) => {
      const { yTop } = yForBand(baselines[i], v);
      if (i === 0) ctx.moveTo(xFor(i), yTop); else ctx.lineTo(xFor(i), yTop);
    });
    ctx.strokeStyle = layer.color; ctx.lineWidth = 2; ctx.setLineDash([]); ctx.stroke();
    tops.forEach((v, i) => { baselines[i] = v; });
  });

  if (retirementSplitIndex > 0 && retirementSplitIndex < n) {
    const rx = xFor(retirementSplitIndex);
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(pad.left, pad.top, rx - pad.left, plotHeight);
    ctx.strokeStyle = "rgba(255,220,80,0.85)"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(rx, pad.top); ctx.lineTo(rx, pad.top + plotHeight); ctx.stroke();
    ctx.setLineDash([]);
    if (retirementYear) {
      const badgeText = `Retirement ${retirementYear}`;
      ctx.font = "bold 11px Inter, system-ui, sans-serif";
      const bw = ctx.measureText(badgeText).width + 16, bh = 20;
      const bx = rx - bw / 2, by = pad.top + plotHeight - bh - 14;
      ctx.fillStyle = "rgba(255,220,80,0.18)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 6); else ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,220,80,0.7)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = "rgba(255,220,80,1)"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(badgeText, rx, by + bh / 2);
    }
    ctx.restore();
  }

  const targetLabels = Math.max(4, Math.min(8, Math.floor(plotWidth / 90)));
  const yearStep = Math.max(1, Math.ceil((n - 1) / Math.max(1, targetLabels - 1)));
  const labelIdxs = [];
  for (let i = 0; i < n; i += yearStep) labelIdxs.push(i);
  if (labelIdxs[labelIdxs.length - 1] !== n - 1) labelIdxs.push(n - 1);
  ctx.fillStyle = cs.labelColor; ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.font = cs.font;
  labelIdxs.forEach((ri) => {
    const row = allRows[ri];
    ctx.fillText(String(row.calendarYear), xFor(ri), height - 34);
    ctx.fillText(`(age ${row.age})`, xFor(ri), height - 18);
  });

  let lx = pad.left, ly = 16;
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.font = cs.font;
  layers.forEach((item) => {
    const iw = ctx.measureText(item.label).width + 34;
    if (lx > pad.left && lx + iw > width - pad.right) { lx = pad.left; ly += 18; }
    ctx.fillStyle = item.fill; ctx.fillRect(lx, ly - 6, 18, 12);
    ctx.strokeStyle = item.color; ctx.lineWidth = 1.5; ctx.strokeRect(lx, ly - 6, 18, 12);
    ctx.fillStyle = cs.legendColor; ctx.fillText(item.label, lx + 24, ly);
    lx += iw + 8;
  });

  allRows.forEach((row, xi) => {
    if (row.eventTitles?.length) drawEventStar(ctx, xFor(xi), pad.top + plotHeight - 12);
  });

  if (hoverX === null || n < 2) return;
  const clampedX = Math.max(pad.left, Math.min(width - pad.right, hoverX));
  const rowIndex = Math.min(n - 1, Math.max(0, Math.round(((clampedX - pad.left) / plotWidth) * (n - 1))));
  const row = allRows[rowIndex];
  const hx = xFor(rowIndex);
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(hx, pad.top); ctx.lineTo(hx, pad.top + plotHeight); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
  let dotBase = 0;
  layers.forEach((layer) => {
    const v = Math.max(0, row[layer.key] || 0);
    const { yTop } = yForBand(dotBase, dotBase + v);
    ctx.beginPath(); ctx.arc(hx, yTop, 5, 0, Math.PI * 2);
    ctx.fillStyle = layer.color; ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1.5; ctx.stroke();
    dotBase += v;
  });
  const isPreRetirement = retirementSplitIndex > 0 && rowIndex < retirementSplitIndex;
  const phaseLabel = isPreRetirement ? "  · pre-retirement" : "";
  const lines = [
    { text: `${row.calendarYear}  ·  age ${row.age}${phaseLabel}`, bold: true },
    ...layers.map((l) => ({ text: `${l.label}: ${formatCurrency(row[l.key] || 0)}`, dot: l.color })),
    { text: `Total: ${formatCurrency(stackTotals[rowIndex])}`, bold: true, sep: true },
    ...(row.eventTitles?.length ? row.eventTitles.map((t) => ({ text: `★ ${t}`, color: "#fde047" })) : []),
  ];
  drawChartTooltip(ctx, { x: hx, y: pad.top + 12, lines, width, padLeft: pad.left, padRight: pad.right, plotTop: pad.top, plotBottom: pad.top + plotHeight, cs });
}

// ── Income: stacked bar chart ─────────────────────────────────────────────
function renderStackedIncomeChartCanvas({ canvas, rows: rawRows, hoverX = null }) {
  if (!canvas || !rawRows?.length) return;
  // Enrich rows with split savings keys
  const rows = rawRows.map((row) => ({
    ...row,
    _mySavingsUsed:      (Number(row.bankSavingsUsed) || 0) + (Number(row.isaSavingsUsed) || 0) + (Number(row.premiumBondsUsed) || 0),
    _partnerSavingsUsed: Number(row.partnerSavingsUsed) || 0,
  }));
  const incomeSources = [
    { key: "partnerIncome",         label: "Partner work",             color: "#2563eb" },
    { key: "partnerStatePension",   label: "Partner state pension",    color: "#16a34a" },
    { key: "partnerWorkPension",    label: "Partner work pension",     color: "#65a30d" },
    { key: "ownStatePension",       label: "My state pension",         color: "#0f766e" },
    { key: "definedBenefitIncome",  label: "My DB pension",            color: "#0891b2" },
    { key: "definedBenefitLumpSum", label: "DB lump sum",              color: "#06b6d4" },
    { key: "taxFreeCash",           label: "TFLS",                     color: "#f59e0b" },
    { key: "grossPensionWithdrawal",label: "Taxable pension withdrawn", color: "#7c3aed" },
    { key: "_mySavingsUsed",        label: "My savings",               color: "#db2777" },
    { key: "_partnerSavingsUsed",   label: "Partner savings",          color: "#f472b6" },
  ];
  const needSeries = { key: "totalIncomeRequired", label: "Income needed", color: "#b45309", dash: [7, 5] };
  const stackedTotals = rows.map((row) =>
    incomeSources.reduce((s, src) => s + Math.max(0, Number(row[src.key]) || 0), 0)
  );

  const cs = getChartStyle();
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width / dpr;
  const height = canvas.clientHeight || canvas.height / dpr;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = cs.bg; ctx.fillRect(0, 0, width, height);

  const pad = { top: 60, right: 22, bottom: 56, left: 70 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const axisStep = 10000;
  const maxRaw = Math.max(...stackedTotals, ...rows.map((r) => r[needSeries.key] || 0));
  const maxValue = Math.max(axisStep, Math.ceil(maxRaw / axisStep) * axisStep);
  const yFor = (v) => pad.top + plotHeight - (v / maxValue) * plotHeight;
  const barBand = plotWidth / Math.max(1, rows.length);
  const xFor = (i) => pad.left + i * barBand + barBand / 2;
  const barWidth = Math.max(6, Math.min(26, barBand - 3));

  ctx.font = cs.font;
  for (let v = 0; v <= maxValue; v += axisStep) {
    const y = yFor(v);
    ctx.strokeStyle = cs.gridColor; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
    ctx.fillStyle = cs.labelColor; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(formatCurrency(v), 8, y);
  }

  rows.forEach((row, index) => {
    const x = xFor(index) - barWidth / 2;
    let stack = 0;
    incomeSources.forEach((src) => {
      const v = Math.max(0, Number(row[src.key]) || 0);
      if (v <= 0) return;
      const y = yFor(stack + v);
      ctx.fillStyle = src.color;
      ctx.fillRect(x, y, barWidth, yFor(stack) - y);
      stack += v;
    });
  });

  ctx.beginPath();
  rows.forEach((row, i) => {
    const x = xFor(i), y = yFor(row[needSeries.key] || 0);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = needSeries.color; ctx.lineWidth = 3; ctx.setLineDash(needSeries.dash); ctx.stroke(); ctx.setLineDash([]);

  const targetLabels = Math.max(4, Math.min(8, Math.floor(plotWidth / 90)));
  const yearStep = Math.max(1, Math.ceil((rows.length - 1) / Math.max(1, targetLabels - 1)));
  const labelIdxs = [];
  for (let i = 0; i < rows.length; i += yearStep) labelIdxs.push(i);
  if (labelIdxs[labelIdxs.length - 1] !== rows.length - 1) labelIdxs.push(rows.length - 1);
  ctx.fillStyle = cs.labelColor; ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.font = cs.font;
  labelIdxs.forEach((ri) => {
    ctx.fillText(String(rows[ri].calendarYear), xFor(ri), height - 34);
    ctx.fillText(`(age ${rows[ri].age})`, xFor(ri), height - 18);
  });

  let lx = pad.left, ly = 16;
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.font = cs.font;
  [...incomeSources, needSeries].forEach((item) => {
    const iw = ctx.measureText(item.label).width + 58;
    if (lx > pad.left && lx + iw > width - pad.right) { lx = pad.left; ly += 18; }
    if (item === needSeries) {
      ctx.strokeStyle = item.color; ctx.lineWidth = 3; ctx.setLineDash(item.dash);
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 20, ly); ctx.stroke(); ctx.setLineDash([]);
    } else {
      ctx.fillStyle = item.color; ctx.fillRect(lx, ly - 5, 18, 10);
    }
    ctx.fillStyle = cs.legendColor; ctx.fillText(item.label, lx + 26, ly);
    lx += iw;
  });

  rows.forEach((row, i) => {
    if (row.eventTitles?.length) drawEventStar(ctx, xFor(i), pad.top + plotHeight - 12);
  });

  if (hoverX === null || rows.length < 2) return;
  const clampedX = Math.max(pad.left, Math.min(width - pad.right, hoverX));
  const rowIndex = Math.min(rows.length - 1, Math.max(0, Math.floor((clampedX - pad.left) / barBand)));
  const row = rows[rowIndex];
  const hx = xFor(rowIndex);
  ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(hx, pad.top); ctx.lineTo(hx, pad.top + plotHeight); ctx.stroke(); ctx.setLineDash([]);
  const incomeTotal = incomeSources.reduce((s, src) => s + Math.max(0, Number(row[src.key]) || 0), 0);
  const lines = [
    { text: `${row.calendarYear}  ·  age ${row.age}`, bold: true },
    ...incomeSources.filter((src) => (row[src.key] || 0) > 0.01).map((src) => ({ text: `${src.label}: ${formatCurrency(row[src.key])}`, dot: src.color })),
    { text: `Income needed: ${formatCurrency(row[needSeries.key] || 0)}`, dot: needSeries.color, sep: true },
    { text: `Total income: ${formatCurrency(incomeTotal)}`, bold: true },
    ...(row.eventTitles?.length ? row.eventTitles.map((t) => ({ text: `★ ${t}`, color: "#fde047" })) : []),
  ];
  drawChartTooltip(ctx, { x: hx, y: pad.top + 10, lines, width, padLeft: pad.left, padRight: pad.right, plotTop: pad.top, plotBottom: pad.top + plotHeight, cs });
}

// ── Spending Breakdown: stacked bar chart ─────────────────────────────────
function renderSpendingChartCanvas({ canvas, rows, cpiRate = 0, realTerms = true, monthly = false, freeOnly = false, hoverX = null }) {
  if (!canvas || !rows?.length) return;
  const spendKeys = freeOnly ? [] : [
    { key: "householdBills", label: "Bills",    color: "#3b82f6" },
    { key: "holidays",       label: "Holidays", color: "#10b981" },
    { key: "carCost",        label: "Car",      color: "#f59e0b" },
  ];
  // n0: years from today to the first retirement row — mirrors the Pension Forecaster's yearsToRetirement offset
  const baseYear = importedPlan?.assumptions?.plan?.currentYear
    ?? importedPlan?.assumptions?.sourceState?.currentYear
    ?? rows[0]?.calendarYear;
  const n0 = Math.max(0, (rows[0]?.calendarYear ?? 0) - (baseYear ?? 0));
  // yi = n0 + i: total years of inflation from today (matches Pension Forecaster: n0 + yi - 1 where yi is 1-based)
  const adjust = (v, i) => {
    if (realTerms && cpiRate > 0) v /= Math.pow(1 + cpiRate / 12, 12 * (n0 + i));
    return monthly ? v / 12 : v;
  };
  const computeFreeCash = (row, i) => adjust((row.excessNet || 0) - (row.carCost || 0), i);

  const rowData = rows.map((row, i) => {
    const freeCash = computeFreeCash(row, i);
    const surplus = Math.max(0, freeCash);
    const shortfall = Math.min(0, freeCash);
    const spending = spendKeys.map((s) => ({ ...s, v: Math.max(0, adjust(Number(row[s.key]) || 0, i)) }));
    const tax = freeOnly ? 0 : Math.max(0, adjust(row.estimatedTax || 0, i));
    const stackTop = spending.reduce((s, d) => s + d.v, 0) + surplus + tax;
    return { spending, tax, surplus, shortfall, stackTop };
  });

  const axisStep = monthly ? 1000 : 10000;
  const minShortfall = Math.min(0, ...rowData.map((d) => d.shortfall));
  const maxStack = Math.max(axisStep, ...rowData.map((d) => d.stackTop));
  const minValue = Math.min(0, Math.floor(minShortfall / axisStep) * axisStep);
  const maxValue = Math.ceil(maxStack / axisStep) * axisStep;
  const range = maxValue - minValue;
  const hasShortfall = minValue < 0;

  const cs = getChartStyle();
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width / dpr;
  const height = canvas.clientHeight || canvas.height / dpr;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = cs.bg; ctx.fillRect(0, 0, width, height);

  const pad = { top: 56, right: 22, bottom: 56, left: 70 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const yFor = (v) => pad.top + plotHeight - ((v - minValue) / range) * plotHeight;
  const zeroY = yFor(0);
  const barBand = plotWidth / Math.max(1, rows.length);
  const xFor = (i) => pad.left + i * barBand + barBand / 2;
  const barW = Math.max(6, Math.min(26, barBand - 3));
  const hatchPattern = hasShortfall ? makeHatchPattern(ctx, "rgba(239,68,68,0.55)") : null;

  ctx.font = cs.font;
  for (let v = minValue; v <= maxValue; v += axisStep) {
    const y = yFor(v);
    const isZero = v === 0 && hasShortfall;
    ctx.strokeStyle = isZero ? "rgba(239,68,68,0.5)" : cs.gridColor;
    ctx.lineWidth = isZero ? 1.5 : 1;
    if (isZero) ctx.setLineDash([5, 3]);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
    ctx.setLineDash([]); ctx.lineWidth = 1;
    ctx.fillStyle = v < 0 ? "#ef4444" : cs.labelColor;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(formatCurrency(v), 8, y);
  }

  rows.forEach((row, i) => {
    const d = rowData[i];
    const x = xFor(i) - barW / 2;
    let stack = 0;
    d.spending.forEach((seg) => {
      if (seg.v <= 0) return;
      const y = yFor(stack + seg.v);
      ctx.fillStyle = seg.color; ctx.fillRect(x, y, barW, yFor(stack) - y);
      stack += seg.v;
    });
    if (d.surplus > 0) {
      const y = yFor(stack + d.surplus);
      ctx.fillStyle = "#8b5cf6"; ctx.fillRect(x, y, barW, yFor(stack) - y);
      stack += d.surplus;
    }
    if (!freeOnly && d.tax > 0) {
      const y = yFor(stack + d.tax), segH = yFor(stack) - y;
      ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, barW - 2, segH - 2); ctx.lineWidth = 1;
    }
    if (d.shortfall < -0.01) {
      const shortfallH = yFor(d.shortfall) - zeroY;
      ctx.fillStyle = "rgba(239,68,68,0.25)"; ctx.fillRect(x, zeroY, barW, shortfallH);
      if (hatchPattern) { ctx.fillStyle = hatchPattern; ctx.fillRect(x, zeroY, barW, shortfallH); }
      ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 0.75, zeroY + 0.75, barW - 1.5, shortfallH - 1.5); ctx.lineWidth = 1;
    }
  });

  const targetLabels = Math.max(4, Math.min(8, Math.floor(plotWidth / 90)));
  const yearStep = Math.max(1, Math.ceil((rows.length - 1) / Math.max(1, targetLabels - 1)));
  const labelIdxs = [];
  for (let i = 0; i < rows.length; i += yearStep) labelIdxs.push(i);
  if (labelIdxs[labelIdxs.length - 1] !== rows.length - 1) labelIdxs.push(rows.length - 1);
  ctx.fillStyle = cs.labelColor; ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.font = cs.font;
  labelIdxs.forEach((ri) => {
    ctx.fillText(String(rows[ri].calendarYear), xFor(ri), height - 34);
    ctx.fillText(`(age ${rows[ri].age})`, xFor(ri), height - 18);
  });

  const legendSources = freeOnly
    ? [{ label: "Free cash", color: "#8b5cf6" }]
    : [...spendKeys, { label: "Free cash", color: "#8b5cf6" }, { label: "Tax", color: "#ef4444", outline: true }, ...(hasShortfall ? [{ label: "Shortfall", color: "#ef4444", hatch: true }] : [])];
  let lx = pad.left, ly = 14;
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.font = cs.font;
  legendSources.forEach((src) => {
    const w = ctx.measureText(src.label).width + 44;
    if (lx > pad.left && lx + w > width - pad.right) { lx = pad.left; ly += 18; }
    if (src.outline) {
      ctx.strokeStyle = src.color; ctx.lineWidth = 2; ctx.strokeRect(lx, ly - 5, 18, 10); ctx.lineWidth = 1;
    } else if (src.hatch && hatchPattern) {
      ctx.fillStyle = "rgba(239,68,68,0.25)"; ctx.fillRect(lx, ly - 5, 18, 10);
      ctx.fillStyle = hatchPattern; ctx.fillRect(lx, ly - 5, 18, 10);
      ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 1.5; ctx.strokeRect(lx, ly - 5, 18, 10); ctx.lineWidth = 1;
    } else {
      ctx.fillStyle = src.color; ctx.fillRect(lx, ly - 5, 18, 10);
    }
    ctx.fillStyle = cs.legendColor; ctx.fillText(src.label, lx + 24, ly);
    lx += w;
  });

  rows.forEach((row, i) => {
    if (row.eventTitles?.length) drawEventStar(ctx, xFor(i), pad.top + plotHeight - 12);
  });

  if (hoverX === null || rows.length < 2) return;
  const clampedX = Math.max(pad.left, Math.min(width - pad.right, hoverX));
  const rowIndex = Math.min(rows.length - 1, Math.max(0, Math.floor((clampedX - pad.left) / barBand)));
  const row = rows[rowIndex];
  const d = rowData[rowIndex];
  const hx = xFor(rowIndex);
  ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(hx, pad.top); ctx.lineTo(hx, pad.top + plotHeight); ctx.stroke(); ctx.setLineDash([]);
  const lines = [{ text: `${row.calendarYear}  ·  age ${row.age}`, bold: true }];
  if (!freeOnly) d.spending.forEach((seg) => { if (seg.v > 0.01) lines.push({ text: `${seg.label}: ${formatCurrency(seg.v)}`, dot: seg.color }); });
  if (d.surplus > 0.01) lines.push({ text: `Free cash: ${formatCurrency(d.surplus)}`, dot: "#8b5cf6" });
  else if (d.shortfall < -0.01) lines.push({ text: `Shortfall: ${formatCurrency(Math.abs(d.shortfall))}`, dot: "#ef4444" });
  if (!freeOnly && d.tax > 0.01) lines.push({ text: `Tax: ${formatCurrency(d.tax)}`, dot: "#ef4444" });
  const total = d.spending.reduce((s, seg) => s + seg.v, 0) + d.surplus + (freeOnly ? 0 : d.tax);
  lines.push({ text: `Total: ${formatCurrency(total)}`, bold: true, sep: true });
  if (row.eventTitles?.length) row.eventTitles.forEach((t) => lines.push({ text: `★ ${t}`, color: "#fde047" }));
  drawChartTooltip(ctx, { x: hx, y: pad.top + 10, lines, width, padLeft: pad.left, padRight: pad.right, plotTop: pad.top, plotBottom: pad.top + plotHeight, cs });
}

function drawChart(data) {
  const colours = getChartColours();
  const width = chart.width;
  const height = chart.height;
  const pad = { top: 24, right: 28, bottom: 64, left: 72 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const maxValue = Math.max(...data.years.map((year) => Math.max(year.balance, year.spendingDraw)), 100000);
  const { step, yMax } = getChartScale(maxValue);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = colours.bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = colours.line;
  ctx.lineWidth = 1;
  ctx.fillStyle = colours.muted;
  ctx.font = "15px Inter, system-ui, sans-serif";

  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (plotHeight / 4) * i;
    const value = yMax - step * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillText(currency(value).replace(".00", ""), 10, y + 7);
  }

  const point = (year, value) => {
    const x = pad.left + ((year.age - data.years[0].age) / (data.years.at(-1).age - data.years[0].age)) * plotWidth;
    const y = pad.top + plotHeight - (value / yMax) * plotHeight;
    return { x, y };
  };

  ctx.strokeStyle = colours.accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  data.years.forEach((year, index) => {
    const { x, y } = point(year, year.balance);
    index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.strokeStyle = colours.accent2;
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  data.years.forEach((year, index) => {
    const { x, y } = point(year, year.spendingDraw);
    index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = colours.muted;
  ctx.font = "14px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  const tickIndexes = [0, 0.25, 0.5, 0.75, 1]
    .map((ratio) => Math.round((data.years.length - 1) * ratio))
    .filter((index, position, indexes) => indexes.indexOf(index) === position);
  tickIndexes.forEach((index) => {
    const year = data.years[index];
    const { x } = point(year, 0);
    ctx.fillText(String(year.year), x, height - 32);
    ctx.fillText(`age ${year.age}`, x, height - 12);
  });
  ctx.textAlign = "start";
}

// Convert a row index to a canvas hoverX pixel value using each chart's internal geometry.
// areaChart=true uses the area/line formula (i/(n-1)); false uses bar-centre formula ((i+0.5)/n).
function indexToHoverX(canvas, index, n, areaChart = false) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width / dpr;
  const padLeft = 70, padRight = 22;
  const plotWidth = width - padLeft - padRight;
  if (areaChart) {
    return padLeft + (n <= 1 ? 0 : (index / (n - 1)) * plotWidth);
  }
  return padLeft + ((index + 0.5) / Math.max(1, n)) * plotWidth;
}

function renderPlanCharts(hoverSavingsX = null, hoverIncomeX = null, hoverSpendingX = null) {
  if (!importedPlan?.rows?.length) return;
  const rows = importedPlan.rows;
  const cpiRate = importedPlan.assumptions?.growthAndInflation?.cpiRate
    ?? importedPlan.assumptions?.sourceState?.cpiRate
    ?? 0;

  const savingsWrap = document.querySelector("#savingsChartWrap");
  const incomeWrap = document.querySelector("#incomeChartWrap");
  const spendingWrap = document.querySelector("#spendingChartWrap");

  savingsWrap.hidden = !planChartState.showSavings;
  incomeWrap.hidden = !planChartState.showIncome;
  spendingWrap.hidden = !planChartState.showSpending;

  // When no mouse hover is active, pin tooltip to the selected plan year
  const preRetRows = importedPlan.preRetirementRows || [];
  const savingsN = (planChartState.showPreRetirement ? preRetRows.length : 0) + rows.length;
  const savingsIdx = planChartState.showPreRetirement
    ? preRetRows.length + selectedPlanIndex
    : selectedPlanIndex;

  if (planChartState.showSavings) {
    const canvas = document.querySelector("#savingsChartCanvas");
    renderStackedSavingsChartCanvas({
      canvas,
      rows,
      preRetirementRows: preRetRows,
      retirementYear: importedPlan.retirementYear,
      showPreRetirement: planChartState.showPreRetirement,
      hoverX: hoverSavingsX ?? indexToHoverX(canvas, savingsIdx, savingsN, true),
    });
  }
  if (planChartState.showIncome) {
    const canvas = document.querySelector("#incomeChartCanvas");
    renderStackedIncomeChartCanvas({
      canvas,
      rows,
      hoverX: hoverIncomeX ?? indexToHoverX(canvas, selectedPlanIndex, rows.length, false),
    });
  }
  if (planChartState.showSpending) {
    const captionParts = [];
    if (planChartState.spendingFreeOnly) captionParts.push("free cash only");
    if (planChartState.spendingMonthly) captionParts.push("monthly averages");
    if (planChartState.spendingRealTerms) captionParts.push("today's money");
    document.querySelector("#spendingChartCaption").textContent =
      captionParts.length ? `Showing ${captionParts.join(", ")}` : "Annual nominal values";
    const canvas = document.querySelector("#spendingChartCanvas");
    renderSpendingChartCanvas({
      canvas,
      rows,
      cpiRate,
      realTerms: planChartState.spendingRealTerms,
      monthly: planChartState.spendingMonthly,
      freeOnly: planChartState.spendingFreeOnly,
      hoverX: hoverSpendingX ?? indexToHoverX(canvas, selectedPlanIndex, rows.length, false),
    });
  }
}

function syncChartToggleChips() {
  const map = {
    toggleSavingsChart:  planChartState.showSavings,
    toggleIncomeChart:   planChartState.showIncome,
    toggleSpendingChart: planChartState.showSpending,
    togglePreRetirement: planChartState.showPreRetirement,
    toggleFreeOnly:      planChartState.spendingFreeOnly,
    toggleMonthly:       planChartState.spendingMonthly,
    toggleRealTerms:     planChartState.spendingRealTerms,
  };
  Object.entries(map).forEach(([id, active]) => {
    document.querySelector(`#${id}`)?.classList.toggle("chart-toggle-chip-active", active);
  });
}

function updateInsights(data, inputs) {
  const pill = document.querySelector("#readinessPill");
  const message = document.querySelector("#optimizerMessage");
  const levers = document.querySelector("#leversList");
  const rate = data.withdrawalRate;
  const shortfall = Boolean(data.exhaustedYear);

  pill.classList.remove("warning", "danger");
  if (rate <= 0.04 && !shortfall) {
    pill.textContent = "On track";
    message.textContent = `The ${inputs.currentYear} plan starts at age ${data.currentAge}, has a pension pot of ${currency(inputs.startingAssets)}, needs ${currency(data.nextYearPortfolioNeed)} from the portfolio, and does not exhaust before age ${data.maxProjectionAge}.`;
  } else if (rate <= 0.055 && !shortfall) {
    pill.textContent = "Watch closely";
    pill.classList.add("warning");
    message.textContent = `The projection does not exhaust before age ${data.maxProjectionAge}, but the ${inputs.currentYear} withdrawal rate is ${Math.round(rate * 1000) / 10}%. A small adjustment to next year's plan could create a wider margin later.`;
  } else {
    pill.textContent = "Needs adjustment";
    pill.classList.add("danger");
    message.textContent = data.exhaustedYear
      ? `The pot is projected to exhaust in ${data.exhaustedYear.year}, around age ${data.exhaustedYear.age}. The ${inputs.currentYear} plan needs ${currency(data.nextYearPortfolioNeed)} from the portfolio.`
      : `The plan is under pressure. The ${inputs.currentYear} plan needs ${currency(data.nextYearPortfolioNeed)} from the portfolio, which is high relative to the current balance.`;
  }

  const spendReduction = Math.max(0, Math.ceil((inputs.portfolioDraw - data.startingBalance * 0.04) / 1000) * 1000);
  const incomeGap = Math.max(0, Math.ceil((inputs.portfolioDraw - data.startingBalance * 0.04) / 1000) * 1000);

  levers.innerHTML = "";
  [
    `Use ${inputs.currentYear} as the March planning baseline, then adjust it to replay future or past retirement years.`,
    `Remaining LSA is ${currency(inputs.lsaRemaining)}, with up to ${currency(inputs.availableTaxFreeCash)} currently available from uncrystallised pension funds before other scheme limits.`,
    incomeGap > 0
      ? `Add roughly ${currency(incomeGap)} of reliable income for the year to target a 4% starting withdrawal.`
      : "Reliable income covers enough of the year that portfolio withdrawals stay within range.",
    spendReduction > 0
      ? `Trim planned spending by roughly ${currency(spendReduction)} for the year to reduce portfolio pressure.`
      : "Planned spending is aligned with the current portfolio range.",
  ].forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    levers.appendChild(li);
  });
}

function updateTaxYearView(taxYearPlan, inputs) {
  const startLsa = Math.max(0, inputs.lumpSumAllowance - inputs.taxFreeLumpSumsTaken);
  const startTaxFreeCash = Math.min(startLsa, inputs.uncrystallisedPension * 0.25);
  document.querySelector("#taxYearHeading").textContent = `${inputs.currentYear}/${String(inputs.currentYear + 1).slice(2)} Tax Year`;
  document.querySelector("#monthlySpend").textContent = currency(taxYearPlan.monthlySpend);
  document.querySelector("#yearSpend").textContent = currency(taxYearPlan.yearSpend);
  document.querySelector("#taxEstimate").textContent = currency(taxYearPlan.taxEstimate);
  document.querySelector("#monthlyTaxEstimate").textContent = `(${currency(taxYearPlan.taxEstimate / 12)}/month)`;
  document.querySelector("#billsHolidaysTotal").textContent = currency(taxYearPlan.yearBills + taxYearPlan.yearHolidays);
  document.querySelector("#freeCashTile").textContent = annualMonthlyCurrency(taxYearPlan.freeCash);
  document.querySelector("#startPot").textContent = currency(inputs.startingAssets);
  document.querySelector("#startCrystallised").textContent = currency(inputs.crystallisedPension);
  document.querySelector("#startCrystallisedToDate").textContent = currency(inputs.startCrystallisedToDate);
  document.querySelector("#startUncrystallised").textContent = currency(inputs.uncrystallisedPension);
  document.querySelector("#startBankBalance").textContent = currency(inputs.bankBalance);
  document.querySelector("#startTflsTaken").textContent = currency(inputs.taxFreeLumpSumsTaken);
  document.querySelector("#startLsa").textContent = currency(startLsa);
  document.querySelector("#startTaxFreeCash").textContent = currency(startTaxFreeCash);
  document.querySelector("#endPot").textContent = currency(taxYearPlan.endPot);
  document.querySelector("#endCrystallised").textContent = currency(taxYearPlan.endCrystallised);
  document.querySelector("#endCrystallisedToDate").textContent = currency(taxYearPlan.endCrystallisedToDate);
  document.querySelector("#endUncrystallised").textContent = currency(taxYearPlan.endUncrystallised);
  document.querySelector("#endBankBalance").textContent = currency(taxYearPlan.endBankBalance);
  document.querySelector("#endTflsTaken").textContent = currency(taxYearPlan.endTflsTaken);
  document.querySelector("#endLsa").textContent = currency(taxYearPlan.endLsa);
  document.querySelector("#endTaxFreeCash").textContent = currency(taxYearPlan.endTaxFreeCash);
  document.querySelector("#changePot").textContent = currency(taxYearPlan.endPot - inputs.startingAssets);
  document.querySelector("#changeCrystallised").textContent = currency(taxYearPlan.endCrystallised - inputs.crystallisedPension);
  document.querySelector("#changeCrystallisedToDate").textContent = currency(taxYearPlan.endCrystallisedToDate - inputs.startCrystallisedToDate);
  document.querySelector("#changeUncrystallised").textContent = currency(taxYearPlan.endUncrystallised - inputs.uncrystallisedPension);
  document.querySelector("#changeBankBalance").textContent = currency(taxYearPlan.endBankBalance - inputs.bankBalance);
  document.querySelector("#changeTflsTaken").textContent = currency(taxYearPlan.endTflsTaken - inputs.taxFreeLumpSumsTaken);
  document.querySelector("#changeLsa").textContent = currency(taxYearPlan.endLsa - startLsa);
  document.querySelector("#changeTaxFreeCash").textContent = currency(taxYearPlan.endTaxFreeCash - startTaxFreeCash);

  const timeline = document.querySelector("#taxYearTimeline");
  timeline.innerHTML = "";
  taxYearPlan.months.forEach((month) => {
    const row = document.createElement("tr");
    [
      month.label,
      month.spend,
      month.income,
      month.bills,
      month.holidays,
      month.tax,
      month.taxFreeCash,
      month.partnerContribution,
      month.isaSource,
      month.savingsSource,
      month.premiumBondsSource,
      month.draw,
      month.freeCash,
      month.potLeft,
    ].forEach((value, index) => {
      const cell = document.createElement(index === 0 ? "th" : "td");
      cell.textContent = index === 0 ? value : currency(value);
      row.appendChild(cell);
    });
    timeline.appendChild(row);
  });

  const totalsRow = document.createElement("tr");
  totalsRow.className = "totals-row";
  [
    "Total",
    taxYearPlan.yearSpend,
    inputs.annualGrossIncome,
    taxYearPlan.yearBills,
    taxYearPlan.yearHolidays,
    taxYearPlan.taxEstimate,
    inputs.effectiveTaxFreeCashThisYear,
    inputs.cashPartnerContribution,
    inputs.isaSource,
    inputs.savingsSource,
    inputs.premiumBondsSource,
    taxYearPlan.portfolioDraw,
    taxYearPlan.freeCash,
    taxYearPlan.endPot,
  ].forEach((value, index) => {
    const cell = document.createElement(index === 0 ? "th" : "td");
    cell.textContent = index === 0 ? value : currency(value);
    totalsRow.appendChild(cell);
  });
  timeline.appendChild(totalsRow);
}

function render() {
  const inputs = readInputs();
  fields.currentYear.value = Math.max(inputs.birthYear, inputs.currentYear);
  const currentAge = Number(fields.currentYear.value) - inputs.birthYear;
  fields.planningAge.value = Math.max(currentAge + 1, inputs.planningAge);
  updateTaxFreeCashControl(readInputs());
  const cleanInputs = readInputs();
  const data = project(cleanInputs);
  const taxYearPlan = buildTaxYearPlan(cleanInputs);
  const todayMoneyYearSpend = getTodayMoneyValue(taxYearPlan.yearSpend);
  const todayMoneyMonthlySpend = getTodayMoneyValue(taxYearPlan.monthlySpend);
  const todayMoneyTaxEstimate = getTodayMoneyValue(taxYearPlan.taxEstimate);
  const todayMoneyBillsHolidays = getTodayMoneyValue(taxYearPlan.yearBills + taxYearPlan.yearHolidays);
  const todayMoneyFreeCash = getTodayMoneyValue(taxYearPlan.freeCash);

  document.querySelector("#growthRateValue").textContent = `${cleanInputs.growthRate.toFixed(1)}%`;
  document.querySelector("#inflationRateValue").textContent = `${cleanInputs.inflationRate.toFixed(1)}%`;
  document.querySelector("#targetEquivalentIncomeValue").textContent = currency(cleanInputs.targetEquivalentIncome);
  targetEquivalentIncomeExact.value = document.activeElement === targetEquivalentIncomeExact
    ? targetEquivalentIncomeExact.value
    : formatNumberInput("targetEquivalentIncome", cleanInputs.targetEquivalentIncome);
  document.querySelector("#taxFreeLumpSumsThisYearValue").textContent = currency(cleanInputs.taxFreeLumpSumsThisYear);
  document.querySelector("#yearSpendToday").textContent = todayMoneyYearSpend === null
    ? "-"
    : currency(todayMoneyYearSpend);
  document.querySelector("#monthlySpendToday").textContent = todayMoneyMonthlySpend === null
    ? "-"
    : currency(todayMoneyMonthlySpend);
  document.querySelector("#taxEstimateToday").textContent = todayMoneyTaxEstimate === null
    ? "-"
    : currency(todayMoneyTaxEstimate);
  document.querySelector("#billsHolidaysToday").textContent = todayMoneyBillsHolidays === null
    ? "-"
    : currency(todayMoneyBillsHolidays);
  document.querySelector("#freeCashToday").textContent = todayMoneyFreeCash === null
    ? "-"
    : annualMonthlyCurrency(todayMoneyFreeCash);
  document.querySelector("#lsaRemaining").textContent = `${currency(cleanInputs.lsaRemaining)} LSA left`;
  document.querySelector("#annualSpendingTotal").textContent = `${currency(cleanInputs.annualSpending)}/yr`;
  updateTaxYearView(taxYearPlan, cleanInputs);

  syncPlanTiles();
  drawChart(data);
  renderPlanCharts();
  updateInsights(data, cleanInputs);
  postEmbeddedHeight();
}

function postEmbeddedHeight() {
  if (!isEmbeddedOptimiser) return;
  requestAnimationFrame(() => {
    const targetOrigin = window.location.protocol === "file:" ? "*" : window.location.origin;
    window.parent.postMessage({
      type: "retirement-optimiser-height",
      height: document.documentElement.scrollHeight,
    }, targetOrigin);
  });
}

function applyParentTheme(payload) {
  if (!payload || typeof payload !== "object") return;
  const root = document.documentElement;
  Object.entries(payload.vars || {}).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
  if (payload.theme) {
    root.setAttribute("data-theme", payload.theme);
  }
  if (payload.bodyFontFamily) {
    document.body.style.fontFamily = payload.bodyFontFamily;
  }
  document.body.style.background = "transparent";
  if (importedPlan?.rows?.length) {
    render();
  }
}

function setOptimizerReadonly() {
  if (!isEmbeddedOptimiser) return;
  document.body.classList.add("optimizer-readonly");
  form.querySelectorAll("input, select, textarea, button").forEach((control) => {
    control.disabled = true;
  });
}

function loadForecasterPlan(payload) {
  if (!isForecasterPlanExport(payload)) return;
  const selectedYear = importedPlan?.rows?.[selectedPlanIndex]?.calendarYear;
  importedPlan = getForecasterPlan(payload);
  if (Number.isFinite(selectedYear)) {
    const matchingIndex = importedPlan.rows.findIndex((row) => row.calendarYear === selectedYear);
    selectedPlanIndex = matchingIndex >= 0 ? matchingIndex : 0;
  } else {
    selectedPlanIndex = 0;
  }
  importedPlan.selectedIndex = selectedPlanIndex;
  updatePlanControls();
  const row = importedPlan.rows[selectedPlanIndex];
  const settings = coerceImportedSettings(
    getForecasterPlanRowSettings(payload, row),
    "pension-forecaster-plan"
  );
  applySettings(settings);
  render();
  setOptimizerReadonly();
  postEmbeddedHeight();
}

// Override top summary tiles with values directly from the selected plan row,
// so they always match the chart tooltips for that year.
function syncPlanTiles() {
  if (!importedPlan?.rows?.length) return;
  const row = importedPlan.rows[selectedPlanIndex];
  if (!row) return;

  const annualSpend = row.totalIncomeRequired ?? 0;
  const tax         = row.estimatedTax ?? 0;
  const bills       = row.householdBills ?? row.incomeRequired ?? 0;
  const holidays    = row.holidays ?? 0;
  const freeCash    = row.excessNet ?? 0;
  const monthly     = annualSpend / 12;

  document.querySelector("#yearSpend").textContent          = currency(annualSpend);
  document.querySelector("#monthlySpend").textContent       = currency(monthly);
  document.querySelector("#taxEstimate").textContent        = currency(tax);
  document.querySelector("#monthlyTaxEstimate").textContent = `(${currency(tax / 12)}/month)`;
  document.querySelector("#billsHolidaysTotal").textContent = currency(bills + holidays);
  document.querySelector("#freeCashTile").textContent       = annualMonthlyCurrency(freeCash);

  // Today's money equivalents — reuse existing deflation logic
  const td = (v) => getTodayMoneyValue(v);
  const tdAnnualSpend = td(annualSpend);
  const tdTax         = td(tax);
  const tdBillsHols   = td(bills + holidays);
  const tdFreeCash    = td(freeCash);

  document.querySelector("#yearSpendToday").textContent     = tdAnnualSpend  != null ? currency(tdAnnualSpend)              : "-";
  document.querySelector("#monthlySpendToday").textContent  = tdAnnualSpend  != null ? currency(tdAnnualSpend / 12)         : "-";
  document.querySelector("#taxEstimateToday").textContent   = tdTax          != null ? currency(tdTax)                      : "-";
  document.querySelector("#billsHolidaysToday").textContent = tdBillsHols    != null ? currency(tdBillsHols)                : "-";
  document.querySelector("#freeCashToday").textContent      = tdFreeCash     != null ? annualMonthlyCurrency(tdFreeCash)    : "-";
}

form.addEventListener("input", () => {
  render();
  saveSettings();
});
document.querySelector("#resetButton").addEventListener("click", () => {
  resetFields();
  render();
  saveSettings();
});
document.querySelector("#exportSettingsButton").addEventListener("click", exportSettings);
document.querySelector("#importSettingsButton").addEventListener("click", () => {
  importSettingsFile.click();
});
importSettingsFile.addEventListener("change", () => {
  importSettings(importSettingsFile.files[0]);
});

// Settings panel toggle
const controlsPanel = document.querySelector("#controlsPanel");
const panelToggleButton = document.querySelector("#panelToggleButton");
panelToggleButton.addEventListener("click", () => {
  const open = controlsPanel.hidden;
  controlsPanel.hidden = !open;
  panelToggleButton.setAttribute("aria-expanded", String(open));
  panelToggleButton.textContent = open ? "Settings ‹" : "Settings ›";
});
planYearSlider.addEventListener("input", () => {
  selectedPlanIndex = Number(planYearSlider.value);
  applySelectedPlanYear();
});
document.querySelector("#assumptionsToggle").addEventListener("click", () => {
  const content = document.querySelector("#assumptionsContent");
  const toggle = document.querySelector("#assumptionsToggle");
  const collapsed = content.hidden;
  content.hidden = !collapsed;
  toggle.textContent = collapsed ? "Hide" : "Show";
  toggle.setAttribute("aria-expanded", String(collapsed));
});
versionTag.addEventListener("click", showLastChanged);

// Plan chart toggles
function wireChartToggle(id, stateKey) {
  document.querySelector(`#${id}`)?.addEventListener("click", () => {
    planChartState[stateKey] = !planChartState[stateKey];
    syncChartToggleChips();
    renderPlanCharts();
  });
}
wireChartToggle("toggleSavingsChart",  "showSavings");
wireChartToggle("toggleIncomeChart",   "showIncome");
wireChartToggle("toggleSpendingChart", "showSpending");
wireChartToggle("togglePreRetirement", "showPreRetirement");
wireChartToggle("toggleFreeOnly",      "spendingFreeOnly");
wireChartToggle("toggleMonthly",       "spendingMonthly");
wireChartToggle("toggleRealTerms",     "spendingRealTerms");

function wireChartHover(canvasId, renderFn) {
  const el = document.querySelector(`#${canvasId}`);
  if (!el) return;
  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const scaleX = (el.width / window.devicePixelRatio) / rect.width;
    renderFn((e.clientX - rect.left) * scaleX);
  });
  el.addEventListener("mouseleave", () => renderFn(null));
}
wireChartHover("savingsChartCanvas",  (hx) => renderPlanCharts(hx, null, null));
wireChartHover("incomeChartCanvas",   (hx) => renderPlanCharts(null, hx, null));
wireChartHover("spendingChartCanvas", (hx) => renderPlanCharts(null, null, hx));

window.addEventListener("message", (event) => {
  if (window.location.protocol !== "file:" && event.origin !== window.location.origin) return;
  if (event.data?.type === "pension-forecaster-theme") {
    applyParentTheme(event.data.payload);
    return;
  }
  if (event.data?.type !== "pension-forecaster-plan") return;
  loadForecasterPlan(event.data.payload);
});

window.addEventListener("resize", postEmbeddedHeight);

// Theme switcher
const themeSettingsButton = document.querySelector("#themeSettingsButton");
const themePanel = document.querySelector("#themePanel");
const bgHueSlider = document.querySelector("#bgHueSlider");
const tileHueSlider = document.querySelector("#tileHueSlider");
const canvasHueSlider = document.querySelector("#canvasHueSlider");
const textHueSlider = document.querySelector("#textHueSlider");

themeSettingsButton.addEventListener("click", (event) => {
  event.stopPropagation();
  themePanel.hidden = !themePanel.hidden;
});

document.addEventListener("click", (event) => {
  if (!themePanel.hidden && !themePanel.contains(event.target) && event.target !== themeSettingsButton) {
    themePanel.hidden = true;
  }
});

document.querySelectorAll(".theme-chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    activeTheme = btn.dataset.theme;
    applyTheme(activeTheme, customBgHue, customTileHue, customCanvasHue, customTextHue);
    saveThemePrefs();
    render();
  });
});

bgHueSlider.addEventListener("input", () => {
  customBgHue = Number(bgHueSlider.value);
  syncSwatches();
  applyTheme("custom", customBgHue, customTileHue, customCanvasHue, customTextHue);
  saveThemePrefs();
  render();
});

tileHueSlider.addEventListener("input", () => {
  customTileHue = Number(tileHueSlider.value);
  syncSwatches();
  applyTheme("custom", customBgHue, customTileHue, customCanvasHue, customTextHue);
  saveThemePrefs();
  render();
});

canvasHueSlider.addEventListener("input", () => {
  customCanvasHue = Number(canvasHueSlider.value);
  syncSwatches();
  applyTheme("custom", customBgHue, customTileHue, customCanvasHue, customTextHue);
  saveThemePrefs();
  render();
});

textHueSlider.addEventListener("input", () => {
  customTextHue = Number(textHueSlider.value);
  syncSwatches();
  applyTheme("custom", customBgHue, customTileHue, customCanvasHue, customTextHue);
  saveThemePrefs();
  render();
});

setupNumberInputs();
resetFields();
loadSavedSettings();
loadThemePrefs();
bgHueSlider.value     = customBgHue;
tileHueSlider.value   = customTileHue;
canvasHueSlider.value = customCanvasHue;
textHueSlider.value   = customTextHue;
syncSwatches();
applyTheme(activeTheme, customBgHue, customTileHue, customCanvasHue, customTextHue);
render();
