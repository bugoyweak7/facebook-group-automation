import { describe, it, expect } from 'vitest';
import {
  validateFacebookGroupUrl,
  detectDuplicateGroup,
  validatePost,
  validateBackupData,
} from '../src/utils/validators';
import { Group } from '../src/types/group';

describe('Validators', () => {
  describe('validateFacebookGroupUrl', () => {
    it('accepts standard facebook group URLs and extracts slug', () => {
      const result = validateFacebookGroupUrl('https://www.facebook.com/groups/dhaka.bikes');
      expect(result.valid).toBe(true);
      expect(result.groupId).toBe('dhaka.bikes');
      expect(result.cleanUrl).toBe('https://www.facebook.com/groups/dhaka.bikes/');
    });

    it('accepts numeric group ID URLs', () => {
      const result = validateFacebookGroupUrl('https://facebook.com/groups/123456789012345/');
      expect(result.valid).toBe(true);
      expect(result.groupId).toBe('123456789012345');
    });

    it('accepts web.facebook.com and m.facebook.com subdomains', () => {
      const webResult = validateFacebookGroupUrl('https://web.facebook.com/groups/chattogram.deals');
      expect(webResult.valid).toBe(true);

      const mResult = validateFacebookGroupUrl('https://m.facebook.com/groups/sylhet.market');
      expect(mResult.valid).toBe(true);
    });

    it('rejects non-facebook URLs', () => {
      const result = validateFacebookGroupUrl('https://twitter.com/groups/123');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Facebook domain');
    });

    it('rejects general feed/discover pages', () => {
      const result = validateFacebookGroupUrl('https://www.facebook.com/groups/feed');
      expect(result.valid).toBe(false);
    });

    it('rejects empty or invalid URLs', () => {
      expect(validateFacebookGroupUrl('').valid).toBe(false);
      expect(validateFacebookGroupUrl('not a url').valid).toBe(false);
    });
  });

  describe('detectDuplicateGroup', () => {
    const existingGroups: Group[] = [
      {
        id: 'g1',
        name: 'Dhaka Bikes',
        url: 'https://www.facebook.com/groups/dhaka.bikes/',
        groupId: 'dhaka.bikes',
        category: 'Vehicles',
        enabled: true,
        status: 'READY',
        postCount: 0,
        createdAt: 1000,
        updatedAt: 1000,
      },
    ];

    it('identifies exact URL duplicates', () => {
      expect(detectDuplicateGroup('https://www.facebook.com/groups/dhaka.bikes/', existingGroups)).toBe(true);
    });

    it('identifies canonical variations as duplicates', () => {
      expect(detectDuplicateGroup('https://m.facebook.com/groups/dhaka.bikes', existingGroups)).toBe(true);
      expect(detectDuplicateGroup('https://web.facebook.com/groups/dhaka.bikes/', existingGroups)).toBe(true);
    });

    it('ignores duplicate check when updating the same group', () => {
      expect(detectDuplicateGroup('https://www.facebook.com/groups/dhaka.bikes/', existingGroups, 'g1')).toBe(false);
    });

    it('returns false for new distinct groups', () => {
      expect(detectDuplicateGroup('https://www.facebook.com/groups/sylhet.bikes/', existingGroups)).toBe(false);
    });
  });

  describe('validatePost', () => {
    it('passes for complete post data', () => {
      const res = validatePost({
        title: 'Yamaha FZS Sale',
        productName: 'Yamaha FZS V3',
        description: 'Mint condition bike for sale',
      });
      expect(res.valid).toBe(true);
    });

    it('fails when title is missing', () => {
      const res = validatePost({
        productName: 'Yamaha FZS V3',
        description: 'Mint condition',
      });
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('Post title is required');
    });

    it('fails when productName is missing', () => {
      const res = validatePost({
        title: 'Yamaha FZS Sale',
        description: 'Mint condition',
      });
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('Product name is required');
    });
  });
});
