/**
 * Utility for loading and parsing YAML specification files.
 */
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { RetrievalStrategies } from '../types/index.js';

// Assuming the specs directory is at the root of the project.
const SPECS_DIR = path.resolve(process.cwd(), 'specs');

/**
 * Loads and parses the retrieval strategies from the YAML spec file.
 *
 * @returns A promise that resolves to the structured retrieval strategies.
 */
export function loadRetrievalStrategies(): Promise<RetrievalStrategies> {
  return new Promise((resolve, reject) => {
    const filePath = path.join(SPECS_DIR, 'retrieval-strategies.yaml');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading retrieval strategies spec file:', err);
        return reject(err);
      }
      try {
        const strategies: RetrievalStrategies = yaml.parse(data);
        console.log('Successfully loaded retrieval strategies.');
        resolve(strategies);
      } catch (parseError) {
        console.error('Error parsing retrieval strategies YAML:', parseError);
        reject(parseError);
      }
    });
  });
}
