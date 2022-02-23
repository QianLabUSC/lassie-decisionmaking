import * as _ from 'lodash';
import { NORMALIZED_WIDTH, RowType, transectLines, BATTERY_COST_PER_SAMPLE,
  BATTERY_COST_PER_DISTANCE, BATTERY_COST_PER_TRANSECT_DISTANCE, MAX_NUM_OF_MEASUREMENTS, 
  sampleLocations, NUM_OF_LOCATIONS, MOISTURE_BINS, NUM_MEASUREMENTS, objectiveOptions } from './constants';
import { measurements } from './mesurements';
import { dataset } from './data/rhexDataset';
import { Transect, TransectType, ActualStrategySample } from './types';
import { IState } from './state';
import { floor } from 'lodash';

export const isProduction = () => {
  return process.env.MODE === 'production';
};

export function getDistanceSquare(x1: number, y1: number, x2: number, y2: number) {
  return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}

export function getDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(getDistanceSquare(x1, y1, x2, y2));
}

// Return the nearest location, from 0 - 21
export function getNearestIndex(normOffsetXY : number[]) : number {
  const [offsetX, offsetY] = normOffsetXY; // these values are normOffsetX and normOffsetY from ClickableImage.tsx
  // If the distance square is larger than maxSquare, an error will pop up
  const maxSquare = 400;
  let start = 0, end = sampleLocations.length - 1;
  if (offsetX < sampleLocations[0][0]) {
    if (getDistanceSquare(offsetX, offsetY,
                          sampleLocations[0][0],
                          sampleLocations[0][1]) > maxSquare
    ) {
      return -1;
    }
    return 0;
  }
  if (offsetX > sampleLocations[sampleLocations.length - 1][0]) {
    if (getDistanceSquare(offsetX, offsetY,
                          sampleLocations[sampleLocations.length - 1][0],
                          sampleLocations[sampleLocations.length - 1][1]) > maxSquare
    ) {
      return -1;
    }
    return sampleLocations.length - 1;
  }
  // Use binary search to find the first x coordinate that is smaller than offsetX
  let mid;
  while (start < end) {
    mid = Math.floor((start + end) / 2);
    const midX = sampleLocations[mid][0];
    const midNext = mid + 1 === sampleLocations.length - 1 ? NORMALIZED_WIDTH : sampleLocations[mid + 1][0];
    if (offsetX >= midX && offsetX < midNext) {
      break;
    } else if (offsetX < midX) {
      end = mid;
    } else if (offsetX >= midNext) {
      start = mid + 1;
    }
  }
  // We compare between mid and mid + 1 to see which one is the closest
  const dist1 = getDistanceSquare(offsetX, offsetY, sampleLocations[mid][0], sampleLocations[mid][1]);
  const dist2 = getDistanceSquare(offsetX, offsetY, sampleLocations[mid + 1][0], sampleLocations[mid + 1][1]);
  // Since the actual index is offset by 1, we change mid and mid + 1 to mid + 1 and mid + 2
  if (Math.min(dist1, dist2) > maxSquare) {
    return -1;
  }
  return dist1 < dist2 ? mid : mid + 1;
}

function getTransectCost(ta: Transect, tb: Transect) : number {
  const la = transectLines[ta.number], lb = transectLines[tb.number];
  const midA = [(la.from[0] + la.to[0]) / 2, (la.from[1] + la.to[1]) / 2];
  const midB = [(lb.from[0] + lb.to[0]) / 2, (lb.from[1] + lb.to[1]) / 2];
  return getDistance(midA[0], midA[1], midB[0], midB[1]) * BATTERY_COST_PER_TRANSECT_DISTANCE;
}

function getRowCost(ra: IRow, rb: IRow) : number {
  return getDistance(ra.normOffsetX, ra.normOffsetY, rb.normOffsetX, rb.normOffsetY) * BATTERY_COST_PER_DISTANCE;
}

export function getBatteryCost(transectIndices: Transect[], transectSamples: IRow[][],
                 curTransectIdx?: number, curRowIdx?: number) : number
{
  let cost = 0;
  let lastNonDiscardTransect = -1;
  const transectMax = curTransectIdx === undefined ? transectIndices.length : curTransectIdx + 1;
  
  for (let i = 0; i < transectMax; i++) {
    const transect = transectIndices[i];
    if (transect.type === TransectType.DISCARDED) {
      continue;
    }
    if (lastNonDiscardTransect > -1) {
      cost += getTransectCost(transectIndices[lastNonDiscardTransect], transectIndices[i]);
    }
    const samples = transectSamples[i];
    const sampleMax =
      (curRowIdx !== undefined && i === curTransectIdx && transect.type !== TransectType.DEVIATED) ?
      curRowIdx : samples.length;
    let lastNonDiscardRow = -1;
    for (let j = 0; j < sampleMax; j++) {
      if (samples[j].type === RowType.DISCARDED) {
        continue;
      }
      cost += samples[j].measurements * BATTERY_COST_PER_SAMPLE;
      if (lastNonDiscardRow > -1) {
        cost += getRowCost(samples[lastNonDiscardRow], samples[j]);
      }
      lastNonDiscardRow = j;
    }
    lastNonDiscardTransect = i;
  }
  return cost;
}

// Function to load moisture data
export function getMoistureData() {
  return dataset.moisture;
}

// Function to load shear data 
export function getShearData() {
  return dataset.shear; 
}

export function getRandomMeasurements(isAlternativeHypo = false) {
  // Clone a copy of data
  const { y_H0, y_H1 } = measurements;
  const data = _.cloneDeep(isAlternativeHypo ? y_H1 : y_H0);
  for (let loc = 0; loc < data.length; loc++) {
    // Shuffle the order of measurements for each location
    for (let i = data[loc].length - 1; i >= 0; i--) {
      const rand = Math.round(Math.random() * i);
      const temp = data[loc][i];
      data[loc][i] = data[loc][rand];
      data[loc][rand] = temp;
    };
  }
  return data;
}

export function getBasename() {
  return window.location.host.startsWith('localhost') ? '' : '/~shenyuec';
}

// Get the number of measurements for a index until untilIndex
export function getNOMTaken(rows: IRow[], index, untilIndex = rows.length) {
  let sum = 0;
  for (let i = 0; i < untilIndex; i++) {
    if (rows[i].index === index && rows[i].type !== RowType.DISCARDED) {
      sum += rows[i].measurements;
    }
  }
  return sum;
}

export function cloneRow(row: IRow) : IRow {
  const clone: IRow = {
    index: row.index,
    measurements: row.measurements,
    type: row.type,
    normOffsetX: row.normOffsetX,
    normOffsetY: row.normOffsetY,
    isHovered: row.isHovered,
    moisture: row.moisture,
    shear: row.shear
  };
  return clone;
}

/**
 * Used in the scenario where you deviate and attempt to take more measurements
 * that would surpass 100% battery usage if your planned strategy was still
 * completed. Works from the last measurement to the first, removing samples
 * until the deviated measurements and the planned strategy fit within the 
 * battery constraint. Returns the array of samples for each transect.
 * 
 * Parameter batteryCost is the total battery usage, presumably over 100%.
 * 
 */
export function trimSamplesByBatteryUsage(batteryCost: number, transectSamples: IRow[][]) : IRow[][] {
  let extraCost = batteryCost - 1;
  const newSamples: IRow[][] = [];
  for (let i = 0; i < transectSamples.length; i++) {
    newSamples.push(new Array<IRow>());
  }

  for (let transectIndex = transectSamples.length - 1; transectIndex >= 0; transectIndex--) {
    for (let location = transectSamples[transectIndex].length - 1; location >= 0; location--) {
      const measurements = transectSamples[transectIndex][location].measurements;
      const cost = measurements * BATTERY_COST_PER_SAMPLE;

      if (extraCost <= 0) {
        // For all rows before the ones that need to be reduced, copy them over in full.
        newSamples[transectIndex].unshift(cloneRow(transectSamples[transectIndex][location]));
      } else if (extraCost - cost > 0) {
        // Remove all of these measurements
        const newRow: IRow = cloneRow(transectSamples[transectIndex][location]);
        extraCost -= newRow.measurements * BATTERY_COST_PER_SAMPLE;
        newRow.measurements = 0;
        // 
        // newSamples[transectIndex].unshift(newRow);
      } else {
        // Remove a portion of these measurements
        const measurementsToRemove = Math.ceil(extraCost / BATTERY_COST_PER_SAMPLE);
        const newRow: IRow = cloneRow(transectSamples[transectIndex][location]);
        newRow.measurements = newRow.measurements - measurementsToRemove;
        newSamples[transectIndex].unshift(newRow);
        extraCost -= measurementsToRemove * BATTERY_COST_PER_SAMPLE;
      }
    }
  }

  while (newSamples[newSamples.length - 1].length === 0) {
    newSamples.pop();
  }

  return newSamples;
}

export function RGBAtoRGB(color: number[], backgroundColor: number[]) : number[] {
  if (color.length < 4) return color;
  const a = color[3];
  return [
    (1 - a) * backgroundColor[0] + a * color[0],
    (1 - a) * backgroundColor[1] + a * color[1],
    (1 - a) * backgroundColor[2] + a * color[2]
  ];
}

export function randomInt(max: number) : number {
  return Math.floor(Math.random() * Math.floor(max));
}

export function mean(a: number[]) :  number {
  if (a.length === 0) return 0;
  return a.reduce((acc, v) => acc + (v ? v : 0), 0) / a.length;
}

export function getVector2Angle(v: number[]) : number {
  return Math.atan2(v[1], v[0]);
}

// MurmurHash3 hashing function
function xmur3(str) {
  for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
      h = h << 13 | h >>> 19;
  return function() {
      h = Math.imul(h ^ h >>> 16, 2246822507);
      h = Math.imul(h ^ h >>> 13, 3266489909);
      return (h ^= h >>> 16) >>> 0;
  }
}

// Mulberry32 random number generator
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function createRNG(seedString) {
  const seed = xmur3(seedString);
  return mulberry32(seed());
}

// This function is where the shear, moisture, and grain data is determined based on the user sample inputs.
// The transectIndex is also transect id. Location index is the value in [0, 21] for the position of the sample 
// on the curve. Measurements is the number of measurements taken at that point.
export function getMeasurements(globalState: IState, transectIndex: number, locationIndex: number, measurements: number) {
  const { fullData, moistureData } = globalState;
  // Should seed include the current number of measurements taken?
  const seed = `${transectIndex}${measurements}`;
  const rng = createRNG(seed);
  const shearValues: number[] = [];
  const moistureValues: number[] = [];
  const shearMoistureValues: {shearValue: number, moistureValue: number}[] = [];

  for (let i = 0; i < measurements; i++) {
    // const j = Math.floor(rng() * MAX_NUM_OF_MEASUREMENTS);
    // //console.log({transectIndex, locationIndex, measurements, j}); // for debugging
    // shearValues.push(fullData[locationIndex][j]);
    // moistureValues.push(moistureData[locationIndex][j]);
    // shearMoistureValues.push({shearValue: fullData[locationIndex][j], moistureValue: moistureData[locationIndex][j]});
    shearValues.push(fullData[locationIndex][i]);
    moistureValues.push(moistureData[locationIndex][i]);
    shearMoistureValues.push({shearValue: fullData[locationIndex][i], moistureValue: moistureData[locationIndex][i]});
  }
  //console.log({shearValues, moistureValues, grainValues, shearMoistureValues}); // for debugging
  return {shearValues, moistureValues, shearMoistureValues};
}

// This function parses the URL to determine whether the original or robotic version of the website will be used
// Original version with manual execution of strategy: https://www.seas.upenn.edu/~foraging/field/dev/#/
// New version with robotic suggested execution of strategy: https://www.seas.upenn.edu/~foraging/field/dev/#/?v=1
export function parseQueryString(query: string) {
  if (!query || !query.length) return {};
  if (query.startsWith('?')) query = query.substring(1);
  const blocks = query.split('&');
  let queryParams = {};
  blocks.forEach(block => {
    const i = block.indexOf('=');
    if (i === -1) queryParams[block] = null;
    if (i === 0) return;
    queryParams[decodeURI(block.substring(0, i))] = decodeURI(block.substring(i + 1));
  });
  return queryParams;
}

// Interface for aggregated sample data by location (indices 0 - 21 on the transect)
interface IAggregatedSamplesByLoc {
  location: number,
  measurements: number,
  moisture: number[],
  shear: number[],
}

// This function calculates the robot's suggested location
export async function calculateRobotSuggestions(actualStrategySamples: ActualStrategySample[], 
  globalState: IState, objectives: number[], objectivesRankings: number[]) {

  // Consolidate the objectives and their rankings, ordered by ranking in ascending order
  let objectivesRanked : any[] = [];
  for (let i = 0; i < objectives.length; i++) {
    objectivesRanked.push({objective: objectives[i], ranking: objectivesRankings[i]});
  }
  objectivesRanked.sort((a, b) => (a.ranking > b.ranking) ? 1 : -1);
  //console.log({objectivesRanked});

  // Create an array which contains the aggregated sample data by location
  let aggregatedSamplesByLoc : IAggregatedSamplesByLoc[] = buildAggregatedSamplesByLocation(actualStrategySamples);
  
  // Compute the Measurement Noise (standard deviation of shear strength at each location that has been sampled)
  let std_loc = computeMeasurementNoise(aggregatedSamplesByLoc);

  // Compute the direct Information Spatial Coverage for each sampled location
  let spatial_coverage = computeInformationSpatialCoverage(aggregatedSamplesByLoc);

  // Compute the Information Reward for each sampled location
  let spatial_reward = computeInformationSpatialReward(aggregatedSamplesByLoc, spatial_coverage);
  
  // Compute the Information Variable Coverage at sampled location
  let variable_coverage = computeInformationVariableCoverage(aggregatedSamplesByLoc);

  // Compute the Information Reward for each moisture selection
  let information_reward = computeInformationReward(variable_coverage); 
  
  // Compute the Moisture vs. Location Belief (not truncated)
  let moisture_v_locationBelief = computeMoistureVsLocationBelief(aggregatedSamplesByLoc, globalState);

  // Compute the distribution of variable space information reward at each location
  let moisture_reward = computeVariableSpaceInformationReward(moisture_v_locationBelief, information_reward);

  // Compute the potential discrepancy belief of sampled location using given hypothesis
  let potential_discrepancy_belief = await computePotentialDiscrepancyBelief(aggregatedSamplesByLoc, globalState);

  // Compute the belief of shear strength vs moisture
  let shearStrength_v_moisture = computeShearStrengthVsMoisture(potential_discrepancy_belief);

  // Compute the potential discrepancy reward
  let discrepancy_reward = computeDiscrepancyReward(moisture_v_locationBelief, shearStrength_v_moisture, potential_discrepancy_belief);

  // Round all the reward values to 4 decimal places (to align with Matlab examples)
  spatial_reward = spatial_reward.map(item => Number(item.toFixed(4)));
  moisture_reward = moisture_reward.map(item => Number(item.toFixed(4)));
  discrepancy_reward = discrepancy_reward.map(item => Number(item.toFixed(4)));

  // Compute the robot suggestions based on each objective (limit to 3 suggestions)
  let peaks : any = await computePeaks(spatial_reward, moisture_reward, discrepancy_reward);

  let peaksRankedSpatial : any[] = [];
  let peaksRankedVariable : any[] = [];
  let peaksRankedDiscrepancy : any[] = [];
  let peaksRankedDiscrepancyLows: any[] = [];

  for (let i = 0; i < peaks.spatial_locs.length; i++) {
    peaksRankedSpatial.push({loc: peaks.spatial_locs[i], spatialReward: spatial_reward[peaks.spatial_locs[i]]});
  }
  peaksRankedSpatial.sort((a, b) => (a.spatialReward < b.spatialReward) ? 1 : -1);

  for (let i = 0; i < peaks.variable_locs.length; i++) {
    peaksRankedVariable.push({loc: peaks.variable_locs[i], moistureReward: moisture_reward[peaks.variable_locs[i]]});
  }
  peaksRankedVariable.sort((a, b) => (a.moistureReward < b.moistureReward) ? 1 : -1);

  for (let i = 0; i < peaks.discrepancy_locs.length; i++) {
    peaksRankedDiscrepancy.push({loc: peaks.discrepancy_locs[i], discrepancyReward: discrepancy_reward[peaks.discrepancy_locs[i]]});
  }
  peaksRankedDiscrepancy.sort((a, b) => (a.discrepancyReward < b.discrepancyReward) ? 1 : -1);
  
  for (let i = 0; i < peaks.discrepancy_lows_locs.length; i++) {
    peaksRankedDiscrepancyLows.push({loc: peaks.discrepancy_lows_locs[i], discrepancyReward: discrepancy_reward[peaks.discrepancy_lows_locs[i]]});
  }
  peaksRankedDiscrepancyLows.sort((a, b) => (a.discrepancyReward > b.discrepancyReward) ? 1 : -1);

  console.log({aggregatedSamplesByLoc, std_loc, spatial_coverage, spatial_reward, variable_coverage, information_reward, moisture_v_locationBelief, moisture_reward, potential_discrepancy_belief, shearStrength_v_moisture, discrepancy_reward, peaks, peaksRankedSpatial, peaksRankedVariable, peaksRankedDiscrepancy, peaksRankedDiscrepancyLows});
  
  let locs;

  switch (objectivesRanked[0].objective) {
    case 0: {
      let peaksRankedSpatialTrimmed = peaksRankedSpatial.slice(0, 3);
      locs = peaksRankedSpatialTrimmed.map(suggestion => suggestion.loc);
      break;
    }
    case 1: {
      let peaksRankedVariableTrimmed = peaksRankedVariable.slice(0, 3);
      locs = peaksRankedVariableTrimmed.map(suggestion => suggestion.loc);
      break;
    }
    case 2: {
      let peaksRankedDiscrepancyTrimmed = peaksRankedDiscrepancy.slice(0, 3);
      locs = peaksRankedDiscrepancyTrimmed.map(suggestion => suggestion.loc);
      break;
    }
    case 3: {
      let peaksRankedDiscrepancyLowsTrimmed = peaksRankedDiscrepancyLows.slice(0, 3);
      locs = peaksRankedDiscrepancyLowsTrimmed.map(suggestion => suggestion.loc);
      break;
    }
  }

  let robotSuggestion : IRow[] = locs.map((loc) => {
    let suggestion : IRow = {
      index: loc,
      measurements: 3,
      type: RowType.ROBOT_SUGGESTION,
      normOffsetX: sampleLocations[loc][0],
      normOffsetY: sampleLocations[loc][1],
      isHovered: false
    }
    return suggestion;
  });

  console.log({robotSuggestion});

  return robotSuggestion;
}


function buildAggregatedSamplesByLocation(actualStrategySamples: ActualStrategySample[]) {

  let aggregatedSamplesByLoc : IAggregatedSamplesByLoc[] = [];
  
  for (let i = 0; i < actualStrategySamples.length; i++) {
    // Accumulate the total samples for each location
    let locationExists = false;
    for (let j = 0; j < aggregatedSamplesByLoc.length; j++) {
      if (actualStrategySamples[i].index == aggregatedSamplesByLoc[j].location) {
        locationExists = true;
        aggregatedSamplesByLoc[j].measurements += actualStrategySamples[i].measurements;
        aggregatedSamplesByLoc[j].moisture.push(...actualStrategySamples[i].moisture);
        aggregatedSamplesByLoc[j].shear.push(...actualStrategySamples[i].shear);
      }
    }

    // Location doesn't yet exist in the copy of the transect samples
    if (!locationExists) {
      let temp = {
        location: actualStrategySamples[i].index,
        measurements: actualStrategySamples[i].measurements,
        moisture: actualStrategySamples[i].moisture,
        shear: actualStrategySamples[i].shear,
      };
      aggregatedSamplesByLoc.push(temp);
    }
  }

  // Sort the transect samples by the location index in ascending order
  aggregatedSamplesByLoc.sort((a, b) => (a.location > b.location) ? 1 : -1);

  return aggregatedSamplesByLoc;
}


function computeMeasurementNoise(aggregatedSamplesByLoc : IAggregatedSamplesByLoc[]) {
  let std_loc = new Array(NUM_OF_LOCATIONS).fill(0);
  for (let i = 0; i < aggregatedSamplesByLoc.length; i++) {
    const n = aggregatedSamplesByLoc[i].shear.length;
    const mean = aggregatedSamplesByLoc[i].shear.reduce((a, b) => a + b) / n;
    const std = Math.sqrt(aggregatedSamplesByLoc[i].shear.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / (n - 1));
    std_loc[aggregatedSamplesByLoc[i].location] = std;
  }
  return std_loc;
}

function computeInformationSpatialCoverage(aggregatedSamplesByLoc : IAggregatedSamplesByLoc[]) {
  let I_s = new Array(NUM_OF_LOCATIONS).fill(0);

  for (let i = 0; i < NUM_OF_LOCATIONS; i++) {
    for (let j = 0; j < aggregatedSamplesByLoc.length; j++) {
      let I_s_s = Math.exp(-1/Math.sqrt(aggregatedSamplesByLoc[j].measurements));
      let gaussmf = Math.exp((-Math.pow((i - aggregatedSamplesByLoc[j].location), 2) / (2 * Math.pow(1.5, 2))));
      I_s[i] += I_s_s * gaussmf;
      I_s[i] = Math.min(I_s[i], 1); // set an upper bound of 1 for the information coverage
    }
  }
  return I_s;
}

function computeInformationSpatialReward(aggregatedSamplesByLoc : IAggregatedSamplesByLoc[], spatial_coverage : number[]) {
  // let R_s_set = new Array(NUM_OF_LOCATIONS).fill(0);
  // for (let i = 0; i < NUM_OF_LOCATIONS; i++) {
  //   let I_s_s_increase = 0;
  //   for (let j = 0; j < aggregatedSamplesByLoc.length; j++) {
  //     if (aggregatedSamplesByLoc[j].location == i) {
  //       I_s_s_increase = Math.exp(-1 / Math.sqrt(aggregatedSamplesByLoc[j].measurements + 3)) - Math.exp(-1 / Math.sqrt(aggregatedSamplesByLoc[j].measurements));
  //       break;
  //     }
  //   }
  //   if (I_s_s_increase == 0) {
  //     I_s_s_increase = Math.exp(-1 / Math.sqrt(3))
  //   }
  //   let I_s_s_increase_infer_matrix = new Array(NUM_OF_LOCATIONS).fill(0);
  //   let Max_increase_matrix = new Array(NUM_OF_LOCATIONS).fill(0);
  //   let R_s_matrix = new Array(NUM_OF_LOCATIONS).fill(0);
  //   for (let k = 0; k < NUM_OF_LOCATIONS; k++) {
  //     let gaussmf = Math.exp((-Math.pow((k - i), 2) / (2 * Math.pow(1.5, 2))));
  //     I_s_s_increase_infer_matrix[k] = I_s_s_increase * gaussmf;
  //     Max_increase_matrix[k] = 1 - spatial_coverage[k];
  //     R_s_matrix[k] = Math.min(I_s_s_increase_infer_matrix[k], Max_increase_matrix[k]);
  //   }
  //   let R_s = R_s_matrix.reduce((a, b) => a + b, 0);
  //   R_s_set[i] = R_s;
  // }
  //return R_s_set;

  let spatialReward = new Array(spatial_coverage.length).fill(0);
  for (let i = 0; i < spatial_coverage.length; i++) {
    spatialReward[i] = 1 - spatial_coverage[i];
  }
  return spatialReward;
}

function histogram(data, bins) {
  let min = Infinity;
  let max = -Infinity;

  for (const item of data) {
      if (item < min) min = item;
      else if (item > max) max = item;
  }

  const histogram = new Array(bins).fill(0);
  const binWidth = (max - min) / (bins - 1);

  // data points are treated as the bin centers
  let bottom = min - (binWidth / 2);
  for (const item of data) {
      //histogram[Math.floor((item - bottom) / binWidth)]++;
      histogram[Math.round(item) + 1]++;
  }

  return histogram;
}

function computeInformationVariableCoverage(aggregatedSamplesByLoc : IAggregatedSamplesByLoc[]) {

  let xx : number[] = [];
  // let moist : number[] = [];
  // for (let i = 0; i < moistureData.length; i++) {
  //   moist.push(moistureData[i][0]);
  // }

  for (let i = 0; i < aggregatedSamplesByLoc.length; i++) {
    for (let j = 0; j < aggregatedSamplesByLoc[i].measurements; j++) {
      xx.push(aggregatedSamplesByLoc[i].moisture[0]);
    }
  }

  let moistureBins = MOISTURE_BINS;
  let countMoist : number[] = histogram(xx, moistureBins);
  let I_v_s = countMoist.map((count) => {
    //count /= moistureBins;
    count = Math.exp(-1 / Math.sqrt(2 * count));
    return count;
  })

  let I_v = new Array(I_v_s.length).fill(0);
  for (let i = 0; i < I_v_s.length; i++) {
    for (let j = 0; j < I_v_s.length; j++) {
      let gaussmf = Math.exp((-Math.pow((j - i), 2) / (2 * Math.pow(1.5, 2))));
      I_v[i] += I_v_s[j] * gaussmf;
    }
    I_v[i] = Math.min(I_v[i], 1); 
  }

  //console.log({xx, countMoist, I_v_s, I_v});
  return I_v; 
}

function computeInformationReward(variable_coverage : number[]) {
  // let R_m_set = new Array(MOISTURE_BINS).fill(0);
  // let I_m_m_increase_infer_matrix = new Array(MOISTURE_BINS).fill(0);
  // let Max_increase_moisture_matrix = new Array(MOISTURE_BINS).fill(0);
  // let R_m_matrix = new Array(MOISTURE_BINS).fill(0);

  // for (let i = 0; i < MOISTURE_BINS; i++) {
  //   for (let j = 0; j < MOISTURE_BINS; j++) {
  //     let gaussmf = Math.exp((-Math.pow((j - i), 2) / (2 * Math.pow(1.5, 2))));
  //     I_m_m_increase_infer_matrix[j] = (3 / MOISTURE_BINS) * gaussmf;
  //   }
  //   for (let k = 0; k < MOISTURE_BINS; k++) {
  //     Max_increase_moisture_matrix[k] = 1 - variable_coverage[k];
  //     R_m_matrix[k] = Math.min(I_m_m_increase_infer_matrix[k], Max_increase_moisture_matrix[k]);
  //   }
  //   //Max_increase_moisture_matrix[i] = 1 - variable_coverage[i];
  //   //R_m_matrix[i] = Math.min(I_m_m_increase_infer_matrix[i], Max_increase_moisture_matrix[i]);
  //   let R_m = R_m_matrix.reduce((a, b) => a + b, 0);
  //   R_m_set[i] = R_m;
  //   console.log({I_m_m_increase_infer_matrix, Max_increase_moisture_matrix, R_m_matrix, R_m});
  // }
  let R_m_set = variable_coverage;
  return R_m_set;
}

function computeMoistureVsLocationBelief(aggregatedSamplesByLoc : IAggregatedSamplesByLoc[], globalState: IState) {

  let mean_moisture_each = new Array(NUM_OF_LOCATIONS).fill(0);
  let min_moisture_each = new Array(NUM_OF_LOCATIONS).fill(0);
  let max_moisture_each = new Array(NUM_OF_LOCATIONS).fill(0);

  const { moistureData } = globalState;
  let moist : number[] = [];
  for (let i = 0; i < moistureData.length; i++) {
    moist.push(moistureData[i][0]);
  }
  //console.log({moist});

  for (let i = 0; i < aggregatedSamplesByLoc.length; i++) {

    let moisture : number[] = [];
    for (let j = 0; j < aggregatedSamplesByLoc[i].measurements; j++) {
      moisture.push(moist[aggregatedSamplesByLoc[i].location]);
    }
    let moisture_mean = moisture.reduce((a, b) => a + b) / moisture.length;
    let moisture_std = Math.sqrt(moisture.map(x => Math.pow(x - moisture_mean, 2)).reduce((a, b) => a + b) / moisture.length);

    // check the first point
    if (i === 0) {
      // find the next point
      let moisture_next : number[] = [];
      for (let j = 0; j < aggregatedSamplesByLoc[i + 1].measurements; j++) {
        moisture_next.push(moist[aggregatedSamplesByLoc[i + 1].location]);
      }
      let moisture_mean_next = moisture_next.reduce((a, b) => a + b) / moisture_next.length;
      let moisture_std_next = Math.sqrt(moisture_next.map(x => Math.pow(x - moisture_mean_next, 2)).reduce((a, b) => a + b) / moisture_next.length);
      // compute the slope of ab
      let slope = (moisture_mean_next - moisture_mean) / (aggregatedSamplesByLoc[i + 1].location - aggregatedSamplesByLoc[i].location);
      // compute mean, max, min arrays (all 1x22)
      for (let j = 0; j < aggregatedSamplesByLoc[i].location; j++) {
        mean_moisture_each[j] = moisture_mean - slope * (aggregatedSamplesByLoc[i].location - j);
        min_moisture_each[j] = Math.min(moisture_mean - 2 * slope * (aggregatedSamplesByLoc[i].location - j), moisture_mean);
        max_moisture_each[j] = Math.max(moisture_mean - 2 * slope * (aggregatedSamplesByLoc[i].location - j), moisture_mean);
      }

    // check the last point
    } else if (i === aggregatedSamplesByLoc.length - 1) {
      // find the previous point d
      let moisture_prev : number[] = [];
      for (let j = 0; j < aggregatedSamplesByLoc[i - 1].measurements; j++) {
        moisture_prev.push(moist[aggregatedSamplesByLoc[i - 1].location]);
      }
      let moisture_mean_prev = moisture_prev.reduce((a, b) => a + b) / moisture_prev.length;
      let moisture_std_prev = Math.sqrt(moisture_prev.map(x => Math.pow(x - moisture_mean_prev, 2)).reduce((a, b) => a + b) / moisture_prev.length);
      // compute the slope of ab
      let slope = (moisture_mean - moisture_mean_prev) / (aggregatedSamplesByLoc[i].location - aggregatedSamplesByLoc[i - 1].location);
      // compute mean, max, min arrays (all 1x22)
      for (let j = aggregatedSamplesByLoc[i].location; j < NUM_OF_LOCATIONS; j++) {
        mean_moisture_each[j] = moisture_mean + slope * (j - aggregatedSamplesByLoc[i].location);
        min_moisture_each[j] = Math.min(moisture_mean + 2 * slope * ((NUM_OF_LOCATIONS - 1) - aggregatedSamplesByLoc[i].location), moisture_mean);
        max_moisture_each[j] = Math.max(moisture_mean + 2 * slope * ((NUM_OF_LOCATIONS - 1) - aggregatedSamplesByLoc[i].location), moisture_mean);
      }
      // also compute the previous part (ask Shipeng whether it should end before current location or at current location, there seems to be some overlap between lines 583 and 589)
      for (let k = aggregatedSamplesByLoc[i - 1].location; k < aggregatedSamplesByLoc[i].location + 1; k++) {
        mean_moisture_each[k] = moisture_mean + slope * (k - aggregatedSamplesByLoc[i].location);
        min_moisture_each[k] = Math.min(moisture_mean_prev, moisture_mean);
        max_moisture_each[k] = Math.max(moisture_mean_prev, moisture_mean);
      }
    
    // check all the middle points
    } else {
      // find the previous point d
      let moisture_prev : number[] = [];
      for (let j = 0; j < aggregatedSamplesByLoc[i - 1].measurements; j++) {
        moisture_prev.push(moist[aggregatedSamplesByLoc[i - 1].location]);
      }
      let moisture_mean_prev = moisture_prev.reduce((a, b) => a + b) / moisture_prev.length;
      let moisture_std_prev = Math.sqrt(moisture_prev.map(x => Math.pow(x - moisture_mean_prev, 2)).reduce((a, b) => a + b) / moisture_prev.length);
      let slope = (moisture_mean - moisture_mean_prev) / (aggregatedSamplesByLoc[i].location - aggregatedSamplesByLoc[i - 1].location);
      for (let j = aggregatedSamplesByLoc[i - 1].location; j < aggregatedSamplesByLoc[i].location; j++) {
        mean_moisture_each[j] = moisture_mean + slope * (j - aggregatedSamplesByLoc[i].location);
        min_moisture_each[j] = Math.min(moisture_mean_prev, moisture_mean);
        max_moisture_each[j] = Math.max(moisture_mean_prev, moisture_mean);
      }
    }
  }

  //console.log({mean_moisture_each, min_moisture_each, max_moisture_each});
  return {mean_moisture_each, min_moisture_each, max_moisture_each};

}

function computeVariableSpaceInformationReward(moisture_v_locationBelief, information_reward) {
  const { mean_moisture_each, min_moisture_each, max_moisture_each } = moisture_v_locationBelief;
  let R_v_set = new Array(NUM_OF_LOCATIONS).fill(0);
  let moisture_reward = new Array(NUM_OF_LOCATIONS).fill(0);

  for (let i = 0; i < NUM_OF_LOCATIONS; i++) {
    let std = (max_moisture_each[i] - min_moisture_each[i]) / 3;
    let moisture_possibility : number[] = [];
    let curr = min_moisture_each[i];
    while (curr <= max_moisture_each[i]) {
      moisture_possibility.push(curr);
      curr += 0.5;
    }

    let probability = new Array(moisture_possibility.length).fill(0);
    let actual_probability = new Array(moisture_possibility.length).fill(0);

    for (let j = 0; j < moisture_possibility.length; j++) {
      probability[j] = Math.exp((-Math.pow((moisture_possibility[j] - mean_moisture_each[i]), 2) / (2 * Math.pow(std, 2))));
    }
    let probability_sum = probability.reduce((a, b) => a + b);
    for (let j = 0; j < moisture_possibility.length; j++) {
      actual_probability[j] = probability[j] / probability_sum;
    }

    let R_m_l = 0;
    for (let j = 0; j < moisture_possibility.length; j++) {
      let moisture_index = 0;
      if (Math.round(moisture_possibility[j]) + 2 < 1) {
        moisture_index = 0;
      } else if (Math.round(moisture_possibility[j]) + 2 > 17) {
        moisture_index = 16;
      } else {
        moisture_index = Math.round(moisture_possibility[j]) + 1;
      }
      R_m_l += information_reward[moisture_index] * actual_probability[j];
      //console.log({R_m_l});
    }
    R_v_set[i] = R_m_l;
    moisture_reward[i] = 1 - R_v_set[i];

    //console.log({std, moisture_possibility, probability, actual_probability, R_m_l, R_v_set, information_reward});
  }
  return moisture_reward;
}

async function computePotentialDiscrepancyBelief(aggregatedSamplesByLoc : IAggregatedSamplesByLoc[], globalState: IState) {
  let temp_xx_yy_zz : any[] = [];
  let xx : number[] = [];
  let yy : number[] = [];
  let zz : number[] = [];
  
  const { moistureData, fullData } = globalState;
  let moist : number[] = [];
  for (let i = 0; i < moistureData.length; i++) {
    moist.push(moistureData[i][0]);
  }

  for (let i = 0; i < aggregatedSamplesByLoc.length; i++) {
    for (let j = 0; j < aggregatedSamplesByLoc[i].measurements; j++) {
      temp_xx_yy_zz.push({
        moistData: moist[aggregatedSamplesByLoc[i].location],
        shearData: fullData[aggregatedSamplesByLoc[i].location][j],
        loc: aggregatedSamplesByLoc[i].location
      });
    }
  }

  // Create the three arrays (xx, yy, zz) sorted by the moisture data in xx
  temp_xx_yy_zz.sort((a, b) => (a.moistData === b.moistData) ? 0 : (a.moistData > b.moistData) ? 1 : -1);
  for (let i = 0; i < temp_xx_yy_zz.length; i++) {
    xx.push(temp_xx_yy_zz[i].moistData);
    yy.push(temp_xx_yy_zz[i].shearData);
    zz.push(temp_xx_yy_zz[i].loc);
  }

  let moistureBins = MOISTURE_BINS;
  let countMoist : number[] = histogram(xx, moistureBins);

  let regressionResults;
  //let moistCoverage = countMoist.filter(element => element > 0).length / MOISTURE_BINS;

  // Run the piecewise linear regression which calls the regression function from the Flask Python backend server 
  regressionResults = await linearRegression(xx, yy, zz, moist);
  let loc = regressionResults.loc;
  let RMSE_distribution = regressionResults.err;
  let RMSE_spread = regressionResults.spread;
  let xfit = regressionResults.xfit;
  let xx_model = regressionResults.xx_model;
  let RMSE = regressionResults['err'].reduce((a, b) => a + b) / regressionResults['err'].length;

  //console.log({xx, yy, zz, temp_xx_yy_zz, RMSE, aggregatedSamplesByLoc, moist, countMoist, moistCoverage, regressionResults});

  return {
    xx,
    yy,
    zz,
    loc,
    RMSE_distribution,
    RMSE_spread,
    xfit,
    xx_model,
    RMSE
  }
}


function computeShearStrengthVsMoisture(potential_discrepancy_belief) {
  
  const { xx, yy, zz } = potential_discrepancy_belief;
  
  let xx_unique : number[] = Array.from(new Set(xx));
  let xx_mean = new Array(xx_unique.length).fill(0);
  let yy_mean = new Array(xx_unique.length).fill(0);

  for (let i = 0; i < xx_unique.length; i++) {
    let aa : number[] = [];
    for (let j = 0; j < xx.length; j++) {
      if (xx[j] === xx_unique[i]) {
        aa.push(j);
      }
    }
    let xx_finded = xx.filter((value, idx) => aa.includes(idx));
    let yy_finded = yy.filter((value, idx) => aa.includes(idx));
    xx_mean[i] = xx_finded.reduce((a, b) => a + b) / xx_finded.length;
    yy_mean[i] = yy_finded.reduce((a, b) => a + b) / yy_finded.length;
  }

  //console.log({xx, yy, xx_mean, yy_mean});

  let shearstrength_predict = new Array(MOISTURE_BINS).fill(0);
  let shearstrength_min = new Array(MOISTURE_BINS).fill(0);
  let shearstrength_max = new Array(MOISTURE_BINS).fill(0);

  for (let i = 0; i < xx_mean.length; i++) {
    
    let moisture_mean = xx_mean[i];
    let shearstrength_mean = yy_mean[i];

    //console.log({moisture_mean, shearstrength_mean});

    // check the first point
    if (i === 0) {
      // find the next point b
      let moisture_mean_next = xx_mean[i + 1];
      let shearstrength_mean_next = yy_mean[i + 1];
      // compute the slope of ab
      let slope = (shearstrength_mean_next - shearstrength_mean) / (moisture_mean_next - moisture_mean);
      for (let j = 1; j <= Math.floor(xx_unique[i]) + 2; j++) {
        shearstrength_predict[j - 1] = shearstrength_mean - slope * (moisture_mean + 2 - j);
        shearstrength_min[j - 1] = Math.min(2 * shearstrength_predict[0] - shearstrength_mean, shearstrength_mean);
        shearstrength_max[j - 1] = Math.max(2 * shearstrength_predict[0] - shearstrength_mean, shearstrength_mean);
      }

    // check the last point
    } else if (i === xx_mean.length - 1) {
      // find the next point b
      let moisture_mean_prev = xx_mean[i - 1];
      let shearstrength_mean_prev = yy_mean[i - 1];
      // compute the slope of ab
      let slope = (shearstrength_mean - shearstrength_mean_prev) / (moisture_mean - moisture_mean_prev);
      for (let j = Math.ceil(xx_unique[i]) + 2; j <= 19; j++) {
        shearstrength_predict[j - 1] = shearstrength_mean + slope * (j - moisture_mean - 2);
        // find index of last non-zero number in shearstrength_predict array
        let idx = shearstrength_predict.length - 1;
        for (let k = shearstrength_predict.length - 1; k >= 0; k--) {
          if (shearstrength_predict[k] != 0) {
            idx = k;
            break;
          }
        }
        shearstrength_min[j - 1] = Math.min(2 * shearstrength_predict[idx] - shearstrength_mean, shearstrength_mean);
        shearstrength_max[j - 1] = Math.max(2 * shearstrength_predict[idx] - shearstrength_mean, shearstrength_mean);
      }
      for (let j = Math.ceil(xx_unique[i - 1]) + 2; j <= Math.floor(xx_unique[i]) + 2; j++) {
        shearstrength_predict[j - 1] = shearstrength_mean + slope * (j - moisture_mean - 2);
        shearstrength_min[j - 1] = Math.min(yy_mean[i - 1], yy_mean[i]);
        shearstrength_max[j - 1] = Math.max(yy_mean[i - 1], yy_mean[i]);
      }

    // check the middle points
    } else {
      // find the next point b
      let moisture_mean_prev = xx_mean[i - 1];
      let shearstrength_mean_prev = yy_mean[i - 1];
      // compute the slope of ab
      let slope = (shearstrength_mean - shearstrength_mean_prev) / (moisture_mean - moisture_mean_prev);
      for (let j = Math.ceil(xx_unique[i - 1]) + 2; j <= Math.floor(xx_unique[i]) + 2; j++) {
        shearstrength_predict[j - 1] = shearstrength_mean + slope * (j - moisture_mean - 2);
        shearstrength_min[j - 1] = Math.min(yy_mean[i - 1], yy_mean[i]);
        shearstrength_max[j - 1] = Math.max(yy_mean[i - 1], yy_mean[i]);
      }
    }
  }

  let shearstrength_range = new Array(shearstrength_min.length).fill(0);
  for (let i = 0; i < shearstrength_range.length; i++) {
    shearstrength_range[i] = shearstrength_max[i] - shearstrength_min[i];
  }

  //console.log({shearstrength_min, shearstrength_max, shearstrength_range, shearstrength_predict});
  return {shearstrength_min, shearstrength_max, shearstrength_range, shearstrength_predict};
}

function computeDiscrepancyReward(moisture_v_locationBelief, shearStrength_v_moisture, potential_discrepancy_belief) {
  
  const { mean_moisture_each, min_moisture_each, max_moisture_each } = moisture_v_locationBelief;
  const { shearstrength_min, shearstrength_max, shearstrength_range, shearstrength_predict } = shearStrength_v_moisture;
  const { xx_model } = potential_discrepancy_belief;

  let R_d_set = new Array(NUM_OF_LOCATIONS).fill(0);
  for (let i = 0; i < NUM_OF_LOCATIONS; i++) {
    let std_moist = (max_moisture_each[i] - min_moisture_each[i]) / 3;
    let moisture_possibility : number[] = [];
    let curr = min_moisture_each[i];
    while (curr <= max_moisture_each[i]) {
      moisture_possibility.push(curr);
      curr += 1;
    }

    let moisture_probability = new Array(moisture_possibility.length).fill(0);
    let moisture_actual_probability = new Array(moisture_possibility.length).fill(0);

    for (let j = 0; j < moisture_possibility.length; j++) {
      moisture_probability[j] = Math.exp((-Math.pow((moisture_possibility[j] - mean_moisture_each[i]), 2) / (2 * Math.pow(std_moist, 2))));
    }
    let moisture_probability_sum = moisture_probability.reduce((a, b) => a + b);
    for (let j = 0; j < moisture_possibility.length; j++) {
      moisture_actual_probability[j] = moisture_probability[j] / moisture_probability_sum;
    }
    
    let R_d_m = 0;
    // given the moisture possibility, we are going to compute the probability of getting certain discrepancy
    for (let j = 0; j < moisture_possibility.length; j++) {
      let moisture_index = 0;
      if (Math.round(moisture_possibility[j]) + 2 < 1) {
        moisture_index = 0;
      } else if (Math.round(moisture_possibility[j]) + 2 > 17) {
        moisture_index = 16;
      } else {
        moisture_index = Math.round(moisture_possibility[j]) + 1;
      }

      let shearstrength_std = (shearstrength_range[moisture_index]) / 3;
      let shearstrength_possibility : number[] = [];
      let curr = shearstrength_min[moisture_index];
      while (curr <= shearstrength_max[moisture_index]) {
        shearstrength_possibility.push(curr);
        curr += 1;
      }
      let shearstrength_probability = new Array(shearstrength_possibility.length).fill(0);
      let shearstrength_actual_probability = new Array(shearstrength_possibility.length).fill(0);
      for (let k = 0; k < shearstrength_possibility.length; k++) {
        shearstrength_probability[k] = Math.exp((-Math.pow((shearstrength_possibility[k] - shearstrength_predict[moisture_index]), 2) / (2 * Math.pow(shearstrength_std, 2))));
      }
      let shearstrength_probability_sum = shearstrength_probability.reduce((a, b) => a + b);
      for (let k = 0; k < shearstrength_possibility.length; k++) {
        shearstrength_actual_probability[k] = shearstrength_probability[k] / shearstrength_probability_sum;
      }
      let shearstrenth_hypo_value = xx_model[moisture_index];
      let R_d_l = 0;
      for (let k = 0; k < shearstrength_possibility.length; k++) {
        R_d_l += shearstrength_actual_probability[k] * Math.abs(shearstrength_possibility[k] - shearstrenth_hypo_value);
      }
      R_d_m += R_d_l * moisture_actual_probability[j];

      //console.log({shearstrength_possibility, shearstrength_probability, shearstrength_actual_probability, shearstrength_std, shearstrenth_hypo_value});

    }

    R_d_set[i] = R_d_m;

    //console.log({moisture_possibility, std_moist, moisture_probability, moisture_actual_probability});
    
  }

  let discrepancyReward = new Array(R_d_set.length).fill(0);
  for (let i = 0; i < R_d_set.length; i++) {
    discrepancyReward[i] = R_d_set[i] / 3;
  }

  //console.log({discrepancyReward});

  return discrepancyReward;
}

function linearRegression(xx: number[], yy: number[], zz: number[], moist: number[]) {

  let inputs = {
    xx : xx,
    yy: yy,
    zz: zz,
    moist: moist
  }
  
  return new Promise((resolve, reject) => {
    //fetch('https://fling.seas.upenn.edu/~foraging/cgi-bin/application.cgi/regression', { //production URL
    fetch('http://127.0.0.1:5000/regression', { //local development URL
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': "application/json",
      },
      body: JSON.stringify(inputs), 
    }).then(
      res => res.json()
    ).then(
      data => {
        //console.log({data});
        resolve(data);
      }
    ).catch((err) => {
      reject(err);
    });
  });
}

function computePeaks(spatial_reward: number[], moisture_reward: number[], discrepancy_reward: number[]) {
  let inputs = {
    spatial_reward: spatial_reward,
    moisture_reward: moisture_reward,
    discrepancy_reward: discrepancy_reward
  }

  console.log({inputs});

  return new Promise((resolve, reject) => {
    //fetch('https://fling.seas.upenn.edu/~foraging/cgi-bin/application.cgi/findpeaks', { //production URL
    fetch('http://127.0.0.1:5000/findpeaks', { //local development URL
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': "application/json",
      },
      body: JSON.stringify(inputs), 
    }).then(
      res => res.json()
    ).then(
      data => {
        //console.log({data});
        resolve(data);
      }
    ).catch((err) => {
      reject(err);
    });
  });
}
