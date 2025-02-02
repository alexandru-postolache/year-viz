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
    backgroundColor: { r: 240, g: 240, b: 240 },
    fillColor: { r: 40, g: 40, b: 40 },
    borderColor: { r: 80, g: 80, b: 80 }
  },
  blue: {
    backgroundColor: { r: 235, g: 245, b: 255 },
    fillColor: { r: 41, g: 98, b: 255 },
    borderColor: { r: 0, g: 71, b: 171 }
  },
  green: {
    backgroundColor: { r: 236, g: 255, b: 244 },
    fillColor: { r: 34, g: 161, b: 98 },
    borderColor: { r: 21, g: 115, b: 71 }
  }
};

// Default parameters
const DEFAULT_PARAMS = {
  rectangleSize: 400,
  fillColor: { r: 0, g: 0, b: 0 },
  borderColor: { r: 0, g: 0, b: 0 },
  borderWeight: 1,
  backgroundColor: { r: 255, g: 255, b: 255 },
  showWeeks: true,
  showDays: false
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
  const params = new URLSearchParams(window.location.search);
  const colorParam = params.get('color')?.toLowerCase() || 'black';
  
  return {
    color: ['black', 'blue', 'green'].includes(colorParam) ? colorParam : 'black',
    showUI: params.get('showUI') !== 'false',
    showWeeks: params.get('showWeeks') !== null ? params.get('showWeeks') === 'true' : DEFAULT_PARAMS.showWeeks,
    showDays: params.get('showDays') !== null ? params.get('showDays') === 'true' : DEFAULT_PARAMS.showDays
  };
}

// Map color param names to preset names
const COLOR_PARAM_TO_PRESET = {
  'black': 'monochrome',
  'blue': 'blue',
  'green': 'green'
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
  
  // Draw calendar
  drawMonths(new Date(), calendarPosition.x, calendarPosition.y, 
             params.rectangleSize, params.rectangleSize);
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

function setupGui() {
  const pane = new Tweakpane.Pane();
  
  const generalFolder = pane.addFolder({ title: "General" });
  generalFolder.addInput(params, "rectangleSize", { min: 100, max: 1000, step: 1 });
  generalFolder.addInput(params, "showWeeks", { label: 'Show Weeks' });
  generalFolder.addInput(params, "showDays", { label: 'Show Days' });
  
  const colorsFolder = pane.addFolder({ title: "Colors" });
  colorsFolder.addInput(params, "backgroundColor", { label: 'Background Color' });
  colorsFolder.addInput(params, "fillColor", { label: 'Fill Color' });
  colorsFolder.addInput(params, "borderColor", { label: 'Border Color' });
}

// Add these new functions
function createPresetButtons() {
  const totalWidth = (BUTTON_CONFIG.diameter * 3) + (BUTTON_CONFIG.gap * 2);
  const startX = width/2 - totalWidth/2;
  // Calculate y position relative to calendar bottom
  const y = (height/2 + params.rectangleSize/2) + BUTTON_CONFIG.yOffset;

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
