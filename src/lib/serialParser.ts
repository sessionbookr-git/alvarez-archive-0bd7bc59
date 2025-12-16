// Alvarez Serial Number Parser
// Based on official Alvarez customer service documentation

export type SerialFormat = 
  | "modern"      // Letter + 8-9 digits (e.g., E24113487)
  | "yairi"       // 4-5 digit number (e.g., 51708) - Emperor code applies
  | "legacy"      // Low numbers <100000 (1960s-70s)
  | "unknown";

export interface SerialParseResult {
  format: SerialFormat;
  estimatedYear: number | null;
  yearRange: string;
  confidence: "high" | "medium" | "low";
  country: string;
  notes: string;
  isYairi: boolean;
  needsEmperorCode: boolean;
  prefix: string | null;
}

// Emperor Year Chart (Japanese calendar system)
const EMPEROR_CODE: Record<number, number> = {
  // Showa Era
  45: 1970, 46: 1971, 47: 1972, 48: 1973, 49: 1974,
  50: 1975, 51: 1976, 52: 1977, 53: 1978, 54: 1979,
  55: 1980, 56: 1981, 57: 1982, 58: 1983, 59: 1984,
  60: 1985, 61: 1986, 62: 1987, 63: 1988,
  // Heisei Era
  1: 1989, 2: 1990, 3: 1991, 4: 1992, 5: 1993,
  6: 1994, 7: 1995, 8: 1996, 9: 1997, 10: 1998,
  11: 1999, 12: 2000,
};

export function getEmperorYear(code: number): number | null {
  return EMPEROR_CODE[code] || null;
}

export function parseSerial(serial: string): SerialParseResult {
  const cleaned = serial.trim().toUpperCase();
  
  // Modern format: Letter + 8-9 digits (e.g., E24113487, CS12071753)
  const modernMatch = cleaned.match(/^([A-Z]{1,2})(\d{2})(\d{6,8})$/);
  if (modernMatch) {
    const [, prefix, yearDigits] = modernMatch;
    const yearNum = parseInt(yearDigits, 10);
    
    // Parse year from prefix
    let estimatedYear: number | null = null;
    let confidence: "high" | "medium" | "low" = "medium";
    let country = "China";
    
    // E-prefix = Recent China-made (E24 = 2024)
    if (prefix === "E") {
      estimatedYear = 2000 + yearNum;
      confidence = "high";
    }
    // CS-prefix = 2010s (CS12 = 2012)
    else if (prefix === "CS") {
      estimatedYear = 2000 + yearNum;
      confidence = "high";
    }
    // F-prefix = 2000s era (F20 = early 2000s)
    else if (prefix === "F") {
      if (yearNum >= 0 && yearNum <= 30) {
        estimatedYear = 2000 + yearNum;
        confidence = "medium";
      }
    }
    // S-prefix = 1990s (S98 = 1998)
    else if (prefix === "S") {
      if (yearNum >= 90 && yearNum <= 99) {
        estimatedYear = 1900 + yearNum;
        confidence = "medium";
      }
    }
    
    return {
      format: "modern",
      estimatedYear,
      yearRange: estimatedYear ? `${estimatedYear}` : "Unknown",
      confidence,
      country,
      notes: `Modern Alvarez serial format. ${prefix}-prefix guitars are typically made in China.`,
      isYairi: false,
      needsEmperorCode: false,
      prefix,
    };
  }
  
  // Yairi format: 4-5 digit number (e.g., 51708, 73508)
  const yairiMatch = cleaned.match(/^(\d{4,5})$/);
  if (yairiMatch) {
    const num = parseInt(cleaned, 10);
    
    // Very low numbers (<100000) are likely 1960s-70s legacy
    if (num < 100000) {
      return {
        format: num < 10000 ? "yairi" : "legacy",
        estimatedYear: null,
        yearRange: "1965-1990 (estimated)",
        confidence: "low",
        country: "Japan",
        notes: num < 10000 
          ? "This appears to be an Alvarez-Yairi serial number. Check the neck block inside the guitar for the Emperor date code."
          : "Low serial numbers indicate early production. Check the neck block inside the guitar for the Emperor date code to determine exact year.",
        isYairi: num < 70000,
        needsEmperorCode: true,
        prefix: null,
      };
    }
  }
  
  // Legacy format: Various older formats
  const legacyMatch = cleaned.match(/^\d+$/);
  if (legacyMatch) {
    const num = parseInt(cleaned, 10);
    return {
      format: "legacy",
      estimatedYear: null,
      yearRange: num < 500000 ? "1960s-1980s" : "Unknown",
      confidence: "low",
      country: "Japan",
      notes: "This appears to be a vintage Alvarez. Older guitars from the 1970s-80s were made in several Japanese factories. Check the neck block inside the guitar for the Emperor date code.",
      isYairi: false,
      needsEmperorCode: true,
      prefix: null,
    };
  }
  
  // Unknown format
  return {
    format: "unknown",
    estimatedYear: null,
    yearRange: "Unknown",
    confidence: "low",
    country: "Unknown",
    notes: "Serial number format not recognized. Please verify the serial number is entered correctly.",
    isYairi: false,
    needsEmperorCode: false,
    prefix: null,
  };
}

// Parse neck block Emperor code
export function parseNeckBlock(neckBlock: string): { year: number | null; notes: string } {
  const cleaned = neckBlock.trim();
  const num = parseInt(cleaned, 10);
  
  if (isNaN(num)) {
    return { year: null, notes: "Invalid neck block number format." };
  }
  
  // Check Emperor code chart
  const emperorYear = getEmperorYear(num);
  if (emperorYear) {
    return { 
      year: emperorYear, 
      notes: `Emperor code ${num} = ${emperorYear}` 
    };
  }
  
  // After 2000: last two digits of year
  if (num >= 0 && num <= 25) {
    const year = 2000 + num;
    return { 
      year, 
      notes: `Post-2000 format: ${year}` 
    };
  }
  
  // Could be ambiguous (e.g., 09 = 1997 or 2009)
  if (num >= 1 && num <= 12) {
    const heiseiYear = EMPEROR_CODE[num];
    const modernYear = 2000 + num;
    return { 
      year: null, 
      notes: `Ambiguous: Could be ${heiseiYear} (Emperor code) or ${modernYear} (post-2000 format). Check model details to determine era.` 
    };
  }
  
  return { year: null, notes: "Neck block number not found in Emperor code chart." };
}
