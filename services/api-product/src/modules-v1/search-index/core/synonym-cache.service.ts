import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SynonymMapping } from '../interfaces';

// Placeholder entity - you may have a Synonym entity or use MasterData
// import { Synonym } from '@/model/synonym.entity';

/**
 * Synonym Cache Service
 *
 * 🔧 FIX OLD PROBLEM:
 * - OLD: Synonym processing on every request, CPU 100% spikes
 * - NEW: Pre-loaded at startup, refreshed hourly, NEVER queries DB at runtime
 *
 * This eliminates CPU-intensive synonym processing during indexing
 */
@Injectable()
export class SynonymCacheService implements OnModuleInit {
  private readonly logger = new Logger(SynonymCacheService.name);

  // In-memory synonym map: term -> synonyms[]
  private synonyms: Map<string, string[]> = new Map();

  // Reverse index for quick lookups
  private reverseIndex: Map<string, string[]> = new Map();

  // Last loaded timestamp
  private lastLoadedAt: Date | null = null;

  constructor() {
    // Inject your synonym repository here
    // @InjectRepository(Synonym)
    // private readonly synonymRepository: Repository<Synonym>,
  }

  /**
   * Load synonyms on module initialization
   */
  async onModuleInit(): Promise<void> {
    await this.loadSynonyms();
  }

  /**
   * Refresh synonyms every hour
   * 🔧 FIX: Never queries DB at runtime for synonyms
   */
  @Cron(CronExpression.EVERY_HOUR)
  async refreshSynonyms(): Promise<void> {
    this.logger.log('Refreshing synonym cache...');
    await this.loadSynonyms();
  }

  /**
   * Get synonyms for a given term
   * This is O(1) lookup - no DB query!
   */
  getSynonyms(term: string): string[] {
    const normalized = this.normalize(term);
    return this.synonyms.get(normalized) || [];
  }

  /**
   * Get all synonyms for a text (tokenized)
   */
  getAllSynonymsForText(text: string): string[] {
    const tokens = this.tokenize(text);
    const allSynonyms: Set<string> = new Set();

    for (const token of tokens) {
      const synonyms = this.getSynonyms(token);
      synonyms.forEach((s) => allSynonyms.add(s));
    }

    return Array.from(allSynonyms);
  }

  /**
   * Check if synonyms are loaded
   */
  isLoaded(): boolean {
    return this.lastLoadedAt !== null;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalTerms: number;
    totalSynonyms: number;
    lastLoadedAt: Date | null;
  } {
    let totalSynonyms = 0;
    for (const syns of this.synonyms.values()) {
      totalSynonyms += syns.length;
    }

    return {
      totalTerms: this.synonyms.size,
      totalSynonyms,
      lastLoadedAt: this.lastLoadedAt,
    };
  }

  /**
   * Force reload synonyms (for admin use)
   */
  async forceReload(): Promise<void> {
    this.logger.log('Force reloading synonym cache...');
    await this.loadSynonyms();
  }

  // ============ Private Methods ============

  private async loadSynonyms(): Promise<void> {
    try {
      // TODO: Replace with actual synonym loading from your data source
      // Example:
      // const synonymData = await this.synonymRepository.find();
      //
      // For now, using mock data structure:
      const synonymData: SynonymMapping[] = await this.fetchSynonymData();

      // Clear existing
      this.synonyms.clear();
      this.reverseIndex.clear();

      // Build synonym map
      for (const mapping of synonymData) {
        const normalizedTerm = this.normalize(mapping.term);
        this.synonyms.set(normalizedTerm, mapping.synonyms);

        // Build reverse index
        for (const synonym of mapping.synonyms) {
          const normalizedSynonym = this.normalize(synonym);
          if (!this.reverseIndex.has(normalizedSynonym)) {
            this.reverseIndex.set(normalizedSynonym, []);
          }
          this.reverseIndex.get(normalizedSynonym)!.push(normalizedTerm);
        }
      }

      this.lastLoadedAt = new Date();
      this.logger.log(
        `Loaded ${this.synonyms.size} synonym terms with ${this.getTotalSynonymCount()} total synonyms`,
      );
    } catch (error) {
      this.logger.error(`Failed to load synonyms: ${error}`);
      // Keep existing cache if load fails
    }
  }

  /**
   * Fetch synonym data from data source
   * TODO: Implement actual data fetching
   */
  private async fetchSynonymData(): Promise<SynonymMapping[]> {
    // Placeholder - implement based on your data source
    // Could be from:
    // 1. A dedicated synonym table
    // 2. MasterData table with type='synonym'
    // 3. External API
    // 4. Configuration file

    // For now, return empty to avoid errors
    return [];
  }

  private normalize(term: string): string {
    return term.toLowerCase().trim();
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);
  }

  private getTotalSynonymCount(): number {
    let count = 0;
    for (const syns of this.synonyms.values()) {
      count += syns.length;
    }
    return count;
  }
}
