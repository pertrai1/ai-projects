/**
 * Plant Document Helper
 * Converts PlantRecord to PlantDocument for indexing
 */

import { PlantRecord, PlantDocument, PlantMetadata } from '../models';

/**
 * Create a rich text description of a plant for embedding
 */
export function createPlantDescription(plant: PlantRecord): string {
  const parts: string[] = [];

  // Basic identification
  parts.push(`${plant.scientificName} (${plant.commonNames.join(', ')})`);
  parts.push(`Family: ${plant.family}`);
  parts.push(`${plant.duration} ${plant.growthHabit.join(', ')}`);

  // Distribution and native status
  const nativeStates = plant.nativeStatus
    .filter((ns) => ns.status === 'Native')
    .map((ns) => ns.state);
  if (nativeStates.length > 0) {
    parts.push(`Native to: ${nativeStates.join(', ')}`);
  }

  parts.push(`Found in states: ${plant.distribution.states.join(', ')}`);

  // Characteristics
  if (plant.characteristics.height) {
    const h = plant.characteristics.height;
    parts.push(`Height: ${h.min}-${h.max} ${h.unit}`);
  }

  if (plant.characteristics.bloomPeriod) {
    parts.push(`Blooms: ${plant.characteristics.bloomPeriod}`);
  }

  if (plant.characteristics.flowerColor && plant.characteristics.flowerColor.length > 0) {
    parts.push(`Flowers: ${plant.characteristics.flowerColor.join(', ')}`);
  }

  if (plant.characteristics.sunRequirements && plant.characteristics.sunRequirements.length > 0) {
    parts.push(`Sun: ${plant.characteristics.sunRequirements.join(', ')}`);
  }

  if (plant.characteristics.waterNeeds) {
    parts.push(`Water needs: ${plant.characteristics.waterNeeds}`);
  }

  if (plant.characteristics.soilTexture && plant.characteristics.soilTexture.length > 0) {
    parts.push(`Soil: ${plant.characteristics.soilTexture.join(', ')}`);
  }

  if (plant.characteristics.wildlifeValue && plant.characteristics.wildlifeValue.length > 0) {
    parts.push(`Wildlife value: ${plant.characteristics.wildlifeValue.join(', ')}`);
  }

  if (plant.characteristics.hardinessZones && plant.characteristics.hardinessZones.length > 0) {
    parts.push(`Hardiness zones: ${plant.characteristics.hardinessZones.join(', ')}`);
  }

  // Description
  if (plant.description) {
    parts.push(plant.description);
  }

  return parts.join('. ');
}

/**
 * Extract metadata for filtering
 */
export function extractPlantMetadata(plant: PlantRecord): PlantMetadata {
  const nativeStates = plant.nativeStatus
    .filter((ns) => ns.status === 'Native')
    .map((ns) => ns.state);

  return {
    scientificName: plant.scientificName,
    commonNames: plant.commonNames,
    family: plant.family,
    states: plant.distribution.states,
    growthHabit: plant.growthHabit,
    duration: plant.duration,
    bloomPeriod: plant.characteristics.bloomPeriod,
    nativeInStates: nativeStates,
  };
}

/**
 * Convert PlantRecord to PlantDocument (without embedding yet)
 */
export function plantToDocument(plant: PlantRecord): Omit<PlantDocument, 'embedding'> {
  return {
    id: plant.id,
    text: createPlantDescription(plant),
    metadata: extractPlantMetadata(plant),
  };
}
