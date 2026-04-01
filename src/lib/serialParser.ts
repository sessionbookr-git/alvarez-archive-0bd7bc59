// Alvarez Serial Number Parser
// Based on official Alvarez customer service documentation
//
// SERIAL PREFIX REFERENCE (Updated April 2026):
// ┌─────────┬────────────────┬─────────────────────┬────────────┐
// │ Prefix  │ Era            │ Country             │ Confidence │
// ├─────────┼────────────────┼─────────────────────┼────────────┤
// │ E       │ 2010s-present  │ China ✓             │ High       │
// │ CS      │ 2010s          │ Unknown             │ Medium     │
// │ CD      │ Mid-2000s      │ Unknown             │ Medium     │
// │ F       │ 2000s          │ China/Korea         │ Medium     │
// │ FC      │ 2000s-2010s    │ Unknown             │ Low        │
// │ G       │ 1990s-2000s    │ Unknown             │ Low        │
// │ S       │ 1990s          │ Korea/China         │ Medium     │
// │ A       │ 1970s-1980s    │ Japan               │ Low        │
// └─────────┴────────────────┴─────────────────────┴────────────┘
//
// KEY FACTS:
// - Only E-prefix is CONFIRMED China production
// - CS-prefix was incorrectly assumed to be "China Serial" - it is NOT
// - Pre-1999: 4-digit model numbers (5021, 5043, etc.)
// - 1999+: Two-letter + two-number model codes (AD60, RD16, etc.)
//
// Sources: Alvarez customer service data, guitar-list.com, community research

export type SerialFormat = 
  | "modern"      // Letter prefix + digits (e.g., E24113487, CS12071753, CD05069348)
  | "yairi"       // 4-5 digit number (e.g., 51708) - Emperor code applies
  | "legacy"      // Low numbers <100000 (1960s-70s)
  | "nine_digit"  // 9-digit format (e.g., 081201626)
  | "unknown";

export interface SerialParseResult {
  format: SerialFormat;
  estimatedYear: number | null;
  estimatedMonth: number | null;
  yearRange: string;
  confidence: "high" | "medium" | "low";
  country: string;
  notes: string;
  isYairi: boolean;
  needsEmperorCode: boolean;
  prefix: string | null;
}

// Emperor Year Chart (Japanese calendar system)
// Showa era: 45-63 = 1970-1988
// Heisei era: 1-12 = 1989-2000
const EMPEROR_CODE: Record<number, number> = {
  // Showa Era (1970-1988)
  45: 1970, 46: 1971, 47: 1972, 48: 1973, 49: 1974,
  50: 1975, 51: 1976, 52: 1977, 53: 1978, 54: 1979,
  55: 1980, 56: 1981, 57: 1982, 58: 1983, 59: 1984,
  60: 1985, 61: 1986, 62: 1987, 63: 1988,
  // Heisei Era (1989-2000)
  1: 1989, 2: 1990, 3: 1991, 4: 1992, 5: 1993,
  6: 1994, 7: 1995, 8: 1996, 9: 1997, 10: 1998,
  11: 1999, 12: 2000,
};

export function getEmperorYear(code: number): number | null {
  return EMPEROR_CODE[code] || null;
}

// Get month name from number
function getMonthName(month: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1] || 'Unknown';
}

// Modern Yairi Serial Parser (2015-2025+)
// Based on verified data from Alvarez official serial checker and customer examples
interface ModernYairiResult {
  year: number;
  yearRange: string;
  confidence: "high" | "medium" | "low";
  notes: string;
}

// Verified anchor points from Alvarez serial checker
const YAIRI_ANCHOR_POINTS = [
  { serial: 72000, year: 2015 },
  { serial: 73000, year: 2018 },
  { serial: 74000, year: 2020 },
  { serial: 74968, year: 2021 }, // Verified customer example (WY1TS)
  { serial: 75000, year: 2021 },
  { serial: 76000, year: 2023 },
  { serial: 77141, year: 2025 }, // Verified customer example (DYM74-NN)
  { serial: 77525, year: 2024 }, // Verified customer example (FYM66HD) — note: 77525 shipped 2024 but 77141 confirmed 2025, production batches overlap
  { serial: 77920, year: 2026 }, // Projected based on ~750/year
];

function parseModernYairiSerial(serialNum: number): ModernYairiResult {
  // Find surrounding anchors for interpolation
  let lowerAnchor = YAIRI_ANCHOR_POINTS[0];
  let upperAnchor: typeof YAIRI_ANCHOR_POINTS[0] | null = null;
  
  // Check for exact match first
  for (const anchor of YAIRI_ANCHOR_POINTS) {
    if (serialNum === anchor.serial) {
      let verifiedNote = '';
      if (serialNum === 74968) {
        verifiedNote = 'Verified: Serial 74968 (WY1TS model) = 2021. ';
      } else if (serialNum === 77525) {
        verifiedNote = 'Verified: Serial 77525 (FYM66HD model) = 2024. ';
      } else if (serialNum === 77141) {
        verifiedNote = 'Verified: Serial 77141 (DYM74-NN model) = 2025. ';
      }
      
      return {
        year: anchor.year,
        yearRange: `${anchor.year}`,
        confidence: 'high',
        notes: `${verifiedNote}Based on Alvarez official serial checker. For exact manufacturing date, check neck block stamp inside guitar.`,
      };
    }
    
    if (serialNum > anchor.serial) {
      lowerAnchor = anchor;
    } else if (serialNum < anchor.serial) {
      upperAnchor = anchor;
      break;
    }
  }
  
  // If serial is beyond all anchors, clamp to the last anchor's year
  let estimatedYear: number;
  if (!upperAnchor) {
    // Serial is above our highest anchor — use last anchor year (don't extrapolate into NaN)
    estimatedYear = lowerAnchor.year;
  } else {
    // Interpolate year between anchors
    const serialRange = upperAnchor.serial - lowerAnchor.serial;
    const yearRange = upperAnchor.year - lowerAnchor.year;
    const serialOffset = serialNum - lowerAnchor.serial;
    const yearOffset = serialRange > 0 ? (serialOffset / serialRange) * yearRange : 0;
    estimatedYear = Math.round(lowerAnchor.year + yearOffset);
  }
  
  // Determine confidence level based on proximity to any anchor point
  let confidence: "high" | "medium" | "low" = 'medium';
  let verifiedNote = '';
  
  // Find distance to nearest anchor point
  let minDistance = Infinity;
  for (const anchor of YAIRI_ANCHOR_POINTS) {
    const distance = Math.abs(serialNum - anchor.serial);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  
  // High confidence if close to any anchor point
  if (minDistance < 200) {
    confidence = 'high';
  }
  
  // Add specific notes for verified customer examples
  if (Math.abs(serialNum - 74968) < 200) {
    verifiedNote = 'Near verified serial 74968 (WY1TS, 2021). ';
  } else if (Math.abs(serialNum - 77525) < 200) {
    verifiedNote = 'Near verified serial 77525 (FYM66HD, 2024). ';
  }
  
  // Build notes - keep simple for modern Yairis
  const notes = `${verifiedNote}Estimated based on Alvarez official serial checker data and verified customer examples.`;
  
  return {
    year: estimatedYear,
    yearRange: `~${estimatedYear}`,
    confidence,
    notes,
  };
}

export function parseSerial(serial: string): SerialParseResult {
  const cleaned = serial.trim().toUpperCase();
  
  // Modern format: PREFIX + YY (year) + MM (month) + sequence
  // E25115614 = E (China) + 25 (2025) + 11 (November) + 5614 (unit #5614)
  // Patterns: E, S, F, CS, CD prefixes
  
  // E-prefix: China-made, E + 2-digit year + 2-digit month + sequence
  // Example: E25115614 = 2025, November, unit 5614
  const eMatch = cleaned.match(/^E(\d{2})(\d{2})(\d+)$/);
  if (eMatch) {
    const [, yearDigits, monthDigits, sequence] = eMatch;
    const year = 2000 + parseInt(yearDigits, 10);
    const monthNum = parseInt(monthDigits, 10);
    const validMonth = monthNum >= 1 && monthNum <= 12 ? monthNum : null;
    
    const monthNote = validMonth 
      ? `${getMonthName(validMonth)} ${year}, unit #${sequence}`
      : `${year}, unit #${monthDigits}${sequence}`;
    
    return {
      format: "modern",
      estimatedYear: year,
      estimatedMonth: validMonth,
      yearRange: `${year}`,
      confidence: "high",
      country: "China",
      notes: `E-prefix serial: Made in China, ${monthNote}.`,
      isYairi: false,
      needsEmperorCode: false,
      prefix: "E",
    };
  }
  
  // CS-prefix: 2010s production (NOT China - E-prefix is China)
  // CS + 2-digit year + 2-digit month + sequence
  // Example: CS12071753 = 2012, July, unit 1753 (verified: RD16CE model)
  // Country of origin uncertain - pattern-based dating only
  const csMatch = cleaned.match(/^CS(\d{2})(\d{2})(\d+)$/);
  if (csMatch) {
    const [, yearDigits, monthDigits, sequence] = csMatch;
    const year = 2000 + parseInt(yearDigits, 10);
    const monthNum = parseInt(monthDigits, 10);
    const validMonth = monthNum >= 1 && monthNum <= 12 ? monthNum : null;
    
    const monthNote = validMonth 
      ? `${getMonthName(validMonth)} ${year}, unit #${sequence}`
      : `${year}, unit #${monthDigits}${sequence}`;
    
    return {
      format: "modern",
      estimatedYear: year,
      estimatedMonth: validMonth,
      yearRange: `${year}`,
      confidence: "medium",
      country: "Unknown",
      notes: `CS-prefix serial: 2010s production, ${monthNote}. Country of manufacture not confirmed for this prefix.`,
      isYairi: false,
      needsEmperorCode: false,
      prefix: "CS",
    };
  }
  
  // CD-prefix: Mid-2000s production (country unknown)
  // CD + 2-digit year + 2-digit month + sequence
  // Example: CD05069348 = 2005, June, unit 9348 (verified: RD-20SCLH model)
  const cdMatch = cleaned.match(/^CD(\d{2})(\d{2})(\d+)$/);
  if (cdMatch) {
    const [, yearDigits, monthDigits, sequence] = cdMatch;
    const year = 2000 + parseInt(yearDigits, 10);
    const monthNum = parseInt(monthDigits, 10);
    const validMonth = monthNum >= 1 && monthNum <= 12 ? monthNum : null;
    
    const monthNote = validMonth 
      ? `${getMonthName(validMonth)} ${year}, unit #${sequence}`
      : `${year}, unit #${monthDigits}${sequence}`;
    
    return {
      format: "modern",
      estimatedYear: year,
      estimatedMonth: validMonth,
      yearRange: `${year}`,
      confidence: "medium",
      country: "Unknown",
      notes: `CD-prefix serial: Mid-2000s production, likely ${monthNote}. Country of manufacture not confirmed for this prefix.`,
      isYairi: false,
      needsEmperorCode: false,
      prefix: "CD",
    };
  }
  
  // F-prefix: 2000s era, F + 1-3 digit year indicator + sequence
  // Examples: F204, F305120169
  const fMatch = cleaned.match(/^F(\d{1,3})(\d*)$/);
  if (fMatch) {
    const [, yearIndicator] = fMatch;
    let estimatedYear: number | null = null;
    let yearRange = "Early-mid 2000s";
    
    // F2xx or F3xx patterns seem to indicate early-mid 2000s
    const firstDigit = parseInt(yearIndicator[0], 10);
    if (firstDigit === 2 || firstDigit === 3) {
      estimatedYear = 2000 + firstDigit;
      yearRange = `${2002}-${2008}`;
    }
    
    return {
      format: "modern",
      estimatedYear,
      estimatedMonth: null,
      yearRange,
      confidence: "medium",
      country: "China/Korea",
      notes: "F-prefix serial: Early-mid 2000s production",
      isYairi: false,
      needsEmperorCode: false,
      prefix: "F",
    };
  }
  
  // S-prefix: 1990s, S + 2-digit year + sequence
  // Examples: S98, S99050225 = 1998, 1999
  const sMatch = cleaned.match(/^S(\d{2})(\d*)$/);
  if (sMatch) {
    const [, yearDigits] = sMatch;
    const yearNum = parseInt(yearDigits, 10);
    let estimatedYear: number | null = null;
    
    if (yearNum >= 90 && yearNum <= 99) {
      estimatedYear = 1900 + yearNum;
    } else if (yearNum >= 0 && yearNum <= 10) {
      // Could be early 2000s
      estimatedYear = 2000 + yearNum;
    }
    
    return {
      format: "modern",
      estimatedYear,
      estimatedMonth: null,
      yearRange: estimatedYear ? `${estimatedYear}` : "1990s",
      confidence: "medium",
      country: "Korea/China",
      notes: estimatedYear 
        ? `S-prefix serial: Likely ${estimatedYear}` 
        : "S-prefix serial: Likely 1990s production",
      isYairi: false,
      needsEmperorCode: false,
      prefix: "S",
    };
  }
  
  // FC-prefix: Fusion/discontinued models (newly documented April 2026)
  // Examples: FC090302 (FDT243CCSBU), FC070900233 (FD60CSBU)
  const fcMatch = cleaned.match(/^FC(\d{2})(\d*)$/);
  if (fcMatch) {
    const [, yearIndicator] = fcMatch;
    const yearNum = parseInt(yearIndicator, 10);
    let estimatedYear: number | null = null;
    if (yearNum >= 0 && yearNum <= 25) {
      estimatedYear = 2000 + yearNum;
    }
    
    return {
      format: "modern",
      estimatedYear,
      estimatedMonth: null,
      yearRange: estimatedYear ? `~${estimatedYear}` : "2000s-2010s",
      confidence: "low",
      country: "Unknown",
      notes: `FC-prefix serial: Likely discontinued Fusion/specialty model.${estimatedYear ? ` Estimated ~${estimatedYear} based on prefix digits.` : ''} Limited data available for this prefix.`,
      isYairi: false,
      needsEmperorCode: false,
      prefix: "FC",
    };
  }
  
  // G-prefix: Rare/undocumented prefix (newly documented April 2026)
  // Example: G0020838 (RD20CU)
  const gMatch = cleaned.match(/^G(\d{2})(\d*)$/);
  if (gMatch) {
    return {
      format: "modern",
      estimatedYear: null,
      estimatedMonth: null,
      yearRange: "1990s-2000s",
      confidence: "low",
      country: "Unknown",
      notes: "G-prefix serial: Rare prefix with limited documentation. Era and country of manufacture uncertain.",
      isYairi: false,
      needsEmperorCode: false,
      prefix: "G",
    };
  }
  
  // A-prefix: Vintage models
  // Example: A82246 (5054)
  const aMatch = cleaned.match(/^A(\d+)$/);
  if (aMatch) {
    return {
      format: "legacy",
      estimatedYear: null,
      estimatedMonth: null,
      yearRange: "1970s-1980s",
      confidence: "low",
      country: "Japan",
      notes: "A-prefix serial: Vintage Japanese-made. Check heelblock for Emperor code to determine exact year.",
      isYairi: false,
      needsEmperorCode: true,
      prefix: "A",
    };
  }
  
  // Nine-digit format: YYMMXXXXX
  // Example: 081201626 = 08 (2008), 12 (December), 01626 (unit)
  const nineDigitMatch = cleaned.match(/^(\d{2})(\d{2})(\d{5})$/);
  if (nineDigitMatch) {
    const [, yearDigits, monthDigits] = nineDigitMatch;
    const yearNum = parseInt(yearDigits, 10);
    const monthNum = parseInt(monthDigits, 10);
    
    let estimatedYear: number | null = null;
    if (yearNum >= 0 && yearNum <= 25) {
      estimatedYear = 2000 + yearNum;
    } else if (yearNum >= 80 && yearNum <= 99) {
      estimatedYear = 1900 + yearNum;
    }
    
    const validMonth = monthNum >= 1 && monthNum <= 12 ? monthNum : null;
    
    return {
      format: "nine_digit",
      estimatedYear,
      estimatedMonth: validMonth,
      yearRange: estimatedYear ? `${estimatedYear}` : "Unknown",
      confidence: "medium",
      country: "Unknown",
      notes: estimatedYear && validMonth
        ? `9-digit serial: Possibly ${getMonthName(validMonth)} ${estimatedYear}`
        : "9-digit serial format: Dating pattern uncertain",
      isYairi: false,
      needsEmperorCode: false,
      prefix: null,
    };
  }
  
  // Yairi format: 4-6 digit numeric serials (e.g., 5152, 75466, 510812)
  // Modern Yairis (72000+): Can estimate year from verified anchor points
  // Vintage Yairis (<72000): Check NECK BLOCK stamp for Emperor code
  // Korean 6-digit (600000+): Made in Korea, not Yairi
  const yairiMatch = cleaned.match(/^(\d{4,6})$/);
  if (yairiMatch) {
    const serialNum = parseInt(cleaned, 10);
    
    // 6-digit Korean serials (600000+): These are NOT Yairi
    if (serialNum >= 600000 && cleaned.length === 6) {
      return {
        format: "legacy",
        estimatedYear: null,
        estimatedMonth: null,
        yearRange: "1980s-1990s",
        confidence: "low",
        country: "Korea",
        notes: "6-digit serial in the 600,000+ range: Made in Korea (1980s-1990s). These were produced in Korean factories during Alvarez's transition period.",
        isYairi: false,
        needsEmperorCode: false,
        prefix: null,
      };
    }
    
    // Modern Yairi range (72000+, 2015-present): Can estimate year from serial
    if (serialNum >= 72000 && cleaned.length <= 5) {
      const yairiResult = parseModernYairiSerial(serialNum);
      return {
        format: "yairi",
        estimatedYear: yairiResult.year,
        estimatedMonth: null,
        yearRange: yairiResult.yearRange,
        confidence: yairiResult.confidence,
        country: "Japan",
        notes: yairiResult.notes,
        isYairi: true,
        needsEmperorCode: false,
        prefix: null,
      };
    }
    
    // Vintage Yairi range (<72000): Requires neck block verification
    if (serialNum < 72000 && cleaned.length <= 5) {
      return {
        format: "yairi",
        estimatedYear: null,
        estimatedMonth: null,
        yearRange: "1970-2014",
        confidence: "low",
        country: "Japan",
        notes: `Vintage Alvarez-Yairi serial #${cleaned}. Check neck block stamp inside guitar for production year. Neck block codes: Showa era (45-63 = 1970-1988), Heisei era (1-12 = 1989-2000), post-2000 (01-14 = 2001-2014). Example: stamp "56" = 1981, stamp "10" = 2010.`,
        isYairi: true,
        needsEmperorCode: true,
        prefix: null,
      };
    }
    
    // Other 6-digit numbers (under 600000) — legacy Japanese format
    if (cleaned.length === 6) {
      return {
        format: "legacy",
        estimatedYear: null,
        estimatedMonth: null,
        yearRange: "1980s",
        confidence: "low",
        country: "Japan",
        notes: "Vintage Alvarez serial number. Guitars from this era were made in several Japanese factories. Check neck block for Emperor date code if applicable.",
        isYairi: false,
        needsEmperorCode: true,
        prefix: null,
      };
    }
  }
  
  // Note: 6-digit numerics are now handled inside the yairiMatch block above
  // (Korean 600000+ and legacy Japanese sub-600000)
  
  // Other numeric formats
  const numericMatch = cleaned.match(/^\d+$/);
  if (numericMatch) {
    const num = parseInt(cleaned, 10);
    return {
      format: "legacy",
      estimatedYear: null,
      estimatedMonth: null,
      yearRange: num < 100000 ? "1960s-1980s" : "Unknown",
      confidence: "low",
      country: "Japan",
      notes: "This appears to be a vintage Alvarez. Many factory records from the 1970s-1990s were lost. Check neck block inside guitar for Emperor date code.",
      isYairi: false,
      needsEmperorCode: true,
      prefix: null,
    };
  }
  
  // Unknown format
  return {
    format: "unknown",
    estimatedYear: null,
    estimatedMonth: null,
    yearRange: "Unknown",
    confidence: "low",
    country: "Unknown",
    notes: "Serial number format not recognized. Please verify the serial number is entered correctly.",
    isYairi: false,
    needsEmperorCode: false,
    prefix: null,
  };
}

// Parse neck block Emperor code (for Yairi guitars)
// Showa era: 45-63 = 1970-1988
// Heisei era: 1-12 = 1989-2000
// Post-2000: 01-99 = 2001-2099 (last 2 digits of year)
export function parseNeckBlock(neckBlock: string): { year: number | null; possibleYears?: number[]; notes: string } {
  const cleaned = neckBlock.trim();
  
  // Tokenize: extract all numeric and alpha tokens from multi-part stamps
  // Handles: "0111 439", "9708439", "S 802075", "56", "07"
  const tokens = cleaned.toUpperCase().match(/[A-Z]+|\d+/g) ?? [];
  const numericTokens = tokens.filter(t => /^\d+$/.test(t));
  
  // If no numeric tokens at all, invalid
  if (numericTokens.length === 0) {
    return { year: null, notes: "No numeric data found in neck block stamp." };
  }
  
  // Strategy: try the first short numeric token (1-2 digits) as an Emperor code
  // For stamps like "0111 439" → tokens ["0111", "439"], try first 2 digits of "0111" = "01"
  // For stamps like "56" → tokens ["56"], direct Emperor lookup
  // For stamps like "S 802075" → tokens ["S", "802075"], try first 2 digits = "80"
  
  let candidateCode: number | null = null;
  
  // First pass: look for a standalone 1-2 digit token (classic Emperor code)
  for (const token of numericTokens) {
    if (token.length <= 2) {
      candidateCode = parseInt(token, 10);
      break;
    }
  }
  
  // Second pass: if no short token, try first 2 digits of the first numeric token
  // e.g., "0111" → 01, "9708439" → 97
  if (candidateCode === null && numericTokens.length > 0) {
    const first2 = numericTokens[0].substring(0, 2);
    candidateCode = parseInt(first2, 10);
  }
  
  if (candidateCode === null || isNaN(candidateCode)) {
    return { year: null, notes: "Could not extract date code from neck block stamp." };
  }
  
  const stampInfo = numericTokens.length > 1 
    ? ` (from stamp "${cleaned}", additional numbers: ${numericTokens.slice(1).join(', ')})` 
    : '';
  
  // Check Showa era first (45-63 = 1970-1988) - unambiguous
  if (candidateCode >= 45 && candidateCode <= 63) {
    const emperorYear = EMPEROR_CODE[candidateCode];
    return { 
      year: emperorYear, 
      notes: `Showa era code ${candidateCode} = ${emperorYear}${stampInfo}` 
    };
  }
  
  // Ambiguous range: 1-12 could be Heisei (1989-2000) OR post-2000 (2001-2012)
  if (candidateCode >= 1 && candidateCode <= 12) {
    const heiseiYear = EMPEROR_CODE[candidateCode]; // 1989-2000
    const modernYear = 2000 + candidateCode; // 2001-2012
    return { 
      year: null,
      possibleYears: [heiseiYear, modernYear],
      notes: `Ambiguous code ${candidateCode}: Could be ${heiseiYear} (Heisei era) or ${modernYear} (post-2000). Check model production dates and guitar features to determine era.${stampInfo}` 
    };
  }
  
  // Clear post-2000 codes (13-44 = 2013-2044)
  if (candidateCode >= 13 && candidateCode <= 44) {
    const year = 2000 + candidateCode;
    return { 
      year, 
      notes: `Post-2000 format: ${year}${stampInfo}` 
    };
  }
  
  // Codes 64-99: Not standard Emperor codes. Could be factory batch numbers.
  // Try interpreting as post-2000 if reasonable (e.g., 97 → 2097 is unlikely)
  if (candidateCode >= 64 && candidateCode <= 99) {
    return { 
      year: null, 
      notes: `Neck block code ${candidateCode} doesn't match known Emperor eras. May be a factory batch number.${stampInfo}` 
    };
  }
  
  // Fallback for multi-digit stamps
  if (cleaned.length >= 6) {
    return { 
      year: null, 
      notes: `Multi-digit neck block stamp "${cleaned}". May contain date information but format varies by factory.` 
    };
  }
  
  return { year: null, notes: `Neck block stamp "${cleaned}" not recognized. May be from a factory that used different numbering.` };
}
