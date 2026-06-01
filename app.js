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
  planYears: 25,
  planToAge: CURRENT_YEAR + 10 - 1971 + 24,
  planEndMode: "years",
  limitPlanYears: true,
  scenario: 1,
  growthLow: 0.04,
  growthMid: 0.06,
  growthHigh: 0.11,
  postRetirementGrowthLow: 0.04,
  postRetirementGrowthMid: 0.06,
  postRetirementGrowthHigh: 0.04,
  applyPotGrowth: true,
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
  applyCpiBills: true,
  applyCpiHolidays: true,
  cpiRate: 0.025,
  partnerDetailsEnabled: true,
  partnerBirthYear: 1971,
  partnerWorkIncome: 15000,
  partnerWorkApplyCpi: true,
  partnerWorkCpiRate: 0.025,
  partnerStatePension: 13000,
  partnerWorkPension: 5000,
  partnerSavings: 0,
  partnerSavingsGrowthRate: 0.03,
  statePensionApplyCpi: true,
  statePensionCpiRate: 0.02,
  ownStatePension: 13000,
  ownStatePensionGrowthRate: 0.02,
  applyTaxAllowanceCpi: false,
  taxAllowanceCpiRate: 0.02,
  taxBandCpiRate: 0,
  taxBandCpiFrequencyYears: 1,
  taxBandCpiStartYear: CURRENT_YEAR,
  regularDrawdownEnabled: false,
  taxOptimisationMode: false,
  usePartnerSavingsForTaxOptimisation: true,
  useTflsBy75: false,
  maximiseBasicRateDrawdown: false,
  forceTflsTaxablePairing: false,
  regularDrawdownAmount: 12000,
  regularDrawdownYears: 15,
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
const summaryGrid = document.getElementById("summary-grid");
const summaryTemplate = document.getElementById("summary-card-template");
const projectionHead = document.getElementById("projection-head");
const projectionBody = document.getElementById("projection-body");
const definedBenefitFields = document.getElementById("defined-benefit-fields");
const savingsFields = document.getElementById("savings-fields");
const partnerDetailFields = document.getElementById("partner-detail-fields");
const regularDrawdownFields = document.getElementById("regular-drawdown-fields");
const yearOneTflsFields = document.getElementById("year-one-tfls-fields");
const potChartCanvas = document.getElementById("pot-chart");
const incomeChartCanvas = document.getElementById("income-chart");
const potChartWrap = document.getElementById("pot-chart-wrap");
const incomeChartWrap = document.getElementById("income-chart-wrap");
const chartEmptyMessage = document.getElementById("chart-empty-message");
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
const togglePanelButton = document.getElementById("toggle-panel-button");
const tableViewSelect = document.getElementById("table-view-select");
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
const showPotChartToggle = document.getElementById("show-pot-chart-toggle");
const showIncomeChartToggle = document.getElementById("show-income-chart-toggle");
const incomeChartModeSelect = document.getElementById("income-chart-mode-select");
const layout = document.getElementById("layout");
const tablePanel = document.querySelector(".table-panel");

const shouldOpenBasicSetupOnLoad = !hasSavedState();
let state = loadState();
let uiState = loadUiState();
let versionBadgeTimeout = null;

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

  next.currentCrystallisedPot = Math.max(0, Math.min(Number(next.currentCrystallisedPot) || 0, Number(next.currentPot) || 0));
  next.lumpSumAllowanceUsed = Math.max(0, Number(next.lumpSumAllowanceUsed) || 0);
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
      incomeChartMode: ["line", "stacked"].includes(saved.incomeChartMode) ? saved.incomeChartMode : "line",
      tableExpanded: Boolean(saved.tableExpanded),
      customTableFields: Array.isArray(saved.customTableFields) ? saved.customTableFields : [],
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
      incomeChartMode: "line",
      tableExpanded: false,
      customTableFields: [],
    };
  }
}

function saveUiState() {
  localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(uiState));
}

function applyUiState() {
  layout.classList.toggle("controls-hidden", uiState.controlsHidden);
  togglePanelButton.textContent = uiState.controlsHidden ? "Show controls" : "Hide controls";
  tableViewSelect.value = uiState.tableView;
  granularTaxToggle.checked = Boolean(uiState.showGranularTaxFields);
  granularIncomeToggle.checked = Boolean(uiState.showGranularIncomeFields);
  granularGrowthToggle.checked = Boolean(uiState.showGranularGrowthFields);
  granularCrystallisationToggle.checked = Boolean(uiState.showGranularCrystallisationFields);
  showPotChartToggle.checked = Boolean(uiState.showPotChart);
  showIncomeChartToggle.checked = Boolean(uiState.showIncomeChart);
  incomeChartModeSelect.value = uiState.incomeChartMode;
  tablePanel.classList.toggle("table-panel-expanded", Boolean(uiState.tableExpanded));
  toggleTableWidthButton.textContent = uiState.tableExpanded ? "-" : "+";
  toggleTableWidthButton.setAttribute("aria-label", uiState.tableExpanded ? "Reduce table width" : "Expand table width");
  toggleTableWidthButton.title = uiState.tableExpanded ? "Reduce table width" : "Expand table width";
  granularTaxToggleWrap.hidden = uiState.tableView !== "granular";
  granularIncomeToggleWrap.hidden = uiState.tableView !== "granular";
  granularGrowthToggleWrap.hidden = uiState.tableView !== "granular";
  granularCrystallisationToggleWrap.hidden = uiState.tableView !== "granular";
  chooseCustomFieldsButton.hidden = uiState.tableView !== "custom";
  definedBenefitFields.hidden = !Boolean(state.definedBenefitEnabled);
  savingsFields.hidden = state.useSavings === false;
  partnerDetailFields.hidden = state.partnerDetailsEnabled === false;
  regularDrawdownFields.hidden = !Boolean(state.regularDrawdownEnabled);
  yearOneTflsFields.hidden = !Boolean(state.take25PercentYear1);
  growthScenarioFields.forEach((field) => {
    field.classList.toggle("growth-scenario-selected", Number(field.dataset.growthScenario) === Number(state.scenario));
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

function compoundAnnual(base, rate, yearsElapsed, enabled = true) {
  if (!enabled) {
    return base;
  }
  return base * Math.pow(1 + rate / 12, 12 * yearsElapsed);
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
  const preRetirementGrowthRate = growthRateForScenario(source, "pre");
  const postRetirementGrowthRate = growthRateForScenario(source, "post");
  const currentUncrystallisedPot = Math.max(0, source.currentPot - source.currentCrystallisedPot);
  const retirementUncrystallisedPot = compoundAnnual(currentUncrystallisedPot, preRetirementGrowthRate, yearsToRetirement, true);
  const retirementCrystallisedPot = compoundAnnual(source.currentCrystallisedPot, preRetirementGrowthRate, yearsToRetirement, true);
  const personalSavingsEnabled = source.useSavings !== false;
  let personalIsaSavingsAtRetirement = personalSavingsEnabled
    ? compoundAnnual(source.personalIsaSavings, source.personalIsaGrowthRate, yearsToRetirement, true)
    : 0;
  const personalBankSavingsAtRetirement = personalSavingsEnabled
    ? compoundAnnual(source.personalBankSavings, source.personalBankInterestRate, yearsToRetirement, true)
    : 0;
  const uncappedPersonalPremiumBondsAtRetirement = personalSavingsEnabled
    ? compoundAnnual(source.personalPremiumBonds, source.personalPremiumBondsGrowthRate, yearsToRetirement, true)
    : 0;
  const premiumBondsToIsaBeforeRetirement = Math.max(0, uncappedPersonalPremiumBondsAtRetirement - UK_TAX_RULES.premiumBondsLimit);
  const personalPremiumBondsAtRetirement = Math.min(uncappedPersonalPremiumBondsAtRetirement, UK_TAX_RULES.premiumBondsLimit);
  personalIsaSavingsAtRetirement += premiumBondsToIsaBeforeRetirement;
  const personalSavingsAtRetirement = personalIsaSavingsAtRetirement + personalBankSavingsAtRetirement + personalPremiumBondsAtRetirement;
  const partnerDetailsEnabled = source.partnerDetailsEnabled !== false;
  const partnerSavingsAtRetirement = partnerDetailsEnabled
    ? compoundAnnual(source.partnerSavings, source.partnerSavingsGrowthRate, yearsToRetirement, true)
    : 0;
  const totalSeparateSavingsAtRetirement = personalSavingsAtRetirement + partnerSavingsAtRetirement;
  const remainingLumpSumAllowanceStart = Math.max(0, UK_TAX_RULES.standardLumpSumAllowance - source.lumpSumAllowanceUsed);
  const taxFreeLumpSum = Math.min(retirementUncrystallisedPot * 0.25, remainingLumpSumAllowanceStart);
  const rows = [];
  const maxYears = source.limitPlanYears ? source.planYears : Math.max(source.planYears, 45);
  let uncrystallisedPot = retirementUncrystallisedPot;
  let crystallisedPot = retirementCrystallisedPot;
  let crystallisedToDate = retirementCrystallisedPot;
  let remainingLumpSumAllowance = remainingLumpSumAllowanceStart;
  let isaSavingsBalance = personalIsaSavingsAtRetirement;
  let bankSavingsBalance = personalBankSavingsAtRetirement;
  let premiumBondsBalance = personalPremiumBondsAtRetirement;
  let partnerSavingsBalance = partnerSavingsAtRetirement;
  let savingsBalance = isaSavingsBalance + bankSavingsBalance + premiumBondsBalance + partnerSavingsBalance;
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
    const holidays = compoundAnnual(source.holidaysAnnual, source.cpiRate, yearIndex, source.applyCpiHolidays);
    const carCost =
      source.carCost > 0
      && yearIndex >= source.carStartYear
      && (yearIndex - source.carStartYear) % source.carFrequencyYears === 0
        ? source.carCost
        : 0;
    const totalIncomeRequired = incomeRequired + carCost;

    const partnerWorkIncome =
      partnerDetailsEnabled && partnerAge < 68
        ? compoundAnnual(source.partnerWorkIncome, source.partnerWorkCpiRate, yearIndex, source.partnerWorkApplyCpi)
        : 0;
    const partnerStatePension =
      partnerDetailsEnabled && partnerAge > 67
        ? compoundAnnual(source.partnerStatePension, source.statePensionCpiRate, yearIndex, source.statePensionApplyCpi)
        : 0;
    const partnerWorkPension =
      partnerDetailsEnabled && partnerAge > 67
        ? compoundAnnual(source.partnerWorkPension, source.statePensionCpiRate, yearIndex, source.statePensionApplyCpi)
        : 0;
    const ownStatePension =
      age > 67
        ? compoundAnnual(source.ownStatePension, source.ownStatePensionGrowthRate, yearIndex, true)
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
    const lumpSumAllowanceAfterDefinedBenefit = Math.max(0, remainingLumpSumAllowance - definedBenefitLumpSum);

    const partnerIncome = partnerWorkIncome;
    const myOtherIncome = ownStatePension + definedBenefitIncome;
    const regularDrawdown =
      source.regularDrawdownEnabled && yearIndex <= source.regularDrawdownYears
        ? source.regularDrawdownAmount
        : 0;
    const baseIncomeTotal = partnerWorkIncome + partnerStatePension + partnerWorkPension + myOtherIncome;
    const pensionNeededGross = Math.max(0, totalIncomeRequired - baseIncomeTotal - definedBenefitLumpSum);
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
    const partnerSavingsAvailableForTaxOptimisation = partnerDetailsEnabled && source.usePartnerSavingsForTaxOptimisation
      ? (yearIndex <= 15 ? partnerSavingsBalance * 0.05 : partnerSavingsBalance)
      : 0;
    const remainingPlanYears = Math.max(1, maxYears - yearIndex + 1);
    const plannedPartnerSavingsForTaxOptimisation = partnerDetailsEnabled && source.usePartnerSavingsForTaxOptimisation
      ? Math.min(
        partnerSavingsAvailableForTaxOptimisation,
        amortisingWithdrawal(partnerSavingsBalance, source.partnerSavingsGrowthRate, remainingPlanYears),
        pensionNeededGross,
      )
      : 0;
    const savingsAvailableForTaxOptimisation = bankSavingsBalance
      + premiumBondsBalance
      + isaSavingsBalance
      + partnerSavingsAvailableForTaxOptimisation;
    const taxOptimisedWithdrawal = source.taxOptimisationMode
      ? calculateTaxOptimisedWithdrawal({
        targetGrossIncome: Math.max(Math.max(0, pensionNeededGross - forcedTaxFreeCash), regularDrawdown),
        myOtherIncome,
        expectedBankInterest: bankInterestGross,
        taxFreeCashCapacity: Math.max(0, taxFreeCashCapacity - forcedTaxFreeCash),
        minimumTaxFreeCash: tflsBy75DrawdownTarget,
        earlySavingsAvailable: plannedPartnerSavingsForTaxOptimisation,
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
    const householdBills = compoundAnnual(source.billsAnnual, source.cpiRate, yearIndex, source.applyCpiBills);
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
    let incomeTotal = baseIncomeTotal + definedBenefitLumpSum + taxFreeCashActual;
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
    const crystallisedToDateCurrent = crystallisedToDate + designatedForTaxFree;
    const openingPot = uncrystallisedPot + crystallisedPot;
    const openingUncrystallisedPot = uncrystallisedPot;
    const openingCrystallisedFund = crystallisedPot;
    const openingIsaSavings = isaSavingsBalance;
    const openingBankSavings = bankSavingsBalance;
    const openingPremiumBonds = premiumBondsBalance;
    const openingPartnerSavings = partnerSavingsBalance;
    const uncrystallisedBeforeGrowth = Math.max(0, uncrystallisedPot - totalDesignated);
    const crystallisedBeforeGrowth = Math.max(0, crystallisedPot + newCrystallisedFromTaxFree + extraDesignationForTaxable - totalTaxableWithdrawal);
    const totalWithdrawn = taxFreeCashActual + totalTaxableWithdrawal;
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

    remainingLumpSumAllowance = Math.max(0, remainingLumpSumAllowance - definedBenefitLumpSum - taxFreeCashActual);
    bankSavingsBalance = Math.max(0, bankSavingsBalance + bankInterestGross - bankInterestTaxBreakdown.bankInterestTax - savingsAllocation.bankSavingsUsed);
    const premiumBondsBeforeLimit = Math.max(0, premiumBondsBalance + premiumBondsGrowth - savingsAllocation.premiumBondsUsed);
    const premiumBondsMovedToIsa = Math.max(0, premiumBondsBeforeLimit - UK_TAX_RULES.premiumBondsLimit);
    premiumBondsBalance = Math.min(premiumBondsBeforeLimit, UK_TAX_RULES.premiumBondsLimit);
    isaSavingsBalance = Math.max(0, isaSavingsBalance + isaInterestGross + premiumBondsMovedToIsa - savingsAllocation.isaSavingsUsed);
    partnerSavingsBalance = Math.max(0, partnerSavingsBalance + (partnerSavingsBalance * source.partnerSavingsGrowthRate) - savingsAllocation.partnerSavingsUsed);
    savingsBalance = bankSavingsBalance + premiumBondsBalance + isaSavingsBalance + partnerSavingsBalance;

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
      partnerWorkPension,
      myOtherIncome,
      incomeTotal,
      incomeCovered: incomeCoveredReconciled,
      incomeShortfall,
      ownStatePension,
      definedBenefitIncome,
      definedBenefitLumpSum,
      pensionNeededGross,
      regularDrawdown,
      taxFreeCash: taxFreeCashActual,
      tflsBy75Target,
      sourcedFromSavings,
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
      partnerSavingsIncludedInOptimisation: partnerDetailsEnabled && source.usePartnerSavingsForTaxOptimisation ? 1 : 0,
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
  saveState();
}

function isPercentInput(input) {
  return input.dataset.format === "percent-1";
}

function formatInputValue(input, value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  if (isPercentInput(input)) {
    return (Number(value) * 100).toFixed(1);
  }
  return value;
}

function parseInputValue(input, fallbackValue) {
  if (input.value === "") {
    return fallbackValue;
  }
  const numericValue = Number(input.value);
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
}

function renderSummary(projection) {
  const lastRow = projection.rows[projection.rows.length - 1];
  const totalTaxPaid = projection.rows.reduce((sum, row) => sum + row.estimatedTax, 0);
  const averageTaxPerYear = projection.rows.length > 0 ? totalTaxPaid / projection.rows.length : 0;
  const averageTaxPerMonth = averageTaxPerYear / 12;
  const pensionDrawdownRows = projection.rows.filter((row) => row.grossPensionWithdrawal > 0.01 || row.taxFreeCash > 0.01);
  const averageEffectiveTaxRate = pensionDrawdownRows.length > 0
    ? pensionDrawdownRows.reduce((sum, row) => {
      const taxableBase = Math.max(0, row.taxableIncomeBeforeAllowance + row.bankInterestTaxable);
      return sum + (taxableBase > 0 ? row.estimatedTax / taxableBase : 0);
    }, 0) / pensionDrawdownRows.length
    : 0;
  const totalPensionTflsTaken = projection.rows.reduce((sum, row) => sum + row.taxFreeCash, 0);
  const totalDefinedBenefitLumpSum = projection.rows.reduce((sum, row) => sum + row.definedBenefitLumpSum, 0);
  const totalTflsTaken = totalPensionTflsTaken + totalDefinedBenefitLumpSum;
  const totalPlanShortfall = projection.rows.reduce((sum, row) => sum + row.incomeShortfall, 0);
  const cards = [
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
      note: `${PERCENT.format(projection.preRetirementGrowthRate)} before retirement, ${PERCENT.format(projection.postRetirementGrowthRate)} after retirement`,
    },
    {
      label: "Uncrystallised at retirement",
      value: formatCurrency(projection.retirementUncrystallisedPot),
      note: `Crystallised ${formatCurrency(projection.retirementCrystallisedPot)}`,
    },
    {
      label: "Total plan shortfall",
      value: formatCurrency(totalPlanShortfall),
      note: `Across ${NUMBER.format(projection.rows.length)} retirement years shown`,
      warning: totalPlanShortfall > 0.01,
      success: totalPlanShortfall <= 0.01,
    },
    {
      label: "End pot",
      value: formatCurrency(lastRow?.totalPotAfterGrowth ?? 0),
      note: projection.depletionYear
        ? `Pot reaches zero in ${projection.depletionYear.calendarYear} (age ${projection.depletionYear.age})`
        : `At plan end ${projection.planEndYear} (age ${projection.planEndAge})`,
    },
    {
      label: "Savings at plan end",
      value: formatCurrency(lastRow?.savingsLeft ?? projection.totalSeparateSavingsAtRetirement),
      note: `ISA ${formatCurrency(lastRow?.isaSavingsLeft ?? projection.personalIsaSavingsAtRetirement)}, bank ${formatCurrency(lastRow?.bankSavingsLeft ?? projection.personalBankSavingsAtRetirement)}, Premium Bonds ${formatCurrency(lastRow?.premiumBondsLeft ?? projection.personalPremiumBondsAtRetirement)}, partner ${formatCurrency(lastRow?.partnerSavingsLeft ?? projection.partnerSavingsAtRetirement)}`,
    },
    {
      label: "Total tax paid",
      value: formatCurrency(totalTaxPaid),
      note: `${formatCurrency(averageTaxPerYear)}/Yr - ${formatCurrency(averageTaxPerMonth)}/Mth - avg eff ${PERCENT.format(averageEffectiveTaxRate)}`,
    },
    {
      label: "Lump sum allowance left",
      value: formatCurrency(lastRow?.remainingLumpSumAllowance ?? projection.remainingLumpSumAllowanceStart),
      note: `Starting allowance left ${formatCurrency(projection.remainingLumpSumAllowanceStart)}`,
    },
    {
      label: "Tax-free lump sums",
      value: formatCurrency(totalTflsTaken),
      note: `Pension ${formatCurrency(totalPensionTflsTaken)}, DB ${formatCurrency(totalDefinedBenefitLumpSum)}`,
    },
    {
      label: "Separate savings total",
      value: formatCurrency(projection.totalSeparateSavingsAtRetirement),
      note: `ISA ${formatCurrency(projection.personalIsaSavingsAtRetirement)}, bank ${formatCurrency(projection.personalBankSavingsAtRetirement)}, Premium Bonds ${formatCurrency(projection.personalPremiumBondsAtRetirement)}, partner ${formatCurrency(projection.partnerSavingsAtRetirement)}`,
    },
    {
      label: "ISA savings at retirement",
      value: formatCurrency(projection.personalIsaSavingsAtRetirement),
      note: `Tax-free growth rate ${PERCENT.format(state.personalIsaGrowthRate)}`,
    },
    {
      label: "Bank savings at retirement",
      value: formatCurrency(projection.personalBankSavingsAtRetirement),
      note: `Interest rate ${PERCENT.format(state.personalBankInterestRate)}`,
    },
    {
      label: "Premium Bonds at retirement",
      value: formatCurrency(projection.personalPremiumBondsAtRetirement),
      note: `Assumed growth/prize rate ${PERCENT.format(state.personalPremiumBondsGrowthRate)}`,
    },
    {
      label: "Savings interest tax",
      value: formatCurrency(projection.totalBankInterestTax),
      note: `PSA used ${formatCurrency(projection.totalPsaUsed)} across projected years`,
    },
    {
      label: "My savings at retirement",
      value: formatCurrency(projection.personalSavingsAtRetirement),
      note: `ISA + bank before retirement`,
    },
    {
      label: "Partner savings at retirement",
      value: formatCurrency(projection.partnerSavingsAtRetirement),
      note: `Growth rate ${PERCENT.format(state.partnerSavingsGrowthRate)}`,
    },
  ];

  summaryGrid.replaceChildren();
  cards.forEach((card) => {
    const clone = summaryTemplate.content.cloneNode(true);
    const cardElement = clone.querySelector(".summary-card");
    cardElement.classList.toggle("summary-card-warning", Boolean(card.warning));
    cardElement.classList.toggle("summary-card-success", Boolean(card.success));
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
    ["partnerWorkPension", "Partner work pension"],
    ["definedBenefitIncome", "My DB pension"],
    ["definedBenefitLumpSum", "DB lump sum"],
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
    ["partnerWorkPension", "Partner work pension"],
    ["ownStatePension", "My state pension"],
    ["definedBenefitIncome", "My DB pension"],
    ["definedBenefitLumpSum", "DB lump sum"],
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
    "partnerWorkPension",
    "ownStatePension",
    "definedBenefitIncome",
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
  const versionText = "Version 3.1";
  versionBadge.textContent = "Changed 2026-05-29 17:03 BST";
  versionBadge.setAttribute("aria-label", versionBadge.textContent);
  clearTimeout(versionBadgeTimeout);
  versionBadgeTimeout = setTimeout(() => {
    versionBadge.textContent = versionText;
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
    partnerStatePension: 'Partner state pension after trigger age and CPI rules.',
    partnerWorkPension: 'Partner work pension after trigger age and CPI rules.',
    ownStatePension: 'Your state pension after trigger age and your own state pension growth rate.',
    definedBenefitIncome: 'Inflexible defined benefit income, starting in the selected year, growing annually, and included in your taxable income before flexible drawdown is optimised.',
    definedBenefitLumpSum: 'Tax-free defined benefit lump sum in the DB start year. It reduces remaining lump sum allowance before flexible TFLS is calculated.',
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
  };
  return `${label}: ${notes[key] || 'See projection logic for this column.'}`;
}

function renderTable(projection) {
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

function renderChart(projection) {
  potChartWrap.hidden = !uiState.showPotChart;
  incomeChartWrap.hidden = !uiState.showIncomeChart;
  chartEmptyMessage.hidden = uiState.showPotChart || uiState.showIncomeChart;

  if (uiState.showPotChart) {
    renderChartCanvas({
      canvas: potChartCanvas,
      projection,
      axisStep: 100000,
      series: [
        { key: "totalPotAfterGrowth", label: "Pension pot", color: "#0f766e", fill: "rgba(15, 118, 110, 0.16)" },
      ],
      maxFallback: projection.totalRetirementPot,
    });
  }

  if (uiState.showIncomeChart) {
    if (uiState.incomeChartMode === "stacked") {
      renderStackedIncomeChartCanvas({ canvas: incomeChartCanvas, projection });
    } else {
      renderChartCanvas({
        canvas: incomeChartCanvas,
        projection,
        axisStep: 10000,
        series: [
          { key: "totalIncomeRequired", label: "Income needed", color: "#b45309" },
          { key: "incomeTotal", label: "Income total", color: "#1d4ed8", dash: [7, 5] },
        ],
        minFloor: 0,
      });
    }
  }
}

function renderChartCanvas({ canvas, projection, axisStep, series, maxFallback = 0, minFloor = null }) {
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

  ctx.strokeStyle = "rgba(38, 25, 12, 0.12)";
  ctx.lineWidth = 1;
  yTicks.forEach((value) => {
    const y = yFor(value);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
  });

  const zeroY = yFor(0);
  ctx.strokeStyle = "rgba(180, 35, 24, 0.35)";
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

  ctx.fillStyle = "#6c5b48";
  ctx.font = '12px Georgia, "Times New Roman", serif';
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
  ctx.font = '12px Georgia, "Times New Roman", serif';
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
    ctx.fillStyle = "#4f4032";
    ctx.fillText(item.label, legendX + 28, legendY);
    legendX += itemWidth;
  });
}

function renderStackedIncomeChartCanvas({ canvas, projection }) {
  const incomeSources = [
    { key: "partnerIncome", label: "Partner work", color: "#2563eb" },
    { key: "partnerStatePension", label: "Partner state pension", color: "#16a34a" },
    { key: "partnerWorkPension", label: "Partner work pension", color: "#65a30d" },
    { key: "ownStatePension", label: "My state pension", color: "#0f766e" },
    { key: "definedBenefitIncome", label: "My DB pension", color: "#0891b2" },
    { key: "definedBenefitLumpSum", label: "DB lump sum", color: "#06b6d4" },
    { key: "taxFreeCash", label: "TFLS", color: "#f59e0b" },
    { key: "grossPensionWithdrawal", label: "Taxable pension withdrawn", color: "#7c3aed" },
    { key: "sourcedFromSavings", label: "Savings", color: "#db2777" },
  ];
  const needSeries = { key: "totalIncomeRequired", label: "Income needed", color: "#b45309", dash: [7, 5] };
  const stackedTotals = projection.rows.map((row) =>
    incomeSources.reduce((sum, source) => sum + Math.max(0, Number(row[source.key]) || 0), 0)
  );

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
  const axisStep = 10000;
  const maxValue = Math.max(axisStep, Math.ceil(Math.max(...stackedTotals, ...projection.rows.map((row) => row.totalIncomeRequired)) / axisStep) * axisStep);
  const yFor = (value) => pad.top + plotHeight - (value / maxValue) * plotHeight;
  const barBand = plotWidth / Math.max(1, projection.rows.length);
  const xFor = (index) => pad.left + index * barBand + barBand / 2;
  const barGap = 3;
  const barWidth = Math.max(6, Math.min(26, barBand - barGap));

  ctx.strokeStyle = "rgba(38, 25, 12, 0.12)";
  ctx.lineWidth = 1;
  for (let value = 0; value <= maxValue; value += axisStep) {
    const y = yFor(value);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillStyle = "#6c5b48";
    ctx.font = '12px Georgia, "Times New Roman", serif';
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(formatCurrency(value), 8, y);
  }

  projection.rows.forEach((row, index) => {
    const x = xFor(index) - barWidth / 2;
    let stackedValue = 0;
    incomeSources.forEach((source) => {
      const value = Math.max(0, Number(row[source.key]) || 0);
      if (value <= 0) {
        return;
      }
      const y = yFor(stackedValue + value);
      const segmentHeight = yFor(stackedValue) - y;
      ctx.fillStyle = source.color;
      ctx.fillRect(x, y, barWidth, segmentHeight);
      stackedValue += value;
    });
  });

  ctx.beginPath();
  projection.rows.forEach((row, index) => {
    const x = xFor(index);
    const y = yFor(row[needSeries.key]);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.strokeStyle = needSeries.color;
  ctx.lineWidth = 3;
  ctx.setLineDash(needSeries.dash);
  ctx.stroke();
  ctx.setLineDash([]);

  const targetYearLabels = Math.max(4, Math.min(8, Math.floor(plotWidth / 90)));
  const yearStep = Math.max(1, Math.ceil((projection.rows.length - 1) / Math.max(1, targetYearLabels - 1)));
  const yearLabelIndexes = [];
  for (let index = 0; index < projection.rows.length; index += yearStep) {
    yearLabelIndexes.push(index);
  }
  if (yearLabelIndexes[yearLabelIndexes.length - 1] !== projection.rows.length - 1) {
    yearLabelIndexes.push(projection.rows.length - 1);
  }

  ctx.fillStyle = "#6c5b48";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  yearLabelIndexes.forEach((rowIndex) => {
    const row = projection.rows[rowIndex];
    const x = xFor(rowIndex);
    ctx.fillText(String(row.calendarYear), x, height - 34);
    ctx.fillText(`(age ${row.age})`, x, height - 18);
  });

  let legendX = pad.left;
  let legendY = 16;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = '12px Georgia, "Times New Roman", serif';
  [...incomeSources, needSeries].forEach((item) => {
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
    ctx.fillStyle = "#4f4032";
    ctx.fillText(item.label, legendX + 26, legendY);
    legendX += itemWidth;
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
  } else if (input.type === "number") {
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
      applyCpiBills: state.applyCpiBills,
      applyCpiHolidays: state.applyCpiHolidays,
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
      ownStatePension: state.ownStatePension,
      ownStatePensionGrowthRate: state.ownStatePensionGrowthRate,
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
      partnerStatePension: state.partnerStatePension,
      partnerWorkPension: state.partnerWorkPension,
      partnerSavings: state.partnerSavings,
      partnerSavingsGrowthRate: state.partnerSavingsGrowthRate,
      partnerSavingsAtRetirement: projection.partnerSavingsAtRetirement,
      statePensionApplyCpi: state.statePensionApplyCpi,
      statePensionCpiRate: state.statePensionCpiRate,
      usePartnerSavingsForTaxOptimisation: state.usePartnerSavingsForTaxOptimisation,
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

function exportPlan() {
  const projection = calculateProjection(state);
  const rows = projection.rows.map((row) => plainObjectForExport(row));
  const planName = String(state.planName || "").trim() || "Pension plan";
  const payload = {
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
    },
    chart: {
      stackedBarSeries: [
        { key: "partnerIncome", label: "Partner work income" },
        { key: "partnerStatePension", label: "Partner state pension" },
        { key: "partnerWorkPension", label: "Partner work pension" },
        { key: "ownStatePension", label: "My state pension" },
        { key: "definedBenefitIncome", label: "My DB pension" },
        { key: "definedBenefitLumpSum", label: "DB lump sum" },
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
      <tbody>${calcRowHtml}${bodyHtml}</tbody>
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
    ["partnerWorkPension", "Partner work pension"],
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
    ["Partner birth year", state.partnerBirthYear],
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
    ["Partner state pension", state.partnerStatePension],
    ["Partner work pension", state.partnerWorkPension],
    ["Own state pension", state.ownStatePension],
    ["Own state pension growth", state.ownStatePensionGrowthRate],
    ["Defined benefit enabled", state.definedBenefitEnabled ? 1 : 0],
    ["Defined benefit start year", state.definedBenefitStartYear],
    ["Defined benefit initial lump sum", state.definedBenefitInitialLumpSum],
    ["Defined benefit initial annual amount", state.definedBenefitInitialAnnualAmount],
    ["Defined benefit max years", state.definedBenefitMaxYears],
    ["Defined benefit growth rate", state.definedBenefitGrowthRate],
    ["State/work pension CPI", state.statePensionCpiRate],
    ["Apply CPI to state/work pensions", state.statePensionApplyCpi ? 1 : 0],
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
    ["Apply CPI to bills", state.applyCpiBills ? 1 : 0],
    ["Holidays annual", state.holidaysAnnual],
    ["Apply CPI to holidays", state.applyCpiHolidays ? 1 : 0],
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
    ["Use partner savings for tax optimisation", state.usePartnerSavingsForTaxOptimisation ? 1 : 0],
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
      partnerIncome: `=IF(${assumptionRef["Partner details enabled"]}=1,IF(${cell("calendarYear", rowNumber)}-${assumptionRef["Partner birth year"]}<68,IF(${assumptionRef["Apply CPI to partner work"]}=1,${assumptionRef["Partner work income"]}*POWER(1+${assumptionRef["Partner work CPI"]}/12,12*${cell("yearIndex", rowNumber)}),${assumptionRef["Partner work income"]}),0),0)`,
      partnerStatePension: `=IF(${assumptionRef["Partner details enabled"]}=1,IF(${cell("calendarYear", rowNumber)}-${assumptionRef["Partner birth year"]}>67,IF(${assumptionRef["Apply CPI to state/work pensions"]}=1,${assumptionRef["Partner state pension"]}*POWER(1+${assumptionRef["State/work pension CPI"]}/12,12*${cell("yearIndex", rowNumber)}),${assumptionRef["Partner state pension"]}),0),0)`,
      partnerWorkPension: `=IF(${assumptionRef["Partner details enabled"]}=1,IF(${cell("calendarYear", rowNumber)}-${assumptionRef["Partner birth year"]}>67,IF(${assumptionRef["Apply CPI to state/work pensions"]}=1,${assumptionRef["Partner work pension"]}*POWER(1+${assumptionRef["State/work pension CPI"]}/12,12*${cell("yearIndex", rowNumber)}),${assumptionRef["Partner work pension"]}),0),0)`,
      ownStatePension: `=IF(${cell("age", rowNumber)}>67,${assumptionRef["Own state pension"]}*POWER(1+${assumptionRef["Own state pension growth"]}/12,12*${cell("yearIndex", rowNumber)}),0)`,
      definedBenefitIncome: `=IF(AND(${assumptionRef["Defined benefit enabled"]}=1,${cell("calendarYear", rowNumber)}>=${assumptionRef["Defined benefit start year"]},${cell("calendarYear", rowNumber)}<${assumptionRef["Defined benefit start year"]}+${assumptionRef["Defined benefit max years"]}),${assumptionRef["Defined benefit initial annual amount"]}*POWER(1+${assumptionRef["Defined benefit growth rate"]}/12,12*(${cell("calendarYear", rowNumber)}-${assumptionRef["Defined benefit start year"]})),0)`,
      definedBenefitLumpSum: `=IF(AND(${assumptionRef["Defined benefit enabled"]}=1,${cell("calendarYear", rowNumber)}=${assumptionRef["Defined benefit start year"]}),MIN(${priorLsa},${assumptionRef["Defined benefit initial lump sum"]}),0)`,
      tflsBy75Target: `=${tflsBy75Formula}`,
      taxFreeCash: `=MAX(IF(${assumptionRef["Tax optimisation mode"]}=1,${taxOptimisedTfls},${standardTfls}),${maximisedDrawdownTfls})`,
      sourcedFromSavings: `=IF(${assumptionRef["Tax optimisation mode"]}=1,MIN(${priorSavings},MAX(0,${targetGross}-${cell("taxFreeCash", rowNumber)}-${cell("grossPensionWithdrawal", rowNumber)})),0)`,
      incomeTotal: `=SUM(${cell("partnerIncome", rowNumber)}:${cell("definedBenefitLumpSum", rowNumber)})+${cell("taxFreeCash", rowNumber)}`,
      pensionNeededGross: `=${targetGross}`,
      grossPensionWithdrawal: `=LET(baseWithdrawal,IF(${assumptionRef["Tax optimisation mode"]}=1,${pairedTaxableWithdrawal},MAX(0,${cell("pensionNeededGross", rowNumber)}-${cell("taxFreeCash", rowNumber)})),maxDrawdown,IF(${assumptionRef["Maximise drawdown to basic rate"]}=1,${basicRateWithdrawalLimit},0),pairedWithdrawal,IF(${assumptionRef["Force TFLS 25/75 pairing"]}=1,${cell("taxFreeCash", rowNumber)}*3,0),MAX(baseWithdrawal,maxDrawdown,pairedWithdrawal))`,
      holidays: `=IF(${assumptionRef["Apply CPI to holidays"]}=1,${assumptionRef["Holidays annual"]}*POWER(1+${assumptionRef["CPI rate"]}/12,12*${cell("yearIndex", rowNumber)}),${assumptionRef["Holidays annual"]})`,
      householdBills: `=IF(${assumptionRef["Apply CPI to bills"]}=1,${assumptionRef["Bills annual"]}*POWER(1+${assumptionRef["CPI rate"]}/12,12*${cell("yearIndex", rowNumber)}),${assumptionRef["Bills annual"]})`,
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
  input.addEventListener("input", updateField);
  input.addEventListener("change", updateField);
});

tableViewSelect.addEventListener("change", () => {
  uiState.tableView = tableViewSelect.value;
  saveUiState();
  if (uiState.tableView === "custom") {
    openCustomFieldChooser();
  }
  render();
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

showPotChartToggle.addEventListener("change", () => {
  uiState.showPotChart = showPotChartToggle.checked;
  saveUiState();
  render();
});

showIncomeChartToggle.addEventListener("change", () => {
  uiState.showIncomeChart = showIncomeChartToggle.checked;
  saveUiState();
  render();
});

incomeChartModeSelect.addEventListener("change", () => {
  uiState.incomeChartMode = incomeChartModeSelect.value;
  saveUiState();
  render();
});

togglePanelButton.addEventListener("click", () => {
  uiState.controlsHidden = !uiState.controlsHidden;
  saveUiState();
  render();
});

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

exportTableButton.addEventListener("click", exportTableToExcel);
exportFormulaButton.addEventListener("click", exportFormulaWorkbookToExcel);
exportPdfButton.addEventListener("click", exportPageToPdf);
exportPlanButton.addEventListener("click", exportPlan);
resetButton.addEventListener("click", resetState);
versionBadge.addEventListener("click", showVersionChangeDate);
importFile.addEventListener("change", importState);
window.addEventListener("resize", render);

render();
if (shouldOpenBasicSetupOnLoad) {
  openBasicSetup();
}
