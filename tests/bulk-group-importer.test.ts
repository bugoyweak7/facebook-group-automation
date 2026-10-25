import { describe, it, expect } from 'vitest';
import {
  parseBulkGroupText,
  extractGroupInfoFromLine,
  formatDefaultGroupName,
  exportGroupsToJson,
  SAMPLE_10_GROUPS_TEXT,
  SAMPLE_20_GROUPS_TEXT,
} from '../src/services/groups/bulk-group-importer';
import { Group } from '../src/types/group';

describe('Bulk Group Importer Service', () => {
  it('formats group names cleanly from slug or ID', () => {
    expect(formatDefaultGroupName('dhaka_buy_sell')).toBe('Dhaka Buy Sell');
    expect(formatDefaultGroupName('bangladesh-online-market')).toBe('Bangladesh Online Market');
    expect(formatDefaultGroupName('1234567890')).toBe('Facebook Group (1234567890)');
  });

  it('extracts info from various line formats', () => {
    // 1. Plain URL
    const res1 = extractGroupInfoFromLine('https://www.facebook.com/groups/dhakasellers');
    expect(res1?.url).toBe('https://www.facebook.com/groups/dhakasellers');
    expect(res1?.name).toBe('');

    // 2. Name, URL
    const res2 = extractGroupInfoFromLine('Dhaka Market, https://www.facebook.com/groups/dhakasellers');
    expect(res2?.url).toBe('https://www.facebook.com/groups/dhakasellers');
    expect(res2?.name).toBe('Dhaka Market');

    // 3. Numbered Name - URL
    const res3 = extractGroupInfoFromLine('1. BD Traders - https://facebook.com/groups/bdtraders/');
    expect(res3?.url).toBe('https://facebook.com/groups/bdtraders/');
    expect(res3?.name).toBe('BD Traders');

    // 4. Pipe separated
    const res4 = extractGroupInfoFromLine('Sylhet Hub | https://web.facebook.com/groups/sylhethub');
    expect(res4?.url).toBe('https://web.facebook.com/groups/sylhethub');
    expect(res4?.name).toBe('Sylhet Hub');
  });

  it('correctly parses 10 sample groups at once', () => {
    const summary = parseBulkGroupText(SAMPLE_10_GROUPS_TEXT, [], 'Buy & Sell', 'PUBLIC', true);

    expect(summary.totalLines).toBe(10);
    expect(summary.validItems.length).toBe(10);
    expect(summary.duplicateItems.length).toBe(0);
    expect(summary.invalidItems.length).toBe(0);
    expect(summary.groupsToCreate.length).toBe(10);

    expect(summary.groupsToCreate[0].name).toBe('Dhaka Buy & Sell Market');
    expect(summary.groupsToCreate[0].category).toBe('Buy & Sell');
    expect(summary.groupsToCreate[0].selected).toBe(true);
    expect(summary.groupsToCreate[0].status).toBe('READY');
  });

  it('correctly parses 20 sample groups at once', () => {
    const summary = parseBulkGroupText(SAMPLE_20_GROUPS_TEXT, [], 'Marketing', 'PUBLIC', true);

    expect(summary.totalLines).toBe(20);
    expect(summary.validItems.length).toBe(20);
    expect(summary.duplicateItems.length).toBe(0);
    expect(summary.groupsToCreate.length).toBe(20);
  });

  it('detects existing duplicates and batch duplicates', () => {
    const existing: Group[] = [
      {
        id: 'grp_1',
        name: 'Existing Group',
        url: 'https://www.facebook.com/groups/dhakabuysellmarket/',
        groupId: 'dhakabuysellmarket',
        enabled: true,
        status: 'READY',
        postCount: 0,
        createdAt: 1000,
        updatedAt: 1000,
      },
    ];

    const inputWithDups = [
      'https://www.facebook.com/groups/dhakabuysellmarket', // Existing duplicate
      'https://www.facebook.com/groups/newgroup1',         // Valid 1
      'https://www.facebook.com/groups/newgroup1',         // Batch duplicate
      'https://www.facebook.com/groups/newgroup2',         // Valid 2
    ].join('\n');

    const summary = parseBulkGroupText(inputWithDups, existing);

    expect(summary.validItems.length).toBe(2);
    expect(summary.duplicateItems.length).toBe(2);
    expect(summary.groupsToCreate.length).toBe(2);
    expect(summary.groupsToCreate.map(g => g.name)).toEqual(['Newgroup1', 'Newgroup2']);
  });

  it('filters out invalid lines with informative errors', () => {
    const inputWithInvalid = [
      'https://google.com/search',
      'just random words with no link',
      'https://www.facebook.com/groups/validgroup1',
    ].join('\n');

    const summary = parseBulkGroupText(inputWithInvalid);

    expect(summary.validItems.length).toBe(1);
    expect(summary.invalidItems.length).toBe(2);
  });

  it('exports groups to JSON and imports them accurately on another device', () => {
    const mockGroups: Group[] = [
      {
        id: 'grp_test1',
        name: 'Device 1 Group A',
        url: 'https://www.facebook.com/groups/device1groupa/',
        groupId: 'device1groupa',
        category: 'Electronics',
        privacy: 'PUBLIC',
        notes: 'Great wholesale deals',
        enabled: true,
        selected: true,
        status: 'READY',
        postCount: 0,
        createdAt: 1000,
        updatedAt: 1000,
      },
      {
        id: 'grp_test2',
        name: 'Device 1 Group B',
        url: 'https://www.facebook.com/groups/device1groupb/',
        groupId: 'device1groupb',
        category: 'Fashion',
        privacy: 'PRIVATE',
        enabled: true,
        selected: true,
        status: 'READY',
        postCount: 0,
        createdAt: 2000,
        updatedAt: 2000,
      },
    ];

    // 1. Export to JSON
    const exportedJson = exportGroupsToJson(mockGroups, 'My Main Account');
    expect(exportedJson).toContain('device1groupa');
    expect(exportedJson).toContain('Device 1 Group A');
    expect(exportedJson).toContain('Electronics');

    // 2. Import this JSON into another device's extension (with empty or different groups)
    const importedSummary = parseBulkGroupText(exportedJson, []);

    expect(importedSummary.validItems.length).toBe(2);
    expect(importedSummary.groupsToCreate.length).toBe(2);
    expect(importedSummary.groupsToCreate[0].name).toBe('Device 1 Group A');
    expect(importedSummary.groupsToCreate[0].category).toBe('Electronics');
    expect(importedSummary.groupsToCreate[0].notes).toBe('Great wholesale deals');
    expect(importedSummary.groupsToCreate[1].privacy).toBe('PRIVATE');
  });

  it('supports direct JSON array paste', () => {
    const rawJsonArray = JSON.stringify([
      { name: 'Raw Array Group 1', url: 'https://facebook.com/groups/rawarray1' },
      { name: 'Raw Array Group 2', url: 'https://facebook.com/groups/rawarray2', category: 'Clothing' },
    ]);

    const summary = parseBulkGroupText(rawJsonArray, []);
    expect(summary.validItems.length).toBe(2);
    expect(summary.groupsToCreate[0].name).toBe('Raw Array Group 1');
    expect(summary.groupsToCreate[1].category).toBe('Clothing');
  });

  it('correctly parses user screenshot malformed JSON snippet with leading comma and groupId only', () => {
    const userScreenshotSnippet = `
,
    "groupId": "274906757200196",
    "category": "Auto Joined",
    "privacy": "PUBLIC"
  }
]
}
`;
    const summary = parseBulkGroupText(userScreenshotSnippet, [], 'Imported');

    expect(summary.validItems.length).toBe(1);
    expect(summary.groupsToCreate.length).toBe(1);
    expect(summary.groupsToCreate[0].groupId).toBe('274906757200196');
    expect(summary.groupsToCreate[0].url).toBe('https://www.facebook.com/groups/274906757200196/');
    expect(summary.groupsToCreate[0].category).toBe('Auto Joined');
    expect(summary.groupsToCreate[0].privacy).toBe('PUBLIC');
    expect(summary.groupsToCreate[0].selected).toBe(true);
  });

  it('correctly parses bare numeric Facebook Group IDs line by line', () => {
    const numericLines = `
274906757200196
987654321012345
Dhaka Tech Group, 112233445566778
`;
    const summary = parseBulkGroupText(numericLines, []);

    expect(summary.validItems.length).toBe(3);
    expect(summary.groupsToCreate.length).toBe(3);
    expect(summary.groupsToCreate[0].groupId).toBe('274906757200196');
    expect(summary.groupsToCreate[1].groupId).toBe('987654321012345');
    expect(summary.groupsToCreate[2].groupId).toBe('112233445566778');
    expect(summary.groupsToCreate[2].name).toBe('Dhaka Tech Group');
  });

  it('correctly parses multiple fragmented objects missing outer array brackets', () => {
    const fragments = `
,
    "groupId": "1111111111",
    "name": "Group One",
    "category": "Sales"
  },
  {
    "groupId": "2222222222",
    "name": "Group Two",
    "category": "Fashion"
  }
`;
    const summary = parseBulkGroupText(fragments, []);

    expect(summary.validItems.length).toBe(2);
    expect(summary.groupsToCreate[0].groupId).toBe('1111111111');
    expect(summary.groupsToCreate[0].name).toBe('Group One');
    expect(summary.groupsToCreate[1].groupId).toBe('2222222222');
    expect(summary.groupsToCreate[1].name).toBe('Group Two');
  });
});

