// Constants
const CANVAS_SIZE = { width: 600, height: 600 };
const LOGO_CONFIG = {
  scaleFactor: 18,
  yOffset: 40  // Further increased distance from bottom
};
const DATE_LABEL_CONFIG = {
  fontSize: 16,
  yOffset: 10
};

// Add this after the existing constants
const COLOR_PRESETS = {
  monochrome: {
    backgroundColor: { r: 247, g: 245, b: 242 },
    fillColor: { r: 28, g: 28, b: 32 },
    borderColor: { r: 118, g: 116, b: 112 }
  },
  blue: {
    backgroundColor: { r: 236, g: 243, b: 250 },
    fillColor: { r: 52, g: 98, b: 168 },
    borderColor: { r: 34, g: 72, b: 124 }
  },
  green: {
    backgroundColor: { r: 241, g: 249, b: 244 },
    fillColor: { r: 30, g: 122, b: 95 },
    borderColor: { r: 22, g: 88, b: 68 }
  },
  // alexcodesart: primary #ffba06, secondary #40476d
  alexcodesart: {
    backgroundColor: { r: 255, g: 252, b: 243 },
    fillColor: { r: 255, g: 186, b: 6 },
    borderColor: { r: 64, g: 71, b: 109 }
  }
};

const VIEW_MODES = {
  YEAR: 'year',
  LIFE: 'life'
};

// Default parameters
const DEFAULT_PARAMS = {
  rectangleSize: 400,
  fillColor: { r: 0, g: 0, b: 0 },
  borderColor: { r: 0, g: 0, b: 0 },
  borderWeight: 1,
  backgroundColor: { r: 255, g: 255, b: 255 },
  showWeeks: true,
  showDays: false,
  viewMode: VIEW_MODES.YEAR,
  birthDate: '1990-01-01',
  lifeExpectancyYears: 80,
  showLifeMonths: true,
  showLifeYears: false
};

let logo;
const params = { ...DEFAULT_PARAMS };

// Add these variables after the existing let declarations
let presetButtons = [];
const BUTTON_CONFIG = {
  diameter: 30,  // Keep small size
  gap: 15,
  yOffset: 30  // Increased offset from calendar
};

// P5Capture.setDefaultOptions({
//   format: "png",
//   quality: 1,
//   width: 1080,
// });

function preload() {
  logo = loadImage('logo-horizontal.png');
}

function getUrlParams() {
  const search = new URLSearchParams(window.location.search);
  const colorParam = search.get('color')?.toLowerCase() || 'black';
  const viewParam = search.get('view')?.toLowerCase();
  const viewMode =
    viewParam === 'life' ? VIEW_MODES.LIFE : VIEW_MODES.YEAR;

  return {
    color: ['black', 'blue', 'green', 'alex', 'alexcodesart'].includes(colorParam)
      ? colorParam
      : 'black',
    showUI: search.get('showUI') !== 'false',
    showWeeks:
      search.get('showWeeks') !== null
        ? search.get('showWeeks') === 'true'
        : DEFAULT_PARAMS.showWeeks,
    showDays:
      search.get('showDays') !== null
        ? search.get('showDays') === 'true'
        : DEFAULT_PARAMS.showDays,
    viewMode,
    birthDate: search.get('birth') || DEFAULT_PARAMS.birthDate,
    lifeExpectancyYears: (() => {
      const raw = parseInt(search.get('expectancy'), 10);
      const n = Number.isFinite(raw) ? raw : DEFAULT_PARAMS.lifeExpectancyYears;
      return Math.max(1, Math.min(200, n));
    })(),
    showLifeMonths:
      search.get('lifeMonths') !== null
        ? search.get('lifeMonths') === 'true'
        : DEFAULT_PARAMS.showLifeMonths,
    showLifeYears:
      search.get('lifeYears') !== null
        ? search.get('lifeYears') === 'true'
        : DEFAULT_PARAMS.showLifeYears
  };
}

// Map color param names to preset names
const COLOR_PARAM_TO_PRESET = {
  black: 'monochrome',
  blue: 'blue',
  green: 'green',
  alex: 'alexcodesart',
  alexcodesart: 'alexcodesart'
};

// Add this right after params initialization
const urlParams = getUrlParams();

function setup() {
  createCanvas(CANVAS_SIZE.width, CANVAS_SIZE.height);
  pixelDensity(3);
  
  // Apply initial color preset
  applyPreset(COLOR_PARAM_TO_PRESET[urlParams.color]);
  
  // Apply URL parameters for weeks and days
  params.showWeeks = urlParams.showWeeks;
  params.showDays = urlParams.showDays;
  params.viewMode = urlParams.viewMode;
  params.birthDate = urlParams.birthDate;
  params.lifeExpectancyYears = urlParams.lifeExpectancyYears;
  params.showLifeMonths = urlParams.showLifeMonths;
  params.showLifeYears = urlParams.showLifeYears;

  if (urlParams.showUI) {
    setupGui();
    createPresetButtons();
  }
}

function draw() {
  background(255);
  drawMainCalendar();
  
  // Draw UI elements by default unless explicitly disabled
  if (urlParams.showUI) {
    drawButtons();
    drawLogo();
  }
}

function apply2DTransformations() {
  translate(-width / 2, -height / 2);
}

function drawMainCalendar() {
  const calendarPosition = {
    x: width / 2 - params.rectangleSize / 2,
    y: height / 2 - params.rectangleSize / 2
  };

  // Draw background rectangle
  drawBackgroundRectangle(calendarPosition);

  const now = new Date();
  if (params.viewMode === VIEW_MODES.LIFE) {
    drawLifeVisualization(
      now,
      calendarPosition.x,
      calendarPosition.y,
      params.rectangleSize,
      params.rectangleSize
    );
  } else {
    drawMonths(
      now,
      calendarPosition.x,
      calendarPosition.y,
      params.rectangleSize,
      params.rectangleSize
    );
  }
}

function drawBackgroundRectangle({ x, y }) {
  fill(params.backgroundColor.r, params.backgroundColor.g, params.backgroundColor.b);
  rect(x, y, params.rectangleSize, params.rectangleSize);
}

function drawLogo() {
  const logoWidth = logo.width / LOGO_CONFIG.scaleFactor;
  const logoHeight = logo.height / LOGO_CONFIG.scaleFactor;
  const logoX = width / 2 - logoWidth / 2;
  const logoY = height - LOGO_CONFIG.yOffset;  // Using new offset
  
  image(logo, logoX, logoY, logoWidth, logoHeight);
}

function drawMonths(date, x, y, w, h) {
  const monthWidth = w / 12;
  const currentMonth = date.getMonth();
  const currentDay = date.getDate();

  setStrokeStyle();
  
  // Draw base rectangles
  drawMonthRectangles(x, y, monthWidth, h);
  
  push();
  // Draw filled months
  drawFilledMonths(date, x, y, monthWidth, h, currentMonth);
  
  // Draw current month progress
  drawCurrentMonthProgress(date, x, y, w, h, currentMonth, monthWidth);
  
  // Draw divisions
  drawMonthDivisions(date, x, y, monthWidth, h);
  
  // Draw date label
  drawDateLabel(currentDay, currentMonth, x + (monthWidth * currentMonth), y, monthWidth);
  pop();
}

function setStrokeStyle() {
  strokeWeight(params.borderWeight);
  stroke(params.borderColor.r, params.borderColor.g, params.borderColor.b);
}

function drawMonthRectangles(x, y, monthWidth, h) {
  for (let i = 0; i < 12; i++) {
    noFill();
    rect(x + (monthWidth * i), y, monthWidth, h);
  }
}

function drawFilledMonths(date, x, y, monthWidth, h, currentMonth) {
  fill(params.fillColor.r, params.fillColor.g, params.fillColor.b);
  for (let i = 0; i < currentMonth; i++) {
    rect(x + (monthWidth * i), y, monthWidth, h);
  }
}

function drawCurrentMonthProgress(date, x, y, w, h, currentMonth, monthWidth) {
  const numberOfDaysInMonth = getDaysInThisMonth(date);
  const currentDay = date.getDate();
  const currentMonthHeight = map(currentDay, 0, numberOfDaysInMonth, 0, h);
  const currentMonthX = x + (monthWidth * currentMonth);
  
  fill(params.fillColor.r, params.fillColor.g, params.fillColor.b);
  rect(currentMonthX, y + h - currentMonthHeight, monthWidth, currentMonthHeight);
}

function drawMonthDivisions(date, x, y, monthWidth, h) {
  for (let i = 0; i < 12; i++) {
    const monthX = x + (monthWidth * i);
    if (params.showWeeks) drawWeekDivisions(date, i, monthX, y, monthWidth, h);
    if (params.showDays) drawDayDivisions(date, i, monthX, y, monthWidth, h);
  }
}

function drawWeekDivisions(date, monthIndex, monthX, y, monthWidth, h) {
  strokeWeight(params.showDays ? params.borderWeight + 1 : params.borderWeight);
  const monthDate = new Date(date.getFullYear(), monthIndex, 1);
  const daysInMonth = getDaysInThisMonth(monthDate);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const checkDate = new Date(date.getFullYear(), monthIndex, day);
    if (checkDate.getDay() === 0 && day !== 1) {
      const weekY = y + (h * (day / daysInMonth));
      line(monthX, weekY, monthX + monthWidth, weekY);
    }
  }
}

function drawDayDivisions(date, monthIndex, monthX, y, monthWidth, h) {
  const daysInMonth = getDaysInThisMonth(new Date(date.getFullYear(), monthIndex, 1));
  strokeWeight(params.borderWeight);
  
  for (let day = 1; day < daysInMonth; day++) {
    const dayY = y + (h / daysInMonth) * day;
    line(monthX, dayY, monthX + monthWidth, dayY);
  }
}

function drawDateLabel(currentDay, currentMonth, x, y, monthWidth) {
  push(); 
  strokeWeight(1);
  textAlign(CENTER);
  textSize(DATE_LABEL_CONFIG.fontSize);
  fill(params.fillColor.r, params.fillColor.g, params.fillColor.b);
  text(`${currentDay}.${currentMonth + 1}`, x + monthWidth/2, y - DATE_LABEL_CONFIG.yOffset);
  pop();
}

function getDaysInThisMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function parseBirthDate(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str).trim());
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const d = parseInt(m[3], 10);
  const dt = new Date(y, mo, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) {
    return null;
  }
  return dt;
}

function addCalendarYears(date, years) {
  const out = new Date(date.getTime());
  out.setFullYear(out.getFullYear() + years);
  return out;
}

function getLifeSpanBounds(birth, expectancyYears) {
  const death = addCalendarYears(birth, expectancyYears);
  return { birth, death, spanMs: Math.max(1, death.getTime() - birth.getTime()) };
}

function getElapsedLifeFraction(now, birth, spanMs) {
  const elapsed = now.getTime() - birth.getTime();
  return Math.min(1, Math.max(0, elapsed / spanMs));
}

function addCalendarMonths(date, months) {
  const out = new Date(date.getTime());
  out.setMonth(out.getMonth() + months);
  return out;
}

function drawLifeVisualization(now, x, y, w, h) {
  const birth = parseBirthDate(params.birthDate);
  if (!birth) {
    push();
    noStroke();
    fill(180, 60, 60);
    textAlign(CENTER, CENTER);
    textSize(14);
    text('Invalid birth date (use YYYY-MM-DD)', x + w / 2, y + h / 2);
    pop();
    return;
  }

  const { death, spanMs } = getLifeSpanBounds(birth, params.lifeExpectancyYears);
  const frac = getElapsedLifeFraction(now, birth, spanMs);
  const twelfthWidth = w / 12;

  setStrokeStyle();

  drawMonthRectangles(x, y, twelfthWidth, h);

  push();
  drawFilledLifeTwelfths(x, y, twelfthWidth, h, frac);
  drawLifeTwelfthDivisions(now, birth, death, x, y, twelfthWidth, h);
  drawLifeLabel(frac, x + w / 2, y - DATE_LABEL_CONFIG.yOffset);
  pop();
}

function drawFilledLifeTwelfths(x, y, twelfthWidth, h, frac) {
  const twelfths = frac * 12;
  const fullCols = Math.min(12, Math.floor(twelfths));
  const partial = twelfths - fullCols;

  fill(params.fillColor.r, params.fillColor.g, params.fillColor.b);
  for (let i = 0; i < fullCols; i++) {
    rect(x + twelfthWidth * i, y, twelfthWidth, h);
  }
  if (fullCols < 12 && partial > 0) {
    const colX = x + twelfthWidth * fullCols;
    const colH = h * partial;
    rect(colX, y + h - colH, twelfthWidth, colH);
  }
}

function drawLifeTwelfthDivisions(now, birth, death, x, y, twelfthWidth, h) {
  for (let i = 0; i < 12; i++) {
    const segStart = new Date(
      birth.getTime() + (i / 12) * (death.getTime() - birth.getTime())
    );
    const segEnd = new Date(
      birth.getTime() + ((i + 1) / 12) * (death.getTime() - birth.getTime())
    );
    const colX = x + twelfthWidth * i;
    if (params.showLifeMonths) {
      strokeWeight(params.borderWeight);
      drawLifeMonthBoundaries(segStart, segEnd, colX, y, twelfthWidth, h);
    }
    if (params.showLifeYears) {
      strokeWeight(
        params.showLifeMonths ? params.borderWeight + 1 : params.borderWeight
      );
      drawLifeYearBoundaries(segStart, segEnd, colX, y, twelfthWidth, h);
    }
  }
}

function drawLifeMonthBoundaries(segStart, segEnd, monthX, y, monthWidth, h) {
  const span = segEnd.getTime() - segStart.getTime();
  if (span <= 0) return;

  let boundary = new Date(segStart.getFullYear(), segStart.getMonth(), 1);
  if (boundary.getTime() <= segStart.getTime()) {
    boundary = addCalendarMonths(boundary, 1);
  }
  while (boundary < segEnd) {
    if (boundary > segStart) {
      const t = (boundary.getTime() - segStart.getTime()) / span;
      const lineY = y + h * t;
      line(monthX, lineY, monthX + monthWidth, lineY);
    }
    boundary = addCalendarMonths(boundary, 1);
  }
}

function drawLifeYearBoundaries(segStart, segEnd, monthX, y, monthWidth, h) {
  const span = segEnd.getTime() - segStart.getTime();
  if (span <= 0) return;

  let boundary = new Date(segStart.getFullYear(), 0, 1);
  if (boundary.getTime() <= segStart.getTime()) {
    boundary = new Date(segStart.getFullYear() + 1, 0, 1);
  }
  while (boundary < segEnd) {
    if (boundary > segStart) {
      const t = (boundary.getTime() - segStart.getTime()) / span;
      const lineY = y + h * t;
      line(monthX, lineY, monthX + monthWidth, lineY);
    }
    boundary = new Date(boundary.getFullYear() + 1, 0, 1);
  }
}

function drawLifeLabel(frac, cx, labelY) {
  push();
  strokeWeight(1);
  textAlign(CENTER);
  textSize(DATE_LABEL_CONFIG.fontSize);
  fill(params.fillColor.r, params.fillColor.g, params.fillColor.b);

  const totalY = params.lifeExpectancyYears;
  const livedYears = frac * totalY;
  const leftYears = totalY - livedYears;
  const pct = Math.round(frac * 100);

  const livedStr =
    livedYears >= 10 ? livedYears.toFixed(1) : livedYears.toFixed(2);
  const leftStr =
    Math.abs(leftYears) >= 10 ? leftYears.toFixed(1) : leftYears.toFixed(2);

  text(`${pct}% lived · ${livedStr} / ${totalY} yr · ${leftStr} yr left`, cx, labelY);
  pop();
}

function setupGui() {
  const pane = new Tweakpane.Pane();

  const generalFolder = pane.addFolder({ title: "General" });
  generalFolder.addInput(params, "rectangleSize", { min: 100, max: 1000, step: 1 });

  const viewTab = pane.addTab({
    pages: [{ title: "Year" }, { title: "Your life" }]
  });

  viewTab.pages[0].addInput(params, "showWeeks", { label: "Show weeks" });
  viewTab.pages[0].addInput(params, "showDays", { label: "Show days" });

  viewTab.pages[1].addInput(params, "birthDate", { label: "Birth (YYYY-MM-DD)" });
  viewTab.pages[1].addInput(params, "lifeExpectancyYears", {
    label: "Lifetime (years)",
    min: 1,
    max: 120,
    step: 1
  });
  viewTab.pages[1].addInput(params, "showLifeMonths", { label: "Show months" });
  viewTab.pages[1].addInput(params, "showLifeYears", { label: "Show years" });

  viewTab.on("select", (ev) => {
    params.viewMode =
      ev.index === 0 ? VIEW_MODES.YEAR : VIEW_MODES.LIFE;
  });

  const lifePageIndex = params.viewMode === VIEW_MODES.LIFE ? 1 : 0;
  viewTab.pages[lifePageIndex].selected = true;

  const colorsFolder = pane.addFolder({ title: "Colors" });
  colorsFolder.addInput(params, "backgroundColor", { label: 'Background Color' });
  colorsFolder.addInput(params, "fillColor", { label: 'Fill Color' });
  colorsFolder.addInput(params, "borderColor", { label: 'Border Color' });
}

// Add these new functions
function createPresetButtons() {
  const n = 4;
  const totalWidth =
    BUTTON_CONFIG.diameter * n + BUTTON_CONFIG.gap * (n - 1);
  const startX = width / 2 - totalWidth / 2;
  // Calculate y position relative to calendar bottom
  const y = height / 2 + params.rectangleSize / 2 + BUTTON_CONFIG.yOffset;

  presetButtons = [
    {
      x: startX,
      y,
      preset: 'monochrome',
      color: COLOR_PRESETS.monochrome.fillColor
    },
    {
      x: startX + BUTTON_CONFIG.diameter + BUTTON_CONFIG.gap,
      y,
      preset: 'blue',
      color: COLOR_PRESETS.blue.fillColor
    },
    {
      x: startX + (BUTTON_CONFIG.diameter + BUTTON_CONFIG.gap) * 2,
      y,
      preset: 'green',
      color: COLOR_PRESETS.green.fillColor
    },
    {
      x: startX + (BUTTON_CONFIG.diameter + BUTTON_CONFIG.gap) * 3,
      y,
      preset: 'alexcodesart',
      color: COLOR_PRESETS.alexcodesart.fillColor
    }
  ];
}

function drawButtons() {
  presetButtons.forEach(button => {
    push();
    // Outer circle (border)
    noFill();
    stroke(100);
    strokeWeight(1);
    circle(button.x + BUTTON_CONFIG.diameter/2, 
           button.y + BUTTON_CONFIG.diameter/2, 
           BUTTON_CONFIG.diameter);
    
    // Inner filled circle
    noStroke();
    fill(button.color.r, button.color.g, button.color.b);
    circle(button.x + BUTTON_CONFIG.diameter/2, 
           button.y + BUTTON_CONFIG.diameter/2, 
           BUTTON_CONFIG.diameter - 4);
    pop();
  });
}

function mousePressed() {
  if (!urlParams.showUI) return;
  
  presetButtons.forEach(button => {
    const centerX = button.x + BUTTON_CONFIG.diameter/2;
    const centerY = button.y + BUTTON_CONFIG.diameter/2;
    const distance = dist(mouseX, mouseY, centerX, centerY);
    
    if (distance < BUTTON_CONFIG.diameter/2) {
      applyPreset(button.preset);
    }
  });
}

function applyPreset(presetName) {
  const preset = COLOR_PRESETS[presetName];
  params.backgroundColor = { ...preset.backgroundColor };
  params.fillColor = { ...preset.fillColor };
  params.borderColor = { ...preset.borderColor };
}
