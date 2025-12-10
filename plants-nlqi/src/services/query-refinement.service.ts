/**
 * Query Refinement Service
 * Cleans, validates, and enhances parsed query intent
 */

import { QueryIntent, QueryFilters, CharacteristicFilters } from '../models';
import { normalizeStateName, GROWTH_HABIT_MAP, WILDLIFE_VALUE_MAP } from '../utils/intent-mappings';
import { logger } from '../utils/logger';

export class QueryRefinementService {
  /**
   * Refine and enhance a parsed intent
   */
  refineIntent(intent: QueryIntent): QueryIntent {
    logger.debug('Refining intent', { originalIntent: intent });

    const refined: QueryIntent = {
      ...intent,
      filters: this.refineFilters(intent.filters),
      semanticQuery: this.refineSemanticQuery(intent.semanticQuery),
    };

    logger.debug('Intent refined', { refinedIntent: refined });
    return refined;
  }

  /**
   * Refine and validate filters
   */
  private refineFilters(filters: QueryFilters): QueryFilters {
    const refined: QueryFilters = { ...filters };

    // Normalize states
    if (refined.states) {
      refined.states = this.normalizeStates(refined.states);
    }

    // Normalize growth habits
    if (refined.growthHabit) {
      refined.growthHabit = this.normalizeGrowthHabits(refined.growthHabit) as any;
    }

    // Normalize wildlife values
    if (refined.wildlifeValue) {
      refined.wildlifeValue = this.normalizeWildlifeValues(refined.wildlifeValue) as any;
    }

    // Refine characteristics
    if (refined.characteristics) {
      refined.characteristics = this.refineCharacteristics(refined.characteristics);
    }

    // Remove empty arrays and objects
    refined.states = this.removeEmpty(refined.states);
    refined.growthHabit = this.removeEmpty(refined.growthHabit);
    refined.wildlifeValue = this.removeEmpty(refined.wildlifeValue);

    return refined;
  }

  /**
   * Normalize state codes
   */
  private normalizeStates(states: string[]): string[] {
    const normalized: string[] = [];

    for (const state of states) {
      const abbr = normalizeStateName(state);
      if (abbr) {
        normalized.push(abbr);
      } else {
        logger.warn('Could not normalize state', { state });
        // Try to use first 2 letters uppercased as fallback
        const fallback = state.toUpperCase().substring(0, 2);
        if (fallback.length === 2) {
          normalized.push(fallback);
        }
      }
    }

    return Array.from(new Set(normalized)); // Remove duplicates
  }

  /**
   * Normalize growth habits
   */
  private normalizeGrowthHabits(habits: any[]): string[] {
    const normalized: string[] = [];

    for (const habit of habits) {
      const habitStr = String(habit).toLowerCase();
      const mapped = GROWTH_HABIT_MAP[habitStr];
      if (mapped) {
        normalized.push(mapped);
      } else if (this.isValidGrowthHabit(habit)) {
        // Already a valid growth habit
        normalized.push(String(habit));
      } else {
        logger.warn('Unknown growth habit', { habit });
      }
    }

    return Array.from(new Set(normalized));
  }

  /**
   * Normalize wildlife values
   */
  private normalizeWildlifeValues(values: any[]): string[] {
    const normalized: string[] = [];

    for (const value of values) {
      const valueStr = String(value).toLowerCase();
      const mapped = WILDLIFE_VALUE_MAP[valueStr];
      if (mapped) {
        normalized.push(mapped);
      } else if (this.isValidWildlifeValue(value)) {
        normalized.push(String(value));
      } else {
        logger.warn('Unknown wildlife value', { value });
      }
    }

    return Array.from(new Set(normalized));
  }

  /**
   * Refine characteristic filters
   */
  private refineCharacteristics(chars: CharacteristicFilters): CharacteristicFilters {
    const refined: CharacteristicFilters = { ...chars };

    // Normalize sun requirements
    if (refined.sunRequirements) {
      refined.sunRequirements = this.normalizeSunRequirements(refined.sunRequirements) as any;
    }

    // Normalize bloom periods
    if (refined.bloomPeriod) {
      refined.bloomPeriod = this.normalizeBloomPeriods(refined.bloomPeriod) as any;
    }

    // Validate height range
    if (refined.heightMin !== undefined && refined.heightMax !== undefined) {
      if (refined.heightMin > refined.heightMax) {
        logger.warn('Invalid height range, swapping', {
          min: refined.heightMin,
          max: refined.heightMax,
        });
        [refined.heightMin, refined.heightMax] = [refined.heightMax, refined.heightMin];
      }
    }

    // Validate pH range
    if (refined.phMin !== undefined && refined.phMax !== undefined) {
      if (refined.phMin > refined.phMax) {
        logger.warn('Invalid pH range, swapping', { min: refined.phMin, max: refined.phMax });
        [refined.phMin, refined.phMax] = [refined.phMax, refined.phMin];
      }
      // Clamp to valid pH range
      refined.phMin = Math.max(0, Math.min(14, refined.phMin));
      refined.phMax = Math.max(0, Math.min(14, refined.phMax));
    }

    return refined;
  }

  /**
   * Normalize sun requirements (handle both array and single values)
   */
  private normalizeSunRequirements(reqs: any): string[] {
    const reqsArray = Array.isArray(reqs) ? reqs : [reqs];
    const normalized: string[] = [];

    for (const req of reqsArray) {
      if (this.isValidSunRequirement(req)) {
        normalized.push(String(req));
      } else {
        logger.warn('Unknown sun requirement', { req });
      }
    }

    return Array.from(new Set(normalized));
  }

  /**
   * Normalize bloom periods (handle both array and single values)
   */
  private normalizeBloomPeriods(periods: any): string[] {
    const periodsArray = Array.isArray(periods) ? periods : [periods];
    const normalized: string[] = [];

    for (const period of periodsArray) {
      if (this.isValidBloomPeriod(period)) {
        normalized.push(String(period));
      } else {
        logger.warn('Unknown bloom period', { period });
      }
    }

    return Array.from(new Set(normalized));
  }

  /**
   * Refine semantic query for better vector search
   */
  private refineSemanticQuery(query: string): string {
    // Remove common stop words
    const stopWords = new Set([
      'a',
      'an',
      'the',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'may',
      'might',
      'can',
    ]);

    const words = query.toLowerCase().split(/\s+/);
    const filtered = words.filter((word) => !stopWords.has(word) && word.length > 2);

    return filtered.join(' ');
  }

  /**
   * Expand query with synonyms
   */
  expandQueryWithSynonyms(query: string): string[] {
    const expansions = [query];

    // Add common plant-related synonyms
    const synonymMap: Record<string, string[]> = {
      native: ['indigenous', 'endemic'],
      wildflower: ['wild flower', 'forb'],
      drought: ['xeric', 'dry'],
      shade: ['shadow', 'shaded'],
      pollinator: ['bee', 'butterfly', 'hummingbird'],
    };

    for (const [key, synonyms] of Object.entries(synonymMap)) {
      if (query.toLowerCase().includes(key)) {
        for (const synonym of synonyms) {
          const expanded = query.toLowerCase().replace(key, synonym);
          expansions.push(expanded);
        }
      }
    }

    return Array.from(new Set(expansions));
  }

  /**
   * Validate growth habit
   */
  private isValidGrowthHabit(habit: any): boolean {
    const valid = ['Tree', 'Shrub', 'Subshrub', 'Forb/herb', 'Graminoid', 'Vine', 'Nonvascular'];
    return valid.includes(String(habit));
  }

  /**
   * Validate wildlife value
   */
  private isValidWildlifeValue(value: any): boolean {
    const valid = ['Pollinators', 'Birds', 'Mammals', 'Butterflies', 'Hummingbirds', 'Bees'];
    return valid.includes(String(value));
  }

  /**
   * Validate sun requirement
   */
  private isValidSunRequirement(req: any): boolean {
    const valid = ['Full Sun', 'Partial Shade', 'Full Shade'];
    return valid.includes(String(req));
  }

  /**
   * Validate bloom period
   */
  private isValidBloomPeriod(period: any): boolean {
    const valid = [
      'Spring',
      'Late Spring',
      'Early Summer',
      'Summer',
      'Late Summer',
      'Fall',
      'Winter',
    ];
    return valid.includes(String(period));
  }

  /**
   * Remove empty arrays
   */
  private removeEmpty<T>(arr: T[] | undefined): T[] | undefined {
    if (!arr || arr.length === 0) {
      return undefined;
    }
    return arr;
  }

  /**
   * Check if intent has any filters
   */
  hasFilters(intent: QueryIntent): boolean {
    const filters = intent.filters;
    return (
      (filters.states && filters.states.length > 0) ||
      (filters.growthHabit && filters.growthHabit.length > 0) ||
      (filters.wildlifeValue && filters.wildlifeValue.length > 0) ||
      filters.nativeStatus !== undefined ||
      (filters.characteristics && Object.keys(filters.characteristics).length > 0) ||
      false
    );
  }

  /**
   * Get a human-readable summary of filters
   */
  getFiltersSummary(filters: QueryFilters): string {
    const parts: string[] = [];

    if (filters.states && filters.states.length > 0) {
      parts.push(`in ${filters.states.join(', ')}`);
    }

    if (filters.nativeStatus) {
      parts.push(`${filters.nativeStatus} plants`);
    }

    if (filters.growthHabit && filters.growthHabit.length > 0) {
      parts.push(filters.growthHabit.join(', ').toLowerCase());
    }

    if (filters.characteristics) {
      const chars = filters.characteristics;
      if (chars.waterNeeds) {
        parts.push(`${chars.waterNeeds.toLowerCase()} water needs`);
      }
      if (chars.sunRequirements && chars.sunRequirements.length > 0) {
        parts.push(chars.sunRequirements.join(' or ').toLowerCase());
      }
      if (chars.bloomPeriod && chars.bloomPeriod.length > 0) {
        parts.push(`blooming in ${chars.bloomPeriod.join(', ').toLowerCase()}`);
      }
    }

    if (filters.wildlifeValue && filters.wildlifeValue.length > 0) {
      parts.push(`attracting ${filters.wildlifeValue.join(', ').toLowerCase()}`);
    }

    return parts.join(', ');
  }
}
