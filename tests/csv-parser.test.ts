import { describe, it, expect } from 'vitest';
import { parseGroupsCsv, exportGroupsToCsv, parseCsvText } from '../src/services/csv/csv-parser';
import { Group } from '../src/types/group';

describe('CSV Parser and Exporter', () => {
  it('parses raw CSV text with quotes and commas', () => {
    const raw = `name,url\n"Dhaka, Bikes","https://www.facebook.com/groups/dhaka.bikes"`;
    const rows = parseCsvText(raw);
    expect(rows.length).toBe(2);
    expect(rows[1][0]).toBe('Dhaka, Bikes');
    expect(rows[1][1]).toBe('https://www.facebook.com/groups/dhaka.bikes');
  });

  it('validates CSV rows and detects invalid rows', () => {
    const csvData = `name,url,category,location\n` +
      `Chattogram Bikes,https://www.facebook.com/groups/ctg.bikes,Vehicles,Chattogram\n` +
      `Invalid Group,https://google.com/search,General,Dhaka\n` +
      `,https://www.facebook.com/groups/nameless,General,Sylhet`;

    const result = parseGroupsCsv(csvData, []);
    expect(result.validRows.length).toBe(1);
    expect(result.validRows[0].name).toBe('Chattogram Bikes');
    expect(result.invalidRows.length).toBe(2); // One bad domain, one missing name
  });

  it('detects duplicate groups in batch and against existing groups', () => {
    const existing: Group[] = [
      {
        id: 'g1',
        name: 'Dhaka Market',
        url: 'https://www.facebook.com/groups/dhaka.market/',
        category: 'General',
        enabled: true,
        status: 'READY',
        postCount: 0,
        createdAt: 1000,
        updatedAt: 1000,
      },
    ];

    const csvData = `name,url\n` +
      `Dhaka Duplicate,https://www.facebook.com/groups/dhaka.market\n` +
      `New Group,https://www.facebook.com/groups/new.group\n` +
      `New Group Repeat,https://www.facebook.com/groups/new.group`;

    const result = parseGroupsCsv(csvData, existing);
    expect(result.validRows.length).toBe(1);
    expect(result.validRows[0].name).toBe('New Group');
    expect(result.duplicateRows.length).toBe(2); // 1 duplicate from existing, 1 internal repeat
  });

  it('exports groups array to valid CSV string', () => {
    const groups: Group[] = [
      {
        id: 'g1',
        name: 'Sylhet Tech',
        url: 'https://www.facebook.com/groups/sylhet.tech',
        category: 'Electronics',
        location: 'Sylhet',
        notes: 'Strict rules',
        enabled: true,
        status: 'READY',
        postCount: 5,
        lastPostedAt: 1700000000000,
        createdAt: 1000,
        updatedAt: 1000,
      },
    ];

    const csv = exportGroupsToCsv(groups);
    expect(csv).toContain('Sylhet Tech');
    expect(csv).toContain('https://www.facebook.com/groups/sylhet.tech');
    expect(csv).toContain('Electronics');
  });
});
