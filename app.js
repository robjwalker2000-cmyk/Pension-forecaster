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

const UK_TAX_RULES = {
  personalAllowance: 12570,
  allowanceTaperStarts: 100000,
  basicRateLimit: 50270,
  higherRateLimit: 125140,
  basicRate: 0.2,
  higherRate: 0.4,
  additionalRate: 0.45,
  standardLumpSumAllowance: 268275,
};

const inputs = Array.from(document.querySelectorAll("[data-field]"));
const summaryGrid = document.getElementById("summary-grid");
const summaryTemplate = document.getElementById("summary-card-template");
const projectionHead = document.getElementById("projection-head");
const projectionBody = document.getElementById("projection-body");
const chartCanvas = document.getElementById("projection-chart");
const chartCaption = document.getElementById("chart-caption");
const tableCaption = document.getElementById("table-caption");
const exportTableButton = document.getElementById("export-table-button");
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
    };
  } catch {
    return { controlsHidden: false, tableView: "summarised", showGranularTaxFields: false, showGranularIncomeFields: true, showGranularGrowthFields: false };
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
  granularTaxToggleWrap.hidden = uiState.tableView !== "granular";
  granularIncomeToggleWrap.hidden = uiState.tableView !== "granular";
  granularGrowthToggleWrap.hidden = uiState.tableView !== "granular";
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

function calculateProjection(source) {
  const retirementYear = source.retirementYear;
  const birthYear = source.yearOfBirth;
  const yearsToRetirement = Math.max(0, retirementYear - source.currentYear);
  const preRetirementGrowthRate = growthRateForScenario(source, "pre");
  const postRetirementGrowthRate = growthRateForScenario(source, "post");
  const currentUncrystallisedPot = Math.max(0, source.currentPot - source.currentCrystallisedPot);
  const retirementUncrystallisedPot = compoundAnnual(currentUncrystallisedPot, preRetirementGrowthRate, yearsToRetirement, true);
  const retirementCrystallisedPot = compoundAnnual(source.currentCrystallisedPot, preRetirementGrowthRate, yearsToRetirement, true);
  const personalSavingsAtRetirement = compoundAnnual(source.personalSavings, source.personalSavingsGrowthRate, yearsToRetirement, true);
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

    const forcedTaxFreeCash = yearIndex === 1 && source.take25PercentYear1
      ? Math.min(remainingLumpSumAllowance, uncrystallisedPot * 0.25)
      : 0;

    const taxFreeCashCapacity = Math.min(remainingLumpSumAllowance, uncrystallisedPot * 0.25);
    const taxFreeCashEnabled = source.regularDrawdownEnabled || (yearIndex === 1 && source.take25PercentYear1);
    const preferredTaxFreeCash = forcedTaxFreeCash + (source.regularDrawdownEnabled ? regularDrawdown : 0);
    const taxFreeCashTaken = taxFreeCashEnabled
      ? Math.min(taxFreeCashCapacity, preferredTaxFreeCash)
      : 0;

    let designatedForTaxFree = Math.min(uncrystallisedPot, taxFreeCashTaken * 4);
    let taxFreeCashActual = Math.min(taxFreeCashTaken, remainingLumpSumAllowance, designatedForTaxFree * 0.25);
    let newCrystallisedFromTaxFree = designatedForTaxFree - taxFreeCashActual;

    const taxableCapacityBeforeExtra = crystallisedPot + newCrystallisedFromTaxFree;
    const targetTaxableWithdrawal = Math.max(0, pensionNeededGross - taxFreeCashActual);
    const extraDesignationForTaxable = Math.min(
      Math.max(0, targetTaxableWithdrawal - taxableCapacityBeforeExtra),
      Math.max(0, uncrystallisedPot - designatedForTaxFree),
    );

    const availableTaxableCapacity = taxableCapacityBeforeExtra + extraDesignationForTaxable;
    const additionalTaxableWithdrawal = Math.min(targetTaxableWithdrawal, availableTaxableCapacity);
    const totalTaxableWithdrawal = additionalTaxableWithdrawal;

    const incomeTotal = baseIncomeTotal + taxFreeCashActual;
    const myTaxableIncome = myOtherIncome + totalTaxableWithdrawal;
    const allowanceBase = compoundAnnual(UK_TAX_RULES.personalAllowance, source.taxAllowanceCpiRate, yearIndex, source.applyTaxAllowanceCpi);
    const taxBreakdown = estimateUkIncomeTax(myTaxableIncome, allowanceBase);
    const estimatedTax = taxBreakdown.totalTax;
    const taxableAfterTax = Math.max(0, myTaxableIncome - estimatedTax - myOtherIncome);
    const householdBills = compoundAnnual(source.billsAnnual, source.cpiRate, yearIndex, source.applyCpiBills);
    const excessNet = totalIncomeRequired - estimatedTax - householdBills - holidays;

    const totalDesignated = designatedForTaxFree + extraDesignationForTaxable;
    const crystallisedToDateCurrent = crystallisedToDate + totalDesignated;
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
      ownStatePension,
      pensionNeededGross,
      regularDrawdown,
      taxFreeCash: taxFreeCashActual,
      grossPensionWithdrawal: totalTaxableWithdrawal,
      taxableWithdrawal: totalTaxableWithdrawal,
      additionalTaxableWithdrawal,
      taxableAfterTax,
      estimatedTax,
      openingPot,
      assumedTaxAllowance: taxBreakdown.personalAllowance,
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
      newlyCrystallised: totalDesignated,
      totalPotBeforeGrowth,
      totalPotAfterGrowth,
      growth,
      withdrawalsTaken: totalWithdrawn,
      potChange,
      remainingLumpSumAllowance,
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
    partnerSavingsAtRetirement,
    totalSeparateSavingsAtRetirement,
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

function syncForm() {
  inputs.forEach((input) => {
    const key = input.dataset.field;
    const value = state[key];
    if (input.type === "checkbox") {
      input.checked = Boolean(value);
      return;
    }
    input.value = value;
  });
}

function renderSummary(projection) {
  const lastRow = projection.rows[projection.rows.length - 1];
  const totalTaxPaid = projection.rows.reduce((sum, row) => sum + row.estimatedTax, 0);
  const cards = [
    {
      label: "Retirement year",
      value: String(projection.retirementYear),
      note: `Age ${projection.rows[0]?.age ?? state.retirementAge} with ${NUMBER.format(projection.yearsToRetirement)} years to go`,
    },
    {
      label: "Pot at retirement",
      value: CURRENCY.format(projection.totalRetirementPot),
      note: `${PERCENT.format(projection.preRetirementGrowthRate)} before retirement, ${PERCENT.format(projection.postRetirementGrowthRate)} after retirement`,
    },
    {
      label: "Separate savings total",
      value: CURRENCY.format(projection.totalSeparateSavingsAtRetirement),
      note: `Kept outside projection: yours ${CURRENCY.format(projection.personalSavingsAtRetirement)}, partner ${CURRENCY.format(projection.partnerSavingsAtRetirement)}`,
    },
    {
      label: "Uncrystallised at retirement",
      value: CURRENCY.format(projection.retirementUncrystallisedPot),
      note: `Crystallised ${CURRENCY.format(projection.retirementCrystallisedPot)}`,
    },
    {
      label: "Plan end",
      value: `${projection.planEndYear}`,
      note: `Age ${projection.planEndAge}`,
    },
    {
      label: "End pot",
      value: CURRENCY.format(lastRow?.totalPotAfterGrowth ?? 0),
      note: projection.depletionYear
        ? `Pot reaches zero in ${projection.depletionYear.calendarYear} (age ${projection.depletionYear.age})`
        : "Pot remains above zero within the displayed plan",
    },
    {
      label: "Total tax paid",
      value: CURRENCY.format(totalTaxPaid),
      note: `Across ${NUMBER.format(projection.rows.length)} retirement years shown`,
    },
    {
      label: "Lump sum allowance left",
      value: CURRENCY.format(lastRow?.remainingLumpSumAllowance ?? projection.remainingLumpSumAllowanceStart),
      note: `Starting allowance left ${CURRENCY.format(projection.remainingLumpSumAllowanceStart)}`,
    },
    {
      label: "My savings at retirement",
      value: CURRENCY.format(projection.personalSavingsAtRetirement),
      note: `Growth rate ${PERCENT.format(state.personalSavingsGrowthRate)}`,
    },
    {
      label: "Partner savings at retirement",
      value: CURRENCY.format(projection.partnerSavingsAtRetirement),
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

function renderTable(projection) {
  const detailedColumns = [
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
    ["taxFreeCash", "Tax-free income"],
    ["incomeTotal", "Income total"],
    ["pensionNeededGross", "From my pension"],
    ["grossPensionWithdrawal", "Gross taxable withdrawn"],
    ["holidays", "Holidays"],
    ["householdBills", "Bills"],
    ["estimatedTax", "Estimated tax"],
    ["excessNet", "Free cash"],
    ["uncrystallisedPot", "Uncrystallised left"],
    ["crystallisedPot", "Crystallised to date"],
    ["totalPotAfterGrowth", "Pot after growth"],
    ["remainingLumpSumAllowance", "LSA left"],
  ];
  const summarisedColumns = [
    ["yearIndex", "Year"],
    ["calendarYear", "Calendar"],
    ["age", "Age"],
    ["incomeRequired", "Gross income required"],
    ["incomeTotal", "Total income"],
    ["grossPensionWithdrawal", "Gross taxable withdrawn"],
    ["estimatedTax", "Estimated tax"],
    ["excessNet", "Free cash"],
    ["totalPotAfterGrowth", "Pot after growth"],
  ];
  const granularIncomeColumns = [
    ["partnerIncome", "Partner work income"],
    ["partnerStatePension", "Partner state pension"],
    ["partnerWorkPension", "Partner work pension"],
    ["ownStatePension", "My state pension"],
    ["taxFreeCash", "Tax-free income"],
  ];
  const detailedColumnsWithoutIncomeBreakdown = detailedColumns.filter(([key]) => !["partnerIncome", "partnerStatePension", "partnerWorkPension", "ownStatePension", "taxFreeCash"].includes(key));
  const granularBaseColumns = uiState.showGranularIncomeFields ? detailedColumns : detailedColumnsWithoutIncomeBreakdown;
  const granularTaxColumns = [
    ["assumedTaxAllowance", "Assumed allowance"],
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
  const granularExtraColumns = [
    ["newlyCrystallised", "New crystallised"],
    ["crystallisedFundLeft", "Crystallised fund left"],
  ];
  const granularColumns = [
    ...granularBaseColumns,
    ...(uiState.showGranularTaxFields ? granularTaxColumns : []),
    ...(uiState.showGranularGrowthFields ? granularGrowthColumns : []),
    ...granularExtraColumns,
  ];
  const columns = uiState.tableView === "granular"
    ? granularColumns
    : uiState.tableView === "detailed"
      ? detailedColumns
      : summarisedColumns;

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
        td.textContent = NUMBER.format(row[key]);
      } else if (["effectiveTaxRate", "marginalTaxRate"].includes(key)) {
        td.textContent = PERCENT.format(row[key] || 0);
      } else {
        td.textContent = CURRENCY.format(row[key]);
      }
      tr.appendChild(td);
    });
    return tr;
  });

  projectionBody.replaceChildren(...bodyRows);
}

function renderChart(projection) {
  const ctx = chartCanvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = chartCanvas.clientWidth || chartCanvas.width;
  const height = chartCanvas.clientHeight || chartCanvas.height;
  chartCanvas.width = width * dpr;
  chartCanvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const pad = { top: 20, right: 20, bottom: 38, left: 62 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const values = projection.rows.flatMap((row) => [
    row.totalPotAfterGrowth,
    row.totalIncomeRequired,
    row.incomeTotal,
  ]);
  const yAxisStep = 100000;
  const rawMinValue = Math.min(0, ...values);
  const rawMaxValue = Math.max(...values, projection.totalRetirementPot);
  const minValue = Math.floor(rawMinValue / yAxisStep) * yAxisStep;
  const maxValue = Math.max(yAxisStep, Math.ceil(rawMaxValue / yAxisStep) * yAxisStep);
  const range = Math.max(maxValue - minValue, yAxisStep);

  const xFor = (index) =>
    pad.left + (projection.rows.length === 1 ? 0 : (index / (projection.rows.length - 1)) * plotWidth);
  const yFor = (value) => pad.top + plotHeight - ((value - minValue) / range) * plotHeight;

  const yTicks = [];
  for (let value = minValue; value <= maxValue; value += yAxisStep) {
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

  const series = [
    { key: "totalPotAfterGrowth", color: "#0f766e", fill: "rgba(15, 118, 110, 0.16)" },
    { key: "totalIncomeRequired", color: "#b45309" },
    { key: "incomeTotal", color: "#1d4ed8" },
  ];

  series.forEach((seriesDef, seriesIndex) => {
    ctx.beginPath();
    projection.rows.forEach((row, index) => {
      const x = xFor(index);
      const y = yFor(row[seriesDef.key]);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    if (seriesIndex === 0) {
      ctx.lineTo(xFor(projection.rows.length - 1), yFor(minValue));
      ctx.lineTo(xFor(0), yFor(minValue));
      ctx.closePath();
      ctx.fillStyle = seriesDef.fill;
      ctx.fill();
      ctx.beginPath();
      projection.rows.forEach((row, index) => {
        const x = xFor(index);
        const y = yFor(row[seriesDef.key]);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
    }

    ctx.strokeStyle = seriesDef.color;
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  ctx.fillStyle = "#6c5b48";
  ctx.font = '12px Georgia, "Times New Roman", serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  yTicks.forEach((value) => {
    const y = yFor(value);
    ctx.fillText(CURRENCY.format(value), 8, y);
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
    state[key] = Number(input.value);
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

function exportTableToExcel() {
  const headerCells = Array.from(document.querySelectorAll("#projection-head th"));
  const bodyRows = Array.from(document.querySelectorAll("#projection-body tr"));
  if (headerCells.length === 0 || bodyRows.length === 0) {
    return;
  }

  const headerHtml = `<tr>${headerCells.map((cell) => `<th>${escapeHtml(cell.textContent || "")}</th>`).join("")}</tr>`;
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
      <tbody>${bodyHtml}</tbody>
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

togglePanelButton.addEventListener("click", () => {
  uiState.controlsHidden = !uiState.controlsHidden;
  saveUiState();
  render();
});

exportTableButton.addEventListener("click", exportTableToExcel);
exportPdfButton.addEventListener("click", exportPageToPdf);
exportButton.addEventListener("click", exportState);
resetButton.addEventListener("click", resetState);
importFile.addEventListener("change", importState);
window.addEventListener("resize", render);

render();
