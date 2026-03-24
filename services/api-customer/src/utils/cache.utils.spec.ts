import { clearCacheByPattern } from './cache.utils';

describe('CacheUtils', () => {
  describe('clearCacheByPattern', () => {
    let mockCacheManager: any;

    beforeEach(() => {
      mockCacheManager = {
        store: {
          keys: jest.fn(),
        },
        del: jest.fn(),
      };
    });

    it('should clear keys found by pattern', async () => {
      mockCacheManager.store.keys.mockResolvedValue(['key1', 'key2']);
      await clearCacheByPattern(mockCacheManager, 'pattern*');
      expect(mockCacheManager.store.keys).toHaveBeenCalledWith('pattern*');
      expect(mockCacheManager.del).toHaveBeenCalledWith('key1');
      expect(mockCacheManager.del).toHaveBeenCalledWith('key2');
    });

    it('should fallback to delete pattern directly if store.keys is not a function', async () => {
      mockCacheManager.store.keys = undefined;
      await clearCacheByPattern(mockCacheManager, 'pattern*');
      expect(mockCacheManager.del).toHaveBeenCalledWith('pattern*');
    });

    it('should handle errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockCacheManager.store.keys.mockRejectedValue(new Error('fail'));
      await clearCacheByPattern(mockCacheManager, 'pattern*');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to clear cache pattern'),
        expect.any(Error),
      );
    });
  });
});
