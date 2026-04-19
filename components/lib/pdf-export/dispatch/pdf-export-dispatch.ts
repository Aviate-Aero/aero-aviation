// pdf-export-dispatch.ts
"use client"

// Define JsPDFDocument interface
export interface JsPDFDocument {
  internal: {
    pageSize: {
      getWidth(): number;
      getHeight(): number;
    };
  };
  setFillColor(...args: number[]): void;
  setDrawColor(...args: number[]): void;
  setTextColor(...args: number[]): void;
  setFontSize(size: number): void;
  setFont(family: string, style?: string): void;
  text(text: string | string[], x: number, y: number, options?: { align?: string }): void;
  rect(x: number, y: number, w: number, h: number, style?: string): void;
  roundedRect(x: number, y: number, w: number, h: number, rx: number, ry: number, style?: string): void;
  addPage(): void;
  save(filename: string): void;
  getTextWidth(text: string): number;
  setLineWidth(width: number): void;
}

// Add RiskAssessmentData interface
export interface RiskAssessmentData {
  checklist: {
    weatherWithinLimits: boolean;
    crewWithinDutyTime: boolean;
    aircraftServiceable: boolean;
    documentationAvailable: boolean;
    riskMitigationInPlace: boolean;
  };
  riskNotes: string;
  assessedAt: string;
}

export interface CategoryColors {
  fill: [number, number, number];
  text: [number, number, number];
  border: [number, number, number];
}

export interface PeriodColor {
  fill: [number, number, number];
}

export interface ParsedMetar {
  station: string;
  time: string;
  wind: string;
  visibility: string;
  clouds: string;
  ceiling: string;
  temperature: string;
  pressure: string;
  category: string;
}

export interface TafPeriod {
  type: string;
  time: string;
  raw: string;
  wind: { text: string | null };
  visibility: { text: string | null } | null;
  clouds: { ceiling: number | null; text: string };
  weather: string | null;
  category: string;
}

export interface TafAnalysis {
  station: string;
  issue: string;
  valid: string;
  periods: TafPeriod[];
}

export interface PirepData {
  raw: string;
  station?: string;
  type?: string;
  time?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  flight_level?: number;
  aircraft?: string;
  turbulence?: {
    severity?: string;
    frequency?: string;
    min_alt?: number;
    max_alt?: number;
  } | null;
  icing?: {
    severity?: string;
    type?: string;
    min_alt?: number;
    max_alt?: number;
  } | null;
  wx_string?: string;
  temp?: number;
  wind?: {
    direction?: number;
    speed?: number;
    gust?: number;
  } | null;
  remarks?: string;
}

export interface FuelCalculationData {
  policy: string;
  tripKg: number;
  taxiKg: number;
  holdFlow: number;
  cruiseFlow: number;
  gsKt: number;
  contPct: number;
  finalMin: number;
  altPlan: string;
  altFuel: number;
  breakdown: {
    taxi: number;
    trip: number;
    contingency: number;
    alternate: number;
    final: number;
    total: number;
  };
  policyDetails: {
    contPct: number;
    finalMin: number;
  };
}

export interface OperationalNotes {
  notesDep: string;
  notesArr: string;
}

export interface CollaborationAuditData {
  deepLink: string;
  auditReport: string;
  generatedAt: string;
}

export interface AirportInfo {
  icao: string;
  iata?: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation_ft: number;
  elevation_m: number;
  timezone: string;
  type: string;
}

export interface Runway {
  ident1: string;
  ident2: string;
  length_ft: number;
  width_ft: number;
  surface: string | null;
  bearing1: number;
  bearing2: number;
}

export interface Communication {
  type: string;
  frequency: number;
}

export interface AirportData {
  info: AirportInfo;
  runways: Runway[];
  communications: Communication[];
  services?: {
    fuel?: string[];
    amenities?: string[];
  };
}

// ===== DESIGN SYSTEM =====
const COLORS = {
  primary: {
    blue: [15, 82, 186] as [number, number, number],
    dark: [15, 23, 42] as [number, number, number],
    light: [248, 250, 252] as [number, number, number],
    white: [255, 255, 255] as [number, number, number]
  },
  semantic: {
    success: [22, 163, 74] as [number, number, number],
    warning: [245, 158, 11] as [number, number, number],
    error: [220, 38, 38] as [number, number, number],
    info: [59, 130, 246] as [number, number, number]
  },
  flightCategories: {
    VFR: { 
      fill: [236, 253, 245] as [number, number, number], 
      text: [6, 95, 70] as [number, number, number], 
      border: [167, 243, 208] as [number, number, number] 
    },
    MVFR: { 
      fill: [239, 246, 255] as [number, number, number], 
      text: [29, 78, 216] as [number, number, number], 
      border: [191, 219, 254] as [number, number, number] 
    },
    IFR: { 
      fill: [254, 252, 232] as [number, number, number], 
      text: [161, 98, 7] as [number, number, number], 
      border: [253, 230, 138] as [number, number, number] 
    },
    LIFR: { 
      fill: [255, 241, 242] as [number, number, number], 
      text: [190, 18, 60] as [number, number, number], 
      border: [253, 164, 175] as [number, number, number] 
    }
  },
  sectionHeaders: {
    metar: [59, 130, 246] as [number, number, number],
    taf: [168, 85, 247] as [number, number, number],
    fuel: [194, 65, 12] as [number, number, number],
    pirep: [139, 69, 19] as [number, number, number],
    notes: [59, 130, 246] as [number, number, number],
    collaboration: [101, 163, 13] as [number, number, number],
    risk: [147, 51, 234] as [number, number, number],
    airport: [100, 116, 139] as [number, number, number]
  },
  gradients: {
    header: [[15, 23, 42], [30, 41, 59]] as [[number, number, number], [number, number, number]],
    flightInfo: [[239, 246, 255], [255, 255, 255]] as [[number, number, number], [number, number, number]]
  }
};

const TYPOGRAPHY = {
  h1: { size: 20, weight: 'bold' },
  h2: { size: 16, weight: 'bold' },
  h3: { size: 14, weight: 'bold' },
  h4: { size: 12, weight: 'bold' },
  body: { size: 10, weight: 'normal' },
  small: { size: 8, weight: 'normal' },
  code: { size: 9, weight: 'bold' },
  micro: { size: 7, weight: 'normal' }
};

const SPACING = {
  margin: 15,
  padding: 8,
  sectionGap: 20,
  elementGap: 10,
  rowHeight: 7,
  compactRow: 6
};

// ===== IMPROVED HELPER FUNCTIONS =====
function safeToString(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return value.toString();
  if (typeof value === 'object') {
    try {
      const obj = value as Record<string, unknown>;
      if (obj.severity || obj.frequency || obj.min_alt || obj.max_alt) {
        const parts = [];
        if (obj.severity) parts.push(String(obj.severity));
        if (obj.frequency) parts.push(String(obj.frequency));
        if (obj.min_alt !== undefined && obj.max_alt !== undefined) {
          parts.push(`${obj.min_alt}-${obj.max_alt}ft`);
        } else if (obj.min_alt !== undefined) parts.push(`above ${obj.min_alt}ft`);
        else if (obj.max_alt !== undefined) parts.push(`below ${obj.max_alt}ft`);
        return parts.join(' ');
      }
      if (obj.direction !== undefined || obj.speed !== undefined) {
        const parts = [];
        if (obj.direction !== undefined) parts.push(`${obj.direction}°`);
        if (obj.speed !== undefined) parts.push(`${obj.speed}kt`);
        if (obj.gust !== undefined) parts.push(`G${obj.gust}`);
        return parts.join('/');
      }
      const jsonStr = JSON.stringify(value);
      return jsonStr.length > 100 ? jsonStr.substring(0, 100) + '...' : jsonStr;
    } catch {
      return '[Object]';
    }
  }
  return String(value);
}

function validatePirepData(pirepData: unknown): pirepData is PirepData {
  if (!pirepData) return false;
  if (typeof pirepData !== 'object') return false;
  const data = pirepData as Record<string, unknown>;
  if (!data.raw || typeof data.raw !== 'string') {
    console.warn('PIREP data missing raw field or invalid type:', data.raw);
    return false;
  }
  return true;
}

export function transformPirepData(apiResponse: unknown, originalRaw: string): PirepData {
  console.log('Transforming PIREP API response:', apiResponse);
  
  if (apiResponse && typeof apiResponse === 'object') {
    const response = apiResponse as Record<string, unknown>;
    if (typeof response.raw === 'string') {
      return apiResponse as PirepData;
    }
  }
  
  console.warn('Transforming API response to PirepData structure. Original API response:', apiResponse);
  
  const apiResponseObj = apiResponse as Record<string, unknown>;
  const transformed: PirepData = {
    raw: originalRaw,
    station: apiResponseObj.station as string | undefined,
    type: apiResponseObj.type as string | undefined,
    time: apiResponseObj.time as string | undefined,
    latitude: apiResponseObj.latitude as number | undefined,
    longitude: apiResponseObj.longitude as number | undefined,
    altitude: apiResponseObj.altitude as number | undefined,
    flight_level: apiResponseObj.flight_level as number | undefined,
    aircraft: apiResponseObj.aircraft as string | undefined,
    wx_string: apiResponseObj.wx_string as string | undefined,
    temp: apiResponseObj.temp as number | undefined,
    remarks: apiResponseObj.remarks as string | undefined,
  };

  if (apiResponseObj.turbulence && typeof apiResponseObj.turbulence === 'object') {
    const turbulence = apiResponseObj.turbulence as Record<string, unknown>;
    transformed.turbulence = {
      severity: turbulence.severity as string | undefined,
      frequency: turbulence.frequency as string | undefined,
      min_alt: turbulence.min_alt as number | undefined,
      max_alt: turbulence.max_alt as number | undefined,
    };
  } else {
    transformed.turbulence = null;
  }

  if (apiResponseObj.icing && typeof apiResponseObj.icing === 'object') {
    const icing = apiResponseObj.icing as Record<string, unknown>;
    transformed.icing = {
      severity: icing.severity as string | undefined,
      type: icing.type as string | undefined,
      min_alt: icing.min_alt as number | undefined,
      max_alt: icing.max_alt as number | undefined,
    };
  } else {
    transformed.icing = null;
  }

  if (apiResponseObj.wind && typeof apiResponseObj.wind === 'object') {
    const wind = apiResponseObj.wind as Record<string, unknown>;
    transformed.wind = {
      direction: wind.direction as number | undefined,
      speed: wind.speed as number | undefined,
      gust: wind.gust as number | undefined,
    };
  } else {
    transformed.wind = null;
  }

  console.log('Transformed PIREP data:', transformed);
  return transformed;
}

// IMPROVED: Better text splitting for long meteorological strings
function splitTextToSize(doc: JsPDFDocument, text: unknown, maxWidth: number): string[] {
  try {
    const lines: string[] = [];
    let currentLine = '';
    const textStr = safeToString(text);
    
    if (!textStr || textStr === '—') return ['—'];
    
    // Special handling for METAR/TAF strings - preserve word boundaries but be more aggressive with splitting
    const words = textStr.split(' ');
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = doc.getTextWidth(testLine);
      
      if (testWidth > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // If a single word is too long, break it into chunks
          let remainingWord = word;
          while (remainingWord.length > 0) {
            let chunk = remainingWord;
            let chunkWidth = doc.getTextWidth(chunk);
            
            // Find the maximum chunk that fits
            while (chunkWidth > maxWidth && chunk.length > 1) {
              chunk = chunk.slice(0, -1);
              chunkWidth = doc.getTextWidth(chunk);
            }
            
            if (chunk.length > 0) {
              lines.push(chunk);
              remainingWord = remainingWord.slice(chunk.length);
            } else {
              // Emergency fallback - break by character
              lines.push(remainingWord.slice(0, 1));
              remainingWord = remainingWord.slice(1);
            }
          }
          currentLine = '';
        }
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines.length > 0 ? lines : ['—'];
  } catch (error) {
    console.error('Error in splitTextToSize:', error);
    return ['Error formatting text'];
  }
}

// ===== STYLING COMPONENTS =====
function applySectionHeader(
  doc: JsPDFDocument, 
  title: string, 
  color: [number, number, number], 
  margin: number, 
  yPosition: number, 
  pageWidth: number
): number {
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 3, 3, 'F');
  
  doc.setFontSize(TYPOGRAPHY.h4.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(title, margin + 8, yPosition + 6.5);
  
  return yPosition + 15;
}

function createStyledTable(
  doc: JsPDFDocument, 
  rows: Array<{label: string, value: unknown}>,
  margin: number, 
  pageWidth: number, 
  startY: number,
  pageHeight: number
): number {
  let yPosition = startY;
  const rowHeight = SPACING.rowHeight;
  const col1Width = 40;
  const col2Width = pageWidth - 2 * margin - col1Width;

  // Check if we need a new page for table header
  if (yPosition + rowHeight > pageHeight - 20) {
    doc.addPage();
    yPosition = SPACING.margin;
  }

  // Table header
  doc.setFillColor(COLORS.primary.dark[0], COLORS.primary.dark[1], COLORS.primary.dark[2]);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 2, 2, 'F');
  
  doc.setFontSize(TYPOGRAPHY.small.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('PARAMETER', margin + 8, yPosition + 4.5);
  doc.text('VALUE', margin + col1Width + 8, yPosition + 4.5);
  
  yPosition += rowHeight;

  let isEven = false;
  
  rows.forEach((row) => {
    // Check if we need a new page for this row
    if (yPosition + rowHeight > pageHeight - 20) {
      doc.addPage();
      yPosition = SPACING.margin;
      // Re-add header on new page
      doc.setFillColor(COLORS.primary.dark[0], COLORS.primary.dark[1], COLORS.primary.dark[2]);
      doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 2, 2, 'F');
      doc.setFontSize(TYPOGRAPHY.small.size);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('PARAMETER', margin + 8, yPosition + 4.5);
      doc.text('VALUE', margin + col1Width + 8, yPosition + 4.5);
      yPosition += rowHeight;
    }

    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 'F');
    }
    
    doc.setFontSize(TYPOGRAPHY.small.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(row.label, margin + 8, yPosition + 4.5);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    
    const valueLines = splitTextToSize(doc, row.value, col2Width - 16);
    if (valueLines.length === 1) {
      doc.text(valueLines[0], margin + col1Width + 8, yPosition + 4.5);
    } else {
      valueLines.forEach((line, lineIndex) => {
        doc.text(line, margin + col1Width + 8, yPosition + 4.5 + (lineIndex * 4));
      });
      yPosition += (valueLines.length - 1) * 4;
    }
    
    yPosition += rowHeight;
    isEven = !isEven;
  });

  return yPosition + 10;
}

function addStatusBadge(
  doc: JsPDFDocument, 
  text: string, 
  color: CategoryColors, 
  margin: number, 
  yPosition: number
): number {
  const textWidth = doc.getTextWidth(text) + 16;
  doc.setFillColor(color.fill[0], color.fill[1], color.fill[2]);
  doc.setDrawColor(color.border[0], color.border[1], color.border[2]);
  doc.roundedRect(margin, yPosition, textWidth, 8, 4, 4, 'FD');
  
  doc.setFontSize(TYPOGRAPHY.small.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(color.text[0], color.text[1], color.text[2]);
  doc.text(text, margin + (textWidth / 2), yPosition + 4.8, { align: 'center' });
  
  return yPosition + 12;
}

function addNoDataMessage(doc: JsPDFDocument, margin: number, yPosition: number, message: string): number {
  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(margin, yPosition, 170, 12, 4, 4, 'FD');
  
  doc.setFontSize(TYPOGRAPHY.small.size);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(161, 98, 7);
  doc.text(message, margin + 8, yPosition + 7.5);
  
  return yPosition + 20;
}

// ===== METAR/TAF PARSING FUNCTIONS =====
function parseMetarForPDF(metar: string): ParsedMetar {
  const station = metar.trim().split(/\s+/)[0];
  
  const timeMatch = metar.match(/\b(\d{6})Z\b/);
  let time = '—';
  if (timeMatch) {
    const t = timeMatch[1];
    time = `Day ${t.slice(0, 2)} at ${t.slice(2, 4)}:${t.slice(4, 6)}Z`;
  }

  const windMatch = metar.match(/\b(\d{3}|VRB)(\d{2,3})(G(\d{2,3}))?KT\b/);
  let wind = '—';
  if (windMatch) {
    const dir = windMatch[1] === 'VRB' ? 'Variable' : `${windMatch[1]}°`;
    const spd = windMatch[2];
    const gust = windMatch[4] ? `, Gust ${windMatch[4]} kt` : '';
    wind = `${dir} / ${spd} kt${gust}`;
  }

  let visibility = '—';
  const visSmMatch = metar.match(/\b((\d+\s)?\d\/\d|\d+)\s?SM\b/);
  const visMeterMatch = metar.match(/\b(\d{4})\b/);
  if (visSmMatch) {
    visibility = `${visSmMatch[1].replace(/\s/g, '')} statute miles`;
  } else if (visMeterMatch) {
    const meters = Number(visMeterMatch[1]);
    visibility = meters === 9999 ? '10 km or more' : `${meters} meters`;
  } else if (metar.includes('CAVOK')) {
    visibility = '10 km or more (CAVOK)';
  }

  const cloudsMatch = [...metar.matchAll(/\b(FEW|SCT|BKN|OVC|VV)(\d{3})(CB|TCU)?\b/g)];
  let clouds = 'Clear';
  let ceiling = '—';
  if (cloudsMatch.length > 0) {
    const cloudLayers = cloudsMatch.map(match => {
      const type = match[1];
      const height = Number(match[2]) * 100;
      const typeText = 
        type === 'FEW' ? 'Few' :
        type === 'SCT' ? 'Scattered' :
        type === 'BKN' ? 'Broken' :
        type === 'OVC' ? 'Overcast' :
        type === 'VV' ? 'Vertical Visibility' : type;
      return { type, height, text: `${typeText} at ${height} ft` };
    });
    
    clouds = cloudLayers.map(layer => layer.text).join(', ');
    const ceilingLayer = cloudLayers.find(layer => ['BKN', 'OVC', 'VV'].includes(layer.type));
    ceiling = ceilingLayer ? `${ceilingLayer.height} ft` : '—';
  }

  const tempMatch = metar.match(/\b(M?\d{2})\/(M?\d{2})\b/);
  let temperature = '—';
  if (tempMatch) {
    const temp = tempMatch[1].replace('M', '-');
    const dewpoint = tempMatch[2].replace('M', '-');
    temperature = `${temp}°C / ${dewpoint}°C`;
  }

  const pressureMatch = metar.match(/\bA(\d{4})\b/) || metar.match(/\bQ(\d{4})\b/);
  let pressure = '—';
  if (pressureMatch) {
    if (pressureMatch[0].startsWith('A')) {
      pressure = `${(Number(pressureMatch[1]) / 100).toFixed(2)} inHg`;
    } else {
      pressure = `${pressureMatch[1]} hPa`;
    }
  }

  const category = calculateFlightCategory(visibility, ceiling);

  return {
    station,
    time,
    wind,
    visibility,
    clouds,
    ceiling,
    temperature,
    pressure,
    category
  };
}

function parseTafForPDF(taf: string): TafAnalysis {
  const station = taf.trim().split(/\s+/)[0];
  
  const timeMatch = taf.match(/\b(\d{6})Z\b/);
  const validityMatch = taf.match(/\b(\d{4})\/(\d{4})\b/);
  
  let issue = '—';
  let valid = '—';
  
  if (timeMatch) {
    const t = timeMatch[1];
    issue = `Day ${t.slice(0, 2)} at ${t.slice(2, 4)}:${t.slice(4, 6)}Z`;
  }
  
  if (validityMatch) {
    const from = validityMatch[1];
    const to = validityMatch[2];
    valid = `${from.slice(0, 2)}:${from.slice(2, 4)}Z to ${to.slice(0, 2)}:${to.slice(2, 4)}Z`;
  }

  const periods = parseTafPeriods(taf);

  return {
    station,
    issue,
    valid,
    periods
  };
}

function parseTafPeriods(taf: string): TafPeriod[] {
  const periods: TafPeriod[] = [];
  const lines = taf.split(/\s+(?=FM|TEMPO|BECMG)/);
  
  let currentPeriod: Partial<TafPeriod> = {};

  lines.forEach((line) => {
    const fmMatch = line.match(/FM(\d{4})/);
    const tempoMatch = line.match(/TEMPO/);
    const becmgMatch = line.match(/BECMG/);

    if (fmMatch) {
      if (Object.keys(currentPeriod).length > 0) {
        periods.push(currentPeriod as TafPeriod);
      }
      currentPeriod = {
        type: 'FM',
        time: `${fmMatch[1].slice(0, 2)}:${fmMatch[1].slice(2, 4)}Z`,
        raw: line
      };
    } else if (tempoMatch) {
      if (Object.keys(currentPeriod).length > 0) {
        periods.push(currentPeriod as TafPeriod);
      }
      currentPeriod = {
        type: 'TEMPO',
        time: 'Temporary',
        raw: line
      };
    } else if (becmgMatch) {
      if (Object.keys(currentPeriod).length > 0) {
        periods.push(currentPeriod as TafPeriod);
      }
      currentPeriod = {
        type: 'BECMG',
        time: 'Becoming',
        raw: line
      };
    } else {
      currentPeriod.raw = (currentPeriod.raw || '') + ' ' + line;
    }

    if (currentPeriod.raw) {
      currentPeriod.wind = parseTafWind(currentPeriod.raw);
      currentPeriod.visibility = parseTafVisibility(currentPeriod.raw);
      currentPeriod.clouds = parseTafClouds(currentPeriod.raw);
      currentPeriod.weather = parseTafWeather(currentPeriod.raw);
      
      const visText = currentPeriod.visibility?.text || null;
      const ceilingValue = currentPeriod.clouds?.ceiling || null;
      currentPeriod.category = calculateFlightCategory(visText, ceilingValue);
    }
  });

  if (Object.keys(currentPeriod).length > 0) {
    periods.push(currentPeriod as TafPeriod);
  }

  return periods;
}

function parseTafWind(period: string): { text: string | null } {
  const m = period.match(/\b(\d{3}|VRB)(\d{2,3})(G(\d{2,3}))?KT\b/);
  if (!m) return { text: null };
  const dir = m[1] === 'VRB' ? null : Number(m[1]);
  const spd = Number(m[2]);
  const gust = m[4] ? Number(m[4]) : null;
  const base = dir == null ? `VRB ${spd} kt` : `${String(dir).padStart(3, '0')}° / ${spd} kt`;
  return { text: gust ? `${base} (gust ${gust} kt)` : base };
}

function parseTafVisibility(period: string): { text: string | null } {
  const us = period.match(/\b((\d+\s)?\d\/\d|\d+)\s?SM\b/);
  if (us) return { text: `${us[1].replace(/\s/g, '')} statute miles` };
  const intl = period.match(/\b(\d{4})\b/);
  if (intl) {
    const meters = Number(intl[1]);
    if (!Number.isNaN(meters) && meters <= 10000) {
      return { text: meters === 9999 ? '10 km or more' : `${meters} meters` };
    }
  }
  if (/\bCAVOK\b/.test(period)) return { text: '10 km or more (CAVOK)' };
  return { text: null };
}

function parseTafClouds(period: string): { ceiling: number | null; text: string } {
  const matches = [...period.matchAll(/\b(FEW|SCT|BKN|OVC|VV)(\d{3})(CB|TCU)?\b/g)];
  if (!matches.length) return { ceiling: null, text: 'Clear' };
  const parts = matches.map((m) => {
    const type = m[1];
    const h = Number(m[2]) * 100;
    const label =
      type === 'FEW' ? 'Few' :
      type === 'SCT' ? 'Scattered' :
      type === 'BKN' ? 'Broken' :
      type === 'OVC' ? 'Overcast' :
      type === 'VV' ? 'Vertical Visibility' : type;
    return { type, height: h, text: `${label} at ${h} ft` };
  });
  const ceilingLayer = parts.find(p => ['BKN', 'OVC', 'VV'].includes(p.type));
  const text = parts.map(p => p.text).join(', ');
  return { ceiling: ceilingLayer?.height || null, text };
}

function parseTafWeather(period: string): string | null {
  const weatherCodes = [
    { code: 'TS', meaning: 'Thunderstorm' },
    { code: 'SH', meaning: 'Shower' },
    { code: 'RA', meaning: 'Rain' },
    { code: 'SN', meaning: 'Snow' },
    { code: 'FG', meaning: 'Fog' },
    { code: 'BR', meaning: 'Mist' },
    { code: 'HZ', meaning: 'Haze' },
    { code: 'FU', meaning: 'Smoke' },
    { code: 'VA', meaning: 'Volcanic Ash' },
  ];
  
  const matches = period.match(/\b(\+|-)?(TS|SH|RA|SN|FG|BR|HZ|FU|VA)(\w+)?\b/g) || [];
  if (!matches.length) return null;
  
  return matches.map(code => {
    const intensity = code.includes('+') ? 'Heavy' : code.includes('-') ? 'Light' : 'Moderate';
    const baseCode = weatherCodes.find(w => code.includes(w.code));
    return baseCode ? `${intensity} ${baseCode.meaning}` : code;
  }).join(', ');
}

function calculateFlightCategory(visibility: string | null, ceiling: string | number | null): string {
  let vis = 10;
  
  if (visibility && visibility !== '—' && visibility !== null) {
    if (visibility.includes('km')) {
      vis = 6;
    } else {
      const match = visibility.match(/(\d+)/);
      if (match) {
        vis = parseFloat(match[1]);
      }
    }
  }

  let ceil = 9999;
  if (ceiling !== null && ceiling !== '—' && ceiling !== undefined) {
    if (typeof ceiling === 'string') {
      ceil = parseFloat(ceiling);
    } else {
      ceil = ceiling;
    }
  }

  if (vis >= 5 && ceil >= 3000) return 'VFR';
  if (vis >= 3 && ceil >= 1000) return 'MVFR';
  if (vis >= 1 && ceil >= 500) return 'IFR';
  return 'LIFR';
}

function getCategoryColor(category: string): CategoryColors {
  const defaultColor: CategoryColors = { 
    fill: [248, 250, 252] as [number, number, number], 
    text: [71, 85, 105] as [number, number, number], 
    border: [226, 232, 240] as [number, number, number] 
  };
  
  return COLORS.flightCategories[category as keyof typeof COLORS.flightCategories] || defaultColor;
}

// ===== IMPROVED SECTION CREATION FUNCTIONS =====
function createMetarSection(
  doc: JsPDFDocument, 
  title: string, 
  icao: string, 
  rawMetar: string, 
  margin: number, 
  pageWidth: number, 
  startY: number
): number {
  let yPosition = applySectionHeader(doc, title, COLORS.sectionHeaders.metar, margin, startY, pageWidth);
  
  if (!rawMetar || rawMetar === "—") {
    yPosition = addNoDataMessage(doc, margin, yPosition, 'No METAR data available');
    return yPosition;
  }

  // Calculate dynamic height for METAR data card based on content
  const metarLines = splitTextToSize(doc, rawMetar, pageWidth - 2 * margin - 16);
  const metarCardHeight = Math.max(25, 10 + (metarLines.length * 4)); // Dynamic height based on line count
  
  // Apply data card with dynamic height
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, metarCardHeight, 4, 4, 'FD');
  
  doc.setFontSize(TYPOGRAPHY.code.size);
  doc.setFont('courier', 'bold');
  doc.setTextColor(59, 130, 246);
  
  // Use the pre-calculated lines for proper positioning
  metarLines.forEach((line, index) => {
    doc.text(line, margin + 8, yPosition + 10 + (index * 4));
  });
  
  yPosition += metarCardHeight + 10;

  const parsed = parseMetarForPDF(rawMetar);
  const rows = [
    { label: 'Station', value: parsed.station },
    { label: 'Time', value: parsed.time },
    { label: 'Wind', value: parsed.wind },
    { label: 'Visibility', value: parsed.visibility },
    { label: 'Ceiling', value: parsed.ceiling },
    { label: 'Clouds', value: parsed.clouds },
    { label: 'Temperature', value: parsed.temperature },
    { label: 'Pressure', value: parsed.pressure },
  ];

  yPosition = createStyledTable(doc, rows, margin, pageWidth, yPosition, doc.internal.pageSize.getHeight());

  const catColor = getCategoryColor(parsed.category);
  yPosition = addStatusBadge(doc, `FLIGHT CATEGORY: ${parsed.category}`, catColor, margin, yPosition);

  return yPosition + 15;
}

function createTafSection(
  doc: JsPDFDocument, 
  title: string, 
  icao: string, 
  rawTaf: string, 
  margin: number, 
  pageWidth: number, 
  startY: number
): number {
  let yPosition = applySectionHeader(doc, title, COLORS.sectionHeaders.taf, margin, startY, pageWidth);
  
  if (!rawTaf || rawTaf === "—") {
    yPosition = addNoDataMessage(doc, margin, yPosition, 'No TAF data available');
    return yPosition;
  }

  // Calculate dynamic height for TAF data card based on content
  const tafLines = splitTextToSize(doc, rawTaf, pageWidth - 2 * margin - 16);
  const tafCardHeight = Math.max(30, 15 + (tafLines.length * 4)); // Dynamic height based on line count
  
  // Apply data card with dynamic height
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, tafCardHeight, 4, 4, 'FD');
  
  doc.setFontSize(TYPOGRAPHY.code.size);
  doc.setFont('courier', 'bold');
  doc.setTextColor(59, 130, 246);
  
  // Use the pre-calculated lines for proper positioning
  tafLines.forEach((line, index) => {
    doc.text(line, margin + 8, yPosition + 12 + (index * 4));
  });
  
  yPosition += tafCardHeight + 10;

  const tafAnalysis = parseTafForPDF(rawTaf);
  
  // Header information
  doc.setFontSize(TYPOGRAPHY.body.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Issued:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(tafAnalysis.issue, margin + 20, yPosition);
  
  yPosition += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Valid:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(tafAnalysis.valid, margin + 20, yPosition);
  
  yPosition += 15;

  // Process each TAF period
  tafAnalysis.periods.forEach((period) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Check if we need a new page before adding this period
    if (yPosition > pageHeight - 80) { // Leave space for at least one period
      doc.addPage();
      yPosition = SPACING.margin;
    }

    const periodColors: { [key: string]: [number, number, number] } = {
      'FM': [34, 197, 94],
      'TEMPO': [245, 158, 11],
      'BECMG': [168, 85, 247],
      'MAIN': [59, 130, 246]
    };
    const color = periodColors[period.type] || [100, 116, 139];
    
    // Period header
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 8, 3, 3, 'F');
    
    doc.setFontSize(TYPOGRAPHY.small.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${period.type} - ${period.time}`, margin + 8, yPosition + 5);
    
    yPosition += 12;

    // Period details - handle each field with proper wrapping
    const details = [
      { label: 'Wind', value: period.wind.text || '—' },
      { label: 'Visibility', value: period.visibility?.text || '—' },
      { label: 'Clouds', value: period.clouds.text || '—' },
      { label: 'Weather', value: period.weather || '—' },
    ];

    details.forEach(detail => {
      // Check if we need a new page for this detail line
      if (yPosition > pageHeight - 15) {
        doc.addPage();
        yPosition = SPACING.margin;
      }

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 6, 2, 2, 'F');
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(detail.label, margin + 8, yPosition + 4);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      
      // Handle long values by splitting them
      const valueLines = splitTextToSize(doc, detail.value, pageWidth - margin - 40);
      if (valueLines.length === 1) {
        doc.text(valueLines[0], margin + 30, yPosition + 4);
        yPosition += 7;
      } else {
        // Multi-line value
        doc.text(valueLines[0], margin + 30, yPosition + 4);
        yPosition += 7;
        
        // Additional lines
        for (let i = 1; i < valueLines.length; i++) {
          if (yPosition > pageHeight - 15) {
            doc.addPage();
            yPosition = SPACING.margin;
          }
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 6, 2, 2, 'F');
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(15, 23, 42);
          doc.text(valueLines[i], margin + 8, yPosition + 4);
          yPosition += 7;
        }
      }
    });

    // Flight category badge
    if (yPosition > pageHeight - 15) {
      doc.addPage();
      yPosition = SPACING.margin;
    }

    const catColor = getCategoryColor(period.category);
    yPosition = addStatusBadge(doc, period.category, catColor, margin, yPosition + 3);
    yPosition += 12;
  });

  return yPosition;
}

function addFuelSection(
  doc: JsPDFDocument, 
  fuelData: FuelCalculationData, 
  margin: number, 
  pageWidth: number, 
  startY: number, 
  pageHeight: number
): number {
  let yPosition = applySectionHeader(doc, 'FUEL CALCULATION', COLORS.sectionHeaders.fuel, margin, startY, pageWidth);

  try {
    doc.setFontSize(TYPOGRAPHY.body.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Fuel Policy & Parameters:', margin, yPosition);
    yPosition += 8;

    const paramRows = [
      { label: 'Fuel Policy', value: fuelData.policy.toUpperCase() },
      { label: 'Trip Fuel', value: `${fuelData.tripKg} kg` },
      { label: 'Taxi Fuel', value: `${fuelData.taxiKg} kg` },
      { label: 'Holding Flow', value: `${fuelData.holdFlow} kg/h` },
      { label: 'Cruise Flow', value: `${fuelData.cruiseFlow} kg/h` },
      { label: 'Ground Speed', value: `${fuelData.gsKt} kt` },
      { label: 'Contingency', value: `${fuelData.contPct}%` },
      { label: 'Final Reserve', value: `${fuelData.finalMin} min` },
      { label: 'Alternate Plan', value: fuelData.altPlan || '—' },
      { label: 'Alternate Fuel', value: `${fuelData.altFuel} kg` },
    ];

    yPosition = createStyledTable(doc, paramRows, margin, pageWidth, yPosition, pageHeight);

    yPosition += 5;

    // Check if we need a new page for fuel breakdown
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = SPACING.margin;
    }

    doc.setFontSize(TYPOGRAPHY.body.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Fuel Breakdown:', margin, yPosition);
    yPosition += 8;

    doc.setFillColor(254, 252, 232);
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 45, 4, 4, 'FD');

    const breakdown = fuelData.breakdown;
    const breakdownRows = [
      { label: 'Taxi Fuel', value: `${breakdown.taxi} kg`, emphasis: false },
      { label: 'Trip Fuel', value: `${breakdown.trip} kg`, emphasis: false },
      { label: `Contingency (${fuelData.policyDetails.contPct}%)`, value: `${breakdown.contingency} kg`, emphasis: false },
      { label: 'Alternate Fuel', value: `${breakdown.alternate} kg`, emphasis: false },
      { label: `Final Reserve (${fuelData.policyDetails.finalMin}min)`, value: `${breakdown.final} kg`, emphasis: false },
      { label: 'TOTAL MINIMUM FUEL', value: `${breakdown.total} kg`, emphasis: true },
    ];

    let breakdownY = yPosition + 8;
    
    breakdownRows.forEach((row) => {
      doc.setFontSize(TYPOGRAPHY.small.size);
      
      if (row.emphasis) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(194, 65, 12);
        doc.setFillColor(254, 243, 199);
        doc.rect(margin + 2, breakdownY - 3, pageWidth - 2 * margin - 4, 7, 'F');
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
      }
      
      doc.text(row.label, margin + 8, breakdownY);
      doc.text(row.value, pageWidth - margin - 40, breakdownY, { align: 'right' });
      
      breakdownY += 7;
    });

    yPosition += 50;

  } catch (error) {
    console.error('Error in fuel section:', error);
    yPosition = addNoDataMessage(doc, margin, yPosition, 'Error displaying fuel data');
  }

  return yPosition + 10;
}

function addPirepSection(
  doc: JsPDFDocument, 
  pirepData: PirepData, 
  margin: number, 
  pageWidth: number, 
  startY: number, 
  pageHeight: number
): number {
  let yPosition = applySectionHeader(doc, 'PIREP REPORT', COLORS.sectionHeaders.pirep, margin, startY, pageWidth);

  if (!validatePirepData(pirepData)) {
    console.warn('Invalid PIREP data structure:', pirepData);
    return addNoDataMessage(doc, margin, yPosition, 'Invalid PIREP data format');
  }

  doc.setFontSize(TYPOGRAPHY.body.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PIREP Input:', margin, yPosition);
  yPosition += 8;

  try {
    // Calculate dynamic height for PIREP data card
    const pirepLines = splitTextToSize(doc, pirepData.raw || 'No PIREP text available', pageWidth - 2 * margin - 16);
    const pirepCardHeight = Math.max(25, 10 + (pirepLines.length * 4));
    
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, pirepCardHeight, 4, 4, 'FD');
    
    doc.setFontSize(TYPOGRAPHY.code.size);
    doc.setFont('courier', 'bold');
    doc.setTextColor(59, 130, 246);
    
    pirepLines.forEach((line, index) => {
      doc.text(line, margin + 8, yPosition + 10 + (index * 4));
    });
    
    yPosition += pirepCardHeight + 10;

    const pirepRows = [
      { label: 'Station', value: safeToString(pirepData.station) },
      { label: 'Type', value: safeToString(pirepData.type) },
      { label: 'Time', value: safeToString(pirepData.time) },
      { label: 'Latitude', value: safeToString(pirepData.latitude) },
      { label: 'Longitude', value: safeToString(pirepData.longitude) },
      { label: 'Altitude', value: safeToString(pirepData.altitude) },
      { label: 'Flight Level', value: safeToString(pirepData.flight_level) },
      { label: 'Aircraft', value: safeToString(pirepData.aircraft) },
      { label: 'Temperature', value: safeToString(pirepData.temp) },
      { label: 'Weather', value: safeToString(pirepData.wx_string) },
    ];

    if (pirepData.turbulence) {
      pirepRows.push({ label: 'Turbulence', value: safeToString(pirepData.turbulence) });
    }

    if (pirepData.icing) {
      pirepRows.push({ label: 'Icing', value: safeToString(pirepData.icing) });
    }

    if (pirepData.wind) {
      pirepRows.push({ label: 'Wind', value: safeToString(pirepData.wind) });
    }

    if (pirepData.remarks) {
      pirepRows.push({ label: 'Remarks', value: safeToString(pirepData.remarks) });
    }

    yPosition = createStyledTable(doc, pirepRows, margin, pageWidth, yPosition, pageHeight);

  } catch (error) {
    console.error('Error in PIREP section:', error);
    yPosition = addNoDataMessage(doc, margin, yPosition, 'Error displaying PIREP data');
  }

  return yPosition + 15;
}

function addOperationalNotesSection(
  doc: JsPDFDocument, 
  notesData: OperationalNotes, 
  margin: number, 
  pageWidth: number, 
  startY: number, 
  pageHeight: number
): number {
  let yPosition = applySectionHeader(doc, 'OPERATIONAL NOTES', COLORS.sectionHeaders.notes, margin, startY, pageWidth);

  try {
    doc.setFontSize(TYPOGRAPHY.body.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Departure Notes:', margin, yPosition);
    yPosition += 8;

    // Calculate required height for departure notes
    const depNotes = notesData.notesDep || 'No departure notes provided';
    const depLines = splitTextToSize(doc, depNotes, pageWidth - 2 * margin - 16);
    const depHeight = Math.max(25, 12 + (depLines.length * 4)); // Dynamic height based on content

    // Check if we need a new page
    if (yPosition + depHeight > pageHeight - 20) {
      doc.addPage();
      yPosition = SPACING.margin;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, depHeight, 4, 4, 'FD');
    
    doc.setFontSize(TYPOGRAPHY.body.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    
    depLines.forEach((line, lineIndex) => {
      doc.text(line, margin + 8, yPosition + 12 + (lineIndex * 4));
    });
    
    yPosition += depHeight + 10;

    // Check if we need a new page for arrival notes
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = SPACING.margin;
    }

    doc.setFontSize(TYPOGRAPHY.body.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Arrival Notes:', margin, yPosition);
    yPosition += 8;

    // Calculate required height for arrival notes
    const arrNotes = notesData.notesArr || 'No arrival notes provided';
    const arrLines = splitTextToSize(doc, arrNotes, pageWidth - 2 * margin - 16);
    const arrHeight = Math.max(25, 12 + (arrLines.length * 4)); // Dynamic height based on content

    // Check if we need a new page
    if (yPosition + arrHeight > pageHeight - 20) {
      doc.addPage();
      yPosition = SPACING.margin;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, arrHeight, 4, 4, 'FD');
    
    doc.setFontSize(TYPOGRAPHY.body.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    
    arrLines.forEach((line, lineIndex) => {
      doc.text(line, margin + 8, yPosition + 12 + (lineIndex * 4));
    });
    
    yPosition += arrHeight + 10;

  } catch (error) {
    console.error('Error in operational notes section:', error);
    yPosition = addNoDataMessage(doc, margin, yPosition, 'Error displaying operational notes');
  }

  return yPosition;
}

function addCollaborationAuditSection(
  doc: JsPDFDocument, 
  collaborationData: CollaborationAuditData, 
  margin: number, 
  pageWidth: number, 
  startY: number, 
  pageHeight: number
): number {
  let yPosition = applySectionHeader(doc, 'COLLABORATION & AUDIT', COLORS.sectionHeaders.collaboration, margin, startY, pageWidth);

  try {
    // Deep Link Section
    doc.setFontSize(TYPOGRAPHY.body.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Shareable Configuration Link:', margin, yPosition);
    yPosition += 8;

    if (collaborationData.deepLink && collaborationData.deepLink !== "—") {
      // Set font for width calculation BEFORE splitting text
      doc.setFont('courier', 'normal');
      doc.setFontSize(TYPOGRAPHY.small.size);
      
      // Calculate required height for deep link
      const availableWidth = pageWidth - 2 * margin - 16;
      const linkLines = splitTextToSize(doc, collaborationData.deepLink, availableWidth);
      const lineHeight = 3.5;
      const padding = 10;
      const linkHeight = Math.max(25, padding + (linkLines.length * lineHeight));

      // Check if we need a new page
      if (yPosition + linkHeight > pageHeight - 20) {
        doc.addPage();
        yPosition = SPACING.margin;
      }

      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, linkHeight, 4, 4, 'FD');
      
      doc.setTextColor(6, 95, 70);
      
      // Draw each line with proper positioning
      linkLines.forEach((line, index) => {
        const lineY = yPosition + 8 + (index * lineHeight);
        doc.text(line, margin + 8, lineY);
      });
      
      yPosition += linkHeight + 10;
    } else {
      yPosition = addNoDataMessage(doc, margin, yPosition, 'No shareable link generated');
      yPosition += 10;
    }

    // Check if we need a new page for audit section
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = SPACING.margin;
    }

    // Audit Report Section
    doc.setFontSize(TYPOGRAPHY.body.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Audit Trail & Verification:', margin, yPosition);
    yPosition += 8;

    if (collaborationData.auditReport && collaborationData.auditReport !== "—") {
  doc.setFont('courier', 'normal'); // Monospaced for hashes
  doc.setFontSize(TYPOGRAPHY.small.size);

  const padding = 15;
  const availableWidth = pageWidth - 2 * margin - 2 * padding; // account for padding inside box

  // Split hash by fixed length to avoid overlap
  const maxCharsPerLine = Math.floor(availableWidth / doc.getTextWidth('A')); // Monospaced, so 'A' width works
  const auditLines = collaborationData.auditReport.match(new RegExp(`.{1,${maxCharsPerLine}}`, 'g')) || [];

  const lineHeight = 4;
  const auditHeight = Math.max(35, padding + (auditLines.length * lineHeight));

  if (yPosition + auditHeight > pageHeight - 20) {
    doc.addPage();
    yPosition = SPACING.margin;
  }

  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, auditHeight, 4, 4, 'FD');

  doc.setTextColor(161, 98, 7);

  auditLines.forEach((line, index) => {
    const lineY = yPosition + 10 + index * lineHeight;
    doc.text(line, margin + padding, lineY);
  });

  yPosition += auditHeight + 10;
}

    else {
      yPosition = addNoDataMessage(doc, margin, yPosition, 'No audit report generated');
      yPosition += 10;
    }

    // Check if we need a new page for timestamp
    if (yPosition > pageHeight - 15) {
      doc.addPage();
      yPosition = SPACING.margin;
    }

    // Timestamp
    doc.setFontSize(TYPOGRAPHY.small.size);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(`Report generated: ${collaborationData.generatedAt || new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 8;

  } catch (error) {
    console.error('Error in collaboration & audit section:', error);
    yPosition = addNoDataMessage(doc, margin, yPosition, 'Error displaying collaboration data');
  }

  return yPosition;
}

function addRiskAssessmentSection(
  doc: JsPDFDocument, 
  riskData: RiskAssessmentData, 
  margin: number, 
  pageWidth: number, 
  startY: number, 
  pageHeight: number
): number {
  let yPosition = applySectionHeader(doc, 'RISK ASSESSMENT', COLORS.sectionHeaders.risk, margin, startY, pageWidth);

  try {
    doc.setFontSize(TYPOGRAPHY.body.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Go/No-Go Checklist:', margin, yPosition);
    yPosition += 8;

    const checklistItems = [
      { label: 'Weather conditions within operational limits', key: 'weatherWithinLimits' as keyof typeof riskData.checklist },
      { label: 'Crew within duty time limits', key: 'crewWithinDutyTime' as keyof typeof riskData.checklist },
      { label: 'Aircraft serviceable and properly equipped', key: 'aircraftServiceable' as keyof typeof riskData.checklist },
      { label: 'All required documentation available', key: 'documentationAvailable' as keyof typeof riskData.checklist },
      { label: 'Risk mitigation measures in place', key: 'riskMitigationInPlace' as keyof typeof riskData.checklist },
    ];

    const rowHeight = SPACING.compactRow;

    // Check if we need a new page for checklist header
    if (yPosition + rowHeight > pageHeight - 20) {
      doc.addPage();
      yPosition = SPACING.margin;
    }

    doc.setFillColor(COLORS.primary.dark[0], COLORS.primary.dark[1], COLORS.primary.dark[2]);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 2, 2, 'F');
    
    doc.setFontSize(TYPOGRAPHY.small.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Checklist Item', margin + 8, yPosition + 4);
    doc.text('Status', pageWidth - margin - 15, yPosition + 4, { align: 'right' });
    
    yPosition += rowHeight;

    let isEven = false;
    
    checklistItems.forEach(item => {
      // Check if we need a new page for each checklist item
      if (yPosition + rowHeight > pageHeight - 20) {
        doc.addPage();
        yPosition = SPACING.margin;
        // Re-add header on new page
        doc.setFillColor(COLORS.primary.dark[0], COLORS.primary.dark[1], COLORS.primary.dark[2]);
        doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 2, 2, 'F');
        doc.setFontSize(TYPOGRAPHY.small.size);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Checklist Item', margin + 8, yPosition + 4);
        doc.text('Status', pageWidth - margin - 15, yPosition + 4, { align: 'right' });
        yPosition += rowHeight;
      }

      if (isEven) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 'F');
      }
      
      doc.setFontSize(TYPOGRAPHY.small.size);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(item.label, margin + 8, yPosition + 4);
      
      doc.setFont('helvetica', 'normal');
      const status = riskData.checklist[item.key] ? 'COMPLETE' : 'PENDING';
      const statusColor = riskData.checklist[item.key] ? [34, 197, 94] : [239, 68, 68];
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(status, pageWidth - margin - 15, yPosition + 4, { align: 'right' });
      
      yPosition += rowHeight;
      isEven = !isEven;
    });

    yPosition += 8;

    // Check if we need a new page for risk notes
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = SPACING.margin;
    }

    doc.setFontSize(TYPOGRAPHY.body.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Risk Mitigation Notes:', margin, yPosition);
    yPosition += 8;

    // Calculate required height for risk notes
    const notes = riskData.riskNotes || 'No risk mitigation notes provided.';
    const notesLines = splitTextToSize(doc, notes, pageWidth - 2 * margin - 16);
    const notesHeight = Math.max(40, 10 + (notesLines.length * 4));

    // Check if we need a new page
    if (yPosition + notesHeight > pageHeight - 20) {
      doc.addPage();
      yPosition = SPACING.margin;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, notesHeight, 4, 4, 'FD');
    
    doc.setFontSize(TYPOGRAPHY.body.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    
    notesLines.forEach((line, lineIndex) => {
      doc.text(line, margin + 8, yPosition + 10 + (lineIndex * 4));
    });
    
    yPosition += notesHeight + 8;

    // Check if we need a new page for timestamp
    if (yPosition > pageHeight - 10) {
      doc.addPage();
      yPosition = SPACING.margin;
    }

    doc.setFontSize(TYPOGRAPHY.small.size);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(`Assessment conducted: ${riskData.assessedAt}`, margin, yPosition);
    yPosition += 8;

  } catch (error) {
    console.error('Error in risk assessment section:', error);
    yPosition = addNoDataMessage(doc, margin, yPosition, 'Error displaying risk assessment data');
  }

  return yPosition;
}

function addAirportSummaryToPDF(
  doc: JsPDFDocument, 
  airportData: AirportData, 
  margin: number, 
  pageWidth: number, 
  startY: number, 
  pageHeight: number
): number {
  let yPosition = applySectionHeader(doc, 'AIRPORT INFORMATION', COLORS.sectionHeaders.airport, margin, startY, pageWidth);

  doc.setFontSize(TYPOGRAPHY.h4.size);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${airportData.info.name} (${airportData.info.icao})`, margin + 8, yPosition);
  
  doc.setFontSize(TYPOGRAPHY.small.size);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`${airportData.info.city}, ${airportData.info.country} • ${airportData.info.type}`, margin + 8, yPosition + 5);

  yPosition += 12;

  const basicInfo = [
    { label: 'Coordinates', value: formatCoordinatesForPDF(airportData.info.latitude, airportData.info.longitude) },
    { label: 'Elevation', value: `${airportData.info.elevation_ft} ft / ${airportData.info.elevation_m} m` },
    { label: 'Timezone', value: airportData.info.timezone },
    { label: 'Runways', value: `${airportData.runways.length}` },
    { label: 'Communications', value: `${airportData.communications.length}` },
  ];

  yPosition = createStyledTable(doc, basicInfo, margin, pageWidth, yPosition, pageHeight);

  if (airportData.runways.length > 0) {
    yPosition += 5;
    
    doc.setFontSize(TYPOGRAPHY.body.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Runways Summary:', margin, yPosition);
    
    yPosition += 8;

    airportData.runways.slice(0, 2).forEach((runway) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = SPACING.margin;
      }

      doc.setFontSize(TYPOGRAPHY.small.size);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`• ${runway.ident1}/${runway.ident2}: ${runway.length_ft ? runway.length_ft.toLocaleString() : '—'} ft`, margin + 8, yPosition);
      
      yPosition += 4;
    });

    if (airportData.runways.length > 2) {
      doc.setFontSize(TYPOGRAPHY.micro.size);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text(`+ ${airportData.runways.length - 2} more runways...`, margin + 8, yPosition);
      yPosition += 4;
    }
  }

  return yPosition + 10;
}

function formatCoordinatesForPDF(lat: number, lon: number): string {
  if (!lat || !lon) return '—';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir} ${Math.abs(lon).toFixed(4)}°${lonDir}`;
}

// ===== MAIN PDF EXPORT FUNCTION =====
export async function exportWeatherPDF(
  weatherData: {
    dep: string;
    arr: string;
    metarDep: string;
    metarArr: string;
    tafDep: string;
    tafArr: string;
  },
  airportData?: AirportData,
  pirepData?: PirepData | null,
  fuelData?: FuelCalculationData | null,
  operationalNotes?: OperationalNotes,
  collaborationData?: CollaborationAuditData,
  riskAssessmentData?: RiskAssessmentData
) {
  try {
    console.log('🔄 Starting PDF export process...');
    console.log('📊 Weather data:', weatherData);
    console.log('📋 PIREP data:', pirepData);
    console.log('⛽ Fuel data:', fuelData);
    console.log('🏢 Airport data:', airportData ? 'Available' : 'Not available');
    console.log('📝 Operational notes:', operationalNotes ? 'Available' : 'Not available');
    console.log('🔗 Collaboration data:', collaborationData ? 'Available' : 'Not available');
    console.log('🛡️ Risk Assessment data:', riskAssessmentData);

    if (pirepData && !validatePirepData(pirepData)) {
      console.warn('⚠️ Invalid PIREP data structure detected, proceeding without PIREP data');
      pirepData = undefined;
    }

    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    }) as unknown as JsPDFDocument;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = SPACING.margin;
    let yPosition = margin;

    // ===== CLEAN HEADER DESIGN =====
    doc.setFillColor(COLORS.primary.dark[0], COLORS.primary.dark[1], COLORS.primary.dark[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Main title
    doc.setFontSize(TYPOGRAPHY.h1.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Flight Dispatch', pageWidth / 2, 18, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(TYPOGRAPHY.body.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Professional Dispatch Analysis & Risk Assessment', pageWidth / 2, 25, { align: 'center' });

    yPosition = 45;

    // ===== ENHANCED FLIGHT INFO CARD =====
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 32, 8, 8, 'FD');
    
    // Add accent border
    doc.setDrawColor(COLORS.primary.blue[0], COLORS.primary.blue[1], COLORS.primary.blue[2]);
    doc.setLineWidth(0.5);
    doc.rect(margin + 1, yPosition + 1, pageWidth - 2 * margin - 2, 30, 'S');
    
    // Flight route with proper arrow symbol
    doc.setFontSize(TYPOGRAPHY.h2.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary.dark[0], COLORS.primary.dark[1], COLORS.primary.dark[2]);
    
    // Draw departure airport
    const depX = margin + 25;
    doc.text(weatherData.dep, depX, yPosition + 12);
    
    // Draw arrow symbol (using text character that works in PDF)
    const arrowX = pageWidth / 2;
    doc.text('to', arrowX, yPosition + 12, { align: 'center' });
    // Draw arrival airport
    const arrX = pageWidth - margin - 35;
    doc.text(weatherData.arr, arrX, yPosition + 12);
    
    // Details
    doc.setFontSize(TYPOGRAPHY.small.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    
    const now = new Date();
    const timeString = now.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc.text(`Generated: ${timeString}`, pageWidth / 2, yPosition + 22, { align: 'center' });
    doc.text('For Calculations/estimation purposes only, verify with actual data.', pageWidth / 2, yPosition + 27, { align: 'center' });

    yPosition += 42;

    // ===== WEATHER SECTIONS =====
    console.log('📡 Adding METAR sections...');
    yPosition = createMetarSection(doc, 'DEPARTURE METAR', weatherData.dep, weatherData.metarDep, margin, pageWidth, yPosition);
    yPosition = createMetarSection(doc, 'ARRIVAL METAR', weatherData.arr, weatherData.metarArr, margin, pageWidth, yPosition);
    
    console.log('🌤️ Adding TAF sections...');
    yPosition = createTafSection(doc, 'DEPARTURE TAF', weatherData.dep, weatherData.tafDep, margin, pageWidth, yPosition);
    yPosition = createTafSection(doc, 'ARRIVAL TAF', weatherData.arr, weatherData.tafArr, margin, pageWidth, yPosition);

    // ===== ADDITIONAL SECTIONS =====
    if (fuelData) {
      console.log('⛽ Adding fuel calculation section...');
      yPosition = addFuelSection(doc, fuelData, margin, pageWidth, yPosition, pageHeight);
    }

    if (pirepData) {
      console.log('📝 Adding PIREP section...');
      yPosition = addPirepSection(doc, pirepData, margin, pageWidth, yPosition, pageHeight);
    }

    if (operationalNotes) {
      console.log('📝 Adding operational notes section...');
      yPosition = addOperationalNotesSection(doc, operationalNotes, margin, pageWidth, yPosition, pageHeight);
    }

    if (collaborationData) {
      console.log('🔗 Adding collaboration & audit section...');
      yPosition = addCollaborationAuditSection(doc, collaborationData, margin, pageWidth, yPosition, pageHeight);
    }

    if (riskAssessmentData) {
      console.log('🛡️ Adding risk assessment section...');
      yPosition = addRiskAssessmentSection(doc, riskAssessmentData, margin, pageWidth, yPosition, pageHeight);
    }

    if (airportData) {
      console.log('🏢 Adding airport information...');
      yPosition = addAirportSummaryToPDF(doc, airportData, margin, pageWidth, yPosition, pageHeight);
    }

    // ===== CLEAN FOOTER =====
    const footerY = pageHeight - 15;
    doc.setFillColor(COLORS.primary.dark[0], COLORS.primary.dark[1], COLORS.primary.dark[2]);
    doc.rect(0, footerY, pageWidth, 15, 'F');
    
    doc.setFontSize(TYPOGRAPHY.small.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('For Calculations/estimation purposes only, verify with actual data.', pageWidth / 2, footerY + 6, { align: 'center' });

    // Save the PDF
    const filename = `Weather-Briefing-${weatherData.dep}-${weatherData.arr}-${now.toISOString().split('T')[0]}.pdf`;
    console.log('💾 Saving PDF as:', filename);
    doc.save(filename);
    
    console.log('✅ PDF export completed successfully!');
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    throw new Error('Failed to generate PDF report. Please try again.');
  }
}

// Export the validation function
export { validatePirepData };