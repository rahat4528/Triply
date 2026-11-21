/**
 * Robust CSV Spatial Ingestion Engine
 * Delimiter auto-detection, UTF-8 BOM stripping, coordinate inference, and row validation.
 */

export interface InferredColumn {
  name: string;
  type: 'STRING' | 'FLOAT' | 'INTEGER' | 'BOOLEAN' | 'TIMESTAMP';
  isLatitude: boolean;
  isLongitude: boolean;
  sampleValues: string[];
}

export interface CSVParseRowIssue {
  rowIndex: number;
  column?: string;
  reason: string;
}

export interface CSVParseResult {
  delimiter: string;
  hasBOM: boolean;
  columns: InferredColumn[];
  latitudeColumn?: string;
  longitudeColumn?: string;
  validRowsCount: number;
  invalidRowsCount: number;
  issues: CSVParseRowIssue[];
  rows: Record<string, any>[];
}

export function detectDelimiter(headerLine: string): string {
  const delimiters = [',', '\t', ';', '|'];
  let maxCount = 0;
  let bestDelimiter = ',';

  for (const d of delimiters) {
    const count = (headerLine.match(new RegExp(`\\${d}`, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = d;
    }
  }

  return bestDelimiter;
}

export function stripBOM(content: string): { text: string; hasBOM: boolean } {
  if (content.charCodeAt(0) === 0xfeff) {
    return { text: content.slice(1), hasBOM: true };
  }
  return { text: content, hasBOM: false };
}

export function inferType(values: string[]): 'STRING' | 'FLOAT' | 'INTEGER' | 'BOOLEAN' | 'TIMESTAMP' {
  const nonEmpty = values.filter((v) => v !== '' && v != null);
  if (nonEmpty.length === 0) return 'STRING';

  const isInt = nonEmpty.every((v) => /^-?\d+$/.test(v.trim()));
  if (isInt) return 'INTEGER';

  const isFloat = nonEmpty.every((v) => /^-?\d+(\.\d+)?$/.test(v.trim()));
  if (isFloat) return 'FLOAT';

  const isBool = nonEmpty.every((v) => ['true', 'false', '0', '1', 'yes', 'no'].includes(v.trim().toLowerCase()));
  if (isBool) return 'BOOLEAN';

  const isDate = nonEmpty.every((v) => !Number.isNaN(Date.parse(v)) && (v.includes('-') || v.includes('/')));
  if (isDate) return 'TIMESTAMP';

  return 'STRING';
}

export function parseCSV(rawContent: string): CSVParseResult {
  const { text, hasBOM } = stripBOM(rawContent);
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    throw new Error('CSV file is empty.');
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''));

  // Detect coordinate headers
  const latRegex = /^(lat|latitude|y|coord_y)$/i;
  const lonRegex = /^(lon|lng|longitude|x|coord_x)$/i;

  let latCol: string | undefined;
  let lonCol: string | undefined;

  headers.forEach((h) => {
    if (!latCol && latRegex.test(h)) latCol = h;
    if (!lonCol && lonRegex.test(h)) lonCol = h;
  });

  const parsedRows: Record<string, any>[] = [];
  const issues: CSVParseRowIssue[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));

    if (rawCols.length !== headers.length) {
      issues.push({
        rowIndex: i + 1,
        reason: `Column count mismatch (expected ${headers.length}, found ${rawCols.length})`,
      });
      continue;
    }

    const rowObj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = rawCols[idx];
    });

    // Validate coordinates if detected
    if (latCol && lonCol) {
      const latVal = parseFloat(rowObj[latCol]);
      const lonVal = parseFloat(rowObj[lonCol]);

      if (Number.isNaN(latVal) || Number.isNaN(lonVal)) {
        issues.push({
          rowIndex: i + 1,
          reason: 'Non-numeric coordinate values detected.',
        });
        continue;
      }

      if (latVal < -90 || latVal > 90) {
        const potentialSwap = lonVal >= -90 && lonVal <= 90;
        issues.push({
          rowIndex: i + 1,
          column: latCol,
          reason: `Latitude ${latVal} out of WGS84 bounds [-90, 90].${potentialSwap ? ' Coordinates appear swapped.' : ''}`,
        });
        continue;
      }

      if (lonVal < -180 || lonVal > 180) {
        issues.push({
          rowIndex: i + 1,
          column: lonCol,
          reason: `Longitude ${lonVal} out of bounds [-180, 180].`,
        });
        continue;
      }

      rowObj._lat = latVal;
      rowObj._lon = lonVal;
    }

    parsedRows.push(rowObj);
  }

  // Infer column types from valid rows
  const inferredColumns: InferredColumn[] = headers.map((h) => {
    const sampleValues = parsedRows.slice(0, 10).map((r) => r[h]);
    return {
      name: h,
      type: inferType(sampleValues),
      isLatitude: h === latCol,
      isLongitude: h === lonCol,
      sampleValues,
    };
  });

  return {
    delimiter,
    hasBOM,
    columns: inferredColumns,
    latitudeColumn: latCol,
    longitudeColumn: lonCol,
    validRowsCount: parsedRows.length,
    invalidRowsCount: issues.length,
    issues,
    rows: parsedRows,
  };
}
