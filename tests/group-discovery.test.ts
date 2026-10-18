import { describe, it, expect } from 'vitest';
import { cleanGroupName, extractGroupsFromHtml } from '../src/services/facebook/detectors/group-discovery';
import { mergeDiscoveredGroups } from '../src/services/facebook/discovery-manager';
import { getGroups, setGroups } from '../src/services/storage/chrome-storage';
import { Group } from '../src/types/group';

describe('Group Discovery & Name Extraction', () => {
  describe('cleanGroupName', () => {
    it('cleans English suffixes such as Public group and member counts', () => {
      const raw = 'Sylhet Sell Bazar | সিলেট বেচা-কেনা · Public group · 45K members';
      expect(cleanGroupName(raw)).toBe('Sylhet Sell Bazar | সিলেট বেচা-কেনা');
    });

    it('cleans Bengali suffixes such as পাবলিক গ্রুপ and সদস্য', () => {
      const raw = 'সিলেটের বেচা-কেনা [ক্রয়-বিক্রয় গ্রুপ] · পাবলিক গ্রুপ · ১ লাখ সদস্য';
      expect(cleanGroupName(raw)).toBe('সিলেটের বেচা-কেনা [ক্রয়-বিক্রয় গ্রুপ]');
    });

    it('removes Visit / View action prefixes in English and Bengali', () => {
      expect(cleanGroupName('Visit Bike Bazar.com/বাইক বাজার.কম')).toBe('Bike Bazar.com/বাইক বাজার.কম');
      expect(cleanGroupName('গ্রুপ দেখুন Sell Bazar only Sylhet')).toBe('Sell Bazar only Sylhet');
    });

    it('falls back to formatted slug if raw name is empty or generic', () => {
      expect(cleanGroupName('', 'sylhet.bikers')).toBe('Sylhet Bikers');
      expect(cleanGroupName('Visit', 'dhaka_sell_buy')).toBe('Dhaka Sell Buy');
    });
  });

  describe('extractGroupsFromHtml', () => {
    it('extracts Relay group JSON structures with clean names', () => {
      const sampleHtml = `
        <script>
          {"__typename":"Group","id":"987654321","name":"Chittagong Motor Club · Public group"}
        </script>
      `;
      const groups = extractGroupsFromHtml(sampleHtml);
      expect(groups.length).toBe(1);
      expect(groups[0].groupId).toBe('987654321');
      expect(groups[0].name).toBe('Chittagong Motor Club');
    });
  });

  describe('mergeDiscoveredGroups exact sync', () => {
    it('prunes non-member discovered groups when syncMode is exact while preserving manual groups', async () => {
      const existing: Group[] = [
        {
          id: 'grp-old-discovered',
          name: 'Old Feed Group',
          url: 'https://www.facebook.com/groups/oldfeed/',
          groupId: 'oldfeed',
          category: 'Discovered',
          enabled: true,
          status: 'READY',
          postCount: 3,
          createdAt: 1000,
          updatedAt: 1000,
        },
        {
          id: 'grp-manual',
          name: 'My Custom Group',
          url: 'https://www.facebook.com/groups/custom/',
          groupId: 'custom',
          category: 'Custom Category',
          enabled: true,
          status: 'READY',
          postCount: 1,
          createdAt: 1000,
          updatedAt: 1000,
        },
      ];
      await setGroups(existing);

      const discoveredJoined = [
        {
          name: 'Real Joined Group A',
          url: 'https://www.facebook.com/groups/real.joined.a/',
          groupId: 'real.joined.a',
          privacy: 'PUBLIC' as const,
        },
      ];

      const res = await mergeDiscoveredGroups(discoveredJoined, { syncMode: 'exact' });
      expect(res.imported).toBe(1);

      const stored = await getGroups();
      // Should have Real Joined Group A and My Custom Group (manual), but Old Feed Group (discovered) pruned!
      expect(stored.some(g => g.groupId === 'real.joined.a')).toBe(true);
      expect(stored.some(g => g.groupId === 'custom')).toBe(true);
      expect(stored.some(g => g.groupId === 'oldfeed')).toBe(false);
    });
  });

  describe('Storage clearAllGroups', () => {
    it('clears all groups from storage', async () => {
      const { clearAllGroups } = await import('../src/services/storage/chrome-storage');
      await setGroups([
        {
          id: 'grp-1',
          name: 'Group 1',
          url: 'https://facebook.com/groups/1',
          category: 'Discovered',
          enabled: true,
          status: 'READY',
          postCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);
      expect((await getGroups()).length).toBe(1);
      await clearAllGroups();
      expect((await getGroups()).length).toBe(0);
    });
  });

  describe('isUnjoinedOrSuggestedGroup detection', () => {
    it('detects unjoined groups that have Join / যোগ দিন buttons', async () => {
      const { isUnjoinedOrSuggestedGroup } = await import('../src/services/facebook/detectors/group-discovery');
      const mockContainer = {
        querySelectorAll: () => [
          { textContent: 'Join group', getAttribute: () => null }
        ],
        textContent: 'Some Group Name',
      };
      const mockAnchor = {
        closest: (selector: string) => {
          if (selector.includes('role="listitem"')) return mockContainer;
          return null;
        },
        parentElement: mockContainer,
      } as unknown as Element;

      expect(isUnjoinedOrSuggestedGroup(mockAnchor)).toBe(true);
    });

    it('detects suggested groups in Bengali', async () => {
      const { isUnjoinedOrSuggestedGroup } = await import('../src/services/facebook/detectors/group-discovery');
      const mockContainer = {
        querySelectorAll: () => [
          { textContent: '', getAttribute: (attr: string) => (attr === 'aria-label' ? 'যোগ দিন' : null) }
        ],
        textContent: 'বাংলা গ্রুপ',
      };
      const mockAnchor = {
        closest: (selector: string) => {
          if (selector.includes('role="listitem"')) return mockContainer;
          return null;
        },
        parentElement: mockContainer,
      } as unknown as Element;

      expect(isUnjoinedOrSuggestedGroup(mockAnchor)).toBe(true);
    });

    it('rejects group links inside news feed posts', async () => {
      const { isUnjoinedOrSuggestedGroup } = await import('../src/services/facebook/detectors/group-discovery');
      const mockAnchor = {
        closest: (selector: string) => {
          if (selector.includes('role="feed"')) return {};
          return null;
        },
        parentElement: null,
      } as unknown as Element;

      expect(isUnjoinedOrSuggestedGroup(mockAnchor)).toBe(true);
    });

    it('accepts legitimate joined groups in LeftRail without Join buttons', async () => {
      const { isUnjoinedOrSuggestedGroup } = await import('../src/services/facebook/detectors/group-discovery');
      const mockContainer = {
        querySelectorAll: () => [
          { textContent: 'Visit', getAttribute: () => null }
        ],
        textContent: 'My Real Group',
      };
      const mockAnchor = {
        closest: (selector: string) => {
          if (selector.includes('LeftRail')) return mockContainer;
          if (selector.includes('role="listitem"')) return mockContainer;
          return null;
        },
        parentElement: mockContainer,
      } as unknown as Element;

      expect(isUnjoinedOrSuggestedGroup(mockAnchor)).toBe(false);
    });
  });

  describe('isNotificationOrPostAnchor detection', () => {
    it('rejects post permalink URLs and comment notifications', async () => {
      const { isNotificationOrPostAnchor } = await import('../src/services/facebook/detectors/group-discovery');
      const permalinkAnchor = {
        href: 'https://www.facebook.com/groups/12345/permalink/67890/?comment_id=111',
        getAttribute: () => 'https://www.facebook.com/groups/12345/permalink/67890/?comment_id=111',
        textContent: 'UnreadFaruk Feni also commented on a post in Bikes',
        closest: () => null,
      } as unknown as Element;

      expect(isNotificationOrPostAnchor(permalinkAnchor)).toBe(true);
    });

    it('rejects anchors inside notification menus', async () => {
      const { isNotificationOrPostAnchor } = await import('../src/services/facebook/detectors/group-discovery');
      const notifAnchor = {
        href: 'https://www.facebook.com/groups/12345/',
        getAttribute: () => 'https://www.facebook.com/groups/12345/',
        textContent: 'Md Jamir Uddin Mojumder also commented on a post',
        closest: (sel: string) => sel.includes('Notification') ? {} : null,
      } as unknown as Element;

      expect(isNotificationOrPostAnchor(notifAnchor)).toBe(true);
    });

    it('accepts clean direct group URLs', async () => {
      const { isNotificationOrPostAnchor } = await import('../src/services/facebook/detectors/group-discovery');
      const validAnchor = {
        href: 'https://www.facebook.com/groups/puratoncomputer/?ref=group_browse',
        getAttribute: () => 'https://www.facebook.com/groups/puratoncomputer/?ref=group_browse',
        textContent: 'পুরাতন কম্পিউটার ক্রয়-বিক্রয়',
        closest: () => null,
      } as unknown as Element;

      expect(isNotificationOrPostAnchor(validAnchor)).toBe(false);
    });

    it('rejects Pending group requests cards', async () => {
      const { isUnjoinedOrSuggestedGroup } = await import('../src/services/facebook/detectors/group-discovery');
      const pendingCard = {
        querySelectorAll: () => [
          { textContent: 'Answer questions', getAttribute: () => null }
        ],
        textContent: 'Nazipur bike buy and sell exchange Requested to join 7 weeks ago Answer questions',
      };
      const mockAnchor = {
        closest: (sel: string) => {
          if (sel.includes('Pending')) return pendingCard;
          if (sel.includes('listitem')) return pendingCard;
          return null;
        },
        parentElement: pendingCard,
      } as unknown as Element;

      expect(isUnjoinedOrSuggestedGroup(mockAnchor)).toBe(true);
    });
  });

  describe('Storage auto-purging of notification items', () => {
    it('isInvalidNotificationGroup identifies notification entries and permits real groups', async () => {
      const { isInvalidNotificationGroup } = await import('../src/services/storage/chrome-storage');

      expect(isInvalidNotificationGroup({
        name: 'UnreadFaruk Feni also commented on a post...',
        url: 'https://www.facebook.com/groups/123/permalink/456/',
      })).toBe(true);

      expect(isInvalidNotificationGroup({
        name: 'Pradip Ta commented on your post in Ra...',
        url: 'https://www.facebook.com/groups/123/?comment_id=789',
      })).toBe(true);

      expect(isInvalidNotificationGroup({
        name: 'পুরাতন কম্পিউটার ক্রয়-বিক্রয়',
        url: 'https://www.facebook.com/groups/puratoncomputer/',
      })).toBe(false);
    });
  });
});

