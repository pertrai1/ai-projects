/**
 * Citation Validator (Stage 2: Core Learning Module)
 *
 * PURPOSE: Detect hallucinations by validating that LLM answers are faithful
 * to the retrieved code evidence.
 *
 * LEARNING GOAL: Understand how to build "trust but verify" systems for LLMs.
 * We give the LLM freedom to generate answers, but we validate every claim.
 *
 * This is the difference between a toy demo and a production code Q&A system.
 */

import { Citation } from '../types/index.js';

/**
 * Result of a single validation check
 */
export interface ValidationResult {
  passed: boolean;
  confidence: number; // 0-1, how confident are we in this validation?
  issues: ValidationIssue[];
  summary: string;
}

export interface ValidationIssue {
  type: 'missing_citation' | 'line_mismatch' | 'code_mismatch' | 'entity_mismatch' | 'unsupported_claim';
  severity: 'error' | 'warning' | 'info';
  message: string;
  context?: string; // Additional context about the issue
}

/**
 * Overall faithfulness assessment
 */
export interface FaithfulnessScore {
  overallScore: number; // 0-1, where 1 = perfectly faithful
  citationReferenceScore: number;
  lineNumberScore: number;
  codeQuoteScore: number;
  entityNameScore: number;
  issues: ValidationIssue[];
  recommendation: 'accept' | 'review' | 'reject';
}

/**
 * CitationValidator: The Shield Against Hallucinations
 *
 * DESIGN PHILOSOPHY:
 * - Start simple: Check 1 is easy to implement and catches obvious problems
 * - Build incrementally: Add more sophisticated checks as needed
 * - Fail gracefully: Don't reject good answers due to overly strict validation
 * - Provide explanations: Every issue should explain WHAT and WHY
 */
export class CitationValidator {
  /**
   * Check 1: Citation Reference Validation
   *
   * WHAT IT DOES:
   * Scans the answer for citation markers like [Source 1], [Source 2], etc.
   * and verifies that each referenced source actually exists in the citations.
   *
   * WHY IT MATTERS:
   * If an LLM says "The code does X [Source 5]" but we only have 3 citations,
   * Source 5 is hallucinated. This is an OBVIOUS red flag.
   *
   * EDGE CASES TO HANDLE:
   * - Different citation formats: [Source 1], [1], (Source 1), etc.
   * - Multiple references: [Source 1, Source 2]
   * - Invalid references: [Source foo], [Source -1]
   *
   * @param answer - The LLM-generated answer text
   * @param citations - The actual citations we provided to the LLM
   * @returns Validation result with any issues found
   */
  validateCitationReferences(answer: string, citations: Citation[]): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Step 1: Extract all citation references from the answer
    // Pattern: [Source N] where N is a number
    const citationPattern = /\[Source (\d+)\]/gi;
    const matches = [...answer.matchAll(citationPattern)];

    if (matches.length === 0) {
      // TEACHING MOMENT: Is it bad if there are NO citations?
      // It depends! If the answer is "I couldn't find evidence", that's OK.
      // But if the answer makes specific claims without citations, that's bad.
      const hasSubstantiveContent = answer.length > 100 && !answer.includes("could not find");

      if (hasSubstantiveContent) {
        issues.push({
          type: 'missing_citation',
          severity: 'error',
          message: 'Answer makes claims but includes no citation references',
          context: 'Expected [Source N] markers in answer text',
        });
      }
    }

    // Step 2: Validate each referenced source exists
    const maxCitationIndex = citations.length;

    for (const match of matches) {
      const sourceNum = parseInt(match[1], 10);

      // Check if source number is valid (1-indexed, must be <= citations.length)
      if (sourceNum < 1 || sourceNum > maxCitationIndex) {
        issues.push({
          type: 'missing_citation',
          severity: 'error',
          message: `Answer references [Source ${sourceNum}] but only ${maxCitationIndex} citations exist`,
          context: `Valid range: [Source 1] to [Source ${maxCitationIndex}]`,
        });
      }
    }

    // Step 3: Check if citations exist but aren't referenced
    // TEACHING MOMENT: Is it bad if we provide citations but the answer doesn't use them?
    // This suggests the LLM ignored the evidence - potential hallucination!
    const referencedSources = new Set(matches.map(m => parseInt(m[1], 10)));
    const unreferencedCitations: number[] = [];

    for (let i = 1; i <= maxCitationIndex; i++) {
      if (!referencedSources.has(i)) {
        unreferencedCitations.push(i);
      }
    }

    if (unreferencedCitations.length > 0 && matches.length > 0) {
      // Only warn if some citations are used (if none are used, we already flagged it above)
      issues.push({
        type: 'missing_citation',
        severity: 'warning',
        message: `Provided ${unreferencedCitations.length} citation(s) that weren't referenced in answer`,
        context: `Unreferenced: [Source ${unreferencedCitations.join('], [Source ')}]`,
      });
    }

    // Step 4: Calculate confidence score
    // Perfect: All citations referenced, no invalid references
    // Bad: Invalid references exist
    const hasErrors = issues.some(i => i.severity === 'error');
    const confidence = hasErrors ? 0.3 : (issues.length === 0 ? 1.0 : 0.7);

    return {
      passed: !hasErrors,
      confidence,
      issues,
      summary: this.generateSummary('citation_reference', issues, matches.length, maxCitationIndex),
    };
  }

  /**
   * Calculate overall faithfulness score
   *
   * LEARNING NOTE: This combines multiple validation checks into a single score.
   * In Stage 2, we'll start with just Check 1. As we add more checks (2-4),
   * this function will integrate them into a holistic assessment.
   */
  calculateFaithfulness(answer: string, citations: Citation[]): FaithfulnessScore {
    // For now, only Check 1 is implemented
    const citationRefValidation = this.validateCitationReferences(answer, citations);

    const allIssues = [...citationRefValidation.issues];
    const hasErrors = allIssues.some(i => i.severity === 'error');
    const hasWarnings = allIssues.some(i => i.severity === 'warning');

    // Simple scoring for now (will get more sophisticated as we add checks)
    let overallScore = citationRefValidation.confidence;

    // Determine recommendation
    let recommendation: 'accept' | 'review' | 'reject';
    if (hasErrors) {
      recommendation = 'reject';
    } else if (hasWarnings || overallScore < 0.8) {
      recommendation = 'review';
    } else {
      recommendation = 'accept';
    }

    return {
      overallScore,
      citationReferenceScore: citationRefValidation.confidence,
      lineNumberScore: 1.0, // Not implemented yet
      codeQuoteScore: 1.0, // Not implemented yet
      entityNameScore: 1.0, // Not implemented yet
      issues: allIssues,
      recommendation,
    };
  }

  /**
   * Generate human-readable summary of validation results
   */
  private generateSummary(
    checkType: string,
    issues: ValidationIssue[],
    referencesFound: number,
    citationsProvided: number
  ): string {
    if (issues.length === 0) {
      return `✓ ${checkType}: All ${referencesFound} citation references are valid`;
    }

    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;

    const parts = [];
    if (errors > 0) parts.push(`${errors} error(s)`);
    if (warnings > 0) parts.push(`${warnings} warning(s)`);

    return `✗ ${checkType}: Found ${parts.join(', ')} | ${referencesFound} references, ${citationsProvided} citations provided`;
  }
}
