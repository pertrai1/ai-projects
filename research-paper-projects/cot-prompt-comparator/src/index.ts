import { run } from './runner.js';
import { analyze } from './analyzer.js';

const command = process.argv[2];

if (command === 'analyze') {
  analyze();
} else {
  run();
}