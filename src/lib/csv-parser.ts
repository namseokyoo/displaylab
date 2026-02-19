/**
 * CSV Parser
 *
 * Based on ISCV file-parser.ts with Sentry removed.
 * Extended to support viewing angle CSV format.
 */

/** Generic parsed row */
export type ParsedRow = Record<string, number>;

/** Detect delimiter in a line of text */
function detectDelimiter(line: string): string {
  const delimiters = ['\t', ',', ';', ' '];

  for (const delimiter of delimiters) {
    const parts = line.split(delimiter).filter((p) => p.trim() !== '');
    if (parts.length >= 2) {
      const hasNumbers = parts.slice(0, 2).every((p) => !isNaN(parseFloat(p.trim())));
      if (hasNumbers) {
        return delimiter;
      }
    }
  }

  return '\t';
}

/** Check if a line is a header (contains non-numeric values) */
function isHeaderLine(line: string, delimiter: string): boolean {
  const parts = line.split(delimiter).filter((p) => p.trim() !== '');

  if (parts.length < 2) return true;

  return parts.slice(0, 2).some((p) => {
    const trimmed = p.trim();
    return isNaN(parseFloat(trimmed)) && trimmed !== '';
  });
}

/**
 * Parse CSV text into an array of objects with column headers as keys.
 * Auto-detects delimiter and header row.
 */
export function parseCSVText(content: string, expectedColumns?: string[]): ParsedRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#') && !line.startsWith('//'));

  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);

  let headers: string[] | null = null;
  const rows: ParsedRow[] = [];
  let headerChecked = false;

  for (const line of lines) {
    if (!headerChecked && isHeaderLine(line, delimiter)) {
      headers = line.split(delimiter).map((h) => h.trim());
      headerChecked = true;
      continue;
    }
    headerChecked = true;

    const parts = line.split(delimiter).filter((p) => p.trim() !== '');
    if (parts.length < 2) continue;

    const values = parts.map((p) => parseFloat(p.trim()));
    if (values.some((v) => isNaN(v))) continue;

    const row: ParsedRow = {};

    if (headers && headers.length >= values.length) {
      values.forEach((v, i) => {
        row[headers![i]] = v;
      });
    } else if (expectedColumns && expectedColumns.length >= values.length) {
      values.forEach((v, i) => {
        row[expectedColumns[i]] = v;
      });
    } else {
      values.forEach((v, i) => {
        row[`col${i}`] = v;
      });
    }

    rows.push(row);
  }

  return rows;
}

/**
 * Parse CSV file (File object from input or drag-drop)
 */
export async function parseCSVFile(
  file: File,
  expectedColumns?: string[],
): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        try {
          const rows = parseCSVText(content, expectedColumns);
          resolve(rows);
        } catch (error) {
          console.error('[csv-parser] Failed to parse file:', error);
          reject(new Error(`Failed to parse file: ${error}`));
        }
      } else {
        reject(new Error('Failed to read file content'));
      }
    };

    reader.onerror = () => {
      console.error('[csv-parser] Failed to read file');
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Validate parsed CSV data against expected columns
 */
export function validateCSVData(
  rows: ParsedRow[],
  requiredColumns: string[],
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (rows.length === 0) {
    errors.push('No data rows found');
    return { valid: false, errors, warnings };
  }

  if (rows.length < 3) {
    warnings.push('Very few data rows - results may be inaccurate');
  }

  const firstRow = rows[0];
  for (const col of requiredColumns) {
    if (!(col in firstRow)) {
      errors.push(`Missing required column: ${col}`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
