import { Group, GroupImportRow } from '../../types/group';
import { HistoryRecord } from '../../types/history';
import { detectDuplicateGroup, validateFacebookGroupUrl } from '../../utils/validators';

export interface CsvImportSummary {
  totalRows: number;
  validRows: GroupImportRow[];
  invalidRows: { rowNumber: number; rawRow: Record<string, string>; errors: string[] }[];
  duplicateRows: { rowNumber: number; row: GroupImportRow; reason: string }[];
}

/**
 * Robust CSV line tokenizer that handles quotes, commas, and newlines within fields.
 */
export function parseCsvText(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        if (currentRow.some(f => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some(f => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses and validates CSV string for Facebook Groups.
 */
export function parseGroupsCsv(csvText: string, existingGroups: Group[] = []): CsvImportSummary {
  const parsedGrid = parseCsvText(csvText);

  if (parsedGrid.length === 0) {
    return {
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      duplicateRows: [],
    };
  }

  // Header detection
  const rawHeaders = parsedGrid[0].map(h => h.toLowerCase().replace(/[\s_-]+/g, ''));
  const headerMap: Record<string, number> = {};

  rawHeaders.forEach((h, idx) => {
    if (h.includes('name') || h.includes('groupname') || h.includes('title')) headerMap['name'] = idx;
    else if (h.includes('url') || h.includes('link') || h.includes('groupurl')) headerMap['url'] = idx;
    else if (h.includes('category') || h.includes('cat') || h.includes('type')) headerMap['category'] = idx;
    else if (h.includes('location') || h.includes('city') || h.includes('area')) headerMap['location'] = idx;
    else if (h.includes('note') || h.includes('description') || h.includes('remark')) headerMap['notes'] = idx;
  });

  // If no name or url header found, fallback to positional [name, url, category, location, notes]
  const hasHeaders = headerMap['name'] !== undefined || headerMap['url'] !== undefined;
  const startIndex = hasHeaders ? 1 : 0;

  const validRows: GroupImportRow[] = [];
  const invalidRows: { rowNumber: number; rawRow: Record<string, string>; errors: string[] }[] = [];
  const duplicateRows: { rowNumber: number; row: GroupImportRow; reason: string }[] = [];

  const seenInBatch = new Set<string>();

  for (let i = startIndex; i < parsedGrid.length; i++) {
    const row = parsedGrid[i];
    const rowNum = i + 1;

    const name = hasHeaders
      ? (row[headerMap['name']] || '')
      : (row[0] || '');
    const url = hasHeaders
      ? (row[headerMap['url']] || '')
      : (row[1] || '');
    const category = hasHeaders
      ? (row[headerMap['category']] || 'General')
      : (row[2] || 'General');
    const location = hasHeaders
      ? (row[headerMap['location']] || '')
      : (row[3] || '');
    const notes = hasHeaders
      ? (row[headerMap['notes']] || '')
      : (row[4] || '');

    const rawObj: Record<string, string> = { name, url, category, location, notes };
    const rowErrors: string[] = [];

    if (!name.trim()) {
      rowErrors.push('Group Name is required');
    }

    if (!url.trim()) {
      rowErrors.push('Group URL is required');
    } else {
      const urlCheck = validateFacebookGroupUrl(url);
      if (!urlCheck.valid) {
        rowErrors.push(...urlCheck.errors);
      }
    }

    if (rowErrors.length > 0) {
      invalidRows.push({ rowNumber: rowNum, rawRow: rawObj, errors: rowErrors });
      continue;
    }

    const groupRow: GroupImportRow = {
      name: name.trim(),
      url: url.trim(),
      category: category.trim() || 'General',
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    // Duplicate check in batch
    const urlCheck = validateFacebookGroupUrl(groupRow.url);
    const normalizedKey = urlCheck.cleanUrl || groupRow.url.toLowerCase();

    if (seenInBatch.has(normalizedKey)) {
      duplicateRows.push({ rowNumber: rowNum, row: groupRow, reason: 'Duplicate URL within this CSV file' });
      continue;
    }
    seenInBatch.add(normalizedKey);

    // Duplicate check in existing groups
    if (detectDuplicateGroup(groupRow.url, existingGroups)) {
      duplicateRows.push({ rowNumber: rowNum, row: groupRow, reason: 'Group URL already exists in saved groups' });
      continue;
    }

    validRows.push(groupRow);
  }

  return {
    totalRows: parsedGrid.length - startIndex,
    validRows,
    invalidRows,
    duplicateRows,
  };
}

/**
 * Escapes a string for CSV format.
 */
function escapeCsvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Exports groups array to formatted CSV string.
 */
export function exportGroupsToCsv(groups: Group[]): string {
  const headers = ['name', 'url', 'category', 'location', 'notes', 'status', 'postCount', 'lastPostedAt'];
  const rows = groups.map(g => [
    escapeCsvCell(g.name),
    escapeCsvCell(g.url),
    escapeCsvCell(g.category),
    escapeCsvCell(g.location || ''),
    escapeCsvCell(g.notes || ''),
    escapeCsvCell(g.status),
    escapeCsvCell(g.postCount),
    escapeCsvCell(g.lastPostedAt ? new Date(g.lastPostedAt).toISOString() : ''),
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Exports history array to formatted CSV string.
 */
export function exportHistoryToCsv(history: HistoryRecord[]): string {
  const headers = ['date', 'status', 'groupName', 'groupUrl', 'productName', 'postTitle', 'notes'];
  const rows = history.map(h => [
    escapeCsvCell(new Date(h.postedAt).toLocaleString()),
    escapeCsvCell(h.status),
    escapeCsvCell(h.groupName),
    escapeCsvCell(h.groupUrl),
    escapeCsvCell(h.productName),
    escapeCsvCell(h.postTitle),
    escapeCsvCell(h.notes || ''),
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
