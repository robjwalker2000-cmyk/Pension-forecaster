const STORAGE_KEY = "pension-forecaster-state-v3";
const CURRENT_YEAR = new Date().getFullYear();
const UI_STORAGE_KEY = "pension-forecaster-ui-v1";

function hasSavedState() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

const DEFAULT_STATE = {
  planName: "Pension plan",
  currentYear: CURRENT_YEAR,
  currentAge: CURRENT_YEAR - 1971,
  yearOfBirth: 1971,
  retirementYear: CURRENT_YEAR + 10,
  retirementAge: CURRENT_YEAR + 10 - 1971,
  currentPot: 100000,
  currentCrystallisedPot: 0,
  lumpSumAllowanceUsed: 0,
  personalMonthlyContribution: 0,
  personalSavings: 0,
  useSavings: true,
  personalSavingsGrowthRate: 0.03,
  personalIsaSavings: 0,
  personalIsaGrowthRate: 0.03,
  personalBankSavings: 0,
  personalBankInterestRate: 0.03,
  personalPremiumBonds: 0,
  personalPremiumBondsGrowthRate: 0.03,
  definedBenefitEnabled: false,
  definedBenefitStartYear: CURRENT_YEAR + 10,
  definedBenefitInitialLumpSum: 0,
  definedBenefitInitialAnnualAmount: 0,
  definedBenefitMaxYears: 10,
  definedBenefitGrowthRate: 0.02,
  annuityEnabled: false,
  annuityPurchaseYear: CURRENT_YEAR + 10,
  annuityCost: 0,
  annuityTaxFreeCashTaken: 0,
  annuityRate: 0.05,
  annuityEscalationType: "level",
  annuityFixedEscalationRate: 0.03,
  planYears: 25,
  planToAge: CURRENT_YEAR + 10 - 1971 + 24,
  planEndMode: "years",
  limitPlanYears: true,
  scenario: 1,
  maxGrowthRate: 0.15,
  growthLow: 0.04,
  growthMid: 0.06,
  growthHigh: 0.11,
  postRetirementGrowthLow: 0.04,
  postRetirementGrowthMid: 0.06,
  postRetirementGrowthHigh: 0.04,
  applyPotGrowth: true,
  taperPreRetirementGrowth: false,
  take25PercentYear1: false,
  yearOneTflsMode: "full",
  yearOneTflsAmount: 0,
  incomeRequired: 60000,
  incomeAfterYear10: 40000,
  billsAnnual: 30000,
  holidaysAnnual: 4500,
  carCost: 20000,
  carFrequencyYears: 4,
  carStartYear: 2,
  applyCpiIncome: true,
  incomeValuesRelativeToToday: true,
  applyCpiSpending: true,
  applyCpiCar: false,
  cpiRate: 0.025,
  partnerDetailsEnabled: true,
  partnerBirthYear: 1971,
  partnerRetirementAge: 68,
  partnerWorkIncome: 15000,
  partnerWorkApplyCpi: true,
  partnerWorkCpiRate: 0.025,
  partnerSavings: 0,
  partnerSavingsGrowthRate: 0.03,
  statePension: 11502,
  statePensionGrowthRate: 0.025,
  myStatePensionPct: 100,
  partnerStatePensionPct: 100,
  applyTaxAllowanceCpi: false,
  taxAllowanceCpiRate: 0.02,
  taxBandCpiRate: 0,
  taxBandCpiFrequencyYears: 1,
  taxBandCpiStartYear: CURRENT_YEAR,
  regularDrawdownEnabled: false,
  taxOptimisationMode: false,
  savingsTaxOptimisation: "my",
  useTflsBy75: false,
  maximiseBasicRateDrawdown: false,
  forceTflsTaxablePairing: false,
  useSavingsForCar: false,
  regularDrawdownAmount: 12000,
  regularDrawdownYears: 15,
  specialEvents: [],
  myPensionEnabled: true,
  partnerPensionEnabled: false,
  partnerScenario: 1,
  partnerGrowthLow: 0.04,
  partnerGrowthMid: 0.06,
  partnerGrowthHigh: 0.11,
  partnerPostRetirementGrowthLow: 0.04,
  partnerPostRetirementGrowthMid: 0.06,
  partnerPostRetirementGrowthHigh: 0.04,
  partnerCurrentPot: 0,
  partnerCrystallisedPot: 0,
  partnerLumpSumAllowanceUsed: 0,
  partnerMonthlyContribution: 0,
  partnerDBEnabled: false,
  partnerDefinedBenefitStartYear: CURRENT_YEAR + 10,
  partnerDefinedBenefitInitialLumpSum: 0,
  partnerDefinedBenefitInitialAnnualAmount: 0,
  partnerDefinedBenefitMaxYears: 10,
  partnerDefinedBenefitGrowthRate: 0.02,
};

const CURRENCY = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const NUMBER = new Intl.NumberFormat("en-GB", {
  maximumFractionDigits: 0,
});

const PERCENT = new Intl.NumberFormat("en-GB", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function normaliseMoney(value) {
  const amount = Number(value) || 0;
  return Math.abs(amount) < 0.5 ? 0 : amount;
}

function formatCurrency(value) {
  return CURRENCY.format(normaliseMoney(value));
}

const UK_TAX_RULES = {
  personalAllowance: 12570,
  allowanceTaperStarts: 100000,
  basicRateLimit: 50270,
  higherRateLimit: 125140,
  basicRate: 0.2,
  higherRate: 0.4,
  additionalRate: 0.45,
  personalSavingsAllowanceBasic: 1000,
  personalSavingsAllowanceHigher: 500,
  premiumBondsLimit: 50000,
  standardLumpSumAllowance: 268275,
};

const inputs = Array.from(document.querySelectorAll("[data-field]"));
const LINKED_PLAN_FIELDS = new Set(["planYears", "planToAge"]);
const growthScenarioFields = Array.from(document.querySelectorAll("[data-growth-scenario]"));
const partnerGrowthScenarioFields = Array.from(document.querySelectorAll("[data-partner-growth-scenario]"));
const summaryGrid = document.getElementById("summary-grid");
const summaryTemplate = document.getElementById("summary-card-template");
const projectionHead = document.getElementById("projection-head");
const projectionBody = document.getElementById("projection-body");
const definedBenefitFields = document.getElementById("defined-benefit-fields");
const savingsFields = document.getElementById("savings-fields");
const partnerDetailFields = document.getElementById("partner-detail-fields");
const myPensionFields = document.getElementById("my-pension-fields");
const partnerPensionFields = document.getElementById("partner-pension-fields");
const partnerDbFields = document.getElementById("partner-db-fields");
const annuityFields = document.getElementById("annuity-fields");
const annuityFixedEscalationFields = document.getElementById("annuity-fixed-escalation-fields");
const regularDrawdownFields = document.getElementById("regular-drawdown-fields");
const yearOneTflsFields = document.getElementById("year-one-tfls-fields");
const potChartCanvas = document.getElementById("pot-chart");
const incomeChartCanvas = document.getElementById("income-chart");
const potChartWrap = document.getElementById("pot-chart-wrap");
const incomeChartWrap = document.getElementById("income-chart-wrap");
const chartCaption = document.getElementById("chart-caption");
const tableCaption = document.getElementById("table-caption");
const versionBadge = document.getElementById("version-badge");
const toggleTableWidthButton = document.getElementById("toggle-table-width-button");
const exportTableButton = document.getElementById("export-table-button");
const exportFormulaButton = document.getElementById("export-formula-button");
const exportPdfButton = document.getElementById("export-pdf-button");
const exportPlanButton = document.getElementById("export-plan-button");
const resetButton = document.getElementById("reset-button");
const importFile = document.getElementById("import-file");
const appViewsTrack = document.getElementById("app-views-track");
const appViewButtons = Array.from(document.querySelectorAll(".app-view-button[data-app-view]"));
const optimiserFrame = document.getElementById("optimiser-frame");
const togglePanelButton = document.getElementById("toggle-panel-button");
const tableViewButton   = document.getElementById("table-view-button");
const tableViewDropdown = document.getElementById("table-view-dropdown");
const tableViewOptions  = tableViewDropdown.querySelectorAll(".table-view-option");
const scenarioButton        = document.getElementById("scenario-button");
const scenarioDropdown      = document.getElementById("scenario-dropdown");
const scenarioOptions       = scenarioDropdown.querySelectorAll(".scenario-option");
const partnerScenarioButton  = document.getElementById("partner-scenario-button");
const partnerScenarioDropdown = document.getElementById("partner-scenario-dropdown");
const partnerScenarioOptions  = partnerScenarioDropdown.querySelectorAll(".partner-scenario-option");
const savingsTaxOptimButton  = document.getElementById("savings-tax-optim-button");
const savingsTaxOptimDropdown = document.getElementById("savings-tax-optim-dropdown");
const savingsTaxOptimOptions  = savingsTaxOptimDropdown.querySelectorAll(".savings-tax-optim-option");
const chooseCustomFieldsButton = document.getElementById("choose-custom-fields-button");
const granularTaxToggleWrap = document.getElementById("granular-tax-toggle-wrap");
const granularTaxToggle = document.getElementById("granular-tax-toggle");
const granularIncomeToggleWrap = document.getElementById("granular-income-toggle-wrap");
const granularIncomeToggle = document.getElementById("granular-income-toggle");
const granularGrowthToggleWrap = document.getElementById("granular-growth-toggle-wrap");
const granularGrowthToggle = document.getElementById("granular-growth-toggle");
const granularCrystallisationToggleWrap = document.getElementById("granular-crystallisation-toggle-wrap");
const granularCrystallisationToggle = document.getElementById("granular-crystallisation-toggle");
const customFieldsDialog = document.getElementById("custom-fields-dialog");
const customFieldsList = document.getElementById("custom-fields-list");
const closeCustomFieldsButton = document.getElementById("close-custom-fields-button");
const applyCustomFieldsButton = document.getElementById("apply-custom-fields-button");
const basicSetupDialog = document.getElementById("basic-setup-dialog");
const closeBasicSetupButton = document.getElementById("close-basic-setup-button");
const applyBasicSetupButton = document.getElementById("apply-basic-setup-button");
const savingsPreRetirementToggle = document.getElementById("savings-preretirement-toggle");
const savingsViewPersonalBtn = document.getElementById("savings-view-personal");
const savingsViewPartnerBtn  = document.getElementById("savings-view-partner");
const savingsViewCombinedBtn = document.getElementById("savings-view-combined");
const spendingChartCanvas = document.getElementById("spending-chart");
const spendingChartRealToggle = document.getElementById("spending-chart-real-toggle");
const spendingChartMonthlyToggle = document.getElementById("spending-chart-monthly-toggle");
const spendingChartFreeToggle = document.getElementById("spending-chart-free-toggle");
const spendingChartTaxToggle  = document.getElementById("spending-chart-tax-toggle");
const spendingChartCaption = document.getElementById("spending-chart-caption");
const layout = document.getElementById("layout");
const tablePanel = document.querySelector(".table-panel");
const tableWrap = document.getElementById("table-wrap");

function loadStateFromUrlHash() {
  try {
    const hash = window.location.hash;
    if (!hash.startsWith("#plan=")) return null;
    const encoded = hash.slice(6);
    const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    if (decoded && typeof decoded === "object") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return normaliseState({ ...DEFAULT_STATE, ...decoded });
    }
  } catch {
    // malformed hash — ignore
  }
  return null;
}

function generateShareUrl() {
  try {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    return `${window.location.href.split("#")[0]}#plan=${encoded}`;
  } catch {
    return window.location.href;
  }
}

const urlState = loadStateFromUrlHash();
const shouldOpenBasicSetupOnLoad = !urlState && !hasSavedState();
let state = urlState || loadState();

// ?maxGrowth=N (N in percent, e.g. ?maxGrowth=25) overrides the growth cap
const _maxGrowthParam = new URLSearchParams(window.location.search).get('maxGrowth');
if (_maxGrowthParam !== null && !Number.isNaN(Number(_maxGrowthParam))) {
  state = normaliseState({ ...state, maxGrowthRate: Number(_maxGrowthParam) / 100 });
  history.replaceState(null, '', window.location.pathname + window.location.hash);
}
let activeAppView = "forecaster";
let optimiserFrameReady = false;
let deferredChartRender = null;
let uiState = loadUiState();
let versionBadgeTimeout = null;
const OPTIMISER_THEME_VARS = [
  "--bg", "--bg-2", "--panel", "--panel-strong", "--panel-a", "--panel-b", "--panel-c",
  "--card", "--card-2", "--card-warn", "--card-warn-2", "--card-success", "--card-success-2",
  "--line", "--line-strong", "--text", "--muted", "--accent", "--accent-2", "--accent-glow",
  "--danger", "--success", "--shadow", "--radius", "--input-bg", "--button-text", "--table-bg",
  "--panel-blur",
];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return normaliseState({ ...DEFAULT_STATE, ...(saved || {}) });
  } catch {
    return normaliseState({ ...DEFAULT_STATE });
  }
}

function normaliseState(source, changedKey = null) {
  const next = { ...source };
  // Migrate applyCpiBills + applyCpiHolidays → applyCpiSpending
  if ((next.applyCpiBills !== undefined || next.applyCpiHolidays !== undefined) && next.applyCpiSpending === undefined) {
    next.applyCpiSpending = (next.applyCpiBills !== false) || (next.applyCpiHolidays !== false);
  }
  delete next.applyCpiBills;
  delete next.applyCpiHolidays;
  if (next.applyCpiCar === undefined) next.applyCpiCar = false;
  // Migrate old boolean field to new enum
  if (next.usePartnerSavingsForTaxOptimisation !== undefined && next.savingsTaxOptimisation === undefined) {
    next.savingsTaxOptimisation = next.usePartnerSavingsForTaxOptimisation ? "balanced" : "my";
  }
  delete next.usePartnerSavingsForTaxOptimisation;
  if (!["none", "my", "partner", "balanced"].includes(next.savingsTaxOptimisation)) {
    next.savingsTaxOptimisation = "my";
  }
  next.planName = typeof next.planName === "string" ? next.planName : "Pension plan";
  next.currentYear = CURRENT_YEAR;

  if (Number.isFinite(Number(next.yearOfBirth))) {
    next.yearOfBirth = Number(next.yearOfBirth);
    next.currentAge = next.currentYear - next.yearOfBirth;
  } else if (Number.isFinite(Number(next.currentAge))) {
    next.currentAge = Number(next.currentAge);
    next.yearOfBirth = next.currentYear - next.currentAge;
  }

  if (Number.isFinite(Number(next.retirementAge)) && Number.isFinite(Number(next.yearOfBirth))) {
    next.retirementAge = Number(next.retirementAge);
    next.retirementYear = Number(next.yearOfBirth) + Number(next.retirementAge);
  } else if (Number.isFinite(Number(next.retirementYear)) && Number.isFinite(Number(next.yearOfBirth))) {
    next.retirementYear = Number(next.retirementYear);
    next.retirementAge = next.retirementYear - next.yearOfBirth;
  } else {
    next.retirementYear = next.currentYear + 10;
    next.retirementAge = next.retirementYear - next.yearOfBirth;
  }

  if (changedKey === "planToAge") {
    next.planEndMode = "age";
  } else if (changedKey === "planYears") {
    next.planEndMode = "years";
  } else if (!["age", "years"].includes(next.planEndMode)) {
    next.planEndMode = Number.isFinite(Number(source.planToAge)) && !Number.isFinite(Number(source.planYears)) ? "age" : "years";
  }

  const planYearsValue = Math.max(1, Math.round(Number(next.planYears) || DEFAULT_STATE.planYears));
  const planToAgeValue = Math.max(next.retirementAge, Math.round(Number(next.planToAge) || (next.retirementAge + planYearsValue - 1)));
  if (next.planEndMode === "age") {
    next.planToAge = planToAgeValue;
    next.planYears = Math.max(1, next.planToAge - next.retirementAge + 1);
  } else {
    next.planYears = planYearsValue;
    next.planToAge = next.retirementAge + next.planYears - 1;
  }

  next.maxGrowthRate = Math.max(0.01, Math.min(0.50, Number(next.maxGrowthRate) || 0.15));

  if (!Number.isFinite(Number(next.partnerRetirementAge))) {
    next.partnerRetirementAge = 68;
  } else {
    next.partnerRetirementAge = Math.round(Number(next.partnerRetirementAge));
  }

  next.currentCrystallisedPot = Math.max(0, Math.min(Number(next.currentCrystallisedPot) || 0, Number(next.currentPot) || 0));
  next.lumpSumAllowanceUsed = Math.max(0, Number(next.lumpSumAllowanceUsed) || 0);
  next.personalMonthlyContribution = Math.max(0, Number(next.personalMonthlyContribution) || 0);
  if (!Number.isFinite(Number(source.personalBankSavings)) && !Number.isFinite(Number(source.personalIsaSavings))) {
    next.personalBankSavings = Math.max(0, Number(source.personalSavings) || 0);
    next.personalIsaSavings = 0;
    next.personalPremiumBonds = 0;
  } else {
    next.personalBankSavings = Math.max(0, Number(next.personalBankSavings) || 0);
    next.personalIsaSavings = Math.max(0, Number(next.personalIsaSavings) || 0);
    next.personalPremiumBonds = Math.max(0, Number(next.personalPremiumBonds) || 0);
  }
  next.personalSavings = next.personalIsaSavings + next.personalBankSavings + next.personalPremiumBonds;
  next.useSavings = next.useSavings !== false;
  next.taxBandCpiRate = Math.max(0, Number(next.taxBandCpiRate) || 0);
  next.taxBandCpiFrequencyYears = Math.max(1, Math.round(Number(next.taxBandCpiFrequencyYears) || 1));
  next.taxBandCpiStartYear = Math.round(Number(next.taxBandCpiStartYear) || next.currentYear);
  next.yearOneTflsMode = next.yearOneTflsMode === "defined" ? "defined" : "full";
  next.yearOneTflsAmount = Math.max(0, Number(next.yearOneTflsAmount) || 0);
  // Migrate old per-person state pension fields to shared state pension model
  if (next.statePension === undefined) next.statePension = Math.max(0, Number(next.ownStatePension) || 11502);
  else next.statePension = Math.max(0, Number(next.statePension) || 11502);
  if (next.statePensionGrowthRate === undefined) next.statePensionGrowthRate = Math.max(0, Number(next.ownStatePensionGrowthRate) || Number(next.statePensionCpiRate) || 0.025);
  else next.statePensionGrowthRate = Math.max(0, Number(next.statePensionGrowthRate) || 0.025);
  next.myStatePensionPct = Math.max(0, Math.min(100, Number(next.myStatePensionPct) || 100));
  next.partnerStatePensionPct = Math.max(0, Math.min(100, Number(next.partnerStatePensionPct) || 100));
  if (next.myPensionEnabled === undefined) next.myPensionEnabled = true;
  if (next.partnerPensionEnabled === undefined) next.partnerPensionEnabled = false;
  next.partnerCurrentPot = Math.max(0, Number(next.partnerCurrentPot) || 0);
  next.partnerCrystallisedPot = Math.max(0, Math.min(Number(next.partnerCrystallisedPot) || 0, next.partnerCurrentPot));
  next.partnerLumpSumAllowanceUsed = Math.max(0, Number(next.partnerLumpSumAllowanceUsed) || 0);
  next.partnerMonthlyContribution = Math.max(0, Number(next.partnerMonthlyContribution) || 0);
  if (next.partnerDBEnabled === undefined) next.partnerDBEnabled = false;
  next.partnerDefinedBenefitStartYear = Math.round(Number(next.partnerDefinedBenefitStartYear) || (CURRENT_YEAR + 10));
  next.partnerDefinedBenefitInitialLumpSum = Math.max(0, Number(next.partnerDefinedBenefitInitialLumpSum) || 0);
  next.partnerDefinedBenefitInitialAnnualAmount = Math.max(0, Number(next.partnerDefinedBenefitInitialAnnualAmount) || 0);
  next.partnerDefinedBenefitMaxYears = Math.max(1, Math.round(Number(next.partnerDefinedBenefitMaxYears) || 10));
  next.partnerDefinedBenefitGrowthRate = Math.max(0, Number(next.partnerDefinedBenefitGrowthRate) || 0.02);
  if (next.annuityEnabled === undefined) next.annuityEnabled = false;
  next.annuityPurchaseYear = Math.round(Number(next.annuityPurchaseYear) || (CURRENT_YEAR + 10));
  next.annuityCost = Math.max(0, Number(next.annuityCost) || 0);
  next.annuityTaxFreeCashTaken = Math.max(0, Number(next.annuityTaxFreeCashTaken) || 0);
  next.annuityRate = Math.max(0, Number(next.annuityRate) || 0.05);
  next.annuityEscalationType = ["level", "fixed", "indexLinked"].includes(next.annuityEscalationType) ? next.annuityEscalationType : "level";
  next.annuityFixedEscalationRate = Math.max(0, Number(next.annuityFixedEscalationRate) || 0.03);
  next.specialEvents = Array.isArray(next.specialEvents) ? next.specialEvents.map((ev) => ({
    id: ev.id || (`evt_${Date.now()}_${Math.random()}`),
    yearType: ["relative", "absolute"].includes(ev.yearType) ? ev.yearType : "relative",
    year: Math.max(1, Math.round(Number(ev.year) || 1)),
    type: ["expense", "income"].includes(ev.type) ? ev.type : "expense",
    amount: Math.max(0, Number(ev.amount) || 0),
    taxable: Boolean(ev.taxable),
    routing: ["drawdown", "savings"].includes(ev.routing) ? ev.routing : "drawdown",
    title: String(ev.title || ""),
  })) : [];
  return next;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadUiState() {
  try {
    const saved = JSON.parse(localStorage.getItem(UI_STORAGE_KEY) || "{}");
    return {
      controlsHidden: Boolean(saved.controlsHidden),
      tableView: ["summarised", "detailed", "granular", "custom"].includes(saved.tableView) ? saved.tableView : "summarised",
      showGranularTaxFields: Boolean(saved.showGranularTaxFields),
      showGranularIncomeFields: saved.showGranularIncomeFields !== false,
      showGranularGrowthFields: Boolean(saved.showGranularGrowthFields),
      showGranularCrystallisationFields: Boolean(saved.showGranularCrystallisationFields),
      showPotChart: saved.showPotChart !== false,
      showIncomeChart: saved.showIncomeChart !== false,
      showSpendingChart: saved.showSpendingChart !== false,
      showTable: saved.showTable !== false,
      spendingChartReal: Boolean(saved.spendingChartReal),
      spendingChartMonthly: Boolean(saved.spendingChartMonthly),
      spendingChartMode: ["full","freeOnly","taxBreakdown"].includes(saved.spendingChartMode) ? saved.spendingChartMode : (saved.spendingChartFreeOnly ? "freeOnly" : "full"),
      savingsShowPreRetirement: Boolean(saved.savingsShowPreRetirement),
      savingsView: ["personal","partner","combined"].includes(saved.savingsView) ? saved.savingsView : "combined",
      tableExpanded: Boolean(saved.tableExpanded),
      customTableFields: Array.isArray(saved.customTableFields) ? saved.customTableFields : [],
      collapsedPanels: (saved.collapsedPanels && typeof saved.collapsedPanels === "object" && !Array.isArray(saved.collapsedPanels)) ? saved.collapsedPanels : {},
    };
  } catch {
    return {
      controlsHidden: false,
      tableView: "summarised",
      showGranularTaxFields: false,
      showGranularIncomeFields: true,
      showGranularGrowthFields: false,
      showGranularCrystallisationFields: false,
      showPotChart: true,
      showIncomeChart: true,
      showSpendingChart: true,
      showTable: true,
      spendingChartReal: false,
      spendingChartMonthly: false,
      spendingChartMode: "full",
      savingsShowPreRetirement: false,
      savingsView: "combined",
      tableExpanded: false,
      customTableFields: [],
      collapsedPanels: {},
    };
  }
}

function saveUiState() {
  localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(uiState));
}

function applyUiState() {
  layout.classList.toggle("controls-hidden", uiState.controlsHidden);
  togglePanelButton.textContent = uiState.controlsHidden ? "Show controls" : "Hide controls";
  const activeOption = tableViewDropdown.querySelector(`[data-value="${uiState.tableView}"]`);
  if (activeOption) tableViewButton.textContent = activeOption.textContent + " ▾";
  granularTaxToggle.checked = Boolean(uiState.showGranularTaxFields);
  granularIncomeToggle.checked = Boolean(uiState.showGranularIncomeFields);
  granularGrowthToggle.checked = Boolean(uiState.showGranularGrowthFields);
  granularCrystallisationToggle.checked = Boolean(uiState.showGranularCrystallisationFields);
  spendingChartRealToggle.classList.toggle("chart-toggle-chip-active", Boolean(uiState.spendingChartReal));
  spendingChartMonthlyToggle.classList.toggle("chart-toggle-chip-active", Boolean(uiState.spendingChartMonthly));
  spendingChartFreeToggle.classList.toggle("chart-toggle-chip-active", uiState.spendingChartMode === "freeOnly");
  spendingChartTaxToggle.classList.toggle("chart-toggle-chip-active",  uiState.spendingChartMode === "taxBreakdown");
  savingsPreRetirementToggle.classList.toggle("chart-toggle-chip-active", Boolean(uiState.savingsShowPreRetirement));
  savingsViewPersonalBtn.classList.toggle("chart-toggle-chip-active", uiState.savingsView === "personal");
  savingsViewPartnerBtn.classList.toggle("chart-toggle-chip-active",  uiState.savingsView === "partner");
  savingsViewCombinedBtn.classList.toggle("chart-toggle-chip-active", uiState.savingsView === "combined");
  tablePanel.classList.toggle("table-panel-expanded", Boolean(uiState.tableExpanded));
  toggleTableWidthButton.classList.toggle("chart-toggle-chip-active", Boolean(uiState.tableExpanded));
  document.getElementById("granular-options-row").hidden = uiState.tableView !== "granular";
  document.getElementById("custom-options-row").hidden = uiState.tableView !== "custom";
  definedBenefitFields.hidden = !Boolean(state.definedBenefitEnabled);
  savingsFields.hidden = state.useSavings === false;
  partnerDetailFields.hidden = state.partnerDetailsEnabled === false;
  document.getElementById("partner-pension-panel").hidden = state.partnerDetailsEnabled === false;
  myPensionFields.hidden = !Boolean(state.myPensionEnabled);
  partnerPensionFields.hidden = !Boolean(state.partnerPensionEnabled);
  partnerDbFields.hidden = !Boolean(state.partnerDBEnabled);
  annuityFields.hidden = !Boolean(state.annuityEnabled);
  annuityFixedEscalationFields.hidden = state.annuityEscalationType !== "fixed";
  // Restore panel collapsed states
  try {
    document.querySelectorAll(".control-panel .panel, .results-panel .panel").forEach((panel) => {
      const panelId = panel.querySelector("h2")?.textContent?.trim() || "";
      const collapsed = Boolean(uiState.collapsedPanels?.[panelId]);
      panel.classList.toggle("panel-collapsed", collapsed);
      const btn = panel.querySelector(".panel-collapse-btn");
      if (btn) btn.textContent = collapsed ? "+" : "−";
    });
  } catch { /* ignore */ }
  regularDrawdownFields.hidden = !Boolean(state.regularDrawdownEnabled);
  yearOneTflsFields.hidden = !Boolean(state.take25PercentYear1);
  growthScenarioFields.forEach((field) => {
    field.classList.toggle("growth-scenario-selected", Number(field.dataset.growthScenario) === Number(state.scenario));
  });
  partnerGrowthScenarioFields.forEach((field) => {
    field.classList.toggle("growth-scenario-selected", Number(field.dataset.partnerGrowthScenario) === Number(state.partnerScenario));
  });
}

function growthRateForScenario(source, phase = "pre") {
  const lowKey = phase === "post" ? "postRetirementGrowthLow" : "growthLow";
  const midKey = phase === "post" ? "postRetirementGrowthMid" : "growthMid";
  const highKey = phase === "post" ? "postRetirementGrowthHigh" : "growthHigh";
  if (Number(source.scenario) === 2) {
    return Number(source[midKey]);
  }
  if (Number(source.scenario) === 3) {
    return Number(source[highKey]);
  }
  return Number(source[lowKey]);
}

function growthRateForPartnerScenario(source, phase = "pre") {
  const lowKey = phase === "post" ? "partnerPostRetirementGrowthLow" : "partnerGrowthLow";
  const midKey = phase === "post" ? "partnerPostRetirementGrowthMid" : "partnerGrowthMid";
  const highKey = phase === "post" ? "partnerPostRetirementGrowthHigh" : "partnerGrowthHigh";
  if (Number(source.partnerScenario) === 2) return Number(source[midKey]);
  if (Number(source.partnerScenario) === 3) return Number(source[highKey]);
  return Number(source[lowKey]);
}

function compoundAnnual(base, rate, yearsElapsed, enabled = true) {
  if (!enabled) {
    return base;
  }
  return base * Math.pow(1 + rate / 12, 12 * yearsElapsed);
}

// Grows a pot over yearsToRetirement, linearly tapering the annual rate
// from preRate (today) down to postRate (at retirement).
// When disabled uses a flat preRate for every year instead of tapering.
// monthlyContribution (if any) is paid in at the end of each month and compounds
// alongside the pot; contributionYears caps how many of the yearsToRetirement years
// still receive contributions (e.g. contributions stop once someone has retired).
function taperedPreRetirementGrowth(base, preRate, postRate, yearsToRetirement, enabled, monthlyContribution = 0, contributionYears = yearsToRetirement) {
  if (yearsToRetirement <= 0) {
    return base;
  }
  let value = base;
  for (let y = 0; y < yearsToRetirement; y++) {
    // t = 0 in year 1 (use preRate), t = 1 in final year (use postRate)
    const rate = enabled
      ? preRate + (postRate - preRate) * (yearsToRetirement === 1 ? 1 : y / (yearsToRetirement - 1))
      : preRate;
    const monthlyRate = rate / 12;
    const growthFactor = Math.pow(1 + monthlyRate, 12);
    value *= growthFactor;
    if (monthlyContribution > 0 && y < contributionYears) {
      const annuityFactor = monthlyRate === 0 ? 12 : (growthFactor - 1) / monthlyRate;
      value += monthlyContribution * annuityFactor;
    }
  }
  return value;
}

function steppedCpiMultiplier(calendarYear, startYear, frequencyYears, rate) {
  const annualRate = Math.max(0, Number(rate) || 0);
  const year = Math.round(Number(calendarYear) || CURRENT_YEAR);
  const start = Math.round(Number(startYear) || CURRENT_YEAR);
  const frequency = Math.max(1, Math.round(Number(frequencyYears) || 1));
  if (annualRate <= 0 || year < start) {
    return 1;
  }
  return Math.pow(1 + annualRate, Math.floor((year - start) / frequency) + 1);
}

function taxRulesForYear(source, calendarYear) {
  const multiplier = steppedCpiMultiplier(
    calendarYear,
    source.taxBandCpiStartYear,
    source.taxBandCpiFrequencyYears,
    source.taxBandCpiRate,
  );
  return {
    ...UK_TAX_RULES,
    allowanceTaperStarts: UK_TAX_RULES.allowanceTaperStarts * multiplier,
    basicRateLimit: UK_TAX_RULES.basicRateLimit * multiplier,
    higherRateLimit: UK_TAX_RULES.higherRateLimit * multiplier,
  };
}

function estimateUkIncomeTax(totalIncome, allowanceBase = UK_TAX_RULES.personalAllowance, taxRules = UK_TAX_RULES) {
  const income = Math.max(0, Number(totalIncome) || 0);
  const allowanceReduction = Math.max(0, (income - taxRules.allowanceTaperStarts) / 2);
  const personalAllowance = Math.max(0, allowanceBase - allowanceReduction);
  const taxableIncome = Math.max(0, income - personalAllowance);
  const personalAllowanceUsed = Math.min(income, personalAllowance);
  const basicBand = Math.max(0, taxRules.basicRateLimit - personalAllowance);
  const higherBand = Math.max(0, taxRules.higherRateLimit - taxRules.basicRateLimit);
  const basicTaxable = Math.min(taxableIncome, basicBand);
  const higherTaxable = Math.min(Math.max(0, taxableIncome - basicBand), higherBand);
  const additionalTaxable = Math.max(0, taxableIncome - basicBand - higherBand);
  const basicRateTax = basicTaxable * taxRules.basicRate;
  const higherRateTax = higherTaxable * taxRules.higherRate;
  const additionalRateTax = additionalTaxable * taxRules.additionalRate;
  const totalTax = basicRateTax + higherRateTax + additionalRateTax;
  const effectiveTaxRate = income > 0 ? totalTax / income : 0;
  const marginalTaxRate = additionalTaxable > 0
    ? taxRules.additionalRate
    : higherTaxable > 0
      ? taxRules.higherRate
      : basicTaxable > 0
        ? taxRules.basicRate
        : 0;
  return {
    totalTax,
    personalAllowance,
    personalAllowanceUsed,
    taxableIncome,
    basicTaxable,
    higherTaxable,
    additionalTaxable,
    basicRateTax,
    higherRateTax,
    additionalRateTax,
    effectiveTaxRate,
    marginalTaxRate,
  };
}

function netFromTaxableIncome(otherTaxableIncome, taxableWithdrawal, allowanceBase = UK_TAX_RULES.personalAllowance, taxRules = UK_TAX_RULES) {
  const grossTaxable = otherTaxableIncome + taxableWithdrawal;
  const tax = estimateUkIncomeTax(grossTaxable, allowanceBase, taxRules);
  return grossTaxable - tax.totalTax - otherTaxableIncome;
}

function solveTaxableWithdrawal(otherTaxableIncome, targetNetFromPension, allowanceBase = UK_TAX_RULES.personalAllowance, taxRules = UK_TAX_RULES) {
  if (targetNetFromPension <= 0) {
    return { taxableWithdrawal: 0, taxBreakdown: estimateUkIncomeTax(otherTaxableIncome, allowanceBase, taxRules) };
  }

  let low = 0;
  let high = Math.max(targetNetFromPension * 2, 1000);
  while ((otherTaxableIncome + high - estimateUkIncomeTax(otherTaxableIncome + high, allowanceBase, taxRules).totalTax - otherTaxableIncome) < targetNetFromPension && high < 1e7) {
    high *= 2;
  }

  for (let i = 0; i < 40; i += 1) {
    const mid = (low + high) / 2;
    if ((otherTaxableIncome + mid - estimateUkIncomeTax(otherTaxableIncome + mid, allowanceBase, taxRules).totalTax - otherTaxableIncome) >= targetNetFromPension) {
      high = mid;
    } else {
      low = mid;
    }
  }

  const taxableWithdrawal = high;
  return { taxableWithdrawal, taxBreakdown: estimateUkIncomeTax(otherTaxableIncome + taxableWithdrawal, allowanceBase, taxRules) };
}

function personalSavingsAllowanceForIncome(taxableIncomeWithInterest, taxRules = UK_TAX_RULES) {
  if (taxableIncomeWithInterest > taxRules.higherRateLimit) {
    return 0;
  }
  if (taxableIncomeWithInterest > taxRules.basicRateLimit) {
    return taxRules.personalSavingsAllowanceHigher;
  }
  return taxRules.personalSavingsAllowanceBasic;
}

function estimateBankInterestTax(baseTaxableIncome, bankInterest, allowanceBase = UK_TAX_RULES.personalAllowance, taxRules = UK_TAX_RULES) {
  const interest = Math.max(0, Number(bankInterest) || 0);
  if (interest <= 0) {
    return {
      bankInterestGross: 0,
      savingsIncomeForPsa: Math.max(0, baseTaxableIncome),
      personalSavingsAllowance: personalSavingsAllowanceForIncome(baseTaxableIncome, taxRules),
      bankInterestTaxable: 0,
      bankInterestTax: 0,
    };
  }

  const incomeWithInterest = Math.max(0, baseTaxableIncome + interest);
  const personalSavingsAllowance = personalSavingsAllowanceForIncome(incomeWithInterest, taxRules);
  const taxableInterest = Math.max(0, interest - personalSavingsAllowance);
  const baseTax = estimateUkIncomeTax(baseTaxableIncome, allowanceBase, taxRules).totalTax;
  const totalTax = estimateUkIncomeTax(baseTaxableIncome + taxableInterest, allowanceBase, taxRules).totalTax;

  return {
    bankInterestGross: interest,
    savingsIncomeForPsa: incomeWithInterest,
    personalSavingsAllowance,
    bankInterestTaxable: taxableInterest,
    bankInterestTax: Math.max(0, totalTax - baseTax),
  };
}

function allocateSavingsWithdrawal(amount, bankBalance, premiumBondsBalance, isaBalance, partnerBalance) {
  let remaining = Math.max(0, Number(amount) || 0);
  const fromBank = Math.min(bankBalance, remaining);
  remaining -= fromBank;
  const fromPremiumBonds = Math.min(premiumBondsBalance, remaining);
  remaining -= fromPremiumBonds;
  const fromIsa = Math.min(isaBalance, remaining);
  remaining -= fromIsa;
  const fromPartner = Math.min(partnerBalance, remaining);

  return {
    bankSavingsUsed: fromBank,
    premiumBondsUsed: fromPremiumBonds,
    isaSavingsUsed: fromIsa,
    partnerSavingsUsed: fromPartner,
  };
}

function amortisingWithdrawal(balance, annualGrowthRate, remainingYears) {
  const years = Math.max(1, remainingYears);
  const amount = Math.max(0, Number(balance) || 0);
  const rate = Math.max(0, Number(annualGrowthRate) || 0);
  if (amount <= 0) {
    return 0;
  }
  if (rate <= 0) {
    return amount / years;
  }
  const growthFactor = (1 + rate) ** years;
  return (amount * rate * growthFactor) / (growthFactor - 1);
}

function netFromAdditionalTaxableWithdrawal(existingTaxableIncome, taxableWithdrawal, allowanceBase, taxRules = UK_TAX_RULES) {
  const baseTax = estimateUkIncomeTax(existingTaxableIncome, allowanceBase, taxRules).totalTax;
  const totalTax = estimateUkIncomeTax(existingTaxableIncome + taxableWithdrawal, allowanceBase, taxRules).totalTax;
  return taxableWithdrawal - Math.max(0, totalTax - baseTax);
}

function solveAdditionalTaxableWithdrawal(existingTaxableIncome, targetNet, allowanceBase, maxWithdrawal = 1e7, taxRules = UK_TAX_RULES) {
  if (targetNet <= 0 || maxWithdrawal <= 0) {
    return 0;
  }

  const cappedMaxWithdrawal = Math.max(0, maxWithdrawal);
  const maxNet = netFromAdditionalTaxableWithdrawal(existingTaxableIncome, cappedMaxWithdrawal, allowanceBase, taxRules);
  if (maxNet <= targetNet) {
    return cappedMaxWithdrawal;
  }

  let low = 0;
  let high = cappedMaxWithdrawal;
  for (let i = 0; i < 40; i += 1) {
    const mid = (low + high) / 2;
    if (netFromAdditionalTaxableWithdrawal(existingTaxableIncome, mid, allowanceBase, taxRules) >= targetNet) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return high;
}

function estimateTotalTaxWithBankInterest(taxableIncome, bankInterest, allowanceBase, taxRules = UK_TAX_RULES) {
  const taxBreakdown = estimateUkIncomeTax(taxableIncome, allowanceBase, taxRules);
  const bankInterestTaxBreakdown = estimateBankInterestTax(taxableIncome, bankInterest, allowanceBase, taxRules);
  return {
    taxBreakdown,
    bankInterestTaxBreakdown,
    estimatedTax: taxBreakdown.totalTax + bankInterestTaxBreakdown.bankInterestTax,
  };
}

function netFromAdditionalTaxableWithdrawalWithBankInterest(existingTaxableIncome, bankInterest, taxableWithdrawal, allowanceBase, taxRules = UK_TAX_RULES) {
  const currentTax = estimateTotalTaxWithBankInterest(existingTaxableIncome, bankInterest, allowanceBase, taxRules).estimatedTax;
  const nextTax = estimateTotalTaxWithBankInterest(existingTaxableIncome + taxableWithdrawal, bankInterest, allowanceBase, taxRules).estimatedTax;
  return taxableWithdrawal - Math.max(0, nextTax - currentTax);
}

function solveAdditionalTaxableWithdrawalWithBankInterest(existingTaxableIncome, bankInterest, targetNet, allowanceBase, maxWithdrawal = 1e7, taxRules = UK_TAX_RULES) {
  if (targetNet <= 0 || maxWithdrawal <= 0) {
    return 0;
  }

  const cappedMaxWithdrawal = Math.max(0, maxWithdrawal);
  const maxNet = netFromAdditionalTaxableWithdrawalWithBankInterest(
    existingTaxableIncome,
    bankInterest,
    cappedMaxWithdrawal,
    allowanceBase,
    taxRules,
  );
  if (maxNet <= targetNet) {
    return cappedMaxWithdrawal;
  }

  let low = 0;
  let high = cappedMaxWithdrawal;
  for (let i = 0; i < 40; i += 1) {
    const mid = (low + high) / 2;
    if (netFromAdditionalTaxableWithdrawalWithBankInterest(existingTaxableIncome, bankInterest, mid, allowanceBase, taxRules) >= targetNet) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return high;
}

function calculateTaxOptimisedWithdrawal({
  targetGrossIncome,
  myOtherIncome,
  expectedBankInterest = 0,
  taxFreeCashCapacity,
  minimumTaxFreeCash = 0,
  earlySavingsAvailable = 0,
  savingsAvailable = 0,
  crystallisedPot,
  uncrystallisedPot,
  forceTflsTaxablePairing = false,
  taxRules = UK_TAX_RULES,
}) {
  const totalPotAvailable = Math.max(0, crystallisedPot + uncrystallisedPot);
  const taxableCapacity = totalPotAvailable;
  let remainingGrossIncome = Math.max(0, targetGrossIncome);
  let taxableWithdrawal = 0;
  let taxFreeCash = 0;
  let savingsUsed = 0;
  let availableCrystallisedPot = Math.max(0, crystallisedPot);
  let remainingUncrystallisedPot = Math.max(0, uncrystallisedPot);
  let remainingTaxFreeCashCapacity = Math.max(0, taxFreeCashCapacity);
  let taxableFromNewTflsCrystallisation = 0;

  const earlySavingsUsed = Math.min(Math.max(0, earlySavingsAvailable), remainingGrossIncome);
  savingsUsed += earlySavingsUsed;
  remainingGrossIncome -= earlySavingsUsed;

  const plannedTaxFreeCash = Math.min(
    Math.max(0, minimumTaxFreeCash),
    forceTflsTaxablePairing ? remainingGrossIncome / 4 : Number.POSITIVE_INFINITY,
    remainingTaxFreeCashCapacity,
    remainingUncrystallisedPot * 0.25,
  );
  taxFreeCash += plannedTaxFreeCash;
  remainingGrossIncome = Math.max(0, remainingGrossIncome - plannedTaxFreeCash);
  remainingUncrystallisedPot -= plannedTaxFreeCash * 4;
  availableCrystallisedPot += plannedTaxFreeCash * 3;
  remainingTaxFreeCashCapacity -= plannedTaxFreeCash;

  const psaProtectedBasicRateLimit = Math.max(0, taxRules.basicRateLimit - myOtherIncome - Math.max(0, expectedBankInterest));
  const taxableFromExistingCrystallised = Math.min(
    remainingGrossIncome,
    psaProtectedBasicRateLimit,
    availableCrystallisedPot,
  );
  taxableWithdrawal += taxableFromExistingCrystallised;
  remainingGrossIncome -= taxableFromExistingCrystallised;

  const remainingBasicRateRoom = Math.max(0, psaProtectedBasicRateLimit - taxableWithdrawal);
  const pairedTaxableFromNewCrystallisation = Math.min(
    remainingGrossIncome * 0.75,
    remainingBasicRateRoom,
    remainingUncrystallisedPot * 0.75,
    remainingTaxFreeCashCapacity * 3,
  );
  const pairedTaxFreeCash = pairedTaxableFromNewCrystallisation / 3;
  taxableFromNewTflsCrystallisation = pairedTaxableFromNewCrystallisation;
  taxableWithdrawal += pairedTaxableFromNewCrystallisation;
  taxFreeCash += pairedTaxFreeCash;
  remainingGrossIncome -= pairedTaxableFromNewCrystallisation + pairedTaxFreeCash;
  remainingUncrystallisedPot -= pairedTaxableFromNewCrystallisation + pairedTaxFreeCash;
  remainingTaxFreeCashCapacity -= pairedTaxFreeCash;

  const taxFreeUsed = forceTflsTaxablePairing
    ? 0
    : Math.min(remainingTaxFreeCashCapacity, remainingGrossIncome, remainingUncrystallisedPot * 0.25);
  taxFreeCash += taxFreeUsed;
  remainingGrossIncome -= taxFreeUsed;
  remainingUncrystallisedPot -= taxFreeUsed * 4;
  remainingTaxFreeCashCapacity -= taxFreeUsed;

  if (forceTflsTaxablePairing && taxFreeCash > 0) {
    const pairedTaxableTarget = taxFreeCash * 3;
    const taxableShortfall = Math.max(0, pairedTaxableTarget - taxableWithdrawal);
    const remainingTaxableCapacity = Math.max(0, taxableCapacity - taxableWithdrawal - taxFreeCash);
    const pairedTaxableTopUp = Math.min(taxableShortfall, remainingTaxableCapacity);
    taxableWithdrawal += pairedTaxableTopUp;
    remainingGrossIncome = Math.max(0, remainingGrossIncome - pairedTaxableTopUp);
  }

  const laterSavingsAvailable = Math.max(0, savingsAvailable - savingsUsed);
  const laterSavingsUsed = Math.min(laterSavingsAvailable, remainingGrossIncome);
  savingsUsed += laterSavingsUsed;
  remainingGrossIncome -= laterSavingsUsed;

  if (remainingGrossIncome > 0.01) {
    const remainingTaxableCapacity = Math.max(0, taxableCapacity - taxableWithdrawal - taxFreeCash);
    const extraWithdrawal = Math.min(remainingGrossIncome, remainingTaxableCapacity);
    taxableWithdrawal += extraWithdrawal;
  }

  return {
    taxFreeCash,
    taxableWithdrawal,
    savingsUsed,
    earlySavingsUsed,
    taxableFromNewTflsCrystallisation,
    psaProtectedBasicRateLimit,
  };
}

function calculateProjection(source) {
  const retirementYear = source.retirementYear;
  const birthYear = source.yearOfBirth;
  const yearsToRetirement = Math.max(0, retirementYear - source.currentYear);
  const partnerRetirementYear = (source.partnerDetailsEnabled !== false && Number.isFinite(Number(source.partnerBirthYear)) && Number.isFinite(Number(source.partnerRetirementAge)))
    ? Number(source.partnerBirthYear) + Number(source.partnerRetirementAge)
    : retirementYear;
  const yearsToPartnerRetirement = Math.max(0, partnerRetirementYear - source.currentYear);
  const preRetirementGrowthRate = growthRateForScenario(source, "pre");
  const postRetirementGrowthRate = growthRateForScenario(source, "post");
  const partnerPreRetirementGrowthRate  = growthRateForPartnerScenario(source, "pre");
  const partnerPostRetirementGrowthRate = growthRateForPartnerScenario(source, "post");
  const myPensionEnabled = source.myPensionEnabled !== false;
  const partnerDetailsEnabled = source.partnerDetailsEnabled !== false;
  // Partner DC/DB pensions, savings, and income all live behind "Use partner details" —
  // switching that off should zero out every partner input, not just hide the panels.
  const partnerPensionEnabled = partnerDetailsEnabled && Boolean(source.partnerPensionEnabled);
  const effectivePot = myPensionEnabled ? source.currentPot : 0;
  const effectiveCrystallisedPot = myPensionEnabled ? source.currentCrystallisedPot : 0;
  const currentUncrystallisedPot = Math.max(0, effectivePot - effectiveCrystallisedPot);
  const personalMonthlyContribution = myPensionEnabled ? Math.max(0, Number(source.personalMonthlyContribution) || 0) : 0;
  const partnerMonthlyContribution = partnerPensionEnabled ? Math.max(0, Number(source.partnerMonthlyContribution) || 0) : 0;
  // Contributions build up the uncrystallised pot only (new money can't land in an already-crystallised pot).
  const retirementUncrystallisedPot = taperedPreRetirementGrowth(currentUncrystallisedPot, preRetirementGrowthRate, postRetirementGrowthRate, yearsToRetirement, source.taperPreRetirementGrowth, personalMonthlyContribution);
  const retirementCrystallisedPot = taperedPreRetirementGrowth(effectiveCrystallisedPot, preRetirementGrowthRate, postRetirementGrowthRate, yearsToRetirement, source.taperPreRetirementGrowth);

  // Effective equivalent flat rate that produces the same tapered result — investment growth only,
  // excluding contributions, so this stat still reflects the chosen growth-rate assumption.
  let effectivePreRetirementGrowthRate = preRetirementGrowthRate;
  if (source.taperPreRetirementGrowth && yearsToRetirement > 0 && effectivePot > 0) {
    const retirementUncrystallisedPotNoContrib = taperedPreRetirementGrowth(currentUncrystallisedPot, preRetirementGrowthRate, postRetirementGrowthRate, yearsToRetirement, source.taperPreRetirementGrowth);
    const totalStart = effectivePot;
    const totalEnd = retirementUncrystallisedPotNoContrib + retirementCrystallisedPot;
    // Invert monthly-compounding formula: r = ((end/start)^(1/(12*n)) - 1) * 12
    effectivePreRetirementGrowthRate = (Math.pow(totalEnd / totalStart, 1 / (12 * yearsToRetirement)) - 1) * 12;
  }
  const personalSavingsEnabled = source.useSavings !== false;

  // ── Pre-retirement iterative savings simulation ───────────────────────────
  // Run year-by-year so absolute-year events are applied correctly.
  // This simultaneously produces preRetirementRows (for the chart) and the
  // correct savings balances at retirement (fed into the post-retirement loop).
  const preRetirementRows = [];
  let preIsa     = personalSavingsEnabled ? source.personalIsaSavings       : 0;
  let preBank    = personalSavingsEnabled ? source.personalBankSavings      : 0;
  let prePb      = personalSavingsEnabled ? source.personalPremiumBonds     : 0;
  let prePartner = partnerDetailsEnabled  ? source.partnerSavings           : 0;
  const partnerUncrystallisedAtStart = partnerPensionEnabled ? Math.max(0, source.partnerCurrentPot - source.partnerCrystallisedPot) : 0;
  const partnerCrystallisedAtStart   = partnerPensionEnabled ? Math.max(0, source.partnerCrystallisedPot) : 0;

  for (let i = 0; i < yearsToRetirement; i++) {
    const calYear = source.currentYear + i;
    const preAge  = calYear - source.yearOfBirth;

    // Apply growth (skip year 0 — that's the opening balance)
    if (i > 0) {
      const potRate = source.taperPreRetirementGrowth
        ? (preRetirementGrowthRate + (postRetirementGrowthRate - preRetirementGrowthRate) * ((i - 1) / Math.max(1, yearsToRetirement - 1)))
        : preRetirementGrowthRate;
      void potRate; // pot handled separately via taperedPreRetirementGrowth above
      preIsa     *= (1 + (source.personalIsaGrowthRate            || 0));
      preBank    *= (1 + (source.personalBankInterestRate         || 0));
      prePb      *= (1 + (source.personalPremiumBondsGrowthRate   || 0));
      prePartner *= (1 + (source.partnerSavingsGrowthRate         || 0));
      // Premium bonds cap: overflow goes to ISA
      if (prePb > UK_TAX_RULES.premiumBondsLimit) {
        preIsa += prePb - UK_TAX_RULES.premiumBondsLimit;
        prePb   = UK_TAX_RULES.premiumBondsLimit;
      }
    }

    // Apply absolute-year events
    const preEventsThisYear = (source.specialEvents || []).filter((ev) =>
      ev.yearType === "absolute" && Number(ev.year) === calYear
    );
    preEventsThisYear.forEach((ev) => {
      const amount = Math.max(0, Number(ev.amount) || 0);
      if (ev.type === "expense") {
        if (ev.routing === "savings") {
          const used = allocateSavingsWithdrawal(amount, preBank, prePb, preIsa, prePartner);
          preBank    = Math.max(0, preBank    - used.bankSavingsUsed);
          prePb      = Math.max(0, prePb      - used.premiumBondsUsed);
          preIsa     = Math.max(0, preIsa     - used.isaSavingsUsed);
          prePartner = Math.max(0, prePartner - used.partnerSavingsUsed);
        } else {
          // expense from drawdown — doesn't affect savings balances in the chart
        }
      } else {
        if (ev.routing === "savings") {
          preBank += amount;
        }
        // income routed to drawdown doesn't affect savings balances
      }
    });

    // Snapshot the pot value for this year using the tapered formula.
    // Split into uncrystallised/crystallised so contributions only build up the uncrystallised side.
    const prePotSnapshot =
      taperedPreRetirementGrowth(currentUncrystallisedPot, preRetirementGrowthRate, postRetirementGrowthRate, i, source.taperPreRetirementGrowth, personalMonthlyContribution)
      + taperedPreRetirementGrowth(effectiveCrystallisedPot, preRetirementGrowthRate, postRetirementGrowthRate, i, source.taperPreRetirementGrowth);
    const prePartnerPotSnapshot = partnerPensionEnabled
      ? taperedPreRetirementGrowth(partnerUncrystallisedAtStart, partnerPreRetirementGrowthRate, partnerPostRetirementGrowthRate, i, false, partnerMonthlyContribution, Math.min(yearsToPartnerRetirement, i))
        + taperedPreRetirementGrowth(partnerCrystallisedAtStart, partnerPreRetirementGrowthRate, partnerPostRetirementGrowthRate, i, false)
      : 0;

    preRetirementRows.push({
      calendarYear: calYear,
      age: preAge,
      totalPotAfterGrowth: prePotSnapshot,
      partnerPotAfterGrowth: prePartnerPotSnapshot,
      premiumBondsLeft:    prePb,
      isaSavingsLeft:      preIsa,
      bankSavingsLeft:     preBank,
      partnerSavingsLeft:  prePartner,
      eventTitles: preEventsThisYear.map((ev) => ev.title || (ev.type === "expense" ? "Expense" : "Income")),
    });
  }

  // Final savings values at retirement (after all pre-retirement events + growth)
  const personalIsaSavingsAtRetirement     = preIsa;
  const personalBankSavingsAtRetirement    = preBank;
  const personalPremiumBondsAtRetirement   = prePb;
  const partnerSavingsAtRetirement         = prePartner;
  const personalSavingsAtRetirement        = personalIsaSavingsAtRetirement + personalBankSavingsAtRetirement + personalPremiumBondsAtRetirement;
  const totalSeparateSavingsAtRetirement   = personalSavingsAtRetirement + partnerSavingsAtRetirement;
  // Pot value at PERSONAL retirement year using partner's own rates.
  // The post-retirement loop then continues growing it until partner's own retirement year.
  // Contributions (capped to partner's own retirement year) only build up the uncrystallised side.
  const partnerRetirementPot = partnerPensionEnabled
    ? taperedPreRetirementGrowth(partnerUncrystallisedAtStart, partnerPreRetirementGrowthRate, partnerPostRetirementGrowthRate, yearsToRetirement, false, partnerMonthlyContribution, Math.min(yearsToPartnerRetirement, yearsToRetirement))
      + taperedPreRetirementGrowth(partnerCrystallisedAtStart, partnerPreRetirementGrowthRate, partnerPostRetirementGrowthRate, yearsToRetirement, false)
    : 0;
  const remainingLumpSumAllowanceStart = Math.max(0, UK_TAX_RULES.standardLumpSumAllowance - source.lumpSumAllowanceUsed);
  const taxFreeLumpSum = Math.min(retirementUncrystallisedPot * 0.25, remainingLumpSumAllowanceStart);
  const rows = [];
  const maxYears = source.limitPlanYears ? source.planYears : Math.max(source.planYears, 45);
  let uncrystallisedPot = retirementUncrystallisedPot;
  let crystallisedPot = retirementCrystallisedPot;
  let crystallisedToDate = retirementCrystallisedPot;
  let remainingLumpSumAllowance = remainingLumpSumAllowanceStart;
  // Set once, in the purchase year, to whatever tax-free cash was actually available (capped by
  // LSA at that point) — the ongoing annuity income calc below always reads this fixed value,
  // rather than recomputing an LSA-unaware "requested" amount every year.
  let annuityActualTaxFreeCashAtPurchase = 0;
  let isaSavingsBalance = personalIsaSavingsAtRetirement;
  let bankSavingsBalance = personalBankSavingsAtRetirement;
  let premiumBondsBalance = personalPremiumBondsAtRetirement;
  let partnerSavingsBalance = partnerSavingsAtRetirement;
  let savingsBalance = isaSavingsBalance + bankSavingsBalance + premiumBondsBalance + partnerSavingsBalance;
  let partnerPotBalance = partnerRetirementPot;
  let totalBankInterestTax = 0;
  let totalPsaUsed = 0;
  let depletionYear = null;

  for (let yearIndex = 1; yearIndex <= maxYears; yearIndex += 1) {
    const calendarYear = retirementYear + yearIndex - 1;
    const age = source.retirementAge + yearIndex - 1;
    const partnerAge = calendarYear - source.partnerBirthYear;
    const incomeBase = yearIndex <= 10 ? source.incomeRequired : source.incomeAfterYear10;
    const incomeCpiYears = source.incomeValuesRelativeToToday
      ? yearsToRetirement + yearIndex - 1
      : yearIndex <= 10
        ? yearIndex - 1
        : yearIndex - 11;
    const incomeRequired = compoundAnnual(incomeBase, source.cpiRate, incomeCpiYears, source.applyCpiIncome);
    const spendingCpiYears = yearsToRetirement + yearIndex - 1;
    const holidays = compoundAnnual(source.holidaysAnnual, source.cpiRate, spendingCpiYears, source.applyCpiSpending);
    const carCost =
      source.carCost > 0
      && yearIndex >= source.carStartYear
      && (yearIndex - source.carStartYear) % source.carFrequencyYears === 0
        ? compoundAnnual(source.carCost, source.cpiRate, spendingCpiYears, source.applyCpiCar)
        : 0;
    const eventsThisYear = (source.specialEvents || []).filter((ev) =>
      ev.yearType === "relative" ? yearIndex === Number(ev.year) : calendarYear === Number(ev.year)
    );
    const exceptionalExpense = eventsThisYear
      .filter((ev) => ev.type === "expense" && ev.routing !== "savings")
      .reduce((s, ev) => s + Math.max(0, Number(ev.amount) || 0), 0);
    const exceptionalNonTaxableIncome = eventsThisYear
      .filter((ev) => ev.type === "income" && !ev.taxable && ev.routing !== "savings")
      .reduce((s, ev) => s + Math.max(0, Number(ev.amount) || 0), 0);
    const exceptionalTaxableIncome = eventsThisYear
      .filter((ev) => ev.type === "income" && ev.taxable && ev.routing !== "savings")
      .reduce((s, ev) => s + Math.max(0, Number(ev.amount) || 0), 0);
    const exceptionalSavingsIncome = eventsThisYear
      .filter((ev) => ev.type === "income" && ev.routing === "savings")
      .reduce((s, ev) => s + Math.max(0, Number(ev.amount) || 0), 0);
    const exceptionalSavingsExpense = eventsThisYear
      .filter((ev) => ev.type === "expense" && ev.routing === "savings")
      .reduce((s, ev) => s + Math.max(0, Number(ev.amount) || 0), 0);
    // If "use savings for car" is on, draw car cost from personal savings first
    // (Premium Bonds → ISA → Bank — most tax-efficient order), remainder falls to income
    const carFromSavingsAlloc = source.useSavingsForCar && carCost > 0
      ? (() => {
          const pbAvail  = premiumBondsBalance;
          const isaAvail = isaSavingsBalance;
          const bkAvail  = bankSavingsBalance;
          let rem = carCost;
          const fromPb  = Math.min(pbAvail,  rem); rem -= fromPb;
          const fromIsa = Math.min(isaAvail, rem); rem -= fromIsa;
          const fromBk  = Math.min(bkAvail,  rem); rem -= fromBk;
          return { fromPb, fromIsa, fromBk, carCoveredBySavings: carCost - rem };
        })()
      : { fromPb: 0, fromIsa: 0, fromBk: 0, carCoveredBySavings: 0 };
    const carCostViaIncome = carCost - carFromSavingsAlloc.carCoveredBySavings;
    const totalIncomeRequired = incomeRequired + carCostViaIncome + exceptionalExpense;

    const partnerWorkIncome =
      partnerDetailsEnabled && partnerAge < source.partnerRetirementAge
        ? compoundAnnual(source.partnerWorkIncome, source.partnerWorkCpiRate, yearIndex, source.partnerWorkApplyCpi)
        : 0;
    const statePensionCpiYears = yearsToRetirement + yearIndex - 1;
    const statePensionBase = compoundAnnual(source.statePension, source.statePensionGrowthRate, statePensionCpiYears, true);
    const partnerStatePension =
      partnerDetailsEnabled && partnerAge > 67
        ? statePensionBase * (source.partnerStatePensionPct / 100)
        : 0;
    const ownStatePension =
      age > 67
        ? statePensionBase * (source.myStatePensionPct / 100)
        : 0;
    const definedBenefitYearIndex = calendarYear - source.definedBenefitStartYear;
    const definedBenefitIncome =
      source.definedBenefitEnabled
      && definedBenefitYearIndex >= 0
      && definedBenefitYearIndex < Math.max(0, Number(source.definedBenefitMaxYears) || 0)
        ? compoundAnnual(source.definedBenefitInitialAnnualAmount, source.definedBenefitGrowthRate, definedBenefitYearIndex, true)
        : 0;
    const definedBenefitLumpSum =
      source.definedBenefitEnabled && calendarYear === source.definedBenefitStartYear
        ? Math.min(Math.max(0, source.definedBenefitInitialLumpSum), remainingLumpSumAllowance)
        : 0;
    const lumpSumAllowanceAfterDefinedBenefitOnly = Math.max(0, remainingLumpSumAllowance - definedBenefitLumpSum);

    const partnerDBYearIndex = calendarYear - source.partnerDefinedBenefitStartYear;
    const partnerDefinedBenefitIncome = partnerDetailsEnabled && source.partnerDBEnabled
      && partnerDBYearIndex >= 0
      && partnerDBYearIndex < Math.max(0, Number(source.partnerDefinedBenefitMaxYears) || 0)
        ? compoundAnnual(source.partnerDefinedBenefitInitialAnnualAmount, source.partnerDefinedBenefitGrowthRate, partnerDBYearIndex, true)
        : 0;
    const partnerDefinedBenefitLumpSum = partnerDetailsEnabled && source.partnerDBEnabled && calendarYear === source.partnerDefinedBenefitStartYear
      ? Math.max(0, source.partnerDefinedBenefitInitialLumpSum)
      : 0;
    // Annuity: single-life, no guarantee period — pays every year from the purchase year
    // to plan end (there's no mortality model, so "until death" just means "for the rest
    // of the plan"), unlike DB income which is capped by a max-years term.
    // Buying it crystallises the purchase amount: up to 25% can be taken as tax-free cash
    // (capped by remaining LSA), and only the remainder actually funds the annuity income.
    const annuityYearsSincePurchase = calendarYear - source.annuityPurchaseYear;
    const annuityEscalationRate = source.annuityEscalationType === "fixed"
      ? source.annuityFixedEscalationRate
      : source.annuityEscalationType === "indexLinked"
        ? source.cpiRate
        : 0;
    const annuityPurchaseThisYear = source.annuityEnabled && calendarYear === source.annuityPurchaseYear
      ? Math.min(uncrystallisedPot, source.annuityCost)
      : 0;
    // Actual tax-free cash paid at purchase, capped by what's really available: the requested
    // amount, 25% of the amount actually crystallised (in case the pot couldn't cover the full
    // request), and whatever LSA is left after the DB lump sum.
    const annuityTaxFreeCash = source.annuityEnabled && calendarYear === source.annuityPurchaseYear
      ? Math.min(
          Math.max(0, Number(source.annuityTaxFreeCashTaken) || 0),
          annuityPurchaseThisYear * 0.25,
          lumpSumAllowanceAfterDefinedBenefitOnly,
        )
      : 0;
    const lumpSumAllowanceAfterDefinedBenefit = Math.max(0, lumpSumAllowanceAfterDefinedBenefitOnly - annuityTaxFreeCash);
    // Remember the actual (LSA-clamped) tax-free cash from the purchase year so every
    // subsequent year's income calc uses the true funded amount, not a recomputed guess.
    if (calendarYear === source.annuityPurchaseYear) {
      annuityActualTaxFreeCashAtPurchase = annuityTaxFreeCash;
    }
    const annuityIncome = source.annuityEnabled && annuityYearsSincePurchase >= 0
      ? compoundAnnual((source.annuityCost - annuityActualTaxFreeCashAtPurchase) * source.annuityRate, annuityEscalationRate, annuityYearsSincePurchase, true)
      : 0;
    const partnerHasRetired = partnerPensionEnabled && calendarYear >= partnerRetirementYear;
    // Income available from all sources except DC pension pots
    const baseIncomeExcDCPots = partnerWorkIncome + partnerStatePension
      + ownStatePension + definedBenefitIncome + exceptionalTaxableIncome
      + exceptionalNonTaxableIncome + annuityIncome
      + partnerDefinedBenefitIncome + partnerDefinedBenefitLumpSum;
    const totalShortfallExcDCPots = Math.max(0, totalIncomeRequired - baseIncomeExcDCPots - definedBenefitLumpSum - annuityTaxFreeCash);
    const partnerPotPreDrawdown = partnerPotBalance; // opening balance (used for chart peak alignment)
    // Proportional drawdown: when both DC pots are in drawdown, each pot takes a share of the
    // income shortfall proportional to its size relative to the combined pots. The larger pot
    // absorbs more of the burden. The personal pot covers the remaining share via pensionNeededGross.
    const effectivePersonalPot = myPensionEnabled ? Math.max(0, uncrystallisedPot + crystallisedPot) : 0;
    const combinedDCPots = effectivePersonalPot + (partnerHasRetired ? partnerPotBalance : 0);
    const partnerDCFraction = partnerHasRetired && combinedDCPots > 0 ? partnerPotBalance / combinedDCPots : 0;
    const partnerPotDrawdown = partnerHasRetired && partnerPotBalance > 0
      ? Math.min(partnerPotBalance, totalShortfallExcDCPots * partnerDCFraction)
      : 0;

    const partnerIncome = partnerWorkIncome;
    const myOtherIncome = ownStatePension + definedBenefitIncome + annuityIncome + exceptionalTaxableIncome;
    const regularDrawdown =
      source.regularDrawdownEnabled && yearIndex <= source.regularDrawdownYears
        ? source.regularDrawdownAmount
        : 0;
    const baseIncomeTotal = partnerWorkIncome + partnerStatePension + myOtherIncome + exceptionalNonTaxableIncome + partnerPotDrawdown + partnerDefinedBenefitIncome + partnerDefinedBenefitLumpSum;
    const pensionNeededGross = Math.max(0, totalIncomeRequired - baseIncomeTotal - definedBenefitLumpSum - annuityTaxFreeCash);
    const allowanceBase = compoundAnnual(UK_TAX_RULES.personalAllowance, source.taxAllowanceCpiRate, yearIndex, source.applyTaxAllowanceCpi);
    const taxRules = taxRulesForYear(source, calendarYear);
    const isaInterestGross = isaSavingsBalance * source.personalIsaGrowthRate;
    const bankInterestGross = bankSavingsBalance * source.personalBankInterestRate;
    const premiumBondsGrowth = premiumBondsBalance * source.personalPremiumBondsGrowthRate;

    const fullYearOneTaxFreeCash = Math.min(lumpSumAllowanceAfterDefinedBenefit, uncrystallisedPot * 0.25);
    const forcedTaxFreeCash = yearIndex === 1 && source.take25PercentYear1
      ? source.yearOneTflsMode === "defined"
        ? Math.min(source.yearOneTflsAmount, fullYearOneTaxFreeCash)
        : fullYearOneTaxFreeCash
      : 0;

    const taxFreeCashCapacity = Math.min(lumpSumAllowanceAfterDefinedBenefit, uncrystallisedPot * 0.25);
    const yearsToAge75 = Math.max(1, 75 - age + 1);
    const tflsBy75Target = source.useTflsBy75 && age <= 75
      ? Math.min(
        Math.max(0, taxFreeCashCapacity - forcedTaxFreeCash),
        Math.max(0, (lumpSumAllowanceAfterDefinedBenefit - forcedTaxFreeCash) / yearsToAge75),
      )
      : 0;
    const basicRateMaximisedWithdrawal = source.maximiseBasicRateDrawdown
      ? Math.max(0, taxRules.basicRateLimit - myOtherIncome - bankInterestGross)
      : 0;
    const basicRateMaximisedTaxFreeCash = source.maximiseBasicRateDrawdown
      ? Math.min(
        Math.max(0, taxFreeCashCapacity - forcedTaxFreeCash),
        basicRateMaximisedWithdrawal / 3,
      )
      : 0;
    const tflsBy75DrawdownTarget = source.maximiseBasicRateDrawdown && source.forceTflsTaxablePairing
      ? Math.min(tflsBy75Target, basicRateMaximisedTaxFreeCash)
      : tflsBy75Target;
    const sto = source.savingsTaxOptimisation ?? "my";
    const usePartnerSavings = partnerDetailsEnabled && (sto === "partner" || sto === "balanced");
    const useMySavings = sto === "my" || sto === "balanced";
    const mySavingsTotal = bankSavingsBalance + premiumBondsBalance + isaSavingsBalance;
    const mySavingsGrowthRate = mySavingsTotal > 0
      ? (bankSavingsBalance * (source.personalSavingsGrowthRate || 0)
        + premiumBondsBalance * (source.personalSavingsGrowthRate || 0)
        + isaSavingsBalance * (source.personalIsaGrowthRate || 0)) / mySavingsTotal
      : 0;
    const partnerSavingsAvailableForTaxOptimisation = usePartnerSavings
      ? (yearIndex <= 15 ? partnerSavingsBalance * 0.05 : partnerSavingsBalance)
      : 0;
    const mySavingsAvailableForTaxOptimisation = useMySavings
      ? (yearIndex <= 15 ? mySavingsTotal * 0.05 : mySavingsTotal)
      : 0;
    const remainingPlanYears = Math.max(1, maxYears - yearIndex + 1);
    const plannedPartnerSavingsForTaxOptimisation = usePartnerSavings
      ? Math.min(
        partnerSavingsAvailableForTaxOptimisation,
        amortisingWithdrawal(partnerSavingsBalance, source.partnerSavingsGrowthRate, remainingPlanYears),
        pensionNeededGross,
      )
      : 0;
    const plannedMySavingsForTaxOptimisation = useMySavings
      ? Math.min(
        mySavingsAvailableForTaxOptimisation,
        amortisingWithdrawal(mySavingsTotal, mySavingsGrowthRate, remainingPlanYears),
        pensionNeededGross,
      )
      : 0;
    const plannedEarlySavingsForTaxOptimisation = plannedMySavingsForTaxOptimisation + plannedPartnerSavingsForTaxOptimisation;
    const savingsAvailableForTaxOptimisation = mySavingsAvailableForTaxOptimisation + partnerSavingsAvailableForTaxOptimisation;
    const taxOptimisedWithdrawal = source.taxOptimisationMode
      ? calculateTaxOptimisedWithdrawal({
        targetGrossIncome: Math.max(Math.max(0, pensionNeededGross - forcedTaxFreeCash), regularDrawdown),
        myOtherIncome,
        expectedBankInterest: bankInterestGross,
        taxFreeCashCapacity: Math.max(0, taxFreeCashCapacity - forcedTaxFreeCash),
        minimumTaxFreeCash: tflsBy75DrawdownTarget,
        earlySavingsAvailable: plannedEarlySavingsForTaxOptimisation,
        savingsAvailable: savingsAvailableForTaxOptimisation,
        crystallisedPot: crystallisedPot + (forcedTaxFreeCash * 3),
        uncrystallisedPot: Math.max(0, uncrystallisedPot - forcedTaxFreeCash * 4),
        forceTflsTaxablePairing: source.forceTflsTaxablePairing,
        taxRules,
      })
      : null;
    const taxFreeCashEnabled = source.taxOptimisationMode || source.regularDrawdownEnabled || source.useTflsBy75 || source.maximiseBasicRateDrawdown || (yearIndex === 1 && source.take25PercentYear1);
    const preferredTaxFreeCash = forcedTaxFreeCash
      + (source.taxOptimisationMode
        ? Math.max(taxOptimisedWithdrawal.taxFreeCash, basicRateMaximisedTaxFreeCash)
        : source.regularDrawdownEnabled
          ? Math.max(regularDrawdown, tflsBy75DrawdownTarget, basicRateMaximisedTaxFreeCash)
          : source.useTflsBy75
            ? Math.max(tflsBy75DrawdownTarget, basicRateMaximisedTaxFreeCash)
          : basicRateMaximisedTaxFreeCash);
    const taxFreeCashTaken = taxFreeCashEnabled
      ? Math.min(taxFreeCashCapacity, preferredTaxFreeCash)
      : 0;

    let designatedForTaxFree = Math.min(uncrystallisedPot, taxFreeCashTaken * 4);
    let taxFreeCashActual = normaliseMoney(Math.min(taxFreeCashTaken, lumpSumAllowanceAfterDefinedBenefit, designatedForTaxFree * 0.25));
    let newCrystallisedFromTaxFree = designatedForTaxFree - taxFreeCashActual;

    const taxableCapacityBeforeExtra = crystallisedPot + newCrystallisedFromTaxFree;
    const plannedTaxableWithdrawal = source.taxOptimisationMode
      ? taxOptimisedWithdrawal.taxableWithdrawal
      : Math.max(0, pensionNeededGross - taxFreeCashActual);
    const targetTaxableWithdrawal = Math.max(plannedTaxableWithdrawal, basicRateMaximisedWithdrawal);
    let extraDesignationForTaxable = Math.min(
      Math.max(0, targetTaxableWithdrawal - taxableCapacityBeforeExtra),
      Math.max(0, uncrystallisedPot - designatedForTaxFree),
    );

    const availableTaxableCapacity = taxableCapacityBeforeExtra + extraDesignationForTaxable;
    let additionalTaxableWithdrawal = Math.min(targetTaxableWithdrawal, availableTaxableCapacity);
    let totalTaxableWithdrawal = additionalTaxableWithdrawal;
    let myTaxableIncome = myOtherIncome + totalTaxableWithdrawal;
    let {
      taxBreakdown,
      bankInterestTaxBreakdown,
      estimatedTax,
    } = estimateTotalTaxWithBankInterest(myTaxableIncome, bankInterestGross, allowanceBase, taxRules);
    const householdBills = compoundAnnual(source.billsAnnual, source.cpiRate, spendingCpiYears, source.applyCpiSpending);
    const plannedSavingsUse = source.taxOptimisationMode
      ? Math.min(savingsAvailableForTaxOptimisation, taxOptimisedWithdrawal.savingsUsed)
      : 0;
    const taxableWithdrawalAbovePlan = Math.max(0, totalTaxableWithdrawal - plannedTaxableWithdrawal);
    let sourcedFromSavings = Math.max(0, plannedSavingsUse - taxableWithdrawalAbovePlan);
    const partnerSavingsUsedForTaxSmoothing = source.taxOptimisationMode
      ? Math.min(partnerSavingsAvailableForTaxOptimisation, taxOptimisedWithdrawal.earlySavingsUsed, sourcedFromSavings)
      : 0;
    const savingsAllocation = allocateSavingsWithdrawal(
      Math.max(0, sourcedFromSavings - partnerSavingsUsedForTaxSmoothing),
      bankSavingsBalance,
      premiumBondsBalance,
      isaSavingsBalance,
      Math.max(0, partnerSavingsAvailableForTaxOptimisation - partnerSavingsUsedForTaxSmoothing),
    );
    savingsAllocation.partnerSavingsUsed += partnerSavingsUsedForTaxSmoothing;
    // Add car-from-savings deductions into the allocation so balances and chart bars reflect it
    savingsAllocation.premiumBondsUsed += carFromSavingsAlloc.fromPb;
    savingsAllocation.isaSavingsUsed   += carFromSavingsAlloc.fromIsa;
    savingsAllocation.bankSavingsUsed  += carFromSavingsAlloc.fromBk;
    sourcedFromSavings += carFromSavingsAlloc.carCoveredBySavings;
    let incomeTotal = baseIncomeTotal + definedBenefitLumpSum + annuityTaxFreeCash + taxFreeCashActual;
    let incomeCovered = incomeTotal + totalTaxableWithdrawal + sourcedFromSavings;
    let taxFreeCashExemptFromPairing = Math.min(taxFreeCashActual, forcedTaxFreeCash);

    const updateTaxAndIncomeAfterTaxableChange = () => {
      myTaxableIncome = myOtherIncome + totalTaxableWithdrawal;
      ({
        taxBreakdown,
        bankInterestTaxBreakdown,
        estimatedTax,
      } = estimateTotalTaxWithBankInterest(myTaxableIncome, bankInterestGross, allowanceBase, taxRules));
      incomeCovered = incomeTotal + totalTaxableWithdrawal + sourcedFromSavings;
    };

    const enforceTflsTaxablePairing = () => {
      if (!source.forceTflsTaxablePairing || taxFreeCashActual <= 0) {
        return;
      }
      const pairedTaxFreeCash = Math.max(0, taxFreeCashActual - taxFreeCashExemptFromPairing);
      if (pairedTaxFreeCash <= 0.01) {
        return;
      }
      const pairedTaxableTarget = pairedTaxFreeCash * 3;
      const taxableShortfall = Math.max(0, pairedTaxableTarget - totalTaxableWithdrawal);
      if (taxableShortfall <= 0.01) {
        return;
      }

      const remainingCrystallisedCapacity = Math.max(
        0,
        crystallisedPot + newCrystallisedFromTaxFree + extraDesignationForTaxable - totalTaxableWithdrawal,
      );
      const remainingUncrystallisedCapacity = Math.max(0, uncrystallisedPot - designatedForTaxFree - extraDesignationForTaxable);
      const taxableWithdrawalTopUp = Math.min(taxableShortfall, remainingCrystallisedCapacity + remainingUncrystallisedCapacity);
      const extraCrystallisedNeeded = Math.max(0, taxableWithdrawalTopUp - remainingCrystallisedCapacity);
      extraDesignationForTaxable += Math.min(extraCrystallisedNeeded, remainingUncrystallisedCapacity);
      additionalTaxableWithdrawal += taxableWithdrawalTopUp;
      totalTaxableWithdrawal += taxableWithdrawalTopUp;
      updateTaxAndIncomeAfterTaxableChange();
    };

    enforceTflsTaxablePairing();

    const addSavingsTopUp = (amount) => {
      const topUpAllocation = allocateSavingsWithdrawal(
        amount,
        Math.max(0, bankSavingsBalance - savingsAllocation.bankSavingsUsed),
        Math.max(0, premiumBondsBalance - savingsAllocation.premiumBondsUsed),
        Math.max(0, isaSavingsBalance - savingsAllocation.isaSavingsUsed),
        Math.max(0, partnerSavingsAvailableForTaxOptimisation - savingsAllocation.partnerSavingsUsed),
      );
      const topUpUsed = topUpAllocation.bankSavingsUsed
        + topUpAllocation.premiumBondsUsed
        + topUpAllocation.isaSavingsUsed
        + topUpAllocation.partnerSavingsUsed;
      savingsAllocation.bankSavingsUsed += topUpAllocation.bankSavingsUsed;
      savingsAllocation.premiumBondsUsed += topUpAllocation.premiumBondsUsed;
      savingsAllocation.isaSavingsUsed += topUpAllocation.isaSavingsUsed;
      savingsAllocation.partnerSavingsUsed += topUpAllocation.partnerSavingsUsed;
      sourcedFromSavings += topUpUsed;
      incomeCovered += topUpUsed;
      return topUpUsed;
    };

    let freeCashDeficit = Math.max(0, householdBills + holidays + estimatedTax - incomeCovered);
    if (freeCashDeficit > 0.01) {
      const extraTaxFreeCash = Math.min(
        freeCashDeficit,
        source.forceTflsTaxablePairing ? freeCashDeficit / 4 : Number.POSITIVE_INFINITY,
        Math.max(0, lumpSumAllowanceAfterDefinedBenefit - taxFreeCashActual),
        Math.max(0, uncrystallisedPot - designatedForTaxFree - extraDesignationForTaxable) * 0.25,
      );
      if (extraTaxFreeCash > 0) {
        const extraDesignatedForTaxFree = extraTaxFreeCash * 4;
        designatedForTaxFree += extraDesignatedForTaxFree;
        taxFreeCashActual += extraTaxFreeCash;
        newCrystallisedFromTaxFree += extraTaxFreeCash * 3;
        incomeTotal += extraTaxFreeCash;
        incomeCovered += extraTaxFreeCash;
        freeCashDeficit -= extraTaxFreeCash;
        enforceTflsTaxablePairing();
      }
    }

    if (freeCashDeficit > 0.01) {
      freeCashDeficit -= addSavingsTopUp(freeCashDeficit);
    }

    if (freeCashDeficit > 0.01) {
      const remainingCrystallisedCapacity = Math.max(
        0,
        crystallisedPot + newCrystallisedFromTaxFree + extraDesignationForTaxable - totalTaxableWithdrawal,
      );
      const remainingUncrystallisedCapacity = Math.max(0, uncrystallisedPot - designatedForTaxFree - extraDesignationForTaxable);
      const taxableWithdrawalTopUp = solveAdditionalTaxableWithdrawalWithBankInterest(
        myTaxableIncome,
        bankInterestGross,
        freeCashDeficit,
        allowanceBase,
        remainingCrystallisedCapacity + remainingUncrystallisedCapacity,
        taxRules,
      );
      const extraCrystallisedNeeded = Math.max(0, taxableWithdrawalTopUp - remainingCrystallisedCapacity);
      extraDesignationForTaxable += Math.min(extraCrystallisedNeeded, remainingUncrystallisedCapacity);
      additionalTaxableWithdrawal += taxableWithdrawalTopUp;
      totalTaxableWithdrawal += taxableWithdrawalTopUp;
      updateTaxAndIncomeAfterTaxableChange();
    }

    totalBankInterestTax += bankInterestTaxBreakdown.bankInterestTax;
    totalPsaUsed += Math.min(bankInterestTaxBreakdown.bankInterestGross, bankInterestTaxBreakdown.personalSavingsAllowance);
    const taxableAfterTax = Math.max(0, myTaxableIncome - taxBreakdown.totalTax - myOtherIncome);
    const incomeShortfall = Math.max(0, totalIncomeRequired - incomeCovered);
    const excessNet = incomeCovered - estimatedTax - householdBills - holidays;
    const incomeCoveredReconciled = excessNet + estimatedTax + householdBills + holidays;

    const totalDesignated = designatedForTaxFree + extraDesignationForTaxable;
    const crystallisedToDateCurrent = crystallisedToDate + designatedForTaxFree + annuityPurchaseThisYear;
    const openingPot = uncrystallisedPot + crystallisedPot;
    const openingUncrystallisedPot = uncrystallisedPot;
    const openingCrystallisedFund = crystallisedPot;
    const openingIsaSavings = isaSavingsBalance;
    const openingBankSavings = bankSavingsBalance;
    const openingPremiumBonds = premiumBondsBalance;
    const openingPartnerSavings = partnerSavingsBalance;
    const uncrystallisedBeforeGrowth = Math.max(0, uncrystallisedPot - totalDesignated - annuityPurchaseThisYear);
    const crystallisedBeforeGrowth = Math.max(0, crystallisedPot + newCrystallisedFromTaxFree + extraDesignationForTaxable - totalTaxableWithdrawal);
    const totalWithdrawn = taxFreeCashActual + totalTaxableWithdrawal + annuityPurchaseThisYear;
    const totalPotBeforeGrowth = Math.max(0, openingPot - totalWithdrawn);

    const uncrystallisedAfterGrowth = source.applyPotGrowth
      ? compoundAnnual(uncrystallisedBeforeGrowth, postRetirementGrowthRate, 1, true)
      : uncrystallisedBeforeGrowth;
    const crystallisedAfterGrowth = source.applyPotGrowth
      ? compoundAnnual(crystallisedBeforeGrowth, postRetirementGrowthRate, 1, true)
      : crystallisedBeforeGrowth;
    const totalPotAfterGrowth = uncrystallisedAfterGrowth + crystallisedAfterGrowth;
    const growth = totalPotAfterGrowth - totalPotBeforeGrowth;
    const potChange = growth - totalWithdrawn;

    remainingLumpSumAllowance = Math.max(0, remainingLumpSumAllowance - definedBenefitLumpSum - annuityTaxFreeCash - taxFreeCashActual);
    bankSavingsBalance = Math.max(0, bankSavingsBalance + bankInterestGross - bankInterestTaxBreakdown.bankInterestTax - savingsAllocation.bankSavingsUsed);
    const premiumBondsBeforeLimit = Math.max(0, premiumBondsBalance + premiumBondsGrowth - savingsAllocation.premiumBondsUsed);
    const premiumBondsMovedToIsa = Math.max(0, premiumBondsBeforeLimit - UK_TAX_RULES.premiumBondsLimit);
    premiumBondsBalance = Math.min(premiumBondsBeforeLimit, UK_TAX_RULES.premiumBondsLimit);
    isaSavingsBalance = Math.max(0, isaSavingsBalance + isaInterestGross + premiumBondsMovedToIsa - savingsAllocation.isaSavingsUsed);
    partnerSavingsBalance = Math.max(0, partnerSavingsBalance + (partnerSavingsBalance * source.partnerSavingsGrowthRate) - savingsAllocation.partnerSavingsUsed);
    bankSavingsBalance = Math.max(0, bankSavingsBalance + exceptionalSavingsIncome);
    if (exceptionalSavingsExpense > 0) {
      const savingsExpAlloc = allocateSavingsWithdrawal(exceptionalSavingsExpense, bankSavingsBalance, premiumBondsBalance, isaSavingsBalance, partnerSavingsBalance);
      bankSavingsBalance = Math.max(0, bankSavingsBalance - savingsExpAlloc.bankSavingsUsed);
      premiumBondsBalance = Math.max(0, premiumBondsBalance - savingsExpAlloc.premiumBondsUsed);
      isaSavingsBalance = Math.max(0, isaSavingsBalance - savingsExpAlloc.isaSavingsUsed);
      partnerSavingsBalance = Math.max(0, partnerSavingsBalance - savingsExpAlloc.partnerSavingsUsed);
    }
    savingsBalance = bankSavingsBalance + premiumBondsBalance + isaSavingsBalance + partnerSavingsBalance;
    if (partnerHasRetired) {
      partnerPotBalance = Math.max(0, (partnerPotBalance - partnerPotDrawdown) * (1 + (source.applyPotGrowth ? partnerPostRetirementGrowthRate : 0)));
    } else {
      partnerPotBalance = partnerPotBalance * (1 + (source.applyPotGrowth ? partnerPreRetirementGrowthRate : 0)) + partnerMonthlyContribution * 12;
    }
    // For the partner retirement year, show the opening (pre-drawdown) balance in the chart
    // so the visual peak aligns with the "Partner retires" marker rather than the year before.
    const partnerPotForChart = calendarYear === partnerRetirementYear ? partnerPotPreDrawdown : partnerPotBalance;

    if (depletionYear === null && totalPotAfterGrowth < 0.01) {
      depletionYear = { calendarYear, age, yearIndex };
    }

    rows.push({
      yearIndex,
      calendarYear,
      age,
      incomeRequired,
      holidays,
      carCost,
      totalIncomeRequired,
      partnerIncome,
      partnerStatePension,
      myOtherIncome,
      incomeTotal,
      incomeCovered: incomeCoveredReconciled,
      incomeShortfall,
      ownStatePension,
      definedBenefitIncome,
      definedBenefitLumpSum,
      annuityIncome,
      annuityTaxFreeCash,
      pensionNeededGross,
      regularDrawdown,
      taxFreeCash: taxFreeCashActual,
      tflsBy75Target,
      sourcedFromSavings,
      carCoveredBySavings: carFromSavingsAlloc.carCoveredBySavings,
      bankSavingsUsed: savingsAllocation.bankSavingsUsed,
      premiumBondsUsed: savingsAllocation.premiumBondsUsed,
      isaSavingsUsed: savingsAllocation.isaSavingsUsed,
      partnerSavingsUsed: savingsAllocation.partnerSavingsUsed,
      isaInterestGross,
      bankInterestGross: bankInterestTaxBreakdown.bankInterestGross,
      premiumBondsGrowth,
      premiumBondsMovedToIsa,
      savingsIncomeForPsa: bankInterestTaxBreakdown.savingsIncomeForPsa,
      personalSavingsAllowance: bankInterestTaxBreakdown.personalSavingsAllowance,
      personalSavingsAllowanceUsed: Math.min(bankInterestTaxBreakdown.bankInterestGross, bankInterestTaxBreakdown.personalSavingsAllowance),
      bankInterestTaxable: bankInterestTaxBreakdown.bankInterestTaxable,
      bankInterestTax: bankInterestTaxBreakdown.bankInterestTax,
      psaProtectedTaxableWithdrawalLimit: taxOptimisedWithdrawal?.psaProtectedBasicRateLimit ?? Math.max(0, taxRules.basicRateLimit - myOtherIncome - bankInterestGross),
      partnerSavingsIncludedInOptimisation: usePartnerSavings ? 1 : 0,
      partnerSavingsOptimisationLimit: partnerSavingsAvailableForTaxOptimisation,
      partnerSavingsPlannedUse: plannedPartnerSavingsForTaxOptimisation,
      grossPensionWithdrawal: totalTaxableWithdrawal,
      taxableFromNewTflsCrystallisation: taxOptimisedWithdrawal?.taxableFromNewTflsCrystallisation ?? 0,
      taxableWithdrawal: totalTaxableWithdrawal,
      additionalTaxableWithdrawal,
      taxableAfterTax,
      estimatedTax,
      openingPot,
      taxableIncomeBeforeAllowance: myTaxableIncome,
      assumedTaxAllowance: taxBreakdown.personalAllowance,
      personalAllowanceUsed: taxBreakdown.personalAllowanceUsed,
      taxedAmount: taxBreakdown.taxableIncome,
      basicRateTaxable: taxBreakdown.basicTaxable,
      higherRateTaxable: taxBreakdown.higherTaxable,
      additionalRateTaxable: taxBreakdown.additionalTaxable,
      basicRateTax: taxBreakdown.basicRateTax,
      higherRateTax: taxBreakdown.higherRateTax,
      additionalRateTax: taxBreakdown.additionalRateTax,
      effectiveTaxRate: taxBreakdown.effectiveTaxRate,
      marginalTaxRate: taxBreakdown.marginalTaxRate,
      householdBills,
      excessNet,
      openingUncrystallisedPot,
      openingCrystallisedFund,
      openingIsaSavings,
      openingBankSavings,
      openingPremiumBonds,
      openingPartnerSavings,
      uncrystallisedPot: uncrystallisedAfterGrowth,
      crystallisedPot: crystallisedToDateCurrent,
      crystallisedFundLeft: crystallisedAfterGrowth,
      newlyCrystallised: designatedForTaxFree,
      totalPotBeforeGrowth,
      totalPotAfterGrowth,
      partnerPotAfterGrowth: partnerPotForChart,
      partnerPotDrawdown,
      partnerDefinedBenefitIncome,
      partnerDefinedBenefitLumpSum,
      growth,
      withdrawalsTaken: totalWithdrawn,
      potChange,
      remainingLumpSumAllowance,
      savingsLeft: savingsBalance,
      isaSavingsLeft: isaSavingsBalance,
      bankSavingsLeft: bankSavingsBalance,
      premiumBondsLeft: premiumBondsBalance,
      partnerSavingsLeft: partnerSavingsBalance,
      taxableDrawdownDesignated: extraDesignationForTaxable,
      exceptionalExpense,
      exceptionalNonTaxableIncome,
      exceptionalTaxableIncome,
      exceptionalSavingsIncome,
      exceptionalSavingsExpense,
      eventTitles: eventsThisYear.map((ev) => ev.title || (ev.type === "expense" ? "Expense" : "Income")),
    });

    uncrystallisedPot = uncrystallisedAfterGrowth;
    crystallisedPot = crystallisedAfterGrowth;
    crystallisedToDate = crystallisedToDateCurrent;

    if (!source.limitPlanYears && totalPotAfterGrowth < 0.01 && yearIndex > 1) {
      break;
    }
  }

  const endRow = rows[rows.length - 1];
  return {
    rows,
    preRetirementRows,
    birthYear,
    retirementYear,
    yearsToRetirement,
    preRetirementGrowthRate,
    postRetirementGrowthRate,
    retirementUncrystallisedPot,
    retirementCrystallisedPot,
    totalRetirementPot: retirementUncrystallisedPot + retirementCrystallisedPot,
    personalSavingsAtRetirement,
    personalIsaSavingsAtRetirement,
    personalBankSavingsAtRetirement,
    personalPremiumBondsAtRetirement,
    partnerSavingsAtRetirement,
    totalSeparateSavingsAtRetirement,
    totalBankInterestTax,
    totalPsaUsed,
    taxFreeLumpSum,
    remainingLumpSumAllowanceStart,
    depletionYear,
    planEndYear: endRow?.calendarYear ?? retirementYear,
    planEndAge: endRow?.age ?? source.retirementAge,
    taperPreRetirementGrowth: Boolean(source.taperPreRetirementGrowth),
    effectivePreRetirementGrowthRate,
    partnerRetirementYear: source.partnerDetailsEnabled !== false ? partnerRetirementYear : null,
  };
}

function render() {
  applyUiState();
  syncForm();
  const projection = calculateProjection(state);
  renderSummary(projection);
  renderCustomFieldChooser();
  renderTable(projection);
  renderChart(projection);
  scheduleChartRedraw(projection);
  saveState();
  syncOptimiserPlan();
}

function renderProjectionOnly() {
  const projection = calculateProjection(state);
  renderSummary(projection);
  renderCustomFieldChooser();
  renderTable(projection);
  renderChart(projection);
  scheduleChartRedraw(projection);
  saveState();
  syncOptimiserPlan();
}

function scheduleChartRedraw(projection) {
  if (deferredChartRender) cancelAnimationFrame(deferredChartRender);
  deferredChartRender = requestAnimationFrame(() => {
    deferredChartRender = null;
    if (activeAppView === "forecaster") renderChart(projection);
  });
}

function setAppView(view) {
  activeAppView = view === "optimiser" ? "optimiser" : "forecaster";
  const index = activeAppView === "optimiser" ? 1 : 0;
  if (appViewsTrack) {
    appViewsTrack.style.transform = `translateX(calc(${-index * 100}% - ${index * 40}px))`;
  }
  appViewButtons.forEach((button) => {
    const isActive = button.dataset.appView === activeAppView;
    button.classList.toggle("app-view-button-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
  document.body.dataset.appView = activeAppView;
  syncOptimiserTheme();
  syncOptimiserPlan();
}

function getOptimiserThemePayload() {
  const rootStyle = getComputedStyle(document.documentElement);
  const bodyStyle = getComputedStyle(document.body);
  const vars = {};
  OPTIMISER_THEME_VARS.forEach((name) => {
    const value = bodyStyle.getPropertyValue(name).trim() || rootStyle.getPropertyValue(name).trim();
    if (value) vars[name] = value;
  });
  return {
    theme: document.documentElement.getAttribute("data-theme") || "metallic",
    vars,
    bodyFontFamily: bodyStyle.fontFamily,
    bodyBackgroundColor: bodyStyle.backgroundColor,
  };
}

function syncOptimiserTheme() {
  if (!optimiserFrame?.contentWindow || !optimiserFrameReady) return;
  const targetOrigin = window.location.protocol === "file:" ? "*" : window.location.origin;
  optimiserFrame.contentWindow.postMessage({
    type: "pension-forecaster-theme",
    payload: getOptimiserThemePayload(),
  }, targetOrigin);
}

function syncOptimiserPlan() {
  if (!optimiserFrame?.contentWindow || !optimiserFrameReady) return;
  const targetOrigin = window.location.protocol === "file:" ? "*" : window.location.origin;
  optimiserFrame.contentWindow.postMessage({
    type: "pension-forecaster-plan",
    payload: buildCurrentPlanExport(),
  }, targetOrigin);
}

function renderSpecialEventsPanel() {
  const list = document.getElementById("special-events-list");
  const empty = document.getElementById("special-events-empty");
  const events = state.specialEvents || [];

  empty.hidden = events.length > 0;

  if (events.length === 0) {
    list.replaceChildren();
    return;
  }

  const header = document.createElement("div");
  header.className = "event-row event-row-header";
  ["Year type", "Year", "Type", "Amount", "Routing", "Taxable", "Title / note", ""].forEach((text) => {
    const span = document.createElement("span");
    span.textContent = text;
    header.appendChild(span);
  });

  const rows = events.map((ev, i) => {
    const row = document.createElement("div");
    row.className = "event-row";
    row.dataset.eventIndex = i;

    const yearTypeSelect = document.createElement("select");
    yearTypeSelect.dataset.eventField = "yearType";
    [["relative", "Relative yr"], ["absolute", "Absolute yr"]].forEach(([val, label]) => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = label;
      if (ev.yearType === val) opt.selected = true;
      yearTypeSelect.appendChild(opt);
    });

    const yearInput = document.createElement("input");
    yearInput.type = "number";
    yearInput.min = "1";
    yearInput.step = "1";
    yearInput.value = ev.year;
    yearInput.dataset.eventField = "year";

    const typeSelect = document.createElement("select");
    typeSelect.dataset.eventField = "type";
    [["expense", "Expense"], ["income", "Income"]].forEach(([val, label]) => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = label;
      if (ev.type === val) opt.selected = true;
      typeSelect.appendChild(opt);
    });

    const amountInput = document.createElement("input");
    amountInput.type = "text";
    amountInput.inputMode = "numeric";
    amountInput.min = "0";
    amountInput.step = "1000";
    amountInput.value = ev.amount > 0 ? formatCurrency(ev.amount) : "";
    amountInput.dataset.eventField = "amount";
    amountInput.addEventListener("focus", () => {
      amountInput.value = String(amountInput.value).replace(/,/g, "");
    });
    amountInput.addEventListener("blur", () => {
      const n = Number(String(amountInput.value).replace(/,/g, ""));
      if (Number.isFinite(n) && n > 0) amountInput.value = formatCurrency(n);
    });

    const routingSelect = document.createElement("select");
    routingSelect.dataset.eventField = "routing";
    [["drawdown", "Via pot"], ["savings", "Via savings"]].forEach(([val, label]) => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = label;
      if ((ev.routing || "drawdown") === val) opt.selected = true;
      routingSelect.appendChild(opt);
    });

    const taxableLabel = document.createElement("label");
    taxableLabel.className = "event-check-label";
    const taxableCheck = document.createElement("input");
    taxableCheck.type = "checkbox";
    taxableCheck.checked = Boolean(ev.taxable);
    taxableCheck.dataset.eventField = "taxable";
    const taxableSpan = document.createElement("span");
    taxableSpan.textContent = "Taxable";
    taxableLabel.append(taxableCheck, taxableSpan);

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = ev.title || "";
    titleInput.placeholder = "Optional note";
    titleInput.dataset.eventField = "title";

    const actions = document.createElement("div");
    actions.className = "event-actions";

    const dupBtn = document.createElement("button");
    dupBtn.className = "icon-button";
    dupBtn.type = "button";
    dupBtn.dataset.eventAction = "duplicate";
    dupBtn.dataset.eventIndex = i;
    dupBtn.title = "Duplicate event";
    dupBtn.setAttribute("aria-label", "Duplicate event");
    dupBtn.textContent = "⧉";

    const delBtn = document.createElement("button");
    delBtn.className = "icon-button";
    delBtn.type = "button";
    delBtn.dataset.eventAction = "delete";
    delBtn.dataset.eventIndex = i;
    delBtn.title = "Delete event";
    delBtn.setAttribute("aria-label", "Delete event");
    delBtn.textContent = "×";

    actions.append(dupBtn, delBtn);
    row.append(yearTypeSelect, yearInput, typeSelect, amountInput, routingSelect, taxableLabel, titleInput, actions);
    return row;
  });

  list.replaceChildren(header, ...rows);
}

function isPercentInput(input) {
  return input.dataset.format === "percent-1";
}

function isCurrencyInput(input) {
  return !isPercentInput(input) && Number(input.step) >= 500;
}

function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
}

function formatInputValue(input, value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  if (isPercentInput(input)) {
    return (Number(value) * 100).toFixed(1);
  }
  if (isCurrencyInput(input)) {
    return formatCurrency(value);
  }
  return value;
}

function parseInputValue(input, fallbackValue) {
  if (input.value === "") {
    return fallbackValue;
  }
  // Strip thousand separators before parsing
  const raw = String(input.value).replace(/,/g, "");
  const numericValue = Number(raw);
  if (!Number.isFinite(numericValue)) {
    return fallbackValue;
  }
  if (isPercentInput(input)) {
    return numericValue / 100;
  }
  return numericValue;
}

function syncForm() {
  inputs.forEach((input) => {
    const key = input.dataset.field;
    const value = state[key];
    if (input.type === "checkbox") {
      input.checked = Boolean(value);
      return;
    }
    input.value = formatInputValue(input, value);
  });
  // Sync scenario button label
  const activeScenario = scenarioDropdown.querySelector(`[data-value="${state.scenario}"]`);
  if (activeScenario) scenarioButton.textContent = activeScenario.textContent + " ▾";
  const activePartnerScenario = partnerScenarioDropdown.querySelector(`[data-value="${state.partnerScenario}"]`);
  if (activePartnerScenario) partnerScenarioButton.textContent = activePartnerScenario.textContent + " ▾";
  // Sync savings tax optimisation button label
  const activeSto = savingsTaxOptimDropdown.querySelector(`[data-value="${state.savingsTaxOptimisation ?? "my"}"]`);
  if (activeSto) savingsTaxOptimButton.textContent = activeSto.textContent + " ▾";
}

function renderSummary(projection) {
  const lastRow = projection.rows[projection.rows.length - 1];
  const totalTaxPaid = projection.rows.reduce((sum, row) => sum + row.estimatedTax, 0);
  const averageTaxPerYear = projection.rows.length > 0 ? totalTaxPaid / projection.rows.length : 0;
  const averageTaxPerMonth = averageTaxPerYear / 12;
  const totalBasicRateTax = projection.rows.reduce((sum, row) => sum + (row.basicRateTax || 0), 0);
  const totalHigherRateTax = projection.rows.reduce((sum, row) => sum + (row.higherRateTax || 0), 0);
  const pensionDrawdownRows = projection.rows.filter((row) => row.grossPensionWithdrawal > 0.01 || row.taxFreeCash > 0.01);
  const averageEffectiveTaxRate = pensionDrawdownRows.length > 0
    ? pensionDrawdownRows.reduce((sum, row) => {
      const taxableBase = Math.max(0, row.taxableIncomeBeforeAllowance + row.bankInterestTaxable);
      return sum + (taxableBase > 0 ? row.estimatedTax / taxableBase : 0);
    }, 0) / pensionDrawdownRows.length
    : 0;
  const totalPensionTflsTaken = projection.rows.reduce((sum, row) => sum + row.taxFreeCash, 0);
  const totalDefinedBenefitLumpSum = projection.rows.reduce((sum, row) => sum + row.definedBenefitLumpSum, 0);
  const totalAnnuityTaxFreeCash = projection.rows.reduce((sum, row) => sum + row.annuityTaxFreeCash, 0);
  const totalTflsTaken = totalPensionTflsTaken + totalDefinedBenefitLumpSum + totalAnnuityTaxFreeCash;
  const totalPlanShortfall = projection.rows.reduce((sum, row) => sum + row.incomeShortfall, 0);
  const cards = [
    // ── Row 1: Plan overview + savings at retirement ─────────────────────────
    {
      label: "Plan dates",
      split: [
        {
          label: "Retirement",
          value: String(projection.retirementYear),
          note: `Age ${projection.rows[0]?.age ?? state.retirementAge}, ${NUMBER.format(projection.yearsToRetirement)} years to go`,
        },
        {
          label: "Plan end",
          value: String(projection.planEndYear),
          note: `Age ${projection.planEndAge}`,
        },
      ],
    },
    {
      label: "Pot at retirement",
      value: formatCurrency(projection.totalRetirementPot),
      note: projection.taperPreRetirementGrowth
        ? `Tapered rate equiv ${PERCENT.format(projection.effectivePreRetirementGrowthRate)} before retirement, ${PERCENT.format(projection.postRetirementGrowthRate)} after`
        : `${PERCENT.format(projection.preRetirementGrowthRate)} before retirement, ${PERCENT.format(projection.postRetirementGrowthRate)} after retirement`,
    },
    {
      label: "My savings at retirement",
      value: formatCurrency(projection.personalSavingsAtRetirement),
      panel: [
        { label: "ISA",         value: formatCurrency(projection.personalIsaSavingsAtRetirement) },
        { label: "Bank",        value: formatCurrency(projection.personalBankSavingsAtRetirement) },
        { label: "Prem. Bonds", value: formatCurrency(projection.personalPremiumBondsAtRetirement) },
      ],
    },
    {
      label: "Partner savings at retirement",
      value: formatCurrency(projection.partnerSavingsAtRetirement),
      panel: [
        { label: "Growth rate", value: PERCENT.format(state.partnerSavingsGrowthRate) },
      ],
    },
    // ── Row 2: Plan end figures + savings at plan end ────────────────────────
    {
      label: "End pot",
      value: formatCurrency(lastRow?.totalPotAfterGrowth ?? 0),
      note: projection.depletionYear
        ? `Pot reaches zero in ${projection.depletionYear.calendarYear} (age ${projection.depletionYear.age})`
        : `At plan end ${projection.planEndYear} (age ${projection.planEndAge})`,
    },
    {
      label: "Uncrystallised at retirement",
      value: formatCurrency(projection.retirementUncrystallisedPot),
      // Cumulative crystallised total to date (starting crystallised pot + every TFLS designation
      // since, at 4x cash taken) — not the static retirement-day snapshot, which never moves.
      note: `Crystallised to date ${formatCurrency(lastRow?.crystallisedPot ?? projection.retirementCrystallisedPot)}`,
    },
    {
      label: "My savings at plan end",
      value: formatCurrency((lastRow?.isaSavingsLeft ?? 0) + (lastRow?.bankSavingsLeft ?? 0) + (lastRow?.premiumBondsLeft ?? 0)),
      panel: [
        { label: "ISA",          value: formatCurrency(lastRow?.isaSavingsLeft ?? 0) },
        { label: "Bank",         value: formatCurrency(lastRow?.bankSavingsLeft ?? 0) },
        { label: "Prem. Bonds",  value: formatCurrency(lastRow?.premiumBondsLeft ?? 0) },
        { label: "Interest tax", value: formatCurrency(projection.totalBankInterestTax) },
      ],
    },
    {
      label: "Partner savings at plan end",
      value: formatCurrency(lastRow?.partnerSavingsLeft ?? 0),
    },
    // ── Row 3: Plan health metrics ───────────────────────────────────────────
    {
      label: "Total plan shortfall",
      value: formatCurrency(totalPlanShortfall),
      note: `Across ${NUMBER.format(projection.rows.length)} retirement years shown`,
      warning: totalPlanShortfall > 0.01,
      success: totalPlanShortfall <= 0.01,
    },
    {
      label: "Total tax paid",
      wide: true,
      value: formatCurrency(totalTaxPaid),
      panel: [
        { label: "Per year",        value: formatCurrency(averageTaxPerYear) },
        { label: "Per month",       value: formatCurrency(averageTaxPerMonth) },
        { label: "Eff tax rate",    value: PERCENT.format(averageEffectiveTaxRate) },
        { label: "Basic rate tax",  value: formatCurrency(totalBasicRateTax) },
        { label: "Higher rate tax", value: formatCurrency(totalHigherRateTax) },
      ],
    },
    {
      label: "Tax-free lump sums",
      value: formatCurrency(totalTflsTaken),
      note: `Pension ${formatCurrency(totalPensionTflsTaken)}, DB ${formatCurrency(totalDefinedBenefitLumpSum)}, Annuity ${formatCurrency(totalAnnuityTaxFreeCash)} · LSA left ${formatCurrency(lastRow?.remainingLumpSumAllowance ?? projection.remainingLumpSumAllowanceStart)} (was ${formatCurrency(projection.remainingLumpSumAllowanceStart)})`,
    },
  ];

  summaryGrid.replaceChildren();
  cards.forEach((card) => {
    const clone = summaryTemplate.content.cloneNode(true);
    const cardElement = clone.querySelector(".summary-card");
    cardElement.classList.toggle("summary-card-warning", Boolean(card.warning));
    cardElement.classList.toggle("summary-card-success", Boolean(card.success));
    cardElement.classList.toggle("summary-card-wide", Boolean(card.wide));
    clone.querySelector(".summary-label").textContent = card.label;
    if (card.split) {
      cardElement.classList.add("summary-card-split");
      clone.querySelector(".summary-value").remove();
      clone.querySelector(".summary-note").remove();
      const splitWrap = document.createElement("div");
      splitWrap.className = "summary-split";
      card.split.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.className = "summary-split-item";
        itemElement.innerHTML = `
          <p class="summary-split-label"></p>
          <p class="summary-value"></p>
          <p class="summary-note"></p>
        `;
        itemElement.querySelector(".summary-split-label").textContent = item.label;
        const valueElement = itemElement.querySelector(".summary-value");
        valueElement.textContent = item.value;
        if (uiState.controlsHidden && card.label === "Plan dates" && item.label === "Retirement") {
          const valueRow = document.createElement("div");
          valueRow.className = "summary-value-control-row";
          const decreaseButton = document.createElement("button");
          decreaseButton.className = "summary-step-button";
          decreaseButton.type = "button";
          decreaseButton.textContent = "-";
          decreaseButton.setAttribute("aria-label", "Decrease retirement year");
          decreaseButton.dataset.retirementYearStep = "-1";
          const increaseButton = document.createElement("button");
          increaseButton.className = "summary-step-button";
          increaseButton.type = "button";
          increaseButton.textContent = "+";
          increaseButton.setAttribute("aria-label", "Increase retirement year");
          increaseButton.dataset.retirementYearStep = "1";
          valueElement.replaceWith(valueRow);
          valueRow.append(decreaseButton, valueElement, increaseButton);
        }
        itemElement.querySelector(".summary-note").textContent = item.note;
        splitWrap.appendChild(itemElement);
      });
      cardElement.appendChild(splitWrap);
    } else if (card.panel) {
      cardElement.classList.add("summary-card-panel");
      clone.querySelector(".summary-value").remove();
      clone.querySelector(".summary-note").remove();
      const body = document.createElement("div");
      body.className = "summary-panel-body";
      const left = document.createElement("div");
      const valEl = document.createElement("p");
      valEl.className = "summary-value";
      valEl.textContent = card.value;
      left.appendChild(valEl);
      if (card.note) {
        const noteEl = document.createElement("p");
        noteEl.className = "summary-note";
        noteEl.style.height = "auto";
        noteEl.style.webkitLineClamp = "unset";
        noteEl.style.display = "block";
        noteEl.textContent = card.note;
        left.appendChild(noteEl);
      }
      const right = document.createElement("div");
      right.className = "summary-panel-breakdown";
      (card.panel || []).forEach(({ label, value }) => {
        const row = document.createElement("div");
        row.className = "summary-panel-breakdown-item";
        row.innerHTML = `<span></span><span></span>`;
        row.children[0].textContent = label;
        row.children[1].textContent = value;
        right.appendChild(row);
      });
      body.appendChild(left);
      body.appendChild(right);
      cardElement.appendChild(body);
    } else {
      clone.querySelector(".summary-value").textContent = card.value;
      clone.querySelector(".summary-note").textContent = card.note;
    }
    summaryGrid.appendChild(clone);
  });

  chartCaption.textContent = projection.depletionYear
    ? `Projection reaches zero in ${projection.depletionYear.calendarYear} (age ${projection.depletionYear.age}).`
    : "Projection stays positive across the years shown.";

  tableCaption.textContent = `Showing ${projection.rows.length} retirement years from ${projection.retirementYear} onwards.`;
}

function getTableColumnSets() {
  const detailedColumns = [
    ["yearIndex", "Year"],
    ["calendarYear", "Calendar"],
    ["age", "Age"],
    ["totalIncomeRequired", "Gross income required incl. car"],
    ["carCost", "Car"],
    ["partnerIncome", "Partner work income"],
    ["partnerStatePension", "Partner state pension"],
    ["definedBenefitIncome", "My DB pension"],
    ["definedBenefitLumpSum", "My DB lump sum"],
    ["annuityIncome", "Annuity income"],
    ["annuityTaxFreeCash", "Annuity TFLS"],
    ["partnerDefinedBenefitIncome", "Partner DB pension"],
    ["partnerDefinedBenefitLumpSum", "Partner DB lump sum"],
    ["partnerPotDrawdown", "Partner DC pension"],
    ["taxFreeCash", "TFLS (Tax Free Lump Sum)"],
    ["sourcedFromSavings", "Sourced from Savings"],
    ["incomeTotal", "Income total"],
    ["pensionNeededGross", "From my pension"],
    ["holidays", "Holidays"],
    ["householdBills", "Bills"],
    ["estimatedTax", "Estimated tax"],
    ["excessNet", "Free cash"],
    ["incomeShortfall", "Shortfall"],
    ["savingsLeft", "Savings left"],
  ];
  const summarisedColumns = [
    ["yearIndex", "Year"],
    ["calendarYear", "Calendar"],
    ["age", "Age"],
    ["totalIncomeRequired", "Gross income required incl. car"],
    ["sourcedFromSavings", "Sourced from Savings"],
    ["incomeTotal", "Total income"],
    ["grossPensionWithdrawal", "Taxable pension withdrawn"],
    ["estimatedTax", "Estimated tax"],
    ["excessNet", "Free cash"],
    ["incomeShortfall", "Shortfall"],
    ["totalPotAfterGrowth", "Pot after growth"],
  ];
  const granularBaseDetailColumns = [
    ["yearIndex", "Year"],
    ["calendarYear", "Calendar"],
    ["age", "Age"],
    ["incomeRequired", "Base income required"],
    ["carCost", "Car"],
    ["totalIncomeRequired", "Gross income required incl. car"],
    ["partnerIncome", "Partner work income"],
    ["partnerStatePension", "Partner state pension"],
    ["ownStatePension", "My state pension"],
    ["definedBenefitIncome", "My DB pension"],
    ["definedBenefitLumpSum", "My DB lump sum"],
    ["annuityIncome", "Annuity income"],
    ["annuityTaxFreeCash", "Annuity TFLS"],
    ["partnerDefinedBenefitIncome", "Partner DB pension"],
    ["partnerDefinedBenefitLumpSum", "Partner DB lump sum"],
    ["partnerPotDrawdown", "Partner DC pension"],
    ["taxFreeCash", "TFLS (Tax Free Lump Sum)"],
    ["sourcedFromSavings", "Sourced from Savings"],
    ["incomeTotal", "Income total"],
    ["pensionNeededGross", "From my pension"],
    ["grossPensionWithdrawal", "Taxable pension withdrawn"],
    ["taxableFromNewTflsCrystallisation", "Taxable drawdown linked to TFLS"],
    ["taxableDrawdownDesignated", "Crystallised for taxable drawdown"],
    ["holidays", "Holidays"],
    ["householdBills", "Bills"],
    ["estimatedTax", "Estimated tax"],
    ["excessNet", "Free cash"],
    ["incomeShortfall", "Shortfall"],
    ["uncrystallisedPot", "Uncrystallised left"],
    ["crystallisedPot", "TFLS crystallised to date"],
    ["totalPotAfterGrowth", "Pot after growth"],
    ["remainingLumpSumAllowance", "LSA left"],
    ["savingsLeft", "Savings left"],
  ];
  const granularCrystallisationKeys = [
    "uncrystallisedPot",
    "crystallisedPot",
    "tflsBy75Target",
    "newlyCrystallised",
    "taxableFromNewTflsCrystallisation",
    "taxableDrawdownDesignated",
  ];
  const detailedColumnsWithoutIncomeBreakdown = granularBaseDetailColumns.filter(([key]) => ![
    "partnerIncome",
    "partnerStatePension",
    "ownStatePension",
    "definedBenefitIncome",
    "definedBenefitLumpSum",
    "annuityIncome",
    "annuityTaxFreeCash",
    "partnerDefinedBenefitIncome",
    "partnerDefinedBenefitLumpSum",
    "partnerPotDrawdown",
    "taxFreeCash",
    "sourcedFromSavings",
  ].includes(key));
  const granularBaseColumns = uiState.showGranularIncomeFields ? granularBaseDetailColumns : detailedColumnsWithoutIncomeBreakdown;
  const granularBaseColumnsWithoutCrystallisation = granularBaseColumns.filter(([key]) => !granularCrystallisationKeys.includes(key));
  const granularTaxColumns = [
    ["taxableIncomeBeforeAllowance", "Taxable income before allowance"],
    ["assumedTaxAllowance", "Assumed allowance"],
    ["personalAllowanceUsed", "Allowance used"],
    ["taxedAmount", "Taxed amount"],
    ["basicRateTaxable", "Basic-rate taxed"],
    ["higherRateTaxable", "Higher-rate taxed"],
    ["additionalRateTaxable", "Additional-rate taxed"],
    ["basicRateTax", "Basic-rate tax"],
    ["higherRateTax", "Higher-rate tax"],
    ["additionalRateTax", "Additional-rate tax"],
    ["effectiveTaxRate", "Effective tax rate"],
    ["marginalTaxRate", "Tax rate applied"],
  ];
  const granularGrowthColumns = [
    ["growth", "Growth added"],
    ["openingPot", "Opening pot"],
    ["withdrawalsTaken", "Withdrawals taken"],
    ["totalPotBeforeGrowth", "Pot before growth"],
    ["totalPotAfterGrowth", "Pot after growth"],
  ];
  const granularSavingsColumns = [
    ["isaInterestGross", "ISA interest/growth"],
    ["bankInterestGross", "Bank interest"],
    ["premiumBondsGrowth", "Premium Bonds growth"],
    ["premiumBondsMovedToIsa", "Premium Bonds moved to ISA"],
    ["savingsIncomeForPsa", "Income for PSA"],
    ["psaProtectedTaxableWithdrawalLimit", "PSA-protected taxable limit"],
    ["personalSavingsAllowance", "PSA available"],
    ["personalSavingsAllowanceUsed", "PSA used"],
    ["bankInterestTaxable", "Bank interest taxable"],
    ["bankInterestTax", "Bank interest tax"],
    ["bankSavingsUsed", "Bank savings used"],
    ["premiumBondsUsed", "Premium Bonds used"],
    ["isaSavingsUsed", "ISA savings used"],
    ["partnerSavingsIncludedInOptimisation", "Partner savings included"],
    ["partnerSavingsOptimisationLimit", "Partner savings annual limit"],
    ["partnerSavingsPlannedUse", "Partner savings planned use"],
    ["partnerSavingsUsed", "Partner savings used"],
    ["bankSavingsLeft", "Bank savings left"],
    ["premiumBondsLeft", "Premium Bonds left"],
    ["isaSavingsLeft", "ISA savings left"],
    ["partnerSavingsLeft", "Partner savings left"],
  ];
  const granularCrystallisationColumns = [
    ["uncrystallisedPot", "Uncrystallised left"],
    ["crystallisedPot", "TFLS crystallised to date"],
    ["tflsBy75Target", "TFLS by 75 target"],
    ["newlyCrystallised", "New TFLS crystallised"],
    ["taxableFromNewTflsCrystallisation", "Taxable drawdown linked to TFLS"],
    ["taxableDrawdownDesignated", "Crystallised for taxable drawdown"],
  ];
  const granularExtraColumns = [
    ["crystallisedFundLeft", "Crystallised fund left"],
  ];
  const customOnlyColumns = [
    ["incomeCovered", "Income covered"],
    ["exceptionalExpense", "Exceptional expense"],
    ["exceptionalNonTaxableIncome", "Exceptional non-taxable income"],
    ["exceptionalTaxableIncome", "Exceptional taxable income"],
    ["exceptionalSavingsIncome", "Exceptional income into savings"],
    ["exceptionalSavingsExpense", "Exceptional expense from savings"],
  ];
  const granularColumns = [
    ...granularBaseColumnsWithoutCrystallisation,
    ...granularSavingsColumns,
    ...(uiState.showGranularTaxFields ? granularTaxColumns : []),
    ...(uiState.showGranularGrowthFields ? granularGrowthColumns : []),
    ...(uiState.showGranularCrystallisationFields ? granularCrystallisationColumns : []),
    ...granularExtraColumns,
  ];

  const allColumns = uniqueColumns([
    ...summarisedColumns,
    ...detailedColumns,
    ...granularBaseDetailColumns,
    ...granularSavingsColumns,
    ...granularTaxColumns,
    ...granularGrowthColumns,
    ...granularCrystallisationColumns,
    ...granularExtraColumns,
    ...customOnlyColumns,
  ]);

  return {
    detailedColumns,
    summarisedColumns,
    granularColumns,
    allColumns,
  };
}

function uniqueColumns(columns) {
  const seen = new Set();
  return columns.filter(([key]) => {
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

const CUSTOM_MANDATORY_COLUMN_KEYS = [
  "yearIndex",
  "calendarYear",
  "age",
  "totalIncomeRequired",
  "incomeTotal",
  "estimatedTax",
  "excessNet",
  "totalPotAfterGrowth",
];

const CUSTOM_DEFAULT_COLUMN_KEYS = [
  "taxFreeCash",
  "sourcedFromSavings",
  "grossPensionWithdrawal",
  "incomeShortfall",
  "savingsLeft",
];

function getTableColumns() {
  const { summarisedColumns, detailedColumns, granularColumns, allColumns } = getTableColumnSets();
  if (uiState.tableView === "granular") {
    return granularColumns;
  }
  if (uiState.tableView === "detailed") {
    return detailedColumns;
  }
  if (uiState.tableView === "custom") {
    const selectedKeys = new Set([
      ...CUSTOM_MANDATORY_COLUMN_KEYS,
      ...((uiState.customTableFields && uiState.customTableFields.length > 0) ? uiState.customTableFields : CUSTOM_DEFAULT_COLUMN_KEYS),
    ]);
    return allColumns.filter(([key]) => selectedKeys.has(key));
  }
  return summarisedColumns;
}

function renderCustomFieldChooser() {
  const { allColumns } = getTableColumnSets();
  const mandatoryKeys = new Set(CUSTOM_MANDATORY_COLUMN_KEYS);
  const activeKeys = new Set([
    ...CUSTOM_MANDATORY_COLUMN_KEYS,
    ...((uiState.customTableFields && uiState.customTableFields.length > 0) ? uiState.customTableFields : CUSTOM_DEFAULT_COLUMN_KEYS),
  ]);
  customFieldsList.replaceChildren(...allColumns.map(([key, label]) => {
    const item = document.createElement("label");
    item.className = "field-choice";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = key;
    input.checked = activeKeys.has(key);
    input.disabled = mandatoryKeys.has(key);
    const text = document.createElement("span");
    text.textContent = mandatoryKeys.has(key) ? `${label} (mandatory)` : label;
    item.append(input, text);
    return item;
  }));
}

function openCustomFieldChooser() {
  renderCustomFieldChooser();
  customFieldsDialog.hidden = false;
}

function closeCustomFieldChooser() {
  customFieldsDialog.hidden = true;
}

function openBasicSetup() {
  syncForm();
  basicSetupDialog.hidden = false;
}

function closeBasicSetup() {
  basicSetupDialog.hidden = true;
}

function showVersionChangeDate() {
  const versionText = versionBadge.dataset.version || versionBadge.textContent;
  if (!versionBadge.dataset.version) versionBadge.dataset.version = versionText;
  const modified = new Date(document.lastModified);
  const formatted = modified.toLocaleString("en-GB", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
    timeZoneName: "short",
  });
  versionBadge.textContent = `Changed ${formatted}`;
  versionBadge.setAttribute("aria-label", versionBadge.textContent);
  clearTimeout(versionBadgeTimeout);
  versionBadgeTimeout = setTimeout(() => {
    versionBadge.textContent = versionBadge.dataset.version;
    versionBadge.setAttribute("aria-label", "Show last change date");
  }, 5000);
}

function getColumnCalculationNote(key, label) {
  const notes = {
    yearIndex: 'Year number from retirement start.',
    calendarYear: 'Retirement year + (Year - 1).',
    age: 'Retirement age + (Year - 1).',
    incomeRequired: 'Base income target after CPI, before car costs. When income values are relative to today it inflates from now; otherwise each entered income starts from its first relevant retirement year.',
    carCost: 'Car cost applied in the configured replacement years only.',
    totalIncomeRequired: 'Gross income required including any car cost in that year.',
    partnerIncome: 'Partner work income, stopping when state pension starts.',
    partnerStatePension: "Partner's share of the state pension, compounded from today's value at the shared state pension growth rate.",
    ownStatePension: "Your share of the state pension, compounded from today's value at the shared state pension growth rate.",
    definedBenefitIncome: 'Inflexible defined benefit income, starting in the selected year, growing annually, and included in your taxable income before flexible drawdown is optimised.',
    definedBenefitLumpSum: 'Tax-free defined benefit lump sum in the DB start year. It reduces remaining lump sum allowance before flexible TFLS is calculated.',
    annuityIncome: 'Guaranteed single-life annuity income: (annuity cost - tax-free cash taken) x annuity rate at purchase, escalating annually per the chosen option (level, fixed %, or CPI-linked). Runs from the purchase year to plan end, and is taxable income like other pension income.',
    annuityTaxFreeCash: 'Tax-free cash taken when the annuity is purchased, capped at 25% of the amount crystallised and by remaining LSA. Reduces the amount that actually funds the annuity income, and counts against your lump sum allowance like any other TFLS.',
    partnerDefinedBenefitIncome: "Partner's fixed defined benefit income — starts in the configured year, grows at the DB growth rate, and contributes to household income automatically.",
    partnerDefinedBenefitLumpSum: "Partner's DB lump sum in the DB start year.",
    partnerPotDrawdown: "Amortised annual drawdown from the partner's DC pension pot, spread evenly over the remaining plan years with pot growth applied.",
    taxFreeCash: 'Tax Free Lump Sum taken from available uncrystallised pension funds and tested against remaining lump sum allowance.',
    tflsBy75Target: 'Minimum annual TFLS target used when the Use TFLS by 75 option is on, based on remaining lump sum allowance and years left to age 75. When maximise drawdown and forced TFLS pairing are both on, the actual TFLS taken is capped to the basic-rate paired capacity.',
    sourcedFromSavings: 'Savings used in tax optimisation mode to avoid or reduce taxable pension drawdown. Partner savings are smoothed across the remaining plan and capped in early years.',
    bankSavingsUsed: 'Savings withdrawal sourced from taxable bank savings before premium bonds, ISA, and partner savings.',
    premiumBondsUsed: 'Savings withdrawal sourced from Premium Bonds after bank savings and before ISA.',
    isaSavingsUsed: 'Savings withdrawal sourced from ISA after bank and Premium Bonds savings, before partner savings.',
    partnerSavingsIncludedInOptimisation: '1 if partner savings are included in the tax optimisation savings pool, otherwise 0.',
    partnerSavingsOptimisationLimit: 'Partner savings available to tax optimisation this year. Years 1-15 are capped at 5% of the partner savings balance.',
    partnerSavingsPlannedUse: 'Smoothed partner savings use for this year, aiming to use the partner savings balance by plan end while respecting the annual limit.',
    partnerSavingsUsed: 'Savings withdrawal sourced from partner savings for the smoothed tax-reduction plan, plus any reserve use after personal savings, within the annual optimisation limit.',
    isaInterestGross: 'Annual ISA interest/growth, treated as tax-free.',
    bankInterestGross: 'Annual bank interest before tax.',
    premiumBondsGrowth: 'Annual Premium Bonds assumed prize/growth return, treated as tax-free.',
    premiumBondsMovedToIsa: 'Premium Bonds growth above the £50,000 holding limit, swept into ISA savings.',
    savingsIncomeForPsa: 'Your taxable income plus bank interest. This determines whether PSA is £1,000, £500, or £0.',
    psaProtectedTaxableWithdrawalLimit: 'Taxable pension withdrawal limit used by tax optimisation to keep taxable income plus bank interest within the basic-rate band where possible.',
    personalSavingsAllowance: 'Personal Savings Allowance available based on the tax band after bank interest.',
    personalSavingsAllowanceUsed: 'Bank interest covered by the Personal Savings Allowance.',
    bankInterestTaxable: 'Bank interest above the Personal Savings Allowance.',
    bankInterestTax: 'Estimated income tax due on taxable bank interest.',
    bankSavingsLeft: 'Bank savings left after interest, interest tax, and any savings withdrawal.',
    premiumBondsLeft: 'Premium Bonds left after assumed tax-free growth/prizes and any savings withdrawal.',
    isaSavingsLeft: 'ISA savings left after tax-free growth and any savings withdrawal.',
    partnerSavingsLeft: 'Partner savings left after growth and any savings withdrawal.',
    incomeTotal: 'Partner work income + partner state pension + partner work pension + my state pension + defined benefit income + DB lump sum + TFLS taken that year.',
    incomeCovered: 'Free cash + estimated tax + bills + holidays. This reconciles the year after drawdown maximisation, TFLS, savings, and other income have been applied.',
    pensionNeededGross: 'Income needed - base income total before pension withdrawals.',
    grossPensionWithdrawal: 'Gross taxable pension withdrawal only. TFLS is excluded from this figure.',
    taxableFromNewTflsCrystallisation: 'Taxable drawdown paid from the 75% crystallised slice created when same-year TFLS is taken.',
    holidays: 'Holiday cost after CPI rules.',
    householdBills: 'Bills after CPI rules.',
    estimatedTax: 'UK income tax estimate on my taxable income for the year.',
    excessNet: 'Free cash = income covered by pensions, TFLS, taxable withdrawals and savings - estimated tax - bills - holidays.',
    incomeShortfall: 'Income needed - income covered by pensions, TFLS, taxable pension withdrawals, and savings.',
    uncrystallisedPot: 'Uncrystallised fund left after withdrawals and annual growth.',
    crystallisedPot: 'Total crystallised for TFLS to date, including prior years.',
    totalPotAfterGrowth: 'Pot before growth + Growth added.',
    remainingLumpSumAllowance: 'Previous LSA left - DB lump sum - TFLS taken.',
    savingsLeft: 'Separate personal and partner savings left after any tax optimisation use.',
    taxableIncomeBeforeAllowance: 'My state pension + defined benefit income + taxable pension withdrawn. TFLS, savings, and partner income are excluded.',
    assumedTaxAllowance: 'Allowance base after optional tax-allowance CPI and tapering.',
    personalAllowanceUsed: 'The part of my taxable income covered by the personal allowance.',
    taxedAmount: 'My taxable income - assumed allowance.',
    basicRateTaxable: 'Taxed amount falling in the basic-rate band.',
    higherRateTaxable: 'Taxed amount falling in the higher-rate band.',
    additionalRateTaxable: 'Taxed amount falling in the additional-rate band.',
    basicRateTax: 'Basic-rate taxed x 20%.',
    higherRateTax: 'Higher-rate taxed x 40%.',
    additionalRateTax: 'Additional-rate taxed x 45%.',
    effectiveTaxRate: 'Estimated tax / my taxable income.',
    marginalTaxRate: 'Highest tax band used that year.',
    growth: 'Pot after growth - Pot before growth.',
    openingPot: 'Prior year pot after growth, or retirement opening pot in year 1.',
    withdrawalsTaken: 'TFLS + taxable drawdown taken from the pot.',
    totalPotBeforeGrowth: 'Opening pot - Withdrawals taken.',
    newlyCrystallised: 'TFLS crystallisation only: TFLS taken x 4, capped by available uncrystallised funds.',
    taxableDrawdownDesignated: 'Extra uncrystallised funds crystallised first so taxable pension drawdown can be paid when linked TFLS is unavailable or already exhausted.',
    crystallisedFundLeft: 'Crystallised fund still available after withdrawals and growth.',
    exceptionalExpense: 'One-off expenses from special events in this year, added to gross income required.',
    exceptionalNonTaxableIncome: 'One-off non-taxable income from special events in this year, offsetting the amount needed from the pension.',
    exceptionalTaxableIncome: 'One-off taxable income from special events in this year, added to your taxable income and reducing the amount needed from the pension.',
    exceptionalSavingsIncome: 'One-off income routed directly into bank savings, bypassing the drawdown mechanism.',
    exceptionalSavingsExpense: 'One-off expense drawn directly from savings (bank first, then Premium Bonds, ISA, partner), bypassing the drawdown mechanism.',
  };
  return `${label}: ${notes[key] || 'See projection logic for this column.'}`;
}

function renderTable(projection) {
  if (uiState.collapsedPanels?.["Detailed Breakdown Table"]) return;
  const columns = getTableColumns();

  const headRow = document.createElement("tr");
  columns.forEach(([key, label]) => {
    const th = document.createElement("th");
    splitTableHeader(label).forEach((line) => {
      const span = document.createElement("span");
      span.textContent = line;
      th.appendChild(span);
    });
    if (["yearIndex", "calendarYear", "age"].includes(key)) {
      th.classList.add("sticky-column", `sticky-${key}`);
    }
    headRow.appendChild(th);
  });
  projectionHead.replaceChildren(headRow);

  const bodyRows = projection.rows.map((row) => {
    const tr = document.createElement("tr");
    if (row.totalPotAfterGrowth < 0.01) {
      tr.classList.add("is-negative");
    }
    columns.forEach(([key]) => {
      const td = document.createElement("td");
      td.dataset.key = key;
      if (["yearIndex", "calendarYear", "age"].includes(key)) {
        td.classList.add("sticky-column", `sticky-${key}`);
      }
      if (["yearIndex", "calendarYear", "age"].includes(key)) {
        td.textContent = String(Math.round(Number(row[key]) || 0));
      } else if (["effectiveTaxRate", "marginalTaxRate"].includes(key)) {
        td.textContent = PERCENT.format(row[key] || 0);
      } else {
        td.textContent = formatCurrency(row[key]);
      }
      tr.appendChild(td);
    });
    return tr;
  });

  projectionBody.replaceChildren(...bodyRows);
}

function splitTableHeader(label) {
  const manualBreaks = {
    "Gross income required incl. car": ["Gross income", "required", "incl. car"],
    "Base income required": ["Base income", "required"],
    "Sourced from Savings": ["Sourced from", "Savings"],
    "Total income": ["Total", "income"],
    "Taxable pension withdrawn": ["Taxable pension", "withdrawn"],
    "Estimated tax": ["Estimated", "tax"],
    "Free cash": ["Free", "cash"],
    "Pot after growth": ["Pot after", "growth"],
    "Partner work income": ["Partner work", "income"],
    "Partner state pension": ["Partner state", "pension"],
    "Partner work pension": ["Partner work", "pension"],
    "TFLS (Tax Free Lump Sum)": ["TFLS", "(Tax Free Lump Sum)"],
    "From my pension": ["From my", "pension"],
    "Savings left": ["Savings", "left"],
    "Income needed": ["Income", "needed"],
    "My state pension": ["My state", "pension"],
    "My DB pension": ["My DB", "pension"],
    "DB lump sum": ["DB lump", "sum"],
    "Taxable drawdown linked to TFLS": ["Taxable linked", "to TFLS"],
    "Crystallised for taxable drawdown": ["Crystallised for", "taxable drawdown"],
  };
  if (manualBreaks[label]) {
    return manualBreaks[label];
  }
  const words = label.split(" ");
  if (words.length <= 1) {
    return [label];
  }
  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")];
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

function renderSpendingChartCanvas({ canvas, projection, realTerms, monthly, mode = "full", freeOnly, hoverX = null }) {
  // Back-compat: legacy freeOnly boolean
  if (freeOnly !== undefined) mode = freeOnly ? "freeOnly" : "full";
  const cs = getChartStyle();
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const cpiRate = state.cpiRate || 0;
  const n0 = projection.yearsToRetirement;

  const adjust = (v, yi) => {
    if (realTerms && cpiRate > 0) v /= Math.pow(1 + cpiRate / 12, 12 * (n0 + yi - 1));
    return monthly ? v / 12 : v;
  };

  // Actual cash-flow free cash — matches the table's Free cash column exactly.
  // excessNet = incomeCovered - estimatedTax - householdBills - holidays
  // freeCash  = excessNet - carCost
  const computeFreeCash = (row, yi) =>
    adjust(row.excessNet - row.carCost, yi);

  const isFreeOnly     = mode === "freeOnly";
  const isTaxBreakdown = mode === "taxBreakdown";

  const spendKeys = isFreeOnly ? [] : [
    { key: "householdBills", label: "Bills",     color: "#3b82f6" },
    { key: "holidays",       label: "Holidays",  color: "#10b981" },
    { key: "carCost",        label: "Car",       color: "#f59e0b" },
  ];

  // Per-row data: split free cash into surplus (positive) and shortfall (negative)
  const rowData = projection.rows.map((row, i) => {
    const yi = i + 1;
    const freeCash = computeFreeCash(row, yi);
    const surplus   = Math.max(0, freeCash);
    const shortfall = Math.min(0, freeCash); // ≤ 0
    const spending  = spendKeys.map(s => ({ ...s, v: Math.max(0, adjust(Number(row[s.key]) || 0, yi)) }));
    const tax       = isFreeOnly ? 0 : Math.max(0, adjust(row.estimatedTax, yi));
    const basicTax  = isTaxBreakdown ? Math.max(0, adjust(row.basicRateTax  || 0, yi)) : 0;
    const higherTax = isTaxBreakdown ? Math.max(0, adjust(row.higherRateTax || 0, yi)) : 0;
    const stackTop  = isTaxBreakdown
      ? spending.reduce((s, d) => s + d.v, 0) + surplus + basicTax + higherTax
      : spending.reduce((s, d) => s + d.v, 0) + surplus + tax;
    return { spending, tax, basicTax, higherTax, surplus, shortfall, stackTop };
  });

  const minShortfall = Math.min(0, ...rowData.map(d => d.shortfall));
  const maxStackRaw  = Math.max(0, ...rowData.map(d => d.stackTop));

  const pad = { top: 56, right: 22, bottom: 56, left: 70 };
  const plotWidth  = width  - pad.left - pad.right;
  const plotHeight = height - pad.top  - pad.bottom;
  const axisStep = niceAxisStep(maxStackRaw - minShortfall, plotHeight);
  const minValue = Math.min(0, Math.floor(minShortfall / axisStep) * axisStep);
  const maxValue = Math.max(axisStep, Math.ceil(maxStackRaw / axisStep) * axisStep);
  const range    = maxValue - minValue;
  const hasShortfall = minValue < 0;

  const yFor    = (v) => pad.top + plotHeight - ((v - minValue) / range) * plotHeight;
  const zeroY   = yFor(0);
  const barBand = plotWidth / Math.max(1, projection.rows.length);
  const xFor    = (i) => pad.left + i * barBand + barBand / 2;
  const barW    = Math.max(6, Math.min(26, barBand - 3));

  // Grid lines + Y axis labels
  ctx.font = cs.font;
  for (let v = minValue; v <= maxValue; v += axisStep) {
    const y = yFor(v);
    const isZero = v === 0 && hasShortfall;
    ctx.strokeStyle = isZero ? "rgba(239,68,68,0.5)" : cs.gridColor;
    ctx.lineWidth   = isZero ? 1.5 : 1;
    if (isZero) ctx.setLineDash([5, 3]);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.fillStyle = v < 0 ? "#ef4444" : cs.labelColor;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(formatCurrency(v), 8, y);
  }

  // Hatch pattern for shortfall bars
  const hatchPattern = hasShortfall ? makeHatchPattern(ctx, "rgba(239,68,68,0.55)") : null;

  // Bars
  projection.rows.forEach((row, i) => {
    const d = rowData[i];
    const x = xFor(i) - barW / 2;

    // ── Upward stack ──────────────────────────────────────────
    let stack = 0;

    // Spending segments (bills / holidays / car)
    d.spending.forEach((seg) => {
      if (seg.v <= 0) return;
      const y = yFor(stack + seg.v);
      ctx.fillStyle = seg.color;
      ctx.fillRect(x, y, barW, yFor(stack) - y);
      stack += seg.v;
    });

    // Positive free cash / surplus
    if (d.surplus > 0) {
      const y = yFor(stack + d.surplus);
      ctx.fillStyle = "#8b5cf6";
      ctx.fillRect(x, y, barW, yFor(stack) - y);
      stack += d.surplus;
    }

    if (isTaxBreakdown) {
      // Basic rate tax — solid orange-red fill
      if (d.basicTax > 0) {
        const y = yFor(stack + d.basicTax);
        ctx.fillStyle = "#f97316";
        ctx.fillRect(x, y, barW, yFor(stack) - y);
        stack += d.basicTax;
      }
      // Higher rate tax — solid red fill
      if (d.higherTax > 0) {
        const y = yFor(stack + d.higherTax);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(x, y, barW, yFor(stack) - y);
        stack += d.higherTax;
      }
    } else if (!isFreeOnly && d.tax > 0) {
      // Normal mode — red outline on top
      const y    = yFor(stack + d.tax);
      const segH = yFor(stack) - y;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth   = 2;
      ctx.strokeRect(x + 1, y + 1, barW - 2, segH - 2);
      ctx.lineWidth   = 1;
    }

    // ── Downward shortfall bar ────────────────────────────────
    if (d.shortfall < -0.01) {
      const shortfallH = yFor(d.shortfall) - zeroY;
      // Solid red base
      ctx.fillStyle = "rgba(239,68,68,0.25)";
      ctx.fillRect(x, zeroY, barW, shortfallH);
      // Diagonal hatch overlay
      if (hatchPattern) {
        ctx.fillStyle = hatchPattern;
        ctx.fillRect(x, zeroY, barW, shortfallH);
      }
      // Red outline
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth   = 1.5;
      ctx.strokeRect(x + 0.75, zeroY + 0.75, barW - 1.5, shortfallH - 1.5);
      ctx.lineWidth   = 1;
    }
  });

  // X axis year/age labels
  const targetLabels = Math.max(4, Math.min(8, Math.floor(plotWidth / 90)));
  const yearStep     = Math.max(1, Math.ceil((projection.rows.length - 1) / Math.max(1, targetLabels - 1)));
  const labelIndexes = [];
  for (let i = 0; i < projection.rows.length; i += yearStep) labelIndexes.push(i);
  if (labelIndexes[labelIndexes.length - 1] !== projection.rows.length - 1) labelIndexes.push(projection.rows.length - 1);

  ctx.fillStyle = cs.labelColor; ctx.textAlign = "center"; ctx.textBaseline = "top";
  labelIndexes.forEach((ri) => {
    const row = projection.rows[ri];
    const x   = xFor(ri);
    ctx.fillText(String(row.calendarYear), x, height - 34);
    ctx.fillText(`(age ${row.age})`,       x, height - 18);
  });

  // Legend
  const legendSources = isFreeOnly
    ? [{ label: "Free cash", color: "#8b5cf6" }]
    : isTaxBreakdown
      ? [
          ...spendKeys,
          { label: "Free cash",       color: "#8b5cf6" },
          { label: "Basic rate tax",  color: "#f97316" },
          { label: "Higher rate tax", color: "#ef4444" },
          ...(hasShortfall ? [{ label: "Shortfall", color: "#ef4444", hatch: true }] : []),
        ]
      : [
          ...spendKeys,
          { label: "Free cash",  color: "#8b5cf6" },
          { label: "Tax",        color: "#ef4444", outline: true },
          ...(hasShortfall ? [{ label: "Shortfall", color: "#ef4444", hatch: true }] : []),
        ];

  let lx = pad.left, ly = 14;
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.font = cs.font;
  legendSources.forEach((src) => {
    const w = ctx.measureText(src.label).width + 44;
    if (lx > pad.left && lx + w > width - pad.right) { lx = pad.left; ly += 18; }
    if (src.outline) {
      ctx.strokeStyle = src.color; ctx.lineWidth = 2;
      ctx.strokeRect(lx, ly - 5, 18, 10); ctx.lineWidth = 1;
    } else if (src.hatch && hatchPattern) {
      ctx.fillStyle = "rgba(239,68,68,0.25)";
      ctx.fillRect(lx, ly - 5, 18, 10);
      ctx.fillStyle = hatchPattern;
      ctx.fillRect(lx, ly - 5, 18, 10);
      ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 1.5;
      ctx.strokeRect(lx, ly - 5, 18, 10); ctx.lineWidth = 1;
    } else {
      ctx.fillStyle = src.color;
      ctx.fillRect(lx, ly - 5, 18, 10);
    }
    ctx.fillStyle = cs.legendColor;
    ctx.fillText(src.label, lx + 24, ly);
    lx += w;
  });

  // ── Event stars ───────────────────────────────────────────────────────────
  projection.rows.forEach((row, index) => {
    if (row.eventTitles?.length) {
      drawEventStar(ctx, xFor(index), pad.top + plotHeight - 12);
    }
  });

  // ── Hover tooltip ────────────────────────────────────────────────────────
  if (hoverX === null || projection.rows.length < 2) return;

  const clampedX = Math.max(pad.left, Math.min(width - pad.right, hoverX));
  const rowIndex = Math.min(projection.rows.length - 1, Math.max(0, Math.floor((clampedX - pad.left) / barBand)));
  const row = projection.rows[rowIndex];
  const d = rowData[rowIndex];
  const hx = xFor(rowIndex);

  // Vertical hairline through bar centre
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(hx, pad.top);
  ctx.lineTo(hx, pad.top + plotHeight);
  ctx.stroke();
  ctx.setLineDash([]);

  const lines = [
    { text: `${row.calendarYear}  ·  age ${row.age}`, bold: true },
  ];
  if (!isFreeOnly) {
    d.spending.forEach((seg) => {
      if (seg.v > 0.01) lines.push({ text: `${seg.label}: ${formatCurrency(seg.v)}`, dot: seg.color });
    });
  }
  if (d.surplus > 0.01) {
    lines.push({ text: `Free cash: ${formatCurrency(d.surplus)}`, dot: "#8b5cf6" });
  } else if (d.shortfall < -0.01) {
    lines.push({ text: `Shortfall: ${formatCurrency(Math.abs(d.shortfall))}`, dot: "#ef4444" });
  }
  if (isTaxBreakdown) {
    if (d.basicTax > 0.01)  lines.push({ text: `Basic rate tax: ${formatCurrency(d.basicTax)}`,  dot: "#f97316" });
    if (d.higherTax > 0.01) lines.push({ text: `Higher rate tax: ${formatCurrency(d.higherTax)}`, dot: "#ef4444" });
  } else if (!isFreeOnly && d.tax > 0.01) {
    lines.push({ text: `Tax: ${formatCurrency(d.tax)}`, dot: "#ef4444" });
  }
  const total = d.spending.reduce((s, seg) => s + seg.v, 0) + d.surplus +
    (isTaxBreakdown ? d.basicTax + d.higherTax : isFreeOnly ? 0 : d.tax);
  lines.push({ text: `Total: ${formatCurrency(total)}`, bold: true, sep: true });
  if (row.eventTitles?.length) row.eventTitles.forEach((t) => lines.push({ text: `★ ${t}`, color: "#fde047" }));

  drawChartTooltip(ctx, {
    x: hx, y: pad.top + 10, lines, width, padLeft: pad.left, padRight: pad.right,
    plotTop: pad.top, plotBottom: pad.top + plotHeight, cs,
  });
}

// ── Shared event-star renderer ─────────────────────────────────────────────
// Draws a ★ marker at (cx, cy) with a contrasting glow ring.
function drawEventStar(ctx, cx, cy) {
  const spikes = 5, outerR = 6.5, innerR = 2.8;
  ctx.save();
  ctx.translate(cx, cy);
  // Glow halo
  ctx.beginPath();
  ctx.arc(0, 0, outerR + 3.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fill();
  // Star path
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fillStyle = "#fde047";      // bright yellow star
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();
}

// ── Shared tooltip renderer used by all three charts ───────────────────────
// lines: [{ text, bold, color, dot }]  dot = stroke color | null
function drawChartTooltip(ctx, { x: hx, y: ty, lines, width, padLeft, padRight, plotTop, plotBottom, cs }) {
  const ttFont = cs.font;
  const ttBold = ttFont.replace("12px", "bold 12px");
  const lineH = 19;
  const dotColW = 14;
  const ttPadX = 12;
  const ttPadY = 10;

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

  // Background
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

    // Separator before last line (total)
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
    // Tooltip BG is always near-black — use fixed light colours regardless of theme
    const ttPrimary = "#e8edf8";
    const ttMuted = "rgba(180,195,220,0.9)";
    ctx.fillStyle = line.color || (line.bold ? ttPrimary : ttMuted);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(line.text, textX, lineY);
  });
}

// Last-render state for each canvas — lets mouse events re-render with hoverX
let _savingsChartProjection = null;
let _incomeChartState = null;   // { projection, mode, series, axisStep }
let _spendingChartState = null; // { projection, realTerms, monthly, mode }

function renderChart(projection) {
  _savingsChartProjection = projection;
  _spendingChartState = { projection, realTerms: uiState.spendingChartReal, monthly: uiState.spendingChartMonthly, mode: uiState.spendingChartMode };
  _incomeChartState = { projection };
  const potCollapsed = Boolean(uiState.collapsedPanels?.["Savings & pot"]);
  const incomeCollapsed = Boolean(uiState.collapsedPanels?.["Income"]);
  const spendingCollapsed = Boolean(uiState.collapsedPanels?.["Spending"]);

  if (!spendingCollapsed) {
    const mode = uiState.spendingChartMode;
    renderSpendingChartCanvas({ canvas: spendingChartCanvas, projection, realTerms: uiState.spendingChartReal, monthly: uiState.spendingChartMonthly, mode });
    const captionParts = [];
    if (mode === "freeOnly") captionParts.push("free cash only");
    if (mode === "taxBreakdown") captionParts.push("tax breakdown");
    if (uiState.spendingChartMonthly) captionParts.push("monthly averages");
    if (uiState.spendingChartReal) captionParts.push("today's money");
    spendingChartCaption.textContent = captionParts.length ? `Showing ${captionParts.join(", ")}` : "Annual nominal values";
  }

  if (!potCollapsed) {
    renderStackedSavingsChartCanvas({ canvas: potChartCanvas, projection, showPreRetirement: uiState.savingsShowPreRetirement, view: uiState.savingsView });
  }

  if (!incomeCollapsed) {
    renderStackedIncomeChartCanvas({ canvas: incomeChartCanvas, projection });
  }
}

// Picks a "nice" axis step (1/2/5 × 10^n) so Y-axis labels stay legibly spaced
// regardless of the value range, instead of a fixed step that crowds together
// once the range grows (e.g. long plans or large pots).
function niceAxisStep(range, plotHeight, minLabelSpacingPx = 32) {
  if (!(range > 0) || !(plotHeight > 0)) return 1;
  const maxTicks = Math.max(2, Math.floor(plotHeight / minLabelSpacingPx));
  const roughStep = range / maxTicks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;
  const niceResidual = residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1;
  return niceResidual * magnitude;
}

function getChartStyle() {
  const style = getComputedStyle(document.documentElement);
  const get = (v) => style.getPropertyValue(v).trim();
  return {
    labelColor: get("--muted") || "#6c5b48",
    legendColor: get("--text") || "#4f4032",
    gridColor: get("--line") || "rgba(38,25,12,0.12)",
    font: `12px ${document.body.style.fontFamily || "system-ui, sans-serif"}`,
  };
}

function renderChartCanvas({ canvas, projection, axisStep, series, maxFallback = 0, minFloor = null, hoverX = null }) {
  const cs = getChartStyle();
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const pad = { top: 42, right: 22, bottom: 56, left: 70 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const values = projection.rows.flatMap((row) => series.map((seriesDef) => row[seriesDef.key]));
  const rawMinValue = minFloor === null ? Math.min(0, ...values) : Math.min(minFloor, ...values);
  const rawMaxValue = Math.max(...values, maxFallback);
  const minValue = minFloor === null
    ? Math.floor(rawMinValue / axisStep) * axisStep
    : minFloor;
  const maxValue = Math.max(axisStep, Math.ceil(rawMaxValue / axisStep) * axisStep);
  const range = Math.max(maxValue - minValue, axisStep);

  const xFor = (index) =>
    pad.left + (projection.rows.length === 1 ? 0 : (index / (projection.rows.length - 1)) * plotWidth);
  const yFor = (value) => pad.top + plotHeight - ((value - minValue) / range) * plotHeight;

  const yTicks = [];
  for (let value = minValue; value <= maxValue; value += axisStep) {
    yTicks.push(value);
  }

  ctx.strokeStyle = cs.gridColor;
  ctx.lineWidth = 1;
  yTicks.forEach((value) => {
    const y = yFor(value);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
  });

  const zeroY = yFor(0);
  ctx.strokeStyle = "rgba(180, 35, 24, 0.45)";
  ctx.beginPath();
  ctx.moveTo(pad.left, zeroY);
  ctx.lineTo(width - pad.right, zeroY);
  ctx.stroke();

  const drawSeries = ({ key, color, fill, dash = [] }) => {
    ctx.beginPath();
    projection.rows.forEach((row, index) => {
      const x = xFor(index);
      const y = yFor(row[key]);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    if (fill) {
      ctx.lineTo(xFor(projection.rows.length - 1), yFor(minValue));
      ctx.lineTo(xFor(0), yFor(minValue));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.beginPath();
      projection.rows.forEach((row, index) => {
        const x = xFor(index);
        const y = yFor(row[key]);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash(dash);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  series.forEach(drawSeries);

  ctx.fillStyle = cs.labelColor;
  ctx.font = cs.font;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  yTicks.forEach((value) => {
    const y = yFor(value);
    ctx.fillText(formatCurrency(value), 8, y);
  });

  const targetYearLabels = Math.max(4, Math.min(8, Math.floor(plotWidth / 90)));
  const yearStep = Math.max(1, Math.ceil((projection.rows.length - 1) / Math.max(1, targetYearLabels - 1)));
  const yearLabelIndexes = [];
  for (let index = 0; index < projection.rows.length; index += yearStep) {
    yearLabelIndexes.push(index);
  }
  if (yearLabelIndexes[yearLabelIndexes.length - 1] !== projection.rows.length - 1) {
    yearLabelIndexes.push(projection.rows.length - 1);
  }

  ctx.fillStyle = cs.labelColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  yearLabelIndexes.forEach((rowIndex) => {
    const x = xFor(rowIndex);
    const row = projection.rows[rowIndex];
    ctx.fillText(String(row.calendarYear), x, height - 34);
    ctx.fillText(`(age ${row.age})`, x, height - 18);
  });

  let legendX = pad.left;
  let legendY = 16;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = cs.font;
  series.forEach((item) => {
    const itemWidth = ctx.measureText(item.label).width + 62;
    if (legendX > pad.left && legendX + itemWidth > width - pad.right) {
      legendX = pad.left;
      legendY += 18;
    }
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 3;
    ctx.setLineDash(item.dash || []);
    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 22, legendY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = cs.legendColor;
    ctx.fillText(item.label, legendX + 28, legendY);
    legendX += itemWidth;
  });

  // ── Hover tooltip ────────────────────────────────────────────────────────
  if (hoverX === null || projection.rows.length < 2) return;

  const n = projection.rows.length;
  const clampedX = Math.max(pad.left, Math.min(width - pad.right, hoverX));
  const rowIndex = Math.min(n - 1, Math.max(0, Math.round(((clampedX - pad.left) / plotWidth) * (n - 1))));
  const row = projection.rows[rowIndex];
  const hx = xFor(rowIndex);

  // Hairline + dots on each series
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(hx, pad.top);
  ctx.lineTo(hx, pad.top + plotHeight);
  ctx.stroke();
  ctx.setLineDash([]);

  series.forEach((s) => {
    ctx.beginPath();
    ctx.arc(hx, yFor(row[s.key]), 5, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  const lines = [
    { text: `${row.calendarYear}  ·  age ${row.age}`, bold: true },
    ...series.map((s) => ({ text: `${s.label}: ${formatCurrency(row[s.key])}`, dot: s.color })),
  ];

  drawChartTooltip(ctx, {
    x: hx, y: pad.top + 10, lines, width, padLeft: pad.left, padRight: pad.right,
    plotTop: pad.top, plotBottom: pad.top + plotHeight, cs,
  });
}

function renderStackedSavingsChartCanvas({ canvas, projection, showPreRetirement = false, view = "combined", hoverX = null }) {
  if (!canvas.clientWidth) return;

  // All possible layers — filtered by view below
  const personalKeys = new Set(["totalPotAfterGrowth","premiumBondsLeft","isaSavingsLeft","bankSavingsLeft"]);
  const partnerKeys  = new Set(["partnerPotAfterGrowth","partnerSavingsLeft"]);

  const allRows = showPreRetirement && projection.preRetirementRows?.length
    ? [...projection.preRetirementRows, ...projection.rows]
    : projection.rows;
  const retirementSplitIndex = showPreRetirement ? (projection.preRetirementRows?.length ?? 0) : -1;

  // Layers drawn bottom → top. Colours chosen for maximum differentiation.
  let layers = [
    { key: "totalPotAfterGrowth", label: "My pension pot",  color: "#10b981", fill: "rgba(16,185,129,0.72)" },
    { key: "premiumBondsLeft",    label: "Premium Bonds",   color: "#f59e0b", fill: "rgba(245,158,11,0.70)" },
    { key: "isaSavingsLeft",      label: "ISA",             color: "#3b82f6", fill: "rgba(59,130,246,0.70)" },
    { key: "bankSavingsLeft",     label: "Bank savings",    color: "#a855f7", fill: "rgba(168,85,247,0.70)" },
  ];
  if (allRows.some((r) => (r.partnerPotAfterGrowth || 0) > 0.5)) {
    layers.splice(1, 0, { key: "partnerPotAfterGrowth", label: "Partner pot", color: "#06b6d4", fill: "rgba(6,182,212,0.70)" });
  }
  if (allRows.some((r) => (r.partnerSavingsLeft || 0) > 0.5)) {
    layers.push({ key: "partnerSavingsLeft", label: "Partner savings", color: "#f43f5e", fill: "rgba(244,63,94,0.70)" });
  }
  if (view === "personal") {
    layers = layers.filter((l) => personalKeys.has(l.key));
  } else if (view === "partner") {
    layers = layers.filter((l) => partnerKeys.has(l.key));
  }

  const n = allRows.length;
  const stackTotals = allRows.map((row) =>
    layers.reduce((sum, l) => sum + Math.max(0, row[l.key] || 0), 0)
  );

  const cs = getChartStyle();
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight || canvas.height;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const pad = { top: 60, right: 22, bottom: 56, left: 70 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const rawMax = Math.max(...stackTotals, projection.totalRetirementPot || 0);
  const axisStep = niceAxisStep(rawMax, plotHeight);
  const maxValue = Math.max(axisStep, Math.ceil(rawMax / axisStep) * axisStep);

  const xFor = (i) => pad.left + (n === 1 ? 0 : (i / (n - 1)) * plotWidth);
  // valueToY — a thin band gets a guaranteed minimum 3px height so it's always visible
  const yFor = (v) => pad.top + plotHeight - (Math.max(0, v) / maxValue) * plotHeight;
  const yForBand = (base, top) => {
    const rawBase = yFor(base);
    const rawTop = yFor(top);
    const minPx = 3;
    if (top <= base) return { yTop: rawBase, yBase: rawBase };
    const diff = rawBase - rawTop;
    if (diff < minPx) {
      return { yTop: rawBase - minPx, yBase: rawBase };
    }
    return { yTop: rawTop, yBase: rawBase };
  };

  // Grid + Y labels
  ctx.font = cs.font;
  for (let v = 0; v <= maxValue; v += axisStep) {
    const y = yFor(v);
    ctx.strokeStyle = cs.gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillStyle = cs.labelColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(formatCurrency(v), 8, y);
  }

  // Draw stacked area layers + capture per-row tops for tooltip/dots
  const baselines = new Array(n).fill(0);
  const allTops = []; // allTops[layerIndex][rowIndex] = cumulative top value

  layers.forEach((layer) => {
    const tops = allRows.map((row, i) =>
      baselines[i] + Math.max(0, row[layer.key] || 0)
    );
    allTops.push([...tops]);

    // Filled polygon
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
    ctx.fillStyle = layer.fill;
    ctx.fill();

    // Top-edge stroke
    ctx.beginPath();
    tops.forEach((v, i) => {
      const { yTop } = yForBand(baselines[i], v);
      if (i === 0) ctx.moveTo(xFor(i), yTop); else ctx.lineTo(xFor(i), yTop);
    });
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.stroke();

    tops.forEach((v, i) => { baselines[i] = v; });
  });

  // Retirement divider line (only when showing pre-retirement; skip in partner-only view)
  if (retirementSplitIndex > 0 && retirementSplitIndex < n && view !== "partner") {
    const rx = xFor(retirementSplitIndex);
    // Shaded overlay on pre-retirement side
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(pad.left, pad.top, rx - pad.left, plotHeight);
    // Vertical dashed line
    ctx.strokeStyle = "rgba(255,220,80,0.85)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(rx, pad.top);
    ctx.lineTo(rx, pad.top + plotHeight);
    ctx.stroke();
    ctx.setLineDash([]);
    // "RETIREMENT" label — badge style
    const badgeText = `Retirement ${projection.retirementYear}`;
    ctx.font = "bold 11px " + (cs.font.split("px ")[1] || "sans-serif");
    const bw = ctx.measureText(badgeText).width + 16;
    const bh = 20;
    const bx = rx - bw / 2;
    const by = pad.top + plotHeight - bh - 14;
    ctx.fillStyle = "rgba(255,220,80,0.18)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 6); else ctx.rect(bx, by, bw, bh);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,220,80,0.7)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,220,80,1)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, rx, by + bh / 2);
    ctx.restore();
  }

  // Partner retirement marker (skip in personal-only view)
  if (showPreRetirement && projection.partnerRetirementYear && view !== "personal") {
    const pIdx = allRows.findIndex((r) => r.calendarYear >= projection.partnerRetirementYear);
    if (pIdx > 0 && pIdx < n) {
      const px = xFor(pIdx);
      ctx.save();
      ctx.strokeStyle = "rgba(6,182,212,0.85)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(px, pad.top);
      ctx.lineTo(px, pad.top + plotHeight);
      ctx.stroke();
      ctx.setLineDash([]);
      const pBadge = `Partner retires ${projection.partnerRetirementYear}`;
      ctx.font = "bold 11px " + (cs.font.split("px ")[1] || "sans-serif");
      const pbw = ctx.measureText(pBadge).width + 16;
      const pbh = 20;
      const pbx = px - pbw / 2;
      const pby = pad.top + 14;
      ctx.fillStyle = "rgba(6,182,212,0.18)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pbx, pby, pbw, pbh, 6); else ctx.rect(pbx, pby, pbw, pbh);
      ctx.fill();
      ctx.strokeStyle = "rgba(6,182,212,0.7)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "rgba(6,182,212,1)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(pBadge, px, pby + pbh / 2);
      ctx.restore();
    }
  }

  // X-axis year labels
  const targetLabels = Math.max(4, Math.min(8, Math.floor(plotWidth / 90)));
  const yearStep = Math.max(1, Math.ceil((n - 1) / Math.max(1, targetLabels - 1)));
  const yearLabelIdxs = [];
  for (let i = 0; i < n; i += yearStep) yearLabelIdxs.push(i);
  if (yearLabelIdxs[yearLabelIdxs.length - 1] !== n - 1) yearLabelIdxs.push(n - 1);
  ctx.fillStyle = cs.labelColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  yearLabelIdxs.forEach((ri) => {
    const row = allRows[ri];
    ctx.fillText(String(row.calendarYear), xFor(ri), height - 34);
    ctx.fillText(`(age ${row.age})`, xFor(ri), height - 18);
  });

  // Legend
  let lx = pad.left, ly = 16;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = cs.font;
  layers.forEach((item) => {
    const iw = ctx.measureText(item.label).width + 34;
    if (lx > pad.left && lx + iw > width - pad.right) { lx = pad.left; ly += 18; }
    ctx.fillStyle = item.fill;
    ctx.fillRect(lx, ly - 6, 18, 12);
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(lx, ly - 6, 18, 12);
    ctx.fillStyle = cs.legendColor;
    ctx.fillText(item.label, lx + 24, ly);
    lx += iw + 8;
  });

  // ── Event stars across the full timeline ─────────────────────────────────
  allRows.forEach((row, xi) => {
    if (row.eventTitles?.length) {
      drawEventStar(ctx, xFor(xi), pad.top + plotHeight - 12);
    }
  });

  // ── Hover tooltip ────────────────────────────────────────────────────────
  if (hoverX === null || n < 2) return;

  const clampedX = Math.max(pad.left, Math.min(width - pad.right, hoverX));
  const rowIndex = Math.min(n - 1, Math.max(0, Math.round(((clampedX - pad.left) / plotWidth) * (n - 1))));
  const row = allRows[rowIndex];
  const isPreRetirement = retirementSplitIndex > 0 && rowIndex < retirementSplitIndex;
  const hx = xFor(rowIndex);

  // Vertical hairline
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(hx, pad.top);
  ctx.lineTo(hx, pad.top + plotHeight);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Dots at the top of each band at the hover column
  let dotBase = 0;
  layers.forEach((layer, li) => {
    const v = Math.max(0, row[layer.key] || 0);
    const top = dotBase + v;
    const { yTop } = yForBand(dotBase, top);
    ctx.beginPath();
    ctx.arc(hx, yTop, 5, 0, Math.PI * 2);
    ctx.fillStyle = layer.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    dotBase = top;
  });

  const phaseLabel = isPreRetirement ? "  · pre-retirement" : "";
  const lines = [
    { text: `${row.calendarYear}  ·  age ${row.age}${phaseLabel}`, bold: true },
    ...layers.map((l) => ({ text: `${l.label}: ${formatCurrency(row[l.key] || 0)}`, dot: l.color })),
    { text: `Total: ${formatCurrency(stackTotals[rowIndex])}`, bold: true, sep: true },
    ...(row.eventTitles?.length ? row.eventTitles.map((t) => ({ text: `★ ${t}`, color: "#fde047" })) : []),
  ];

  drawChartTooltip(ctx, {
    x: hx, y: pad.top + 12, lines, width, padLeft: pad.left, padRight: pad.right,
    plotTop: pad.top, plotBottom: pad.top + plotHeight, cs,
  });
}

function renderStackedIncomeChartCanvas({ canvas, projection, hoverX = null }) {
  // Add computed split-savings keys to each row (my personal vs partner)
  const rows = projection.rows.map((row) => ({
    ...row,
    _mySavingsUsed:      (row.bankSavingsUsed || 0) + (row.isaSavingsUsed || 0) + (row.premiumBondsUsed || 0),
    _partnerSavingsUsed: row.partnerSavingsUsed || 0,
  }));
  const incomeSources = [
    { key: "partnerIncome",          label: "Partner work",             color: "#2563eb" },
    { key: "partnerStatePension",    label: "Partner state pension",    color: "#16a34a" },
    { key: "ownStatePension",        label: "My state pension",         color: "#0f766e" },
    { key: "definedBenefitIncome",          label: "My DB pension",         color: "#0891b2" },
    { key: "definedBenefitLumpSum",         label: "My DB lump sum",        color: "#06b6d4" },
    { key: "annuityIncome",                 label: "Annuity income",        color: "#6366f1" },
    { key: "annuityTaxFreeCash",            label: "Annuity TFLS",          color: "#818cf8" },
    { key: "partnerDefinedBenefitIncome",   label: "Partner DB pension",    color: "#f97316" },
    { key: "partnerDefinedBenefitLumpSum",  label: "Partner DB lump sum",   color: "#fdba74" },
    { key: "partnerPotDrawdown",            label: "Partner DC pension",    color: "#22d3ee" },
    { key: "taxFreeCash",                   label: "TFLS",                  color: "#f59e0b" },
    { key: "grossPensionWithdrawal", label: "Taxable pension withdrawn", color: "#7c3aed" },
    { key: "_mySavingsUsed",         label: "My savings",               color: "#db2777" },
    { key: "_partnerSavingsUsed",    label: "Partner savings",          color: "#f472b6" },
  ];
  const needSeries = { key: "totalIncomeRequired", label: "Income needed", color: "#b45309", dash: [7, 5] };
  const stackedTotals = rows.map((row) =>
    incomeSources.reduce((sum, source) => sum + Math.max(0, Number(row[source.key]) || 0), 0)
  );

  const cs = getChartStyle();
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const pad = { top: 60, right: 22, bottom: 56, left: 70 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const rawMax = Math.max(...stackedTotals, ...rows.map((row) => row.totalIncomeRequired));
  const axisStep = niceAxisStep(rawMax, plotHeight);
  const maxValue = Math.max(axisStep, Math.ceil(rawMax / axisStep) * axisStep);
  const yFor = (value) => pad.top + plotHeight - (value / maxValue) * plotHeight;
  const barBand = plotWidth / Math.max(1, rows.length);
  const xFor = (index) => pad.left + index * barBand + barBand / 2;
  const barGap = 3;
  const barWidth = Math.max(6, Math.min(26, barBand - barGap));

  ctx.strokeStyle = cs.gridColor;
  ctx.lineWidth = 1;
  ctx.font = cs.font;
  for (let value = 0; value <= maxValue; value += axisStep) {
    const y = yFor(value);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillStyle = cs.labelColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(formatCurrency(value), 8, y);
  }

  rows.forEach((row, index) => {
    const x = xFor(index) - barWidth / 2;
    let stackedValue = 0;
    incomeSources.forEach((source) => {
      const value = Math.max(0, Number(row[source.key]) || 0);
      if (value <= 0) return;
      const y = yFor(stackedValue + value);
      const segmentHeight = yFor(stackedValue) - y;
      ctx.fillStyle = source.color;
      ctx.fillRect(x, y, barWidth, segmentHeight);
      stackedValue += value;
    });
  });

  ctx.beginPath();
  rows.forEach((row, index) => {
    const x = xFor(index);
    const y = yFor(row[needSeries.key]);
    if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = needSeries.color;
  ctx.lineWidth = 3;
  ctx.setLineDash(needSeries.dash);
  ctx.stroke();
  ctx.setLineDash([]);

  const targetYearLabels = Math.max(4, Math.min(8, Math.floor(plotWidth / 90)));
  const yearStep = Math.max(1, Math.ceil((rows.length - 1) / Math.max(1, targetYearLabels - 1)));
  const yearLabelIndexes = [];
  for (let index = 0; index < rows.length; index += yearStep) yearLabelIndexes.push(index);
  if (yearLabelIndexes[yearLabelIndexes.length - 1] !== rows.length - 1) yearLabelIndexes.push(rows.length - 1);

  ctx.fillStyle = cs.labelColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  yearLabelIndexes.forEach((rowIndex) => {
    const row = rows[rowIndex];
    const x = xFor(rowIndex);
    ctx.fillText(String(row.calendarYear), x, height - 34);
    ctx.fillText(`(age ${row.age})`, x, height - 18);
  });

  // Only legend entries with at least one non-zero value across all rows
  const activeSources = incomeSources.filter((src) =>
    rows.some((r) => (Number(r[src.key]) || 0) > 0.5)
  );

  let legendX = pad.left;
  let legendY = 16;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = cs.font;
  [...activeSources, needSeries].forEach((item) => {
    const itemWidth = ctx.measureText(item.label).width + 58;
    if (legendX > pad.left && legendX + itemWidth > width - pad.right) {
      legendX = pad.left;
      legendY += 18;
    }
    if (item === needSeries) {
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 3;
      ctx.setLineDash(item.dash);
      ctx.beginPath();
      ctx.moveTo(legendX, legendY);
      ctx.lineTo(legendX + 20, legendY);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX, legendY - 5, 18, 10);
    }
    ctx.fillStyle = cs.legendColor;
    ctx.fillText(item.label, legendX + 26, legendY);
    legendX += itemWidth;
  });

  // ── Event stars ───────────────────────────────────────────────────────────
  rows.forEach((row, index) => {
    if (row.eventTitles?.length) {
      drawEventStar(ctx, xFor(index), pad.top + plotHeight - 12);
    }
  });

  // ── Hover tooltip ────────────────────────────────────────────────────────
  if (hoverX === null || rows.length < 2) return;

  const n = rows.length;
  const clampedX = Math.max(pad.left, Math.min(width - pad.right, hoverX));
  const rowIndex = Math.min(n - 1, Math.max(0, Math.floor((clampedX - pad.left) / barBand)));
  const row = rows[rowIndex];
  const hx = xFor(rowIndex);

  // Hairline
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(hx, pad.top);
  ctx.lineTo(hx, pad.top + plotHeight);
  ctx.stroke();
  ctx.setLineDash([]);

  // Build tooltip — only show sources with a non-zero value
  const incomeTotal = incomeSources.reduce((s, src) => s + Math.max(0, Number(row[src.key]) || 0), 0);
  const lines = [
    { text: `${row.calendarYear}  ·  age ${row.age}`, bold: true },
    ...incomeSources
      .filter((src) => (row[src.key] || 0) > 0.01)
      .map((src) => ({ text: `${src.label}: ${formatCurrency(row[src.key])}`, dot: src.color })),
    { text: `Income needed: ${formatCurrency(row[needSeries.key])}`, dot: needSeries.color, sep: true },
    { text: `Total income: ${formatCurrency(incomeTotal)}`, bold: true },
    ...(row.eventTitles?.length ? row.eventTitles.map((t) => ({ text: `★ ${t}`, color: "#fde047" })) : []),
  ];

  drawChartTooltip(ctx, {
    x: hx, y: pad.top + 10, lines, width, padLeft: pad.left, padRight: pad.right,
    plotTop: pad.top, plotBottom: pad.top + plotHeight, cs,
  });
}

function updateField(event) {
  const input = event.target;
  const key = input.dataset.field;
  if (!key) {
    return;
  }

  if (event.type === "input" && LINKED_PLAN_FIELDS.has(key)) {
    const value = parseInputValue(input, state[key]);
    if (Number.isFinite(Number(value))) {
      state[key] = value;
    }
    return;
  }

  if (input.type === "checkbox") {
    state[key] = input.checked;
  } else if (input.type === "number" || isCurrencyInput(input)) {
    state[key] = parseInputValue(input, state[key]);
  } else {
    state[key] = input.value;
  }


  state = normaliseState(state, key);
  render();
}

function adjustRetirementYear(step) {
  const nextRetirementAge = Math.max(state.currentAge, Number(state.retirementAge) + step);
  state = normaliseState({
    ...state,
    retirementAge: nextRetirementAge,
    retirementYear: Number(state.yearOfBirth) + nextRetirementAge,
  });
  render();
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

function exportState() {
  const suggestedName = prompt("Save scenario as", "pension-forecaster-scenario");
  if (suggestedName === null) {
    return;
  }

  const safeName = (suggestedName.trim() || "pension-forecaster-scenario").replace(/[^a-z0-9-_ ]/gi, "_");
  const rows = [["field", "value"]];
  Object.entries(state).forEach(([key, value]) => {
    rows.push([key, String(value)]);
  });
  const payload = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([payload], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeName.toLowerCase().endsWith(".csv") ? safeName : `${safeName}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function percentForExport(value) {
  return Math.round((Number(value) || 0) * 1000) / 10;
}

function moneyForExport(value) {
  return Math.round(normaliseMoney(value));
}

function safeFileName(value, fallback) {
  return (String(value || "").trim() || fallback).replace(/[^a-z0-9-_ ]/gi, "_");
}

function plainObjectForExport(source) {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [
      key,
      typeof value === "number" ? (Number.isFinite(value) ? value : null) : value,
    ]),
  );
}

function buildPlanExportAssumptions(projection) {
  return {
    sourceState: plainObjectForExport(state),
    taxRules: plainObjectForExport(UK_TAX_RULES),
    plan: {
      planName: state.planName,
      currentYear: state.currentYear,
      currentAge: state.currentAge,
      yearOfBirth: state.yearOfBirth,
      retirementYear: state.retirementYear,
      retirementAge: state.retirementAge,
      planYears: state.planYears,
      planToAge: state.planToAge,
      planEndMode: state.planEndMode,
      limitPlanYears: state.limitPlanYears,
      planEndYear: projection.planEndYear,
      planEndAge: projection.planEndAge,
    },
    growthAndInflation: {
      scenario: state.scenario,
      growthLow: state.growthLow,
      growthMid: state.growthMid,
      growthHigh: state.growthHigh,
      postRetirementGrowthLow: state.postRetirementGrowthLow,
      postRetirementGrowthMid: state.postRetirementGrowthMid,
      postRetirementGrowthHigh: state.postRetirementGrowthHigh,
      preRetirementGrowthRateUsed: projection.preRetirementGrowthRate,
      postRetirementGrowthRateUsed: projection.postRetirementGrowthRate,
      applyPotGrowth: state.applyPotGrowth,
      cpiRate: state.cpiRate,
      applyCpiIncome: state.applyCpiIncome,
      incomeValuesRelativeToToday: state.incomeValuesRelativeToToday,
      applyCpiSpending: state.applyCpiSpending,
      applyCpiCar: state.applyCpiCar,
      applyTaxAllowanceCpi: state.applyTaxAllowanceCpi,
      taxAllowanceCpiRate: state.taxAllowanceCpiRate,
      taxBandCpiRate: state.taxBandCpiRate,
      taxBandCpiFrequencyYears: state.taxBandCpiFrequencyYears,
      taxBandCpiStartYear: state.taxBandCpiStartYear,
    },
    incomeNeeds: {
      incomeRequired: state.incomeRequired,
      incomeAfterYear10: state.incomeAfterYear10,
      billsAnnual: state.billsAnnual,
      holidaysAnnual: state.holidaysAnnual,
      carCost: state.carCost,
      carFrequencyYears: state.carFrequencyYears,
      carStartYear: state.carStartYear,
    },
    pension: {
      currentPot: state.currentPot,
      currentCrystallisedPot: state.currentCrystallisedPot,
      lumpSumAllowanceUsed: state.lumpSumAllowanceUsed,
      retirementUncrystallisedPot: projection.retirementUncrystallisedPot,
      retirementCrystallisedPot: projection.retirementCrystallisedPot,
      totalRetirementPot: projection.totalRetirementPot,
      remainingLumpSumAllowanceStart: projection.remainingLumpSumAllowanceStart,
      taxFreeLumpSumAtRetirement: projection.taxFreeLumpSum,
    },
    drawdown: {
      taxOptimisationMode: state.taxOptimisationMode,
      regularDrawdownEnabled: state.regularDrawdownEnabled,
      regularDrawdownAmount: state.regularDrawdownAmount,
      regularDrawdownYears: state.regularDrawdownYears,
      take25PercentYear1: state.take25PercentYear1,
      yearOneTflsMode: state.yearOneTflsMode,
      yearOneTflsAmount: state.yearOneTflsAmount,
      useTflsBy75: state.useTflsBy75,
      maximiseBasicRateDrawdown: state.maximiseBasicRateDrawdown,
      forceTflsTaxablePairing: state.forceTflsTaxablePairing,
    },
    personalIncome: {
      statePension: state.statePension,
      statePensionGrowthRate: state.statePensionGrowthRate,
      myStatePensionPct: state.myStatePensionPct,
      partnerStatePensionPct: state.partnerStatePensionPct,
      definedBenefitEnabled: state.definedBenefitEnabled,
      definedBenefitStartYear: state.definedBenefitStartYear,
      definedBenefitInitialLumpSum: state.definedBenefitInitialLumpSum,
      definedBenefitInitialAnnualAmount: state.definedBenefitInitialAnnualAmount,
      definedBenefitMaxYears: state.definedBenefitMaxYears,
      definedBenefitGrowthRate: state.definedBenefitGrowthRate,
    },
    personalSavings: {
      useSavings: state.useSavings,
      personalSavings: state.personalSavings,
      personalSavingsGrowthRate: state.personalSavingsGrowthRate,
      personalIsaSavings: state.personalIsaSavings,
      personalIsaGrowthRate: state.personalIsaGrowthRate,
      personalBankSavings: state.personalBankSavings,
      personalBankInterestRate: state.personalBankInterestRate,
      personalPremiumBonds: state.personalPremiumBonds,
      personalPremiumBondsGrowthRate: state.personalPremiumBondsGrowthRate,
      personalSavingsAtRetirement: projection.personalSavingsAtRetirement,
      personalIsaSavingsAtRetirement: projection.personalIsaSavingsAtRetirement,
      personalBankSavingsAtRetirement: projection.personalBankSavingsAtRetirement,
      personalPremiumBondsAtRetirement: projection.personalPremiumBondsAtRetirement,
    },
    partner: {
      partnerDetailsEnabled: state.partnerDetailsEnabled,
      partnerBirthYear: state.partnerBirthYear,
      partnerWorkIncome: state.partnerWorkIncome,
      partnerWorkApplyCpi: state.partnerWorkApplyCpi,
      partnerWorkCpiRate: state.partnerWorkCpiRate,
      partnerSavings: state.partnerSavings,
      partnerSavingsGrowthRate: state.partnerSavingsGrowthRate,
      partnerSavingsAtRetirement: projection.partnerSavingsAtRetirement,
      savingsTaxOptimisation: state.savingsTaxOptimisation,
    },
  };
}

function buildProjectionExportSummary(projection) {
  return {
    birthYear: projection.birthYear,
    retirementYear: projection.retirementYear,
    yearsToRetirement: projection.yearsToRetirement,
    planEndYear: projection.planEndYear,
    planEndAge: projection.planEndAge,
    preRetirementGrowthRate: projection.preRetirementGrowthRate,
    postRetirementGrowthRate: projection.postRetirementGrowthRate,
    retirementUncrystallisedPot: projection.retirementUncrystallisedPot,
    retirementCrystallisedPot: projection.retirementCrystallisedPot,
    totalRetirementPot: projection.totalRetirementPot,
    personalSavingsAtRetirement: projection.personalSavingsAtRetirement,
    personalIsaSavingsAtRetirement: projection.personalIsaSavingsAtRetirement,
    personalBankSavingsAtRetirement: projection.personalBankSavingsAtRetirement,
    personalPremiumBondsAtRetirement: projection.personalPremiumBondsAtRetirement,
    partnerSavingsAtRetirement: projection.partnerSavingsAtRetirement,
    totalSeparateSavingsAtRetirement: projection.totalSeparateSavingsAtRetirement,
    totalBankInterestTax: projection.totalBankInterestTax,
    totalPsaUsed: projection.totalPsaUsed,
    taxFreeLumpSum: projection.taxFreeLumpSum,
    remainingLumpSumAllowanceStart: projection.remainingLumpSumAllowanceStart,
    depletionYear: projection.depletionYear,
  };
}

function buildCurrentPlanExport() {
  const projection = calculateProjection(state);
  const rows = projection.rows.map((row) => plainObjectForExport(row));
  const planName = String(state.planName || "").trim() || "Pension plan";
  return {
    version: 2,
    schema: "pension-forecaster-plan-export",
    planName,
    exportedAt: new Date().toISOString(),
    rowCount: rows.length,
    appState: plainObjectForExport(state),
    assumptions: buildPlanExportAssumptions(projection),
    projection: {
      summary: buildProjectionExportSummary(projection),
      columns: Object.keys(rows[0] || {}),
      rows,
      preRetirementRows: (projection.preRetirementRows || []).map((row) => plainObjectForExport(row)),
    },
    retirementYear: projection.retirementYear,
    partnerRetirementYear: projection.partnerRetirementYear ?? null,
    chart: {
      stackedBarSeries: [
        { key: "partnerIncome", label: "Partner work income" },
        { key: "partnerStatePension", label: "Partner state pension" },
        { key: "ownStatePension", label: "My state pension" },
        { key: "definedBenefitIncome", label: "My DB pension" },
        { key: "definedBenefitLumpSum", label: "DB lump sum" },
        { key: "annuityIncome", label: "Annuity income" },
        { key: "annuityTaxFreeCash", label: "Annuity TFLS" },
        { key: "taxFreeCash", label: "TFLS" },
        { key: "grossPensionWithdrawal", label: "Taxable pension withdrawn" },
        { key: "sourcedFromSavings", label: "Sourced from savings" },
      ],
      comparisonSeries: [
        { key: "totalIncomeRequired", label: "Required income" },
        { key: "householdBills", label: "Bills" },
        { key: "holidays", label: "Holidays" },
        { key: "estimatedTax", label: "Estimated tax" },
        { key: "excessNet", label: "Free cash" },
        { key: "totalPotAfterGrowth", label: "Pot after growth" },
        { key: "savingsLeft", label: "Savings left" },
      ],
    },
  };
}

function exportPlan() {
  const payload = buildCurrentPlanExport();
  const planName = payload.planName || "Pension plan";
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeFileName(planName, "pension-forecaster-plan")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function exportTableToExcel() {
  const columns = getTableColumns();
  const headerCells = Array.from(document.querySelectorAll("#projection-head th"));
  const bodyRows = Array.from(document.querySelectorAll("#projection-body tr"));
  if (headerCells.length === 0 || bodyRows.length === 0) {
    return;
  }

  // ── Pre-retirement section ───────────────────────────────────────────────
  const projection = calculateProjection(state);
  const preRows = projection.preRetirementRows || [];
  const preColSpan = headerCells.length;
  const preCols = [
    ["calendarYear",     "Calendar Year"],
    ["age",              "Age"],
    ["totalPotAfterGrowth", "Pension Pot"],
    ["premiumBondsLeft", "Premium Bonds"],
    ["isaSavingsLeft",   "ISA"],
    ["bankSavingsLeft",  "Bank Savings"],
    ["partnerSavingsLeft","Partner Savings"],
    ["eventTitles",      "Events"],
  ];
  const preHeaderHtml = `<tr style="background:#d0e8ff">${preCols.map(([, label]) => `<th colspan="${Math.max(1, Math.floor(preColSpan / preCols.length))}">${escapeHtml(label)}</th>`).join("")}</tr>`;
  const preBodyHtml = preRows.map((row) =>
    `<tr>${preCols.map(([key]) => {
      const val = row[key];
      const display = Array.isArray(val) ? val.join(", ") : (typeof val === "number" ? Math.round(val) : (val ?? ""));
      return `<td>${escapeHtml(String(display))}</td>`;
    }).join("")}</tr>`
  ).join("");
  const preTableHtml = preRows.length ? `
    <tr><th colspan="${preColSpan}" style="background:#2563eb;color:#fff;padding:6px">Pre-Retirement Growth (${projection.retirementYear - (preRows[0]?.calendarYear ?? projection.retirementYear)} years to retirement)</th></tr>
    ${preHeaderHtml}${preBodyHtml}
    <tr><td colspan="${preColSpan}" style="background:#f0f4ff;font-style:italic">↑ Pre-retirement phase &nbsp;&nbsp; ↓ Retirement phase (Year 1 = ${projection.retirementYear}, age ${state.retirementAge})</td></tr>
  ` : "";

  // ── Post-retirement section ──────────────────────────────────────────────
  const headerHtml = `<tr>${headerCells.map((cell) => `<th>${escapeHtml(cell.textContent || "")}</th>`).join("")}</tr>`;
  const calcRowHtml = `<tr>${columns.map(([key, label], index) => {
    const note = index === 0
      ? `Calculation notes: ${getColumnCalculationNote(key, label)}`
      : getColumnCalculationNote(key, label);
    return `<td style="font-style:italic;background:#f9f3e9;">${escapeHtml(note)}</td>`;
  }).join("")}</tr>`;
  const bodyHtml = bodyRows.map((row) => {
    const cells = Array.from(row.querySelectorAll("td"));
    return `<tr>${cells.map((cell) => `<td>${escapeHtml(cell.textContent || "")}</td>`).join("")}</tr>`;
  }).join("");

  const worksheet = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8">
    <meta name="ProgId" content="Excel.Sheet">
    <meta name="Generator" content="Pension Forecaster">
  </head>
  <body>
    <table>
      <thead>${headerHtml}</thead>
      <tbody>${preTableHtml}${calcRowHtml}${bodyHtml}</tbody>
    </table>
  </body>
</html>`;

  const blob = new Blob([worksheet], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pension-forecaster-${uiState.tableView}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

function excelColumnName(index) {
  let name = "";
  let current = index;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }
  return name;
}

function excelCell(columnIndex, rowIndex, absolute = false) {
  const columnName = excelColumnName(columnIndex);
  return absolute ? `$${columnName}$${rowIndex}` : `${columnName}${rowIndex}`;
}

function exportFormulaWorkbookToExcel() {
  const projection = calculateProjection(state);
  const formulaColumns = [
    ["yearIndex", "Year"],
    ["calendarYear", "Calendar"],
    ["age", "Age"],
    ["incomeRequired", "Base income required"],
    ["carCost", "Car"],
    ["totalIncomeRequired", "Gross income required incl. car"],
    ["partnerIncome", "Partner work income"],
    ["partnerStatePension", "Partner state pension"],
    ["ownStatePension", "My state pension"],
    ["definedBenefitIncome", "My DB pension"],
    ["definedBenefitLumpSum", "DB lump sum"],
    ["taxFreeCash", "TFLS (Tax Free Lump Sum)"],
    ["sourcedFromSavings", "Sourced from Savings"],
    ["incomeTotal", "Income total"],
    ["pensionNeededGross", "From my pension"],
    ["grossPensionWithdrawal", "Taxable pension withdrawn"],
    ["holidays", "Holidays"],
    ["householdBills", "Bills"],
    ["estimatedTax", "Estimated tax"],
    ["excessNet", "Free cash"],
    ["openingPot", "Opening pot"],
    ["withdrawalsTaken", "Withdrawals taken"],
    ["totalPotBeforeGrowth", "Pot before growth"],
    ["growth", "Growth added"],
    ["totalPotAfterGrowth", "Pot after growth"],
    ["remainingLumpSumAllowance", "LSA left"],
    ["savingsLeft", "Savings left"],
  ];
  const colIndex = Object.fromEntries(formulaColumns.map(([key], index) => [key, index + 1]));
  const assumptions = [
    ["Current year", state.currentYear],
    ["Retirement year", state.retirementYear],
    ["Retirement age", state.retirementAge],
    ["Plan to age", state.planToAge],
    ["Partner details enabled", state.partnerDetailsEnabled !== false ? 1 : 0],
    ["Max growth cap", state.maxGrowthRate],
    ["Partner birth year", state.partnerBirthYear],
    ["Partner retirement age", state.partnerRetirementAge],
    ["Income required", state.incomeRequired],
    ["Income after year 10", state.incomeAfterYear10],
    ["CPI rate", state.cpiRate],
    ["Apply CPI to income", state.applyCpiIncome ? 1 : 0],
    ["Income values relative to today", state.incomeValuesRelativeToToday ? 1 : 0],
    ["Car cost", state.carCost],
    ["Car frequency years", state.carFrequencyYears],
    ["Car start year", state.carStartYear],
    ["Partner work income", state.partnerWorkIncome],
    ["Partner work CPI", state.partnerWorkCpiRate],
    ["Apply CPI to partner work", state.partnerWorkApplyCpi ? 1 : 0],
    ["State pension (today)", state.statePension],
    ["State pension growth rate", state.statePensionGrowthRate],
    ["My state pension %", state.myStatePensionPct],
    ["Partner state pension %", state.partnerStatePensionPct],
    ["Defined benefit enabled", state.definedBenefitEnabled ? 1 : 0],
    ["Defined benefit start year", state.definedBenefitStartYear],
    ["Defined benefit initial lump sum", state.definedBenefitInitialLumpSum],
    ["Defined benefit initial annual amount", state.definedBenefitInitialAnnualAmount],
    ["Defined benefit max years", state.definedBenefitMaxYears],
    ["Defined benefit growth rate", state.definedBenefitGrowthRate],
    ["Personal allowance", UK_TAX_RULES.personalAllowance],
    ["Tax bands CPI", state.taxBandCpiRate],
    ["Tax bands every N years", state.taxBandCpiFrequencyYears],
    ["Tax bands start year", state.taxBandCpiStartYear],
    ["Basic rate limit", UK_TAX_RULES.basicRateLimit],
    ["Higher rate limit", UK_TAX_RULES.higherRateLimit],
    ["Allowance taper starts", UK_TAX_RULES.allowanceTaperStarts],
    ["Basic rate", UK_TAX_RULES.basicRate],
    ["Higher rate", UK_TAX_RULES.higherRate],
    ["Additional rate", UK_TAX_RULES.additionalRate],
    ["Bills annual", state.billsAnnual],
    ["Apply CPI to spending", state.applyCpiSpending ? 1 : 0],
    ["Holidays annual", state.holidaysAnnual],
    ["Apply CPI to car", state.applyCpiCar ? 1 : 0],
    ["Post-retirement growth rate", projection.postRetirementGrowthRate],
    ["Apply pot growth", state.applyPotGrowth ? 1 : 0],
    ["Year 1 TFLS enabled", state.take25PercentYear1 ? 1 : 0],
    ["Year 1 TFLS defined amount mode", state.yearOneTflsMode === "defined" ? 1 : 0],
    ["Year 1 TFLS amount", state.yearOneTflsAmount],
    ["Starting uncrystallised pot", projection.retirementUncrystallisedPot],
    ["Starting crystallised pot", projection.retirementCrystallisedPot],
    ["Starting lump sum allowance", projection.remainingLumpSumAllowanceStart],
    ["Use savings", state.useSavings ? 1 : 0],
    ["Starting savings", projection.totalSeparateSavingsAtRetirement],
    ["Tax optimisation mode", state.taxOptimisationMode ? 1 : 0],
    ["Savings tax optimisation", state.savingsTaxOptimisation ?? "my"],
    ["Use TFLS by 75", state.useTflsBy75 ? 1 : 0],
    ["Maximise drawdown to basic rate", state.maximiseBasicRateDrawdown ? 1 : 0],
    ["Force TFLS 25/75 pairing", state.forceTflsTaxablePairing ? 1 : 0],
    ["Use regular drawdown", state.regularDrawdownEnabled ? 1 : 0],
    ["Regular drawdown", state.regularDrawdownAmount],
    ["Regular drawdown years", state.regularDrawdownYears],
  ];
  const assumptionRef = Object.fromEntries(assumptions.map(([label], index) => [label, excelCell(2, index + 2, true)]));
  const tableHeaderRow = assumptions.length + 3;
  const firstDataRow = tableHeaderRow + 1;
  const cell = (key, rowIndex) => excelCell(colIndex[key], rowIndex);
  const valueFor = (row, key) => normaliseMoney(row[key] ?? 0);
  const formulaFor = (row, rowIndex, rowNumber, key) => {
    const previousRow = rowIndex > 0 ? rowNumber - 1 : null;
    const targetGross = `MAX(0,${cell("totalIncomeRequired", rowNumber)}-SUM(${cell("partnerIncome", rowNumber)}:${cell("definedBenefitLumpSum", rowNumber)}))`;
    const taxableIncome = `${cell("ownStatePension", rowNumber)}+${cell("definedBenefitIncome", rowNumber)}+${cell("grossPensionWithdrawal", rowNumber)}`;
    const taxBandStepMultiplier = `IF(${cell("calendarYear", rowNumber)}<${assumptionRef["Tax bands start year"]},1,POWER(1+${assumptionRef["Tax bands CPI"]},QUOTIENT(${cell("calendarYear", rowNumber)}-${assumptionRef["Tax bands start year"]},${assumptionRef["Tax bands every N years"]})+1))`;
    const basicRateLimitForYear = `(${assumptionRef["Basic rate limit"]}*${taxBandStepMultiplier})`;
    const higherRateLimitForYear = `(${assumptionRef["Higher rate limit"]}*${taxBandStepMultiplier})`;
    const allowanceTaperStartsForYear = `(${assumptionRef["Allowance taper starts"]}*${taxBandStepMultiplier})`;
    const taxFormula = `LET(myTax,${taxableIncome},basicLimit,${basicRateLimitForYear},higherLimit,${higherRateLimitForYear},taperStart,${allowanceTaperStartsForYear},pa,MAX(0,${assumptionRef["Personal allowance"]}-MAX(0,(myTax-taperStart)/2)),taxable,MAX(0,myTax-pa),basicBand,MAX(0,basicLimit-pa),higherBand,higherLimit-basicLimit,MIN(taxable,basicBand)*${assumptionRef["Basic rate"]}+MIN(MAX(0,taxable-basicBand),higherBand)*${assumptionRef["Higher rate"]}+MAX(0,taxable-basicBand-higherBand)*${assumptionRef["Additional rate"]})`;
    const priorPot = previousRow ? cell("totalPotAfterGrowth", previousRow) : `${assumptionRef["Starting uncrystallised pot"]}+${assumptionRef["Starting crystallised pot"]}`;
    const priorLsa = previousRow ? cell("remainingLumpSumAllowance", previousRow) : assumptionRef["Starting lump sum allowance"];
    const priorSavings = previousRow ? cell("savingsLeft", previousRow) : assumptionRef["Starting savings"];
    const lsaAfterDbLump = `MAX(0,${priorLsa}-${cell("definedBenefitLumpSum", rowNumber)})`;
    const basicRateWithdrawalLimit = `MAX(0,${basicRateLimitForYear}-${cell("ownStatePension", rowNumber)}-${cell("definedBenefitIncome", rowNumber)})`;
    const pairedTaxableWithdrawal = `MIN(${targetGross}*0.75,${basicRateWithdrawalLimit},${cell("openingPot", rowNumber)}*0.75,(${lsaAfterDbLump})*3)`;
    const pairedTfls = `(${pairedTaxableWithdrawal})/3`;
    const standaloneTfls = `MIN(MAX(0,(${lsaAfterDbLump})-(${pairedTfls})),MAX(0,${cell("openingPot", rowNumber)}-(${pairedTaxableWithdrawal})-(${pairedTfls}))*0.25,MAX(0,${targetGross}-(${pairedTaxableWithdrawal})-(${pairedTfls})))`;
    const tflsBy75Formula = `IF(AND(${assumptionRef["Use TFLS by 75"]}=1,${cell("age", rowNumber)}<=75),MIN(${lsaAfterDbLump},${cell("openingPot", rowNumber)}*0.25,(${lsaAfterDbLump})/MAX(1,75-${cell("age", rowNumber)}+1)),0)`;
    const maximisedDrawdownTfls = `IF(${assumptionRef["Maximise drawdown to basic rate"]}=1,MIN(${lsaAfterDbLump},${cell("openingPot", rowNumber)}*0.25,(${basicRateWithdrawalLimit})/3),0)`;
    const drawdownSafeTflsBy75Formula = `IF(AND(${assumptionRef["Maximise drawdown to basic rate"]}=1,${assumptionRef["Force TFLS 25/75 pairing"]}=1),MIN(${tflsBy75Formula},${maximisedDrawdownTfls}),${tflsBy75Formula})`;
    const taxOptimisedTfls = `MAX(${drawdownSafeTflsBy75Formula},(${pairedTfls})+(${standaloneTfls}))`;
    const yearOneTfls = `IF(${assumptionRef["Year 1 TFLS defined amount mode"]}=1,MIN(${assumptionRef["Year 1 TFLS amount"]},${lsaAfterDbLump},${cell("openingPot", rowNumber)}*0.25),MIN(${lsaAfterDbLump},${cell("openingPot", rowNumber)}*0.25))`;
    const standardTfls = `MAX(${drawdownSafeTflsBy75Formula},IF(AND(${assumptionRef["Year 1 TFLS enabled"]}=1,${cell("yearIndex", rowNumber)}=1),${yearOneTfls},IF(AND(${assumptionRef["Use regular drawdown"]}=1,${cell("yearIndex", rowNumber)}<=${assumptionRef["Regular drawdown years"]}),MIN(${lsaAfterDbLump},${assumptionRef["Regular drawdown"]},${cell("openingPot", rowNumber)}*0.25),0)))`;
    const formulas = {
      yearIndex: rowIndex === 0 ? "=1" : `=${cell("yearIndex", previousRow)}+1`,
      calendarYear: rowIndex === 0 ? `=${assumptionRef["Retirement year"]}` : `=${cell("calendarYear", previousRow)}+1`,
      age: rowIndex === 0 ? `=${assumptionRef["Retirement age"]}` : `=${cell("age", previousRow)}+1`,
      incomeRequired: `=LET(yearNo,${cell("yearIndex", rowNumber)},incomeBase,IF(yearNo<=10,${assumptionRef["Income required"]},${assumptionRef["Income after year 10"]}),cpiYears,IF(${assumptionRef["Income values relative to today"]}=1,${assumptionRef["Retirement year"]}-${assumptionRef["Current year"]}+yearNo-1,IF(yearNo<=10,yearNo-1,yearNo-11)),IF(${assumptionRef["Apply CPI to income"]}=1,incomeBase*POWER(1+${assumptionRef["CPI rate"]}/12,12*cpiYears),incomeBase))`,
      carCost: `=IF(AND(${assumptionRef["Car cost"]}>0,${cell("yearIndex", rowNumber)}>=${assumptionRef["Car start year"]},MOD(${cell("yearIndex", rowNumber)}-${assumptionRef["Car start year"]},${assumptionRef["Car frequency years"]})=0),${assumptionRef["Car cost"]},0)`,
      totalIncomeRequired: `=${cell("incomeRequired", rowNumber)}+${cell("carCost", rowNumber)}`,
      partnerIncome: `=IF(${assumptionRef["Partner details enabled"]}=1,IF(${cell("calendarYear", rowNumber)}-${assumptionRef["Partner birth year"]}<${assumptionRef["Partner retirement age"]},IF(${assumptionRef["Apply CPI to partner work"]}=1,${assumptionRef["Partner work income"]}*POWER(1+${assumptionRef["Partner work CPI"]}/12,12*${cell("yearIndex", rowNumber)}),${assumptionRef["Partner work income"]}),0),0)`,
      partnerStatePension: `=IF(${assumptionRef["Partner details enabled"]}=1,IF(${cell("calendarYear", rowNumber)}-${assumptionRef["Partner birth year"]}>67,IF(${assumptionRef["Apply CPI to state/work pensions"]}=1,${assumptionRef["Partner state pension"]}*POWER(1+${assumptionRef["State/work pension CPI"]}/12,12*${cell("yearIndex", rowNumber)}),${assumptionRef["Partner state pension"]}),0),0)`,
      ownStatePension: `=IF(${cell("age", rowNumber)}>67,${assumptionRef["Own state pension"]}*POWER(1+${assumptionRef["Own state pension growth"]}/12,12*${cell("yearIndex", rowNumber)}),0)`,
      definedBenefitIncome: `=IF(AND(${assumptionRef["Defined benefit enabled"]}=1,${cell("calendarYear", rowNumber)}>=${assumptionRef["Defined benefit start year"]},${cell("calendarYear", rowNumber)}<${assumptionRef["Defined benefit start year"]}+${assumptionRef["Defined benefit max years"]}),${assumptionRef["Defined benefit initial annual amount"]}*POWER(1+${assumptionRef["Defined benefit growth rate"]}/12,12*(${cell("calendarYear", rowNumber)}-${assumptionRef["Defined benefit start year"]})),0)`,
      definedBenefitLumpSum: `=IF(AND(${assumptionRef["Defined benefit enabled"]}=1,${cell("calendarYear", rowNumber)}=${assumptionRef["Defined benefit start year"]}),MIN(${priorLsa},${assumptionRef["Defined benefit initial lump sum"]}),0)`,
      tflsBy75Target: `=${tflsBy75Formula}`,
      taxFreeCash: `=MAX(IF(${assumptionRef["Tax optimisation mode"]}=1,${taxOptimisedTfls},${standardTfls}),${maximisedDrawdownTfls})`,
      sourcedFromSavings: `=IF(${assumptionRef["Tax optimisation mode"]}=1,MIN(${priorSavings},MAX(0,${targetGross}-${cell("taxFreeCash", rowNumber)}-${cell("grossPensionWithdrawal", rowNumber)})),0)`,
      incomeTotal: `=SUM(${cell("partnerIncome", rowNumber)}:${cell("definedBenefitLumpSum", rowNumber)})+${cell("taxFreeCash", rowNumber)}`,
      pensionNeededGross: `=${targetGross}`,
      grossPensionWithdrawal: `=LET(baseWithdrawal,IF(${assumptionRef["Tax optimisation mode"]}=1,${pairedTaxableWithdrawal},MAX(0,${cell("pensionNeededGross", rowNumber)}-${cell("taxFreeCash", rowNumber)})),maxDrawdown,IF(${assumptionRef["Maximise drawdown to basic rate"]}=1,${basicRateWithdrawalLimit},0),pairedWithdrawal,IF(${assumptionRef["Force TFLS 25/75 pairing"]}=1,${cell("taxFreeCash", rowNumber)}*3,0),MAX(baseWithdrawal,maxDrawdown,pairedWithdrawal))`,
      holidays: `=IF(${assumptionRef["Apply CPI to holidays"]}=1,${assumptionRef["Holidays annual"]}*POWER(1+${assumptionRef["CPI rate"]}/12,12*(${assumptionRef["Retirement year"]}-${assumptionRef["Current year"]}+${cell("yearIndex", rowNumber)}-1)),${assumptionRef["Holidays annual"]})`,
      householdBills: `=IF(${assumptionRef["Apply CPI to bills"]}=1,${assumptionRef["Bills annual"]}*POWER(1+${assumptionRef["CPI rate"]}/12,12*(${assumptionRef["Retirement year"]}-${assumptionRef["Current year"]}+${cell("yearIndex", rowNumber)}-1)),${assumptionRef["Bills annual"]})`,
      estimatedTax: `=${taxFormula}`,
      excessNet: `=${cell("incomeTotal", rowNumber)}+${cell("grossPensionWithdrawal", rowNumber)}+${cell("sourcedFromSavings", rowNumber)}-${cell("estimatedTax", rowNumber)}-${cell("householdBills", rowNumber)}-${cell("holidays", rowNumber)}`,
      openingPot: `=${priorPot}`,
      withdrawalsTaken: `=${cell("taxFreeCash", rowNumber)}+${cell("grossPensionWithdrawal", rowNumber)}`,
      totalPotBeforeGrowth: `=MAX(0,${cell("openingPot", rowNumber)}-${cell("withdrawalsTaken", rowNumber)})`,
      growth: `=IF(${assumptionRef["Apply pot growth"]}=1,${cell("totalPotBeforeGrowth", rowNumber)}*POWER(1+${assumptionRef["Post-retirement growth rate"]}/12,12)-${cell("totalPotBeforeGrowth", rowNumber)},0)`,
      totalPotAfterGrowth: `=${cell("totalPotBeforeGrowth", rowNumber)}+${cell("growth", rowNumber)}`,
      remainingLumpSumAllowance: `=MAX(0,${priorLsa}-${cell("definedBenefitLumpSum", rowNumber)}-${cell("taxFreeCash", rowNumber)})`,
      savingsLeft: `=MAX(0,${priorSavings}-${cell("sourcedFromSavings", rowNumber)})`,
    };
    return formulas[key] || `=${valueFor(row, key)}`;
  };

  const assumptionRows = assumptions.map(([label, value]) =>
    `<tr><td>${escapeHtml(label)}</td><td class="number">${Number(value) || 0}</td></tr>`
  ).join("");
  const headerHtml = `<tr>${formulaColumns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join("")}</tr>`;
  const bodyHtml = projection.rows.map((row, rowIndex) => {
    const rowNumber = firstDataRow + rowIndex;
    return `<tr>${formulaColumns.map(([key]) => {
      const formula = formulaFor(row, rowIndex, rowNumber, key);
      const formulaBody = formula.startsWith("=") ? formula.slice(1) : formula;
      return `<td class="number" x:fmla="${escapeAttribute(formulaBody)}">${valueFor(row, key)}</td>`;
    }).join("")}</tr>`;
  }).join("");

  // ── Pre-retirement rows (simple values, no formulas) ─────────────────────
  const preRetRows = projection.preRetirementRows || [];
  const preRetCols = [
    ["calendarYear",     "Calendar Year"],
    ["age",              "Age"],
    ["totalPotAfterGrowth", "Pension Pot"],
    ["premiumBondsLeft", "Premium Bonds"],
    ["isaSavingsLeft",   "ISA"],
    ["bankSavingsLeft",  "Bank Savings"],
    ["partnerSavingsLeft","Partner Savings"],
    ["eventTitles",      "Events"],
  ];
  const preRetHeader = `<tr style="background:#dbeafe">${preRetCols.map(([, l]) => `<th>${escapeHtml(l)}</th>`).join("")}</tr>`;
  const preRetBody = preRetRows.map((row) =>
    `<tr>${preRetCols.map(([key]) => {
      const val = row[key];
      const display = Array.isArray(val) ? val.join(", ") : (typeof val === "number" ? Math.round(val) : (val ?? ""));
      return `<td class="number">${escapeHtml(String(display))}</td>`;
    }).join("")}</tr>`
  ).join("");
  const preRetSection = preRetRows.length ? `
    <tr><th colspan="${preRetCols.length}" style="background:#1d4ed8;color:#fff;padding:6px">Pre-Retirement Growth (${state.currentYear} – ${state.retirementYear - 1})</th></tr>
    ${preRetHeader}${preRetBody}
    <tr><td colspan="${preRetCols.length}"></td></tr>
  ` : "";

  const workbook = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8">
    <meta name="ProgId" content="Excel.Sheet">
    <meta name="Generator" content="Pension Forecaster">
    <style>
      td, th { border: 1px solid #d6cabc; padding: 4px 6px; }
      th { background: #f3eadc; font-weight: bold; }
      .number { mso-number-format: "0"; }
    </style>
  </head>
  <body>
    <table>
      ${preRetSection}
      <tr><th colspan="2">Assumptions</th></tr>
      ${assumptionRows}
      <tr><td colspan="${formulaColumns.length}"></td></tr>
      ${headerHtml}
      ${bodyHtml}
    </table>
  </body>
</html>`;

  const blob = new Blob([workbook], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pension-forecaster-formulas.xls";
  a.click();
  URL.revokeObjectURL(url);
}

function exportPageToPdf() {
  const previousControlsHidden = uiState.controlsHidden;
  if (uiState.controlsHidden) {
    uiState.controlsHidden = false;
    render();
  }

  const restore = () => {
    window.removeEventListener("afterprint", restore);
    uiState.controlsHidden = previousControlsHidden;
    render();
  };

  window.addEventListener("afterprint", restore, { once: true });
  window.print();
}

function importState(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const raw = String(reader.result || "");
      let parsed;

      if (file.name.toLowerCase().endsWith(".json")) {
        parsed = JSON.parse(raw);
        parsed = stateFromImportedJson(parsed);
      } else {
        const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim().length > 0);
        const dataLines = lines[0] && lines[0].toLowerCase().startsWith("field,") ? lines.slice(1) : lines;
        parsed = {};
        dataLines.forEach((line) => {
          const [key, value = ""] = parseCsvLine(line);
          if (!key) {
            return;
          }
          const trimmedValue = value.trim();
          if (trimmedValue === "true" || trimmedValue === "false") {
            parsed[key] = trimmedValue === "true";
          } else if (trimmedValue !== "" && !Number.isNaN(Number(trimmedValue))) {
            parsed[key] = Number(trimmedValue);
          } else {
            parsed[key] = value;
          }
        });
      }

      state = normaliseState({ ...DEFAULT_STATE, ...parsed });
      render();
    } catch {
      alert("That file could not be read. Please import a plan JSON, CSV, or legacy JSON file exported from this tool.");
    } finally {
      importFile.value = "";
    }
  };
  reader.readAsText(file);
}

function stateFromImportedJson(parsed) {
  if (parsed?.schema === "pension-forecaster-plan-export") {
    return parsed.appState || parsed.assumptions?.sourceState || {};
  }
  return parsed;
}

function resetState() {
  state = normaliseState({ ...DEFAULT_STATE });
  render();
  openBasicSetup();
}

inputs.forEach((input) => {
  // Convert currency number inputs to text so we can display comma formatting
  if (input.type === "number" && isCurrencyInput(input)) {
    input.type = "text";
    input.inputMode = "numeric";
  }
  input.addEventListener("input", updateField);
  input.addEventListener("change", updateField);
  // Focus: strip commas so the user can type/edit freely
  if (isCurrencyInput(input)) {
    input.addEventListener("focus", () => {
      const raw = String(input.value).replace(/,/g, "");
      input.value = raw;
    });
    // Blur: re-apply comma formatting
    input.addEventListener("blur", () => {
      const parsed = parseInputValue(input, null);
      if (parsed !== null) {
        input.value = formatCurrency(parsed);
      }
    });
  }
});

savingsTaxOptimButton.addEventListener("click", (e) => {
  e.stopPropagation();
  const opening = savingsTaxOptimDropdown.hidden;
  closeAllMenus();
  if (opening) {
    savingsTaxOptimDropdown.hidden = false;
    savingsTaxOptimButton.textContent = savingsTaxOptimButton.textContent.replace("▾", "▴");
  }
});
savingsTaxOptimDropdown.addEventListener("click", (e) => e.stopPropagation());
savingsTaxOptimOptions.forEach((btn) => {
  btn.addEventListener("click", () => {
    state.savingsTaxOptimisation = btn.dataset.value;
    savingsTaxOptimButton.textContent = btn.textContent + " ▾";
    savingsTaxOptimDropdown.hidden = true;
    state = normaliseState(state, "savingsTaxOptimisation");
    render();
  });
});

scenarioButton.addEventListener("click", (e) => {
  e.stopPropagation();
  const opening = scenarioDropdown.hidden;
  closeAllMenus();
  if (opening) {
    scenarioDropdown.hidden = false;
    scenarioButton.textContent = scenarioButton.textContent.replace("▾", "▴");
  }
});
scenarioDropdown.addEventListener("click", (e) => e.stopPropagation());
scenarioOptions.forEach((btn) => {
  btn.addEventListener("click", () => {
    state.scenario = Number(btn.dataset.value);
    scenarioButton.textContent = btn.textContent + " ▾";
    scenarioDropdown.hidden = true;
    state = normaliseState(state, "scenario");
    render();
  });
});

partnerScenarioButton.addEventListener("click", (e) => {
  e.stopPropagation();
  const opening = partnerScenarioDropdown.hidden;
  closeAllMenus();
  if (opening) {
    partnerScenarioDropdown.hidden = false;
    partnerScenarioButton.textContent = partnerScenarioButton.textContent.replace("▾", "▴");
  }
});
partnerScenarioDropdown.addEventListener("click", (e) => e.stopPropagation());
partnerScenarioOptions.forEach((btn) => {
  btn.addEventListener("click", () => {
    state.partnerScenario = Number(btn.dataset.value);
    partnerScenarioButton.textContent = btn.textContent + " ▾";
    partnerScenarioDropdown.hidden = true;
    state = normaliseState(state, "partnerScenario");
    render();
  });
});

tableViewButton.addEventListener("click", (e) => {
  e.stopPropagation();
  const opening = tableViewDropdown.hidden;
  closeAllMenus();
  if (opening) {
    tableViewDropdown.hidden = false;
    tableViewButton.textContent = tableViewButton.textContent.replace("▾", "▴");
  }
});
tableViewDropdown.addEventListener("click", (e) => e.stopPropagation());
tableViewOptions.forEach((btn) => {
  btn.addEventListener("click", () => {
    uiState.tableView = btn.dataset.value;
    tableViewButton.textContent = btn.textContent + " ▾";
    tableViewDropdown.hidden = true;
    saveUiState();
    if (uiState.tableView === "custom") openCustomFieldChooser();
    render();
  });
});

closeCustomFieldsButton.addEventListener("click", closeCustomFieldChooser);
chooseCustomFieldsButton.addEventListener("click", openCustomFieldChooser);
closeBasicSetupButton.addEventListener("click", closeBasicSetup);
applyBasicSetupButton.addEventListener("click", closeBasicSetup);

customFieldsDialog.addEventListener("click", (event) => {
  if (event.target === customFieldsDialog) {
    closeCustomFieldChooser();
  }
});

applyCustomFieldsButton.addEventListener("click", () => {
  const selectedKeys = Array.from(customFieldsList.querySelectorAll("input[type='checkbox']:checked"))
    .map((input) => input.value)
    .filter((key) => !CUSTOM_MANDATORY_COLUMN_KEYS.includes(key));
  uiState.customTableFields = selectedKeys;
  saveUiState();
  closeCustomFieldChooser();
  render();
});

granularTaxToggle.addEventListener("change", () => {
  uiState.showGranularTaxFields = granularTaxToggle.checked;
  saveUiState();
  render();
});

granularIncomeToggle.addEventListener("change", () => {
  uiState.showGranularIncomeFields = granularIncomeToggle.checked;
  saveUiState();
  render();
});

granularGrowthToggle.addEventListener("change", () => {
  uiState.showGranularGrowthFields = granularGrowthToggle.checked;
  saveUiState();
  render();
});

granularCrystallisationToggle.addEventListener("change", () => {
  uiState.showGranularCrystallisationFields = granularCrystallisationToggle.checked;
  saveUiState();
  render();
});

savingsPreRetirementToggle.addEventListener("click", () => {
  uiState.savingsShowPreRetirement = !uiState.savingsShowPreRetirement;
  savingsPreRetirementToggle.classList.toggle("chart-toggle-chip-active", Boolean(uiState.savingsShowPreRetirement));
  saveUiState();
  if (_savingsChartProjection && !uiState.collapsedPanels?.["Savings & pot"]) {
    renderStackedSavingsChartCanvas({ canvas: potChartCanvas, projection: _savingsChartProjection, showPreRetirement: uiState.savingsShowPreRetirement, view: uiState.savingsView });
  }
});

[
  [savingsViewPersonalBtn, "personal"],
  [savingsViewPartnerBtn,  "partner"],
  [savingsViewCombinedBtn, "combined"],
].forEach(([btn, view]) => {
  btn.addEventListener("click", () => {
    uiState.savingsView = view;
    savingsViewPersonalBtn.classList.toggle("chart-toggle-chip-active", view === "personal");
    savingsViewPartnerBtn.classList.toggle("chart-toggle-chip-active",  view === "partner");
    savingsViewCombinedBtn.classList.toggle("chart-toggle-chip-active", view === "combined");
    saveUiState();
    if (_savingsChartProjection && !uiState.collapsedPanels?.["Savings & pot"]) {
      renderStackedSavingsChartCanvas({ canvas: potChartCanvas, projection: _savingsChartProjection, showPreRetirement: uiState.savingsShowPreRetirement, view });
    }
  });
});

// Savings chart hover tooltip
potChartCanvas.addEventListener("mousemove", (e) => {
  if (!_savingsChartProjection || uiState.collapsedPanels?.["Savings & pot"]) return;
  const rect = potChartCanvas.getBoundingClientRect();
  renderStackedSavingsChartCanvas({
    canvas: potChartCanvas,
    projection: _savingsChartProjection,
    showPreRetirement: uiState.savingsShowPreRetirement,
    view: uiState.savingsView,
    hoverX: e.clientX - rect.left,
  });
});
potChartCanvas.addEventListener("mouseleave", () => {
  if (!_savingsChartProjection || uiState.collapsedPanels?.["Savings & pot"]) return;
  renderStackedSavingsChartCanvas({ canvas: potChartCanvas, projection: _savingsChartProjection, showPreRetirement: uiState.savingsShowPreRetirement, view: uiState.savingsView });
});

// Income chart hover tooltip
incomeChartCanvas.addEventListener("mousemove", (e) => {
  if (!_incomeChartState || uiState.collapsedPanels?.["Income"]) return;
  const { projection } = _incomeChartState;
  const rect = incomeChartCanvas.getBoundingClientRect();
  renderStackedIncomeChartCanvas({ canvas: incomeChartCanvas, projection, hoverX: e.clientX - rect.left });
});
incomeChartCanvas.addEventListener("mouseleave", () => {
  if (!_incomeChartState || uiState.collapsedPanels?.["Income"]) return;
  renderStackedIncomeChartCanvas({ canvas: incomeChartCanvas, projection: _incomeChartState.projection });
});

// Spending breakdown chart hover tooltip
spendingChartCanvas.addEventListener("mousemove", (e) => {
  if (!_spendingChartState) return;
  const { projection, realTerms, monthly, mode } = _spendingChartState;
  const rect = spendingChartCanvas.getBoundingClientRect();
  renderSpendingChartCanvas({ canvas: spendingChartCanvas, projection, realTerms, monthly, mode, hoverX: e.clientX - rect.left });
});
spendingChartCanvas.addEventListener("mouseleave", () => {
  if (!_spendingChartState) return;
  const { projection, realTerms, monthly, mode } = _spendingChartState;
  renderSpendingChartCanvas({ canvas: spendingChartCanvas, projection, realTerms, monthly, mode });
});


spendingChartRealToggle.addEventListener("click", () => {
  uiState.spendingChartReal = !uiState.spendingChartReal;
  saveUiState();
  render();
});

spendingChartMonthlyToggle.addEventListener("click", () => {
  uiState.spendingChartMonthly = !uiState.spendingChartMonthly;
  saveUiState();
  render();
});

spendingChartFreeToggle.addEventListener("click", () => {
  uiState.spendingChartMode = uiState.spendingChartMode === "freeOnly" ? "full" : "freeOnly";
  saveUiState();
  render();
});
spendingChartTaxToggle.addEventListener("click", () => {
  uiState.spendingChartMode = uiState.spendingChartMode === "taxBreakdown" ? "full" : "taxBreakdown";
  saveUiState();
  render();
});

togglePanelButton.addEventListener("click", () => {
  uiState.controlsHidden = !uiState.controlsHidden;
  saveUiState();
  render();
});

// ── Panel collapse buttons ────────────────────────────────────────────────
document.querySelectorAll(".control-panel .panel, .results-panel .panel").forEach((panel) => {
  const btn = document.createElement("button");
  btn.className = "panel-collapse-btn";
  btn.type = "button";
  btn.textContent = "−";
  const panelId = panel.querySelector("h2")?.textContent?.trim() || "";
  btn.setAttribute("aria-label", "Collapse " + panelId);
  btn.setAttribute("title", "Collapse " + panelId);
  panel.appendChild(btn);
  btn.addEventListener("click", () => {
    const id = panel.querySelector("h2")?.textContent?.trim() || "";
    const isCollapsed = panel.classList.toggle("panel-collapsed");
    btn.textContent = isCollapsed ? "+" : "−";
    btn.setAttribute("aria-label", (isCollapsed ? "Expand " : "Collapse ") + id);
    btn.setAttribute("title", (isCollapsed ? "Expand " : "Collapse ") + id);
    if (!uiState.collapsedPanels) uiState.collapsedPanels = {};
    if (isCollapsed) uiState.collapsedPanels[id] = true;
    else delete uiState.collapsedPanels[id];
    saveUiState();
    if (!isCollapsed && panel.closest(".results-panel")) render();
  });
});

// ── Shared menu helpers ───────────────────────────────────────────────────
function closeAllMenus() {
  tableViewDropdown.hidden = true;
  tableViewButton.textContent = tableViewButton.textContent.replace("▴", "▾");
  ioMenuDropdown.hidden = true;
  ioMenuButton.textContent = "Import / Export ▾";
  scenarioDropdown.hidden = true;
  scenarioButton.textContent = scenarioButton.textContent.replace("▴", "▾");
  partnerScenarioDropdown.hidden = true;
  partnerScenarioButton.textContent = partnerScenarioButton.textContent.replace("▴", "▾");
  savingsTaxOptimDropdown.hidden = true;
  savingsTaxOptimButton.textContent = savingsTaxOptimButton.textContent.replace("▴", "▾");
}

// ── Import / Export dropdown ──────────────────────────────────────────────
const ioMenuButton   = document.getElementById("io-menu-button");
const ioMenuDropdown = document.getElementById("io-menu-dropdown");
ioMenuButton.addEventListener("click", (e) => {
  e.stopPropagation();
  const opening = ioMenuDropdown.hidden;
  closeAllMenus();
  if (opening) {
    ioMenuDropdown.hidden = false;
    ioMenuButton.textContent = "Import / Export ▴";
  }
});
ioMenuDropdown.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", closeAllMenus);

summaryGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-retirement-year-step]");
  if (!button) {
    return;
  }
  adjustRetirementYear(Number(button.dataset.retirementYearStep));
});

toggleTableWidthButton.addEventListener("click", () => {
  uiState.tableExpanded = !uiState.tableExpanded;
  saveUiState();
  render();
});

const closeIoMenu = () => closeAllMenus();
exportTableButton.addEventListener("click", () => { exportTableToExcel(); closeIoMenu(); });
exportFormulaButton.addEventListener("click", () => { exportFormulaWorkbookToExcel(); closeIoMenu(); });
exportPdfButton.addEventListener("click", () => { exportPageToPdf(); closeIoMenu(); });
exportPlanButton.addEventListener("click", () => { exportPlan(); closeIoMenu(); });
resetButton.addEventListener("click", resetState);
versionBadge.addEventListener("click", showVersionChangeDate);
importFile.addEventListener("change", (e) => { importState(e); closeIoMenu(); });
appViewButtons.forEach((button) => {
  button.addEventListener("click", () => setAppView(button.dataset.appView));
});
optimiserFrame?.addEventListener("load", () => {
  optimiserFrameReady = true;
  syncOptimiserTheme();
  syncOptimiserPlan();
});
window.addEventListener("message", (event) => {
  if (window.location.protocol !== "file:" && event.origin !== window.location.origin) return;
  if (event.data?.type !== "retirement-optimiser-height") return;
  const height = Number(event.data.height);
  if (Number.isFinite(height) && height > 400 && optimiserFrame) {
    optimiserFrame.style.height = `${Math.ceil(height)}px`;
  }
});
window.addEventListener("resize", render);

// ─── Share link ───────────────────────────────────────────────────────────

const shareLinkButton = document.getElementById("share-link-button");
const shareDialog = document.getElementById("share-dialog");
const closeShareDialogButton = document.getElementById("close-share-dialog-button");
const shareLinkInput = document.getElementById("share-link-input");
const copyShareLinkButton = document.getElementById("copy-share-link-button");
const shareCopyConfirm = document.getElementById("share-copy-confirm");
let shareCopyTimeout = null;

shareLinkButton.addEventListener("click", () => {
  shareLinkInput.value = generateShareUrl();
  shareCopyConfirm.hidden = true;
  shareDialog.hidden = false;
  // Select the URL so it's easy to copy manually too
  setTimeout(() => shareLinkInput.select(), 50);
});

closeShareDialogButton.addEventListener("click", () => {
  shareDialog.hidden = true;
});

shareDialog.addEventListener("click", (e) => {
  if (e.target === shareDialog) shareDialog.hidden = true;
});

copyShareLinkButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(shareLinkInput.value);
  } catch {
    // Fallback for file:// where clipboard API may be blocked
    shareLinkInput.select();
    document.execCommand("copy");
  }
  shareCopyConfirm.hidden = false;
  clearTimeout(shareCopyTimeout);
  shareCopyTimeout = setTimeout(() => { shareCopyConfirm.hidden = true; }, 2500);
});

setAppView("forecaster");
render();
if (shouldOpenBasicSetupOnLoad) {
  openBasicSetup();
}

// ─── Theme engine ──────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = "pension-forecaster-theme-v1";

MiniTheme.init({
  storageKey:    THEME_STORAGE_KEY,
  onRender:      () => { syncOptimiserTheme(); render(); },
  defaultTheme:  "metallic",
  backgroundUrl: "./background.jpeg",
});
render();
renderSpecialEventsPanel();

// ─── Income vertical sliders ───────────────────────────────────────────────

function formatSliderValue(cfg, value) {
  if (cfg.format === "percent") {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (cfg.format === "number") {
    return `${NUMBER.format(value)}${cfg.unit ? " " + cfg.unit : ""}`;
  }
  if (cfg.format === "year") {
    return String(Math.round(value));
  }
  return formatCurrency(value);
}

const incomeVSliderPopup = document.getElementById("income-vslider-popup");
const incomeVSliderInput = document.getElementById("income-vslider-input");
const incomeVSliderValue = document.getElementById("income-vslider-value");
const incomeVSliderLabel = document.getElementById("income-vslider-label");
let activeIncomeField = null;
let activeIncomeBtn = null;

const INCOME_SLIDER_CONFIG = {
  currentPot:          { label: "Total pension pot",   min: 0,     max: 1000000, step: 5000, format: "currency" },
  partnerCurrentPot:   { label: "Partner pension pot", min: 0,     max: 1000000, step: 5000, format: "currency" },
  personalMonthlyContribution: { label: "Monthly contribution",         min: 0, max: 5000, step: 50, format: "currency" },
  partnerMonthlyContribution:  { label: "Partner monthly contribution", min: 0, max: 5000, step: 50, format: "currency" },
  incomeRequired:      { label: "Income required",     min: 0,     max: 100000, step: 1000, format: "currency" },
  incomeAfterYear10:   { label: "After year 10",       min: 0,     max: 100000, step: 1000, format: "currency" },
  billsAnnual:         { label: "Household bills",     min: 0,     max: 50000,  step: 1000, format: "currency" },
  holidaysAnnual:      { label: "Holidays",            min: 0,     max: 25000,  step: 500,  format: "currency" },
  carCost:             { label: "Car cost",            min: 0,     max: 100000, step: 1000, format: "currency" },
  retirementAge:       { label: "Retirement age",      min: () => state.currentAge, max: 70,  step: 1, format: "number", unit: "yrs" },
  planYears:           { label: "Plan years",          min: 1,     max: 35,     step: 1,    format: "number", unit: "yrs" },
  planToAge:           { label: "Plan to age",         min: () => state.currentAge, max: 100, step: 1, format: "number", unit: "yrs" },
  // Savings (currency)
  personalBankSavings:  { label: "Bank savings",            min: 0,     max: 200000, step: 1000,  format: "currency" },
  personalIsaSavings:   { label: "ISA savings",             min: 0,     max: 200000, step: 1000,  format: "currency" },
  personalPremiumBonds: { label: "Premium Bonds",           min: 0,     max: 50000,  step: 1000,  format: "currency" },
  partnerSavings:       { label: "Partner savings",         min: 0,     max: 200000, step: 1000,  format: "currency" },
  // State pension (shared)
  statePension:         { label: "State pension (today)",   min: 9000,  max: 15000,  step: 100,   format: "currency" },
  partnerRetirementAge: { label: "Partner retirement age", min: 50, max: 75, step: 1, format: "number", unit: "yrs" },
  partnerWorkIncome:    { label: "Partner work income",     min: 0,     max: 30000,  step: 500,   format: "currency" },
  // CPI / inflation rates (0–10%, stored as decimal)
  cpiRate:                    { label: "CPI rate",                  min: 0, max: 0.10, step: 0.005, format: "percent" },
  partnerWorkCpiRate:         { label: "Partner work CPI",          min: 0, max: 0.10, step: 0.005, format: "percent" },
  statePensionGrowthRate:     { label: "State pension growth",      min: 0, max: 0.10, step: 0.005, format: "percent" },
  taxAllowanceCpiRate:        { label: "Tax allowance CPI",         min: 0, max: 0.10, step: 0.005, format: "percent" },
  taxBandCpiRate:             { label: "Tax bands CPI",             min: 0, max: 0.10, step: 0.005, format: "percent" },
  // Growth rates (capped by maxGrowthRate, stored as decimal)
  growthLow:                        { label: "Low pre-retirement",          min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  postRetirementGrowthLow:          { label: "Low post-retirement",         min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  growthMid:                        { label: "Mid pre-retirement",          min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  postRetirementGrowthMid:          { label: "Mid post-retirement",         min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  growthHigh:                       { label: "High pre-retirement",         min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  postRetirementGrowthHigh:         { label: "High post-retirement",        min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  partnerGrowthLow:                 { label: "Partner low pre-retirement",  min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  partnerPostRetirementGrowthLow:   { label: "Partner low post-retirement", min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  partnerGrowthMid:                 { label: "Partner mid pre-retirement",  min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  partnerPostRetirementGrowthMid:   { label: "Partner mid post-retirement", min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  partnerGrowthHigh:                { label: "Partner high pre-retirement", min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  partnerPostRetirementGrowthHigh:  { label: "Partner high post-retirement",min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  definedBenefitGrowthRate:         { label: "DB growth rate",              min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  annuityRate:                      { label: "Annuity rate",                min: 0, max: 0.15, step: 0.005, format: "percent" },
  annuityFixedEscalationRate:       { label: "Annuity escalation rate",     min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  annuityPurchaseYear:              { label: "Annuity purchase year",       min: () => state.retirementYear, max: () => state.retirementYear + 30, step: 1, format: "year" },
  // Savings growth & interest rates (capped by maxGrowthRate, stored as decimal)
  personalBankInterestRate:       { label: "Bank interest",         min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  personalIsaGrowthRate:          { label: "ISA growth",            min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  personalPremiumBondsGrowthRate: { label: "Premium Bonds growth",  min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
  partnerSavingsGrowthRate:       { label: "Partner savings growth", min: 0, max: () => state.maxGrowthRate, step: 0.005, format: "percent" },
};

function positionIncomeSlider(btn) {
  const rect = btn.getBoundingClientRect();
  const popupW = 134;
  const popupH = 318; // fixed height matching CSS content

  let top = rect.top - popupH - 10;
  let left = rect.left + rect.width / 2 - popupW / 2;

  // If too close to top of viewport, flip below the button instead
  if (top < 8) top = rect.bottom + 10;

  // Clamp horizontally to viewport
  left = Math.max(8, Math.min(left, window.innerWidth - popupW - 8));

  // position: fixed — viewport coords only, no scrollY
  incomeVSliderPopup.style.top = `${top}px`;
  incomeVSliderPopup.style.left = `${left}px`;
}

document.querySelectorAll(".income-popup-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const fieldKey = btn.dataset.for;
    const cfg = INCOME_SLIDER_CONFIG[fieldKey] || { label: fieldKey, min: 0, max: 100000, step: 1000 };

    // Toggle off if same button clicked again
    if (!incomeVSliderPopup.hidden && activeIncomeField === fieldKey) {
      incomeVSliderPopup.hidden = true;
      btn.classList.remove("active");
      activeIncomeField = null;
      activeIncomeBtn = null;
      return;
    }

    // Switch to this field
    if (activeIncomeBtn) activeIncomeBtn.classList.remove("active");
    activeIncomeField = fieldKey;
    activeIncomeBtn = btn;
    btn.classList.add("active");

    // Resolve dynamic min/max (can be a function e.g. () => state.currentAge)
    const resolvedMin = typeof cfg.min === "function" ? cfg.min() : cfg.min;
    const resolvedMax = typeof cfg.max === "function" ? cfg.max() : cfg.max;

    // Apply field-specific slider range
    incomeVSliderInput.min  = resolvedMin;
    incomeVSliderInput.max  = resolvedMax;
    incomeVSliderInput.step = cfg.step;

    const currentValue = Math.max(resolvedMin, Math.min(resolvedMax, Number(state[fieldKey]) || 0));
    incomeVSliderInput.value = currentValue;
    incomeVSliderValue.textContent = formatSliderValue(cfg, currentValue);
    incomeVSliderLabel.textContent = cfg.label;

    // Update cap labels
    document.querySelector(".income-vslider-cap:first-of-type").textContent =
      formatSliderValue(cfg, resolvedMax);
    document.querySelector(".income-vslider-cap:last-of-type").textContent =
      formatSliderValue(cfg, resolvedMin);

    positionIncomeSlider(btn);
    incomeVSliderPopup.hidden = false;
    // Auto-focus the range input so arrow keys work immediately
    requestAnimationFrame(() => incomeVSliderInput.focus());
  });
});

// ── Arrow-key nudge on all data-field inputs ──────────────────────────────
// Up/Down arrows step by the slider config step (or input's own step attr).
// Prevents browser default (which only steps by 1 on number inputs).
document.querySelectorAll("input[data-field]").forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const fieldKey = input.dataset.field;
    const cfg = INCOME_SLIDER_CONFIG[fieldKey];
    const step = cfg ? cfg.step : (Number(input.step) || 1);
    const resolvedMin = cfg ? (typeof cfg.min === "function" ? cfg.min() : cfg.min) : -Infinity;
    const resolvedMax = cfg ? (typeof cfg.max === "function" ? cfg.max() : cfg.max) :  Infinity;
    const current = Number(state[fieldKey]) || 0;
    const next = e.key === "ArrowUp"
      ? Math.min(resolvedMax, current + step)
      : Math.max(resolvedMin, current - step);
    // Round to avoid floating point drift (e.g. 0.005 steps)
    const decimals = String(step).includes(".") ? String(step).split(".")[1].length : 0;
    const rounded = Number(next.toFixed(decimals));
    state[fieldKey] = rounded;
    state = normaliseState(state, fieldKey);
    input.value = cfg?.format === "percent" ? (rounded * 100).toFixed(1)
                : cfg?.format === "number"  ? rounded
                : rounded;
    render();
  });
});

incomeVSliderInput.addEventListener("input", () => {
  const value = Number(incomeVSliderInput.value);
  const cfg = INCOME_SLIDER_CONFIG[activeIncomeField] || { format: "currency" };
  incomeVSliderValue.textContent = formatSliderValue(cfg, value);
  if (activeIncomeField) {
    state[activeIncomeField] = value;
    state = normaliseState(state, activeIncomeField);
    render();
  }
});

document.addEventListener("click", (e) => {
  if (
    !incomeVSliderPopup.hidden &&
    !incomeVSliderPopup.contains(e.target) &&
    !e.target.classList.contains("income-popup-btn")
  ) {
    incomeVSliderPopup.hidden = true;
    if (activeIncomeBtn) activeIncomeBtn.classList.remove("active");
    activeIncomeField = null;
    activeIncomeBtn = null;
  }
});

// ─── Special Events panel ─────────────────────────────────────────────────────

const specialEventsPanel = document.getElementById("special-events-panel");

specialEventsPanel.addEventListener("change", (e) => {
  const field = e.target.dataset.eventField;
  if (!field) return;
  const row = e.target.closest("[data-event-index]");
  if (!row) return;
  const i = Number(row.dataset.eventIndex);
  const ev = (state.specialEvents || [])[i];
  if (!ev) return;
  if (field === "taxable") {
    ev.taxable = e.target.checked;
  } else if (field === "amount" || field === "year") {
    const rawVal = String(e.target.value).replace(/,/g, "");
    ev[field] = field === "year"
      ? Math.max(1, Math.round(Number(rawVal) || 1))
      : Math.max(0, Number(rawVal) || 0);
  } else {
    ev[field] = e.target.value;
  }
  saveState();
  renderProjectionOnly();
});

specialEventsPanel.addEventListener("input", (e) => {
  const field = e.target.dataset.eventField;
  if (field !== "title") return;
  const row = e.target.closest("[data-event-index]");
  if (!row) return;
  const i = Number(row.dataset.eventIndex);
  const ev = (state.specialEvents || [])[i];
  if (!ev) return;
  ev.title = e.target.value;
  saveState();
  renderProjectionOnly();
});

specialEventsPanel.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-event-action]");
  if (!btn) return;
  const action = btn.dataset.eventAction;
  const i = Number(btn.dataset.eventIndex);
  if (action === "delete") {
    state.specialEvents.splice(i, 1);
  } else if (action === "duplicate") {
    const copy = { ...state.specialEvents[i], id: `evt_${Date.now()}` };
    state.specialEvents.splice(i + 1, 0, copy);
  }
  saveState();
  renderSpecialEventsPanel();
  renderProjectionOnly();
});

document.getElementById("add-event-button").addEventListener("click", () => {
  if (!Array.isArray(state.specialEvents)) state.specialEvents = [];
  state.specialEvents.push({
    id: `evt_${Date.now()}`,
    yearType: "relative",
    year: 1,
    type: "expense",
    amount: 0,
    taxable: false,
    routing: "drawdown",
    title: "",
  });
  saveState();
  renderSpecialEventsPanel();
  renderProjectionOnly();
});

document.getElementById("clear-events-button").addEventListener("click", () => {
  if (!state.specialEvents || state.specialEvents.length === 0) return;
  if (!confirm("Clear all special events?")) return;
  state.specialEvents = [];
  saveState();
  renderSpecialEventsPanel();
  renderProjectionOnly();
});
