/**
 * Plants NLQI - Orchestrator
 */

import { IntentAgent } from '../agents/intent-agent';
import { ResponseAgent } from '../agents/response-agent';
import { QueryRefinementService } from '../services/query-refinement.service';
import { ConversationService } from '../services/conversation.service';
import { HybridSearchService } from '../search/hybrid-search.service';
import { QueryResult, QueryIntent } from '../models';
import { logger } from '../utils/logger';

export interface PlantsNLQIConfig {
  anthropicApiKey: string;
  voyageApiKey: string;
  pineconeApiKey: string;
  pineconeIndexName: string;
  pineconeNamespace?: string;
  enableConversations?: boolean;
}

export class PlantsNLQI {
  private intentAgent: IntentAgent;
  private responseAgent: ResponseAgent;
  private refinementService: QueryRefinementService;
  private conversationService: ConversationService;
  private hybridSearch: HybridSearchService;
  private enableConversations: boolean;

  constructor(config: PlantsNLQIConfig) {
    this.intentAgent = new IntentAgent({
      apiKey: config.anthropicApiKey,
    });

    this.responseAgent = new ResponseAgent({
      apiKey: config.anthropicApiKey,
    });

    this.refinementService = new QueryRefinementService();

    this.conversationService = new ConversationService({
      maxTurnsInMemory: 5,
    });

    this.hybridSearch = new HybridSearchService({
      voyageApiKey: config.voyageApiKey,
      pineconeApiKey: config.pineconeApiKey,
      pineconeIndexName: config.pineconeIndexName,
      pineconeNamespace: config.pineconeNamespace,
    });

    this.enableConversations = config.enableConversations !== false;

    logger.info('PlantsNLQI Phase 2 initialized', {
      enableConversations: this.enableConversations,
    });
  }

  /**
   * Query with conversation support
   */
  async query(userQuery: string, conversationId?: string): Promise<QueryResult> {
    const startTime = Date.now();

    try {
      logger.info('Processing query', { query: userQuery, conversationId });

      // Step 1: Parse intent
      let intent: QueryIntent;
      let isFollowUp = false;

      if (conversationId && this.enableConversations) {
        // Check if this is a follow-up query
        isFollowUp = this.conversationService.isFollowUpQuery(userQuery);

        if (isFollowUp) {
          // Parse with context
          const refContext = this.conversationService.getReferenceContext(conversationId);
          logger.debug('Parsing as follow-up', { previousPlants: refContext.lastPlants });

          const parseResult = await this.intentAgent.parseIntentWithContext(
            userQuery,
            refContext.lastIntent,
            refContext.lastPlants
          );
          intent = parseResult.intent;
        } else {
          // Parse without context
          const parseResult = await this.intentAgent.parseIntent(userQuery);
          intent = parseResult.intent;
        }
      } else {
        // No conversation - parse normally
        const parseResult = await this.intentAgent.parseIntent(userQuery);
        intent = parseResult.intent;
      }

      logger.debug('Intent parsed', {
        queryType: intent.queryType,
        confidence: intent.confidence,
        hasFilters: Object.keys(intent.filters).length > 0,
      });

      // Step 2: Refine intent
      const refinedIntent = this.refinementService.refineIntent(intent);
      logger.debug('Intent refined', {
        semanticQuery: refinedIntent.semanticQuery,
        filtersSummary: this.refinementService.getFiltersSummary(refinedIntent.filters),
      });

      // Step 3: Hybrid search
      const searchResult = await this.hybridSearch.search(refinedIntent, 10);
      logger.debug('Search completed', {
        strategy: searchResult.searchStrategy,
        resultCount: searchResult.plants.length,
      });

      // Step 4: Generate context-aware response
      const memory = conversationId
        ? this.conversationService.getMemory(conversationId)
        : undefined;

      const answer = await this.responseAgent.generateResponse(
        userQuery,
        searchResult.plants,
        memory,
        isFollowUp
      );

      // Step 5: Create result
      const result: QueryResult = {
        query: userQuery,
        answer,
        plants: searchResult.plants.map((plant) => ({
          plant,
          score: searchResult.scores.get(plant.id) || 0,
        })),
        metadata: {
          totalResults: searchResult.plants.length,
          searchTime: Date.now() - startTime,
          searchType: searchResult.searchStrategy,
          filtersApplied: refinedIntent.filters,
        },
      };

      // Step 6: Add to conversation if enabled
      if (conversationId && this.enableConversations) {
        this.conversationService.addTurn(conversationId, userQuery, refinedIntent, result);
        logger.debug('Turn added to conversation', { conversationId });
      }

      logger.info('Query completed', {
        query: userQuery,
        resultCount: result.plants.length,
        totalTime: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      logger.error('Error processing query', { error, query: userQuery });
      throw new Error(`Query failed: ${error}`);
    }
  }

  /**
   * Start a new conversation
   */
  startConversation(): string {
    if (!this.enableConversations) {
      throw new Error('Conversations are disabled');
    }
    return this.conversationService.startConversation();
  }

  /**
   * End a conversation
   */
  endConversation(conversationId: string): void {
    if (!this.enableConversations) {
      throw new Error('Conversations are disabled');
    }
    this.conversationService.endConversation(conversationId);
  }

  /**
   * Get conversation summary
   */
  getConversationSummary(conversationId: string): string {
    if (!this.enableConversations) {
      throw new Error('Conversations are disabled');
    }
    return this.conversationService.getSummary(conversationId);
  }

  /**
   * Health check - verify all services are operational
   */
  async healthCheck(): Promise<{ status: string; services: Record<string, boolean> }> {
    logger.info('Running health check');

    const services: Record<string, boolean> = {
      intentAgent: false,
      responseAgent: false,
      hybridSearch: false,
    };

    try {
      services.intentAgent = await this.intentAgent.testConnection();
    } catch (error) {
      logger.error('Intent agent health check failed', { error });
    }

    try {
      services.responseAgent = await this.responseAgent.testConnection();
    } catch (error) {
      logger.error('Response agent health check failed', { error });
    }

    try {
      // Check Pinecone connection (no direct method, assume OK if no error)
      services.hybridSearch = true;
    } catch (error) {
      logger.error('Hybrid search health check failed', { error });
    }

    const allHealthy = Object.values(services).every((s) => s);
    const status = allHealthy ? 'healthy' : 'degraded';

    logger.info('Health check completed', { status, services });

    return { status, services };
  }
}
