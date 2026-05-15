const STORAGE_KEY = "pension-forecaster-state-v3";
const CURRENT_YEAR = new Date().getFullYear();
const UI_STORAGE_KEY = "pension-forecaster-ui-v1";

const DEFAULT_STATE = {
  currentYear: CURRENT_YEAR,
  currentAge: CURRENT_YEAR - 1971,
  yearOfBirth: 1971,
  retirementYear: CURRENT_YEAR + 10,
  retirementAge: CURRENT_YEAR + 10 - 1971,
  currentPot: 100000,
  currentCrystallisedPot: 0,
  lumpSumAllowanceUsed: 0,
  personalSavings: 0,
  personalSavingsGrowthRate: 0.03,
  personalIsaSavings: 0,
  personalIsaGrowthRate: 0.03,
  personalBankSavings: 0,
  personalBankInterestRate: 0.03,
  planYears: 25,
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
  incomeRequired: 60000,
  incomeAfterYear10: 40000,
  billsAnnual: 30000,
  holidaysAnnual: 4500,
  carCost: 20000,
  carFrequencyYears: 4,
  carStartYear: 2,
  applyCpiIncome: true,
  applyCpiBills: true,
  applyCpiHolidays: true,
  cpiRate: 0.025,
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
  applyTaxAllowanceCpi: false,
  taxAllowanceCpiRate: 0.02,
  regularDrawdownEnabled: false,
  taxOptimisationMode: false,
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
  standardLumpSumAllowance: 268275,
};

const inputs = Array.from(document.querySelectorAll("[data-field]"));
const summaryGrid = document.getElementById("summary-grid");
const summaryTemplate = document.getElementById("summary-card-template");
const projectionHead = document.getElementById("projection-head");
const projectionBody = document.getElementById("projection-body");
const potChartCanvas = document.getElementById("pot-chart");
const incomeChartCanvas = document.getElementById("income-chart");
const potChartWrap = document.getElementById("pot-chart-wrap");
const incomeChartWrap = document.getElementById("income-chart-wrap");
const chartEmptyMessage = document.getElementById("chart-empty-message");
const chartCaption = document.getElementById("chart-caption");
const tableCaption = document.getElementById("table-caption");
const exportTableButton = document.getElementById("export-table-button");
const exportFormulaButton = document.getElementById("export-formula-button");
const exportPdfButton = document.getElementById("export-pdf-button");
const exportButton = document.getElementById("export-button");
const resetButton = document.getElementById("reset-button");
const importFile = document.getElementById("import-file");
const togglePanelButton = document.getElementById("toggle-panel-button");
const tableViewSelect = document.getElementById("table-view-select");
const granularTaxToggleWrap = document.getElementById("granular-tax-toggle-wrap");
const granularTaxToggle = document.getElementById("granular-tax-toggle");
const granularIncomeToggleWrap = document.getElementById("granular-income-toggle-wrap");
const granularIncomeToggle = document.getElementById("granular-income-toggle");
const granularGrowthToggleWrap = document.getElementById("granular-growth-toggle-wrap");
const granularGrowthToggle = document.getElementById("granular-growth-toggle");
const granularCrystallisationToggleWrap = document.getElementById("granular-crystallisation-toggle-wrap");
const granularCrystallisationToggle = document.getElementById("granular-crystallisation-toggle");
const showPotChartToggle = document.getElementById("show-pot-chart-toggle");
const showIncomeChartToggle = document.getElementById("show-income-chart-toggle");
const incomeChartModeSelect = document.getElementById("income-chart-mode-select");
const layout = document.getElementById("layout");

let state = loadState();
let uiState = loadUiState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return normaliseState({ ...DEFAULT_STATE, ...(saved || {}) });
  } catch {
    return normaliseState({ ...DEFAULT_STATE });
  }
}

function normaliseState(source) {
  const next = { ...source };
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
  next.currentCrystallisedPot = Math.max(0, Math.min(Number(next.currentCrystallisedPot) || 0, Number(next.currentPot) || 0));
  next.lumpSumAllowanceUsed = Math.max(0, Number(next.lumpSumAllowanceUsed) || 0);
  if (!Number.isFinite(Number(source.personalBankSavings)) && !Number.isFinite(Number(source.personalIsaSavings))) {
    next.personalBankSavings = Math.max(0, Number(source.personalSavings) || 0);
    next.personalIsaSavings = 0;
  } else {
    next.personalBankSavings = Math.max(0, Number(next.personalBankSavings) || 0);
    next.personalIsaSavings = Math.max(0, Number(next.personalIsaSavings) || 0);
  }
  next.personalSavings = next.personalIsaSavings + next.personalBankSavings;
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
      tableView: ["summarised", "detailed", "granular"].includes(saved.tableView) ? saved.tableView : "summarised",
      showGranularTaxFields: Boolean(saved.showGranularTaxFields),
      showGranularIncomeFields: saved.showGranularIncomeFields !== false,
      showGranularGrowthFields: Boolean(saved.showGranularGrowthFields),
      showGranularCrystallisationFields: Boolean(saved.showGranularCrystallisationFields),
      showPotChart: saved.showPotChart !== false,
      showIncomeChart: saved.showIncomeChart !== false,
      incomeChartMode: ["line", "stacked"].includes(saved.incomeChartMode) ? saved.incomeChartMode : "line",
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
  granularTaxToggleWrap.hidden = uiState.tableView !== "granular";
  granularIncomeToggleWrap.hidden = uiState.tableView !== "granular";
  granularGrowthToggleWrap.hidden = uiState.tableView !== "granular";
  granularCrystallisationToggleWrap.hidden = uiState.tableView !== "granular";
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

function estimateUkIncomeTax(totalIncome, allowanceBase = UK_TAX_RULES.personalAllowance) {
  const income = Math.max(0, Number(totalIncome) || 0);
  const allowanceReduction = Math.max(0, (income - UK_TAX_RULES.allowanceTaperStarts) / 2);
  const personalAllowance = Math.max(0, allowanceBase - allowanceReduction);
  const taxableIncome = Math.max(0, income - personalAllowance);
  const personalAllowanceUsed = Math.min(income, personalAllowance);
  const basicBand = Math.max(0, UK_TAX_RULES.basicRateLimit - personalAllowance);
  const higherBand = Math.max(0, UK_TAX_RULES.higherRateLimit - UK_TAX_RULES.basicRateLimit);
  const basicTaxable = Math.min(taxableIncome, basicBand);
  const higherTaxable = Math.min(Math.max(0, taxableIncome - basicBand), higherBand);
  const additionalTaxable = Math.max(0, taxableIncome - basicBand - higherBand);
  const basicRateTax = basicTaxable * UK_TAX_RULES.basicRate;
  const higherRateTax = higherTaxable * UK_TAX_RULES.higherRate;
  const additionalRateTax = additionalTaxable * UK_TAX_RULES.additionalRate;
  const totalTax = basicRateTax + higherRateTax + additionalRateTax;
  const effectiveTaxRate = income > 0 ? totalTax / income : 0;
  const marginalTaxRate = additionalTaxable > 0
    ? UK_TAX_RULES.additionalRate
    : higherTaxable > 0
      ? UK_TAX_RULES.higherRate
      : basicTaxable > 0
        ? UK_TAX_RULES.basicRate
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

function netFromTaxableIncome(otherTaxableIncome, taxableWithdrawal) {
  const grossTaxable = otherTaxableIncome + taxableWithdrawal;
  const tax = estimateUkIncomeTax(grossTaxable);
  return grossTaxable - tax.totalTax - otherTaxableIncome;
}

function solveTaxableWithdrawal(otherTaxableIncome, targetNetFromPension, allowanceBase = UK_TAX_RULES.personalAllowance) {
  if (targetNetFromPension <= 0) {
    return { taxableWithdrawal: 0, taxBreakdown: estimateUkIncomeTax(otherTaxableIncome, allowanceBase) };
  }

  let low = 0;
  let high = Math.max(targetNetFromPension * 2, 1000);
  while ((otherTaxableIncome + high - estimateUkIncomeTax(otherTaxableIncome + high, allowanceBase).totalTax - otherTaxableIncome) < targetNetFromPension && high < 1e7) {
    high *= 2;
  }

  for (let i = 0; i < 40; i += 1) {
    const mid = (low + high) / 2;
    if ((otherTaxableIncome + mid - estimateUkIncomeTax(otherTaxableIncome + mid, allowanceBase).totalTax - otherTaxableIncome) >= targetNetFromPension) {
      high = mid;
    } else {
      low = mid;
    }
  }

  const taxableWithdrawal = high;
  return { taxableWithdrawal, taxBreakdown: estimateUkIncomeTax(otherTaxableIncome + taxableWithdrawal, allowanceBase) };
}

function personalSavingsAllowanceForIncome(taxableIncomeWithInterest) {
  if (taxableIncomeWithInterest > UK_TAX_RULES.higherRateLimit) {
    return 0;
  }
  if (taxableIncomeWithInterest > UK_TAX_RULES.basicRateLimit) {
    return UK_TAX_RULES.personalSavingsAllowanceHigher;
  }
  return UK_TAX_RULES.personalSavingsAllowanceBasic;
}

function estimateBankInterestTax(baseTaxableIncome, bankInterest, allowanceBase = UK_TAX_RULES.personalAllowance) {
  const interest = Math.max(0, Number(bankInterest) || 0);
  if (interest <= 0) {
    return {
      bankInterestGross: 0,
      savingsIncomeForPsa: Math.max(0, baseTaxableIncome),
      personalSavingsAllowance: personalSavingsAllowanceForIncome(baseTaxableIncome),
      bankInterestTaxable: 0,
      bankInterestTax: 0,
    };
  }

  const incomeWithInterest = Math.max(0, baseTaxableIncome + interest);
  const personalSavingsAllowance = personalSavingsAllowanceForIncome(incomeWithInterest);
  const taxableInterest = Math.max(0, interest - personalSavingsAllowance);
  const baseTax = estimateUkIncomeTax(baseTaxableIncome, allowanceBase).totalTax;
  const totalTax = estimateUkIncomeTax(baseTaxableIncome + taxableInterest, allowanceBase).totalTax;

  return {
    bankInterestGross: interest,
    savingsIncomeForPsa: incomeWithInterest,
    personalSavingsAllowance,
    bankInterestTaxable: taxableInterest,
    bankInterestTax: Math.max(0, totalTax - baseTax),
  };
}

function allocateSavingsWithdrawal(amount, bankBalance, isaBalance, partnerBalance) {
  let remaining = Math.max(0, Number(amount) || 0);
  const fromBank = Math.min(bankBalance, remaining);
  remaining -= fromBank;
  const fromIsa = Math.min(isaBalance, remaining);
  remaining -= fromIsa;
  const fromPartner = Math.min(partnerBalance, remaining);

  return {
    bankSavingsUsed: fromBank,
    isaSavingsUsed: fromIsa,
    partnerSavingsUsed: fromPartner,
  };
}

function netFromAdditionalTaxableWithdrawal(existingTaxableIncome, taxableWithdrawal, allowanceBase) {
  const baseTax = estimateUkIncomeTax(existingTaxableIncome, allowanceBase).totalTax;
  const totalTax = estimateUkIncomeTax(existingTaxableIncome + taxableWithdrawal, allowanceBase).totalTax;
  return taxableWithdrawal - Math.max(0, totalTax - baseTax);
}

function solveAdditionalTaxableWithdrawal(existingTaxableIncome, targetNet, allowanceBase, maxWithdrawal = 1e7) {
  if (targetNet <= 0 || maxWithdrawal <= 0) {
    return 0;
  }

  const cappedMaxWithdrawal = Math.max(0, maxWithdrawal);
  const maxNet = netFromAdditionalTaxableWithdrawal(existingTaxableIncome, cappedMaxWithdrawal, allowanceBase);
  if (maxNet <= targetNet) {
    return cappedMaxWithdrawal;
  }

  let low = 0;
  let high = cappedMaxWithdrawal;
  for (let i = 0; i < 40; i += 1) {
    const mid = (low + high) / 2;
    if (netFromAdditionalTaxableWithdrawal(existingTaxableIncome, mid, allowanceBase) >= targetNet) {
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
  savingsAvailable = 0,
  crystallisedPot,
  uncrystallisedPot,
}) {
  const totalPotAvailable = Math.max(0, crystallisedPot + uncrystallisedPot);
  const taxableCapacity = totalPotAvailable;
  let remainingGrossIncome = Math.max(0, targetGrossIncome);
  let taxableWithdrawal = 0;
  let taxFreeCash = 0;
  let savingsUsed = 0;
  let remainingUncrystallisedPot = Math.max(0, uncrystallisedPot);
  let remainingTaxFreeCashCapacity = Math.max(0, taxFreeCashCapacity);
  let taxableFromNewTflsCrystallisation = 0;

  const psaProtectedBasicRateLimit = Math.max(0, UK_TAX_RULES.basicRateLimit - myOtherIncome - Math.max(0, expectedBankInterest));
  const taxableFromExistingCrystallised = Math.min(
    remainingGrossIncome,
    psaProtectedBasicRateLimit,
    Math.max(0, crystallisedPot),
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

  const taxFreeUsed = Math.min(remainingTaxFreeCashCapacity, remainingGrossIncome, remainingUncrystallisedPot * 0.25);
  taxFreeCash += taxFreeUsed;
  remainingGrossIncome -= taxFreeUsed;
  remainingUncrystallisedPot -= taxFreeUsed * 4;
  remainingTaxFreeCashCapacity -= taxFreeUsed;

  savingsUsed = Math.min(Math.max(0, savingsAvailable), remainingGrossIncome);
  remainingGrossIncome -= savingsUsed;

  if (remainingGrossIncome > 0.01) {
    const remainingTaxableCapacity = Math.max(0, taxableCapacity - taxableWithdrawal - taxFreeCash);
    const extraWithdrawal = Math.min(remainingGrossIncome, remainingTaxableCapacity);
    taxableWithdrawal += extraWithdrawal;
  }

  return {
    taxFreeCash,
    taxableWithdrawal,
    savingsUsed,
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
  const personalIsaSavingsAtRetirement = compoundAnnual(source.personalIsaSavings, source.personalIsaGrowthRate, yearsToRetirement, true);
  const personalBankSavingsAtRetirement = compoundAnnual(source.personalBankSavings, source.personalBankInterestRate, yearsToRetirement, true);
  const personalSavingsAtRetirement = personalIsaSavingsAtRetirement + personalBankSavingsAtRetirement;
  const partnerSavingsAtRetirement = compoundAnnual(source.partnerSavings, source.partnerSavingsGrowthRate, yearsToRetirement, true);
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
  let partnerSavingsBalance = partnerSavingsAtRetirement;
  let savingsBalance = isaSavingsBalance + bankSavingsBalance + partnerSavingsBalance;
  let totalBankInterestTax = 0;
  let totalPsaUsed = 0;
  let depletionYear = null;

  for (let yearIndex = 1; yearIndex <= maxYears; yearIndex += 1) {
    const calendarYear = retirementYear + yearIndex - 1;
    const age = source.retirementAge + yearIndex - 1;
    const partnerAge = calendarYear - source.partnerBirthYear;
    const incomeBase = yearIndex <= 10 ? source.incomeRequired : source.incomeAfterYear10;
    const incomeRequired = compoundAnnual(incomeBase, source.cpiRate, yearIndex, source.applyCpiIncome);
    const holidays = compoundAnnual(source.holidaysAnnual, source.cpiRate, yearIndex, source.applyCpiHolidays);
    const carCost =
      source.carCost > 0
      && yearIndex >= source.carStartYear
      && (yearIndex - source.carStartYear) % source.carFrequencyYears === 0
        ? source.carCost
        : 0;
    const totalIncomeRequired = incomeRequired + carCost;

    const partnerWorkIncome =
      partnerAge < 68
        ? compoundAnnual(source.partnerWorkIncome, source.partnerWorkCpiRate, yearIndex, source.partnerWorkApplyCpi)
        : 0;
    const partnerStatePension =
      partnerAge > 67
        ? compoundAnnual(source.partnerStatePension, source.statePensionCpiRate, yearIndex, source.statePensionApplyCpi)
        : 0;
    const partnerWorkPension =
      partnerAge > 67
        ? compoundAnnual(source.partnerWorkPension, source.statePensionCpiRate, yearIndex, source.statePensionApplyCpi)
        : 0;
    const ownStatePension =
      age > 67
        ? compoundAnnual(source.ownStatePension, source.statePensionCpiRate, yearIndex, source.statePensionApplyCpi)
        : 0;

    const partnerIncome = partnerWorkIncome;
    const myOtherIncome = ownStatePension;
    const regularDrawdown =
      source.regularDrawdownEnabled && yearIndex <= source.regularDrawdownYears
        ? source.regularDrawdownAmount
        : 0;
    const baseIncomeTotal = partnerWorkIncome + partnerStatePension + partnerWorkPension + myOtherIncome;
    const pensionNeededGross = Math.max(0, totalIncomeRequired - baseIncomeTotal);
    const allowanceBase = compoundAnnual(UK_TAX_RULES.personalAllowance, source.taxAllowanceCpiRate, yearIndex, source.applyTaxAllowanceCpi);
    const isaInterestGross = isaSavingsBalance * source.personalIsaGrowthRate;
    const bankInterestGross = bankSavingsBalance * source.personalBankInterestRate;

    const forcedTaxFreeCash = yearIndex === 1 && source.take25PercentYear1
      ? Math.min(remainingLumpSumAllowance, uncrystallisedPot * 0.25)
      : 0;

    const taxFreeCashCapacity = Math.min(remainingLumpSumAllowance, uncrystallisedPot * 0.25);
    const taxOptimisedWithdrawal = source.taxOptimisationMode
      ? calculateTaxOptimisedWithdrawal({
        targetGrossIncome: Math.max(pensionNeededGross, regularDrawdown),
        myOtherIncome,
        expectedBankInterest: bankInterestGross,
        taxFreeCashCapacity: Math.max(0, taxFreeCashCapacity - forcedTaxFreeCash),
        savingsAvailable: savingsBalance,
        crystallisedPot,
        uncrystallisedPot: Math.max(0, uncrystallisedPot - forcedTaxFreeCash * 4),
      })
      : null;
    const taxFreeCashEnabled = source.taxOptimisationMode || source.regularDrawdownEnabled || (yearIndex === 1 && source.take25PercentYear1);
    const preferredTaxFreeCash = forcedTaxFreeCash
      + (source.taxOptimisationMode
        ? taxOptimisedWithdrawal.taxFreeCash
        : source.regularDrawdownEnabled
          ? regularDrawdown
          : 0);
    const taxFreeCashTaken = taxFreeCashEnabled
      ? Math.min(taxFreeCashCapacity, preferredTaxFreeCash)
      : 0;

    let designatedForTaxFree = Math.min(uncrystallisedPot, taxFreeCashTaken * 4);
    let taxFreeCashActual = normaliseMoney(Math.min(taxFreeCashTaken, remainingLumpSumAllowance, designatedForTaxFree * 0.25));
    let newCrystallisedFromTaxFree = designatedForTaxFree - taxFreeCashActual;

    const taxableCapacityBeforeExtra = crystallisedPot + newCrystallisedFromTaxFree;
    const targetTaxableWithdrawal = source.taxOptimisationMode
      ? taxOptimisedWithdrawal.taxableWithdrawal
      : Math.max(0, pensionNeededGross - taxFreeCashActual);
    const extraDesignationForTaxable = Math.min(
      Math.max(0, targetTaxableWithdrawal - taxableCapacityBeforeExtra),
      Math.max(0, uncrystallisedPot - designatedForTaxFree),
    );

    const availableTaxableCapacity = taxableCapacityBeforeExtra + extraDesignationForTaxable;
    const additionalTaxableWithdrawal = Math.min(targetTaxableWithdrawal, availableTaxableCapacity);
    const totalTaxableWithdrawal = additionalTaxableWithdrawal;

    const myTaxableIncome = myOtherIncome + totalTaxableWithdrawal;
    const taxBreakdown = estimateUkIncomeTax(myTaxableIncome, allowanceBase);
    const bankInterestTaxBreakdown = estimateBankInterestTax(myTaxableIncome, bankInterestGross, allowanceBase);
    const estimatedTax = taxBreakdown.totalTax + bankInterestTaxBreakdown.bankInterestTax;
    totalBankInterestTax += bankInterestTaxBreakdown.bankInterestTax;
    totalPsaUsed += Math.min(bankInterestTaxBreakdown.bankInterestGross, bankInterestTaxBreakdown.personalSavingsAllowance);
    const taxableAfterTax = Math.max(0, myTaxableIncome - taxBreakdown.totalTax - myOtherIncome);
    const sourcedFromSavings = source.taxOptimisationMode
      ? Math.min(savingsBalance, taxOptimisedWithdrawal.savingsUsed)
      : 0;
    const savingsAllocation = allocateSavingsWithdrawal(sourcedFromSavings, bankSavingsBalance, isaSavingsBalance, partnerSavingsBalance);
    const incomeTotal = baseIncomeTotal + taxFreeCashActual;
    const incomeCovered = incomeTotal + totalTaxableWithdrawal + sourcedFromSavings;
    const householdBills = compoundAnnual(source.billsAnnual, source.cpiRate, yearIndex, source.applyCpiBills);
    const excessNet = totalIncomeRequired - estimatedTax - householdBills - holidays;

    const totalDesignated = designatedForTaxFree + extraDesignationForTaxable;
    const crystallisedToDateCurrent = crystallisedToDate + designatedForTaxFree;
    const openingPot = uncrystallisedPot + crystallisedPot;
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

    remainingLumpSumAllowance = Math.max(0, remainingLumpSumAllowance - taxFreeCashActual);
    bankSavingsBalance = Math.max(0, bankSavingsBalance + bankInterestGross - bankInterestTaxBreakdown.bankInterestTax - savingsAllocation.bankSavingsUsed);
    isaSavingsBalance = Math.max(0, isaSavingsBalance + isaInterestGross - savingsAllocation.isaSavingsUsed);
    partnerSavingsBalance = Math.max(0, partnerSavingsBalance + (partnerSavingsBalance * source.partnerSavingsGrowthRate) - savingsAllocation.partnerSavingsUsed);
    savingsBalance = bankSavingsBalance + isaSavingsBalance + partnerSavingsBalance;

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
      incomeCovered,
      ownStatePension,
      pensionNeededGross,
      regularDrawdown,
      taxFreeCash: taxFreeCashActual,
      sourcedFromSavings,
      bankSavingsUsed: savingsAllocation.bankSavingsUsed,
      isaSavingsUsed: savingsAllocation.isaSavingsUsed,
      partnerSavingsUsed: savingsAllocation.partnerSavingsUsed,
      isaInterestGross,
      bankInterestGross: bankInterestTaxBreakdown.bankInterestGross,
      savingsIncomeForPsa: bankInterestTaxBreakdown.savingsIncomeForPsa,
      personalSavingsAllowance: bankInterestTaxBreakdown.personalSavingsAllowance,
      personalSavingsAllowanceUsed: Math.min(bankInterestTaxBreakdown.bankInterestGross, bankInterestTaxBreakdown.personalSavingsAllowance),
      bankInterestTaxable: bankInterestTaxBreakdown.bankInterestTaxable,
      bankInterestTax: bankInterestTaxBreakdown.bankInterestTax,
      psaProtectedTaxableWithdrawalLimit: taxOptimisedWithdrawal?.psaProtectedBasicRateLimit ?? Math.max(0, UK_TAX_RULES.basicRateLimit - myOtherIncome - bankInterestGross),
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
  const totalTflsTaken = projection.rows.reduce((sum, row) => sum + row.taxFreeCash, 0);
  const cards = [
    {
      label: "Retirement year",
      value: String(projection.retirementYear),
      note: `Age ${projection.rows[0]?.age ?? state.retirementAge} with ${NUMBER.format(projection.yearsToRetirement)} years to go`,
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
      label: "Plan end",
      value: `${projection.planEndYear}`,
      note: `Age ${projection.planEndAge}`,
    },
    {
      label: "End pot",
      value: formatCurrency(lastRow?.totalPotAfterGrowth ?? 0),
      note: projection.depletionYear
        ? `Pot reaches zero in ${projection.depletionYear.calendarYear} (age ${projection.depletionYear.age})`
        : "Pot remains above zero within the displayed plan",
    },
    {
      label: "Savings at plan end",
      value: formatCurrency(lastRow?.savingsLeft ?? projection.totalSeparateSavingsAtRetirement),
      note: `ISA ${formatCurrency(lastRow?.isaSavingsLeft ?? projection.personalIsaSavingsAtRetirement)}, bank ${formatCurrency(lastRow?.bankSavingsLeft ?? projection.personalBankSavingsAtRetirement)}, partner ${formatCurrency(lastRow?.partnerSavingsLeft ?? projection.partnerSavingsAtRetirement)}`,
    },
    {
      label: "Total tax paid",
      value: formatCurrency(totalTaxPaid),
      note: `Across ${NUMBER.format(projection.rows.length)} retirement years shown, ${formatCurrency(averageTaxPerYear)} yearly average`,
    },
    {
      label: "Lump sum allowance left",
      value: formatCurrency(lastRow?.remainingLumpSumAllowance ?? projection.remainingLumpSumAllowanceStart),
      note: `Starting allowance left ${formatCurrency(projection.remainingLumpSumAllowanceStart)}`,
    },
    {
      label: "Total TFLS taken",
      value: formatCurrency(totalTflsTaken),
      note: `Across ${NUMBER.format(projection.rows.length)} retirement years shown`,
    },
    {
      label: "Separate savings total",
      value: formatCurrency(projection.totalSeparateSavingsAtRetirement),
      note: `ISA ${formatCurrency(projection.personalIsaSavingsAtRetirement)}, bank ${formatCurrency(projection.personalBankSavingsAtRetirement)}, partner ${formatCurrency(projection.partnerSavingsAtRetirement)}`,
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
    clone.querySelector(".summary-label").textContent = card.label;
    clone.querySelector(".summary-value").textContent = card.value;
    clone.querySelector(".summary-note").textContent = card.note;
    summaryGrid.appendChild(clone);
  });

  chartCaption.textContent = projection.depletionYear
    ? `Projection reaches zero in ${projection.depletionYear.calendarYear} (age ${projection.depletionYear.age}).`
    : "Projection stays positive across the years shown.";

  tableCaption.textContent = `Showing ${projection.rows.length} retirement years from ${projection.retirementYear} onwards.`;
}

function getTableColumns() {
  const detailedColumns = [
    ["yearIndex", "Year"],
    ["calendarYear", "Calendar"],
    ["age", "Age"],
    ["incomeRequired", "Gross income required"],
    ["carCost", "Car"],
    ["partnerIncome", "Partner work income"],
    ["partnerStatePension", "Partner state pension"],
    ["partnerWorkPension", "Partner work pension"],
    ["taxFreeCash", "TFLS (Tax Free Lump Sum)"],
    ["sourcedFromSavings", "Sourced from Savings"],
    ["incomeTotal", "Income total"],
    ["pensionNeededGross", "From my pension"],
    ["holidays", "Holidays"],
    ["householdBills", "Bills"],
    ["estimatedTax", "Estimated tax"],
    ["excessNet", "Free cash"],
    ["savingsLeft", "Savings left"],
  ];
  const summarisedColumns = [
    ["yearIndex", "Year"],
    ["calendarYear", "Calendar"],
    ["age", "Age"],
    ["incomeRequired", "Gross income required"],
    ["sourcedFromSavings", "Sourced from Savings"],
    ["incomeTotal", "Total income"],
    ["grossPensionWithdrawal", "Taxable pension withdrawn"],
    ["estimatedTax", "Estimated tax"],
    ["excessNet", "Free cash"],
    ["totalPotAfterGrowth", "Pot after growth"],
  ];
  const granularBaseDetailColumns = [
    ["yearIndex", "Year"],
    ["calendarYear", "Calendar"],
    ["age", "Age"],
    ["incomeRequired", "Gross income required"],
    ["carCost", "Car"],
    ["totalIncomeRequired", "Income needed"],
    ["partnerIncome", "Partner work income"],
    ["partnerStatePension", "Partner state pension"],
    ["partnerWorkPension", "Partner work pension"],
    ["ownStatePension", "My state pension"],
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
    ["uncrystallisedPot", "Uncrystallised left"],
    ["crystallisedPot", "TFLS crystallised to date"],
    ["totalPotAfterGrowth", "Pot after growth"],
    ["remainingLumpSumAllowance", "LSA left"],
    ["savingsLeft", "Savings left"],
  ];
  const granularCrystallisationKeys = [
    "uncrystallisedPot",
    "crystallisedPot",
    "newlyCrystallised",
    "taxableFromNewTflsCrystallisation",
    "taxableDrawdownDesignated",
  ];
  const detailedColumnsWithoutIncomeBreakdown = granularBaseDetailColumns.filter(([key]) => ![
    "partnerIncome",
    "partnerStatePension",
    "partnerWorkPension",
    "ownStatePension",
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
    ["savingsIncomeForPsa", "Income for PSA"],
    ["psaProtectedTaxableWithdrawalLimit", "PSA-protected taxable limit"],
    ["personalSavingsAllowance", "PSA available"],
    ["personalSavingsAllowanceUsed", "PSA used"],
    ["bankInterestTaxable", "Bank interest taxable"],
    ["bankInterestTax", "Bank interest tax"],
    ["bankSavingsUsed", "Bank savings used"],
    ["isaSavingsUsed", "ISA savings used"],
    ["partnerSavingsUsed", "Partner savings used"],
    ["bankSavingsLeft", "Bank savings left"],
    ["isaSavingsLeft", "ISA savings left"],
    ["partnerSavingsLeft", "Partner savings left"],
  ];
  const granularCrystallisationColumns = [
    ["uncrystallisedPot", "Uncrystallised left"],
    ["crystallisedPot", "TFLS crystallised to date"],
    ["newlyCrystallised", "New TFLS crystallised"],
    ["taxableFromNewTflsCrystallisation", "Taxable drawdown linked to TFLS"],
    ["taxableDrawdownDesignated", "Crystallised for taxable drawdown"],
  ];
  const granularExtraColumns = [
    ["crystallisedFundLeft", "Crystallised fund left"],
  ];
  const granularColumns = [
    ...granularBaseColumnsWithoutCrystallisation,
    ...granularSavingsColumns,
    ...(uiState.showGranularTaxFields ? granularTaxColumns : []),
    ...(uiState.showGranularGrowthFields ? granularGrowthColumns : []),
    ...(uiState.showGranularCrystallisationFields ? granularCrystallisationColumns : []),
    ...granularExtraColumns,
  ];

  return uiState.tableView === "granular"
    ? granularColumns
    : uiState.tableView === "detailed"
      ? detailedColumns
      : summarisedColumns;
}

function getColumnCalculationNote(key, label) {
  const notes = {
    yearIndex: 'Year number from retirement start.',
    calendarYear: 'Retirement year + (Year - 1).',
    age: 'Retirement age + (Year - 1).',
    incomeRequired: 'Base income target after CPI, before car/bills/tax.',
    carCost: 'Car cost applied in the configured replacement years only.',
    totalIncomeRequired: 'Gross income required + Car.',
    partnerIncome: 'Partner work income, stopping when state pension starts.',
    partnerStatePension: 'Partner state pension after trigger age and CPI rules.',
    partnerWorkPension: 'Partner work pension after trigger age and CPI rules.',
    ownStatePension: 'Your state pension after trigger age and CPI rules.',
    taxFreeCash: 'Tax Free Lump Sum taken from available uncrystallised pension funds and tested against remaining lump sum allowance.',
    sourcedFromSavings: 'Savings used in tax optimisation mode to avoid or reduce higher-rate taxable pension drawdown.',
    bankSavingsUsed: 'Savings withdrawal sourced from taxable bank savings first.',
    isaSavingsUsed: 'Savings withdrawal sourced from ISA after bank savings.',
    partnerSavingsUsed: 'Savings withdrawal sourced from partner savings after personal bank and ISA savings.',
    isaInterestGross: 'Annual ISA interest/growth, treated as tax-free.',
    bankInterestGross: 'Annual bank interest before tax.',
    savingsIncomeForPsa: 'Your taxable income plus bank interest. This determines whether PSA is £1,000, £500, or £0.',
    psaProtectedTaxableWithdrawalLimit: 'Taxable pension withdrawal limit used by tax optimisation to keep taxable income plus bank interest within the basic-rate band where possible.',
    personalSavingsAllowance: 'Personal Savings Allowance available based on the tax band after bank interest.',
    personalSavingsAllowanceUsed: 'Bank interest covered by the Personal Savings Allowance.',
    bankInterestTaxable: 'Bank interest above the Personal Savings Allowance.',
    bankInterestTax: 'Estimated income tax due on taxable bank interest.',
    bankSavingsLeft: 'Bank savings left after interest, interest tax, and any savings withdrawal.',
    isaSavingsLeft: 'ISA savings left after tax-free growth and any savings withdrawal.',
    partnerSavingsLeft: 'Partner savings left after growth and any savings withdrawal.',
    incomeTotal: 'Partner work income + partner state pension + partner work pension + my state pension + TFLS taken that year.',
    pensionNeededGross: 'Income needed - base income total before pension withdrawals.',
    grossPensionWithdrawal: 'Gross taxable pension withdrawal only. TFLS is excluded from this figure.',
    taxableFromNewTflsCrystallisation: 'Taxable drawdown paid from the 75% crystallised slice created when same-year TFLS is taken.',
    holidays: 'Holiday cost after CPI rules.',
    householdBills: 'Bills after CPI rules.',
    estimatedTax: 'UK income tax estimate on my taxable income for the year.',
    excessNet: 'Free cash = total income required - estimated tax - bills - holidays.',
    uncrystallisedPot: 'Uncrystallised fund left after withdrawals and annual growth.',
    crystallisedPot: 'Total crystallised for TFLS to date, including prior years.',
    totalPotAfterGrowth: 'Pot before growth + Growth added.',
    remainingLumpSumAllowance: 'Previous LSA left - TFLS taken.',
    savingsLeft: 'Separate personal and partner savings left after any tax optimisation use.',
    taxableIncomeBeforeAllowance: 'My state pension + taxable pension withdrawn. TFLS, savings, and partner income are excluded.',
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
  columns.forEach(([, label]) => {
    const th = document.createElement("th");
    th.textContent = label;
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

  const pad = { top: 42, right: 22, bottom: 42, left: 70 };
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
    ctx.fillText(String(projection.rows[rowIndex].calendarYear), x, height - 20);
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

  const pad = { top: 60, right: 22, bottom: 42, left: 70 };
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
    ctx.fillText(String(projection.rows[rowIndex].calendarYear), xFor(rowIndex), height - 20);
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

  if (input.type === "checkbox") {
    state[key] = input.checked;
  } else if (input.type === "number") {
    state[key] = parseInputValue(input, state[key]);
  } else {
    state[key] = input.value;
  }


  state = normaliseState(state);
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
    ["incomeRequired", "Gross income required"],
    ["carCost", "Car"],
    ["totalIncomeRequired", "Income needed"],
    ["partnerIncome", "Partner work income"],
    ["partnerStatePension", "Partner state pension"],
    ["partnerWorkPension", "Partner work pension"],
    ["ownStatePension", "My state pension"],
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
    ["Partner birth year", state.partnerBirthYear],
    ["Income required", state.incomeRequired],
    ["Income after year 10", state.incomeAfterYear10],
    ["CPI rate", state.cpiRate],
    ["Apply CPI to income", state.applyCpiIncome ? 1 : 0],
    ["Car cost", state.carCost],
    ["Car frequency years", state.carFrequencyYears],
    ["Car start year", state.carStartYear],
    ["Partner work income", state.partnerWorkIncome],
    ["Partner work CPI", state.partnerWorkCpiRate],
    ["Apply CPI to partner work", state.partnerWorkApplyCpi ? 1 : 0],
    ["Partner state pension", state.partnerStatePension],
    ["Partner work pension", state.partnerWorkPension],
    ["Own state pension", state.ownStatePension],
    ["State/work pension CPI", state.statePensionCpiRate],
    ["Apply CPI to state/work pensions", state.statePensionApplyCpi ? 1 : 0],
    ["Personal allowance", UK_TAX_RULES.personalAllowance],
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
    ["Take 25% in year 1", state.take25PercentYear1 ? 1 : 0],
    ["Starting uncrystallised pot", projection.retirementUncrystallisedPot],
    ["Starting crystallised pot", projection.retirementCrystallisedPot],
    ["Starting lump sum allowance", projection.remainingLumpSumAllowanceStart],
    ["Starting savings", projection.totalSeparateSavingsAtRetirement],
    ["Tax optimisation mode", state.taxOptimisationMode ? 1 : 0],
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
    const targetGross = `MAX(0,${cell("totalIncomeRequired", rowNumber)}-SUM(${cell("partnerIncome", rowNumber)}:${cell("ownStatePension", rowNumber)}))`;
    const taxableIncome = `${cell("ownStatePension", rowNumber)}+${cell("grossPensionWithdrawal", rowNumber)}`;
    const taxFormula = `LET(myTax,${taxableIncome},pa,MAX(0,${assumptionRef["Personal allowance"]}-MAX(0,(myTax-${assumptionRef["Allowance taper starts"]})/2)),taxable,MAX(0,myTax-pa),basicBand,MAX(0,${assumptionRef["Basic rate limit"]}-pa),higherBand,${assumptionRef["Higher rate limit"]}-${assumptionRef["Basic rate limit"]},MIN(taxable,basicBand)*${assumptionRef["Basic rate"]}+MIN(MAX(0,taxable-basicBand),higherBand)*${assumptionRef["Higher rate"]}+MAX(0,taxable-basicBand-higherBand)*${assumptionRef["Additional rate"]})`;
    const priorPot = previousRow ? cell("totalPotAfterGrowth", previousRow) : `${assumptionRef["Starting uncrystallised pot"]}+${assumptionRef["Starting crystallised pot"]}`;
    const priorLsa = previousRow ? cell("remainingLumpSumAllowance", previousRow) : assumptionRef["Starting lump sum allowance"];
    const priorSavings = previousRow ? cell("savingsLeft", previousRow) : assumptionRef["Starting savings"];
    const basicRateWithdrawalLimit = `MAX(0,${assumptionRef["Basic rate limit"]}-${cell("ownStatePension", rowNumber)})`;
    const pairedTaxableWithdrawal = `MIN(${targetGross}*0.75,${basicRateWithdrawalLimit},${cell("openingPot", rowNumber)}*0.75,${priorLsa}*3)`;
    const pairedTfls = `(${pairedTaxableWithdrawal})/3`;
    const standaloneTfls = `MIN(MAX(0,${priorLsa}-(${pairedTfls})),MAX(0,${cell("openingPot", rowNumber)}-(${pairedTaxableWithdrawal})-(${pairedTfls}))*0.25,MAX(0,${targetGross}-(${pairedTaxableWithdrawal})-(${pairedTfls})))`;
    const taxOptimisedTfls = `(${pairedTfls})+(${standaloneTfls})`;
    const standardTfls = `IF(AND(${assumptionRef["Take 25% in year 1"]}=1,${cell("yearIndex", rowNumber)}=1),MIN(${priorLsa},${cell("openingPot", rowNumber)}*0.25),IF(AND(${assumptionRef["Use regular drawdown"]}=1,${cell("yearIndex", rowNumber)}<=${assumptionRef["Regular drawdown years"]}),MIN(${priorLsa},${assumptionRef["Regular drawdown"]},${cell("openingPot", rowNumber)}*0.25),0))`;
    const formulas = {
      yearIndex: rowIndex === 0 ? "=1" : `=${cell("yearIndex", previousRow)}+1`,
      calendarYear: rowIndex === 0 ? `=${assumptionRef["Retirement year"]}` : `=${cell("calendarYear", previousRow)}+1`,
      age: rowIndex === 0 ? `=${assumptionRef["Retirement age"]}` : `=${cell("age", previousRow)}+1`,
      incomeRequired: `=IF(${assumptionRef["Apply CPI to income"]}=1,IF(${cell("yearIndex", rowNumber)}<=10,${assumptionRef["Income required"]},${assumptionRef["Income after year 10"]})*POWER(1+${assumptionRef["CPI rate"]}/12,12*${cell("yearIndex", rowNumber)}),IF(${cell("yearIndex", rowNumber)}<=10,${assumptionRef["Income required"]},${assumptionRef["Income after year 10"]}))`,
      carCost: `=IF(AND(${assumptionRef["Car cost"]}>0,${cell("yearIndex", rowNumber)}>=${assumptionRef["Car start year"]},MOD(${cell("yearIndex", rowNumber)}-${assumptionRef["Car start year"]},${assumptionRef["Car frequency years"]})=0),${assumptionRef["Car cost"]},0)`,
      totalIncomeRequired: `=${cell("incomeRequired", rowNumber)}+${cell("carCost", rowNumber)}`,
      partnerIncome: `=IF(${cell("calendarYear", rowNumber)}-${assumptionRef["Partner birth year"]}<68,IF(${assumptionRef["Apply CPI to partner work"]}=1,${assumptionRef["Partner work income"]}*POWER(1+${assumptionRef["Partner work CPI"]}/12,12*${cell("yearIndex", rowNumber)}),${assumptionRef["Partner work income"]}),0)`,
      partnerStatePension: `=IF(${cell("calendarYear", rowNumber)}-${assumptionRef["Partner birth year"]}>67,IF(${assumptionRef["Apply CPI to state/work pensions"]}=1,${assumptionRef["Partner state pension"]}*POWER(1+${assumptionRef["State/work pension CPI"]}/12,12*${cell("yearIndex", rowNumber)}),${assumptionRef["Partner state pension"]}),0)`,
      partnerWorkPension: `=IF(${cell("calendarYear", rowNumber)}-${assumptionRef["Partner birth year"]}>67,IF(${assumptionRef["Apply CPI to state/work pensions"]}=1,${assumptionRef["Partner work pension"]}*POWER(1+${assumptionRef["State/work pension CPI"]}/12,12*${cell("yearIndex", rowNumber)}),${assumptionRef["Partner work pension"]}),0)`,
      ownStatePension: `=IF(${cell("age", rowNumber)}>67,IF(${assumptionRef["Apply CPI to state/work pensions"]}=1,${assumptionRef["Own state pension"]}*POWER(1+${assumptionRef["State/work pension CPI"]}/12,12*${cell("yearIndex", rowNumber)}),${assumptionRef["Own state pension"]}),0)`,
      taxFreeCash: `=IF(${assumptionRef["Tax optimisation mode"]}=1,${taxOptimisedTfls},${standardTfls})`,
      sourcedFromSavings: `=IF(${assumptionRef["Tax optimisation mode"]}=1,MIN(${priorSavings},MAX(0,${targetGross}-${cell("taxFreeCash", rowNumber)}-${cell("grossPensionWithdrawal", rowNumber)})),0)`,
      incomeTotal: `=SUM(${cell("partnerIncome", rowNumber)}:${cell("ownStatePension", rowNumber)})+${cell("taxFreeCash", rowNumber)}`,
      pensionNeededGross: `=${targetGross}`,
      grossPensionWithdrawal: `=IF(${assumptionRef["Tax optimisation mode"]}=1,${pairedTaxableWithdrawal},MAX(0,${cell("pensionNeededGross", rowNumber)}-${cell("taxFreeCash", rowNumber)}))`,
      holidays: `=IF(${assumptionRef["Apply CPI to holidays"]}=1,${assumptionRef["Holidays annual"]}*POWER(1+${assumptionRef["CPI rate"]}/12,12*${cell("yearIndex", rowNumber)}),${assumptionRef["Holidays annual"]})`,
      householdBills: `=IF(${assumptionRef["Apply CPI to bills"]}=1,${assumptionRef["Bills annual"]}*POWER(1+${assumptionRef["CPI rate"]}/12,12*${cell("yearIndex", rowNumber)}),${assumptionRef["Bills annual"]})`,
      estimatedTax: `=${taxFormula}`,
      excessNet: `=${cell("totalIncomeRequired", rowNumber)}-${cell("estimatedTax", rowNumber)}-${cell("householdBills", rowNumber)}-${cell("holidays", rowNumber)}`,
      openingPot: `=${priorPot}`,
      withdrawalsTaken: `=${cell("taxFreeCash", rowNumber)}+${cell("grossPensionWithdrawal", rowNumber)}`,
      totalPotBeforeGrowth: `=MAX(0,${cell("openingPot", rowNumber)}-${cell("withdrawalsTaken", rowNumber)})`,
      growth: `=IF(${assumptionRef["Apply pot growth"]}=1,${cell("totalPotBeforeGrowth", rowNumber)}*POWER(1+${assumptionRef["Post-retirement growth rate"]}/12,12)-${cell("totalPotBeforeGrowth", rowNumber)},0)`,
      totalPotAfterGrowth: `=${cell("totalPotBeforeGrowth", rowNumber)}+${cell("growth", rowNumber)}`,
      remainingLumpSumAllowance: `=MAX(0,${priorLsa}-${cell("taxFreeCash", rowNumber)})`,
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
      alert("That file could not be read. Please import a CSV or legacy JSON file exported from this tool.");
    } finally {
      importFile.value = "";
    }
  };
  reader.readAsText(file);
}

function resetState() {
  state = normaliseState({ ...DEFAULT_STATE });
  render();
}

inputs.forEach((input) => {
  input.addEventListener("input", updateField);
  input.addEventListener("change", updateField);
});

tableViewSelect.addEventListener("change", () => {
  uiState.tableView = tableViewSelect.value;
  saveUiState();
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

exportTableButton.addEventListener("click", exportTableToExcel);
exportFormulaButton.addEventListener("click", exportFormulaWorkbookToExcel);
exportPdfButton.addEventListener("click", exportPageToPdf);
exportButton.addEventListener("click", exportState);
resetButton.addEventListener("click", resetState);
importFile.addEventListener("change", importState);
window.addEventListener("resize", render);

render();
