import { run } from './runner.js';
import { analyze } from './analyzer.js';


async function main() {
  const command = process.argv[2];

  if (command === 'analyze') {
    await analyze();
  } else {
    await run();
  }

  console.log('Application finished.');
}

main();
