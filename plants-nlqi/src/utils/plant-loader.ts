/**
 * Plant Loader
 * Loads plant data from JSON file by IDs
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { PlantRecord } from '../models';
import { logger } from './logger';

let cachedPlants: PlantRecord[] | null = null;

/**
 * Load all plants from sample data file
 */
export function loadAllPlants(): PlantRecord[] {
  if (cachedPlants) {
    return cachedPlants;
  }

  try {
    const plantsPath = join(__dirname, '../../data/samples/sample-plants.json');
    const plantsData = readFileSync(plantsPath, 'utf-8');
    const plants: PlantRecord[] = JSON.parse(plantsData);
    cachedPlants = plants;
    logger.info('Plants loaded from file', { count: plants.length });
    return plants;
  } catch (error) {
    logger.error('Error loading plants', { error });
    throw new Error(`Failed to load plants: ${error}`);
  }
}

/**
 * Load specific plants by their IDs
 */
export function loadPlantsByIds(ids: string[]): PlantRecord[] {
  const allPlants = loadAllPlants();
  const plantsMap = new Map(allPlants.map((plant) => [plant.id, plant]));

  const foundPlants: PlantRecord[] = [];
  const missingIds: string[] = [];

  for (const id of ids) {
    const plant = plantsMap.get(id);
    if (plant) {
      foundPlants.push(plant);
    } else {
      missingIds.push(id);
    }
  }

  if (missingIds.length > 0) {
    logger.warn('Some plant IDs not found', { missingIds });
  }

  return foundPlants;
}

/**
 * Clear the cache (useful for testing)
 */
export function clearPlantCache(): void {
  cachedPlants = null;
  logger.debug('Plant cache cleared');
}
