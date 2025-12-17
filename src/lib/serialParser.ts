// Alvarez Serial Number Parser
// Based on official Alvarez customer service documentation

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
  
  // CS-prefix: 2010s China, CS + 2-digit year + 2-digit month + sequence
  // Example: CS12071753 = 2012, July, unit 1753
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
      confidence: "high",
      country: "China",
      notes: `CS-prefix serial: Made in China, ${monthNote}.`,
      isYairi: false,
      needsEmperorCode: false,
      prefix: "CS",
    };
  }
  
  // CD-prefix: Mid-2000s, CD + 2-digit year + 2-digit month + sequence
  // Example: CD05069348 = 2005, June, unit 9348
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
      country: "China",
      notes: `CD-prefix serial: Likely ${monthNote}`,
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
  
  // Yairi format: 4-5+ digit number (e.g., 51708, 0908123)
  // Format: YYMM + sequence (first 2 = year code, next 2 = month)
  // Pre-2000s: Emperor code (e.g., 51 = Showa 51 = 1976)
  // Post-2000s: Last 2 digits of year (e.g., 09 = 2009)
  const yairiMatch = cleaned.match(/^(\d{2})(\d{2})(\d+)$/);
  if (yairiMatch) {
    const [, yearCode, monthCode, sequence] = yairiMatch;
    const yearNum = parseInt(yearCode, 10);
    const monthNum = parseInt(monthCode, 10);
    const validMonth = monthNum >= 1 && monthNum <= 12 ? monthNum : null;
    
    // Check if it's an Emperor code year (Showa 45-63 = 1970-1988)
    const emperorYear = EMPEROR_CODE[yearNum];
    
    if (emperorYear && yearNum >= 45) {
      // Definite Showa era Emperor code (45-63)
      return {
        format: "yairi",
        estimatedYear: emperorYear,
        estimatedMonth: validMonth,
        yearRange: `${emperorYear}`,
        confidence: "high",
        country: "Japan",
        notes: validMonth 
          ? `Alvarez-Yairi: Showa ${yearNum} (${emperorYear}), ${getMonthName(validMonth)}, unit #${sequence}`
          : `Alvarez-Yairi: Showa ${yearNum} (${emperorYear}), unit #${monthCode}${sequence}`,
        isYairi: true,
        needsEmperorCode: false,
        prefix: null,
      };
    }
    
    // Ambiguous range: 1-12 could be Heisei era (1989-2000) OR post-2000 (2001-2012)
    if (yearNum >= 1 && yearNum <= 12) {
      const heiseiYear = EMPEROR_CODE[yearNum]; // 1989-2000
      const modernYear = 2000 + yearNum; // 2001-2012
      
      return {
        format: "yairi",
        estimatedYear: null,
        estimatedMonth: validMonth,
        yearRange: `${heiseiYear} or ${modernYear}`,
        confidence: "low",
        country: "Japan",
        notes: validMonth
          ? `Alvarez-Yairi: Ambiguous year code ${yearCode}. Could be Heisei ${yearNum} (${heiseiYear}) or ${modernYear}. Month: ${getMonthName(validMonth)}, unit #${sequence}. Check model production dates to determine era.`
          : `Alvarez-Yairi: Ambiguous year code ${yearCode}. Could be Heisei ${yearNum} (${heiseiYear}) or ${modernYear}. Unit #${monthCode}${sequence}. Check model production dates.`,
        isYairi: true,
        needsEmperorCode: false,
        prefix: null,
      };
    }
    
    // Post-2000 clear years (13-25+ = 2013-2025+)
    if (yearNum >= 13 && yearNum <= 30) {
      const modernYear = 2000 + yearNum;
      return {
        format: "yairi",
        estimatedYear: modernYear,
        estimatedMonth: validMonth,
        yearRange: `${modernYear}`,
        confidence: "high",
        country: "Japan",
        notes: validMonth
          ? `Alvarez-Yairi: ${modernYear}, ${getMonthName(validMonth)}, unit #${sequence}`
          : `Alvarez-Yairi: ${modernYear}, unit #${monthCode}${sequence}`,
        isYairi: true,
        needsEmperorCode: false,
        prefix: null,
      };
    }
    
    // Other 2-digit year codes (could be late Showa 64 doesn't exist, or unknown)
    return {
      format: "yairi",
      estimatedYear: null,
      estimatedMonth: validMonth,
      yearRange: "Unknown",
      confidence: "low",
      country: "Japan",
      notes: `Alvarez-Yairi serial: Year code ${yearCode} not recognized. May need additional context or neck block inspection.`,
      isYairi: true,
      needsEmperorCode: true,
      prefix: null,
    };
  }
  
  // Short Yairi format (4 digits only, like 5108)
  const shortYairiMatch = cleaned.match(/^(\d{4})$/);
  if (shortYairiMatch) {
    const yearCode = cleaned.substring(0, 2);
    const monthCode = cleaned.substring(2, 4);
    const yearNum = parseInt(yearCode, 10);
    const monthNum = parseInt(monthCode, 10);
    const validMonth = monthNum >= 1 && monthNum <= 12 ? monthNum : null;
    
    const emperorYear = EMPEROR_CODE[yearNum];
    
    if (emperorYear && yearNum >= 45) {
      return {
        format: "yairi",
        estimatedYear: emperorYear,
        estimatedMonth: validMonth,
        yearRange: `${emperorYear}`,
        confidence: "high",
        country: "Japan",
        notes: validMonth 
          ? `Alvarez-Yairi: Showa ${yearNum} (${emperorYear}), ${getMonthName(validMonth)}`
          : `Alvarez-Yairi: Showa ${yearNum} (${emperorYear})`,
        isYairi: true,
        needsEmperorCode: false,
        prefix: null,
      };
    }
    
    if (yearNum >= 1 && yearNum <= 12) {
      const heiseiYear = EMPEROR_CODE[yearNum];
      const modernYear = 2000 + yearNum;
      return {
        format: "yairi",
        estimatedYear: null,
        estimatedMonth: validMonth,
        yearRange: `${heiseiYear} or ${modernYear}`,
        confidence: "low",
        country: "Japan",
        notes: `Alvarez-Yairi: Ambiguous year code. Could be Heisei ${yearNum} (${heiseiYear}) or ${modernYear}. Check model production dates.`,
        isYairi: true,
        needsEmperorCode: false,
        prefix: null,
      };
    }
    
    if (yearNum >= 13 && yearNum <= 30) {
      const modernYear = 2000 + yearNum;
      return {
        format: "yairi",
        estimatedYear: modernYear,
        estimatedMonth: validMonth,
        yearRange: `${modernYear}`,
        confidence: "high",
        country: "Japan",
        notes: validMonth
          ? `Alvarez-Yairi: ${modernYear}, ${getMonthName(validMonth)}`
          : `Alvarez-Yairi: ${modernYear}`,
        isYairi: true,
        needsEmperorCode: false,
        prefix: null,
      };
    }
  }
  
  // Legacy format: 6-digit numbers (1980s-1990s)
  const sixDigitMatch = cleaned.match(/^(\d{6})$/);
  if (sixDigitMatch) {
    const num = parseInt(cleaned, 10);
    return {
      format: "legacy",
      estimatedYear: null,
      estimatedMonth: null,
      yearRange: num < 500000 ? "1980s" : "1980s-1990s",
      confidence: "low",
      country: "Japan",
      notes: "Vintage Alvarez serial number. Guitars from this era were made in several Japanese factories. Check neck block for Emperor date code if applicable.",
      isYairi: false,
      needsEmperorCode: true,
      prefix: null,
    };
  }
  
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

// Parse neck block Emperor code
export function parseNeckBlock(neckBlock: string): { year: number | null; notes: string } {
  const cleaned = neckBlock.trim();
  const num = parseInt(cleaned, 10);
  
  if (isNaN(num)) {
    return { year: null, notes: "Invalid neck block number format." };
  }
  
  // Check Emperor code chart first (Showa 45-63, Heisei 1-12)
  const emperorYear = getEmperorYear(num);
  if (emperorYear) {
    const era = num >= 45 ? "Showa" : "Heisei";
    return { 
      year: emperorYear, 
      notes: `Emperor code ${num} (${era} era) = ${emperorYear}` 
    };
  }
  
  // After 2000: last two digits of year (e.g., 09 = 2009)
  // Note: Post-2000 format ended Emperor coding system
  if (num >= 13 && num <= 25) {
    const year = 2000 + num;
    return { 
      year, 
      notes: `Post-2000 format: ${year}` 
    };
  }
  
  // Ambiguous codes (1-12 could be Heisei era OR post-2000)
  // Document notes: "Around 1999, '09' could mean 1997 (9th year Heisei) OR 2009"
  if (num >= 1 && num <= 12) {
    const heiseiYear = EMPEROR_CODE[num];
    const modernYear = 2000 + num;
    return { 
      year: null, 
      notes: `Ambiguous: Could be ${heiseiYear} (Heisei era Emperor code) or ${modernYear} (post-2000 format). Check model production dates to determine which era.` 
    };
  }
  
  // Six-digit neck block stamps (e.g., 230130 from AC40SC)
  // May indicate manufacturing date but format varies
  if (cleaned.length === 6) {
    return { 
      year: null, 
      notes: `6-digit neck block stamp. May contain date information but format varies by factory.` 
    };
  }
  
  return { year: null, notes: "Neck block number not found in Emperor code chart. May be from a factory that used different numbering." };
}
