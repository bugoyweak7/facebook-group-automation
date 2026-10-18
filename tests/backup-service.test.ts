import { describe, it, expect } from 'vitest';
import { inspectBackupJson } from '../src/services/backup/backup-service';

describe('Backup and Restore Service', () => {
  it('inspects valid backup JSON and parses previews', () => {
    const backupObj = {
      version: '1.0.0',
      exportedAt: 1700000000000,
      groups: [{ id: 'g1', name: 'Group 1', url: 'https://www.facebook.com/groups/g1' }],
      posts: [{ id: 'p1', title: 'Post 1', productName: 'Item 1' }],
      templates: [{ id: 't1', name: 'Tpl 1', content: '{product_name}' }],
      queue: [],
      history: [],
      settings: {},
    };

    const { preview, parsed, error } = inspectBackupJson(JSON.stringify(backupObj));
    expect(error).toBeUndefined();
    expect(preview).not.toBeNull();
    expect(preview?.groupCount).toBe(1);
    expect(preview?.postCount).toBe(1);
    expect(preview?.templateCount).toBe(1);
    expect(parsed).not.toBeNull();
  });

  it('rejects malformed JSON strings', () => {
    const { preview, parsed, error } = inspectBackupJson('invalid json string');
    expect(preview).toBeNull();
    expect(parsed).toBeNull();
    expect(error).toContain('Invalid JSON format');
  });

  it('rejects JSON missing essential data arrays', () => {
    const invalidSchema = {
      version: '1.0.0',
      groups: 'not an array',
    };

    const { preview, error } = inspectBackupJson(JSON.stringify(invalidSchema));
    expect(preview).toBeNull();
    expect(error).toContain('Missing or invalid "groups" array');
  });
});
