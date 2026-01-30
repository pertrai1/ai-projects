import { QueryRouter } from '../agents/query-router.js';
import * as fs from 'fs';
import * as path from 'path';

interface TestCase {
  query: string;
  expectedIntent: string;
  description: string;
}

export async function phase2Experiment(_codebasePath: string) {
  console.log('Running Phase 2 Experiment: Intent Classification');
  console.log('------------------------------------------------');

  const router = new QueryRouter();
  
  // Load test cases
  const testCasesPath = path.resolve(process.cwd(), 'evaluations/datasets/intent-test-cases.json');
  let testCases: TestCase[] = [];
  
  try {
    const content = fs.readFileSync(testCasesPath, 'utf-8');
    testCases = JSON.parse(content);
  } catch (error) {
    console.error('Failed to load test cases:', error);
    return;
  }

  console.log(`Loaded ${testCases.length} test cases.`);
  
  let correct = 0;
  const results = [];

  for (const testCase of testCases) {
    console.log(`\nQuery: "${testCase.query}"`);
    console.log(`Expected: ${testCase.expectedIntent}`);
    
    const startTime = Date.now();
    const intent = await router.routeQuery(testCase.query);
    const duration = Date.now() - startTime;
    
    const isCorrect = intent.type === testCase.expectedIntent;
    if (isCorrect) correct++;
    
    console.log(`Predicted: ${intent.type} ${isCorrect ? '✅' : '❌'}`);
    console.log(`Strategy: ${router.getStrategyForIntent(intent.type)}`);
    
    results.push({
      query: testCase.query,
      expected: testCase.expectedIntent,
      predicted: intent.type,
      correct: isCorrect,
      confidence: intent.confidence,
      duration
    });
  }

  const accuracy = (correct / testCases.length) * 100;
  console.log('\n------------------------------------------------');
  console.log(`Experiment Complete`);
  console.log(`Accuracy: ${accuracy.toFixed(1)}% (${correct}/${testCases.length})`);
  
  // Save results
  const resultsPath = path.resolve(process.cwd(), 'phase-2-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`Results saved to ${resultsPath}`);
}
