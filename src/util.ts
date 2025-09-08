import * as _ from 'lodash';
import { NORMALIZED_WIDTH, RowType, sampleLocations, NUM_OF_LOCATIONS, objectiveOptions,
  MOISTURE_BINS, NUM_MEASUREMENTS, MAX_NUM_OF_MEASUREMENTS } from './constants';
import { measurements } from './measurements';
import { dataset } from './data/rhexDataset';
import { Sample, PreSample, Objective } from './types';
import { IState } from './state';


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

// Function to load moisture data
export function getMoistureData() {
  return dataset.moisture;
}

// Function to load shear data 
export function getShearData(dataVersion: number) {
  if (dataVersion === 0) return dataset.shear0; 
  return dataset.shear1;
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
export function getNOMTaken(samples: Sample[], index, untilIndex = samples.length) {
  let sum = 0;
  for (let i = 0; i < untilIndex; i++) {
    if (samples[i].index === index) {
      sum += samples[i].measurements;
    }
  }
  return sum;
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
    const j = Math.floor(Math.random() * MAX_NUM_OF_MEASUREMENTS);
    shearValues.push(fullData[locationIndex][j]);
    moistureValues.push(moistureData[locationIndex][j]);
    shearMoistureValues.push({shearValue: fullData[locationIndex][j], moistureValue: moistureData[locationIndex][j]});
  }
  //console.log({shearValues, moistureValues, grainValues, shearMoistureValues}); // for debugging
  return {shearValues, moistureValues, shearMoistureValues};
}

// This function the new function to add the new data typed in by user manually
export function getUserMeasurements(globalState: IState, transectIndex: number, locationIndex: number, measurements: number) {
  const {userStrengthData,  userLocationData } = globalState;
  // Should seed include the current number of measurements taken?
  const seed = `${transectIndex}${measurements}`;
  const rng = createRNG(seed);
  const strengthValues: number[] = [];
  const locationValues: number[] = [];
  const shearMoistureValues: {strengthValue: number, locationValue: number}[] = [];
  for (let i = 0; i < measurements; i++) {
    const j = Math.floor(Math.random() * MAX_NUM_OF_MEASUREMENTS);
    strengthValues.push(userStrengthData[locationIndex][j]);
    locationValues.push(userLocationData[locationIndex][j]);
    shearMoistureValues.push({strengthValue: userStrengthData[locationIndex][j], locationValue: userLocationData[locationIndex][j]});
  }
  //console.log({shearValues, moistureValues, grainValues, shearMoistureValues}); // for debugging
  return {strengthValues, locationValues, shearMoistureValues};
}

// export function pushUserMeasurements(globalState: IState, strength:string, location:string){
//   const {userStrengthData, userLocationData} = globalState;
//   userStrengthData.push(Number(strength));
//   userLocationData.push(Number(location));
// }

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

// This function calculates the robot's suggested location
export async function calculateRobotSuggestions(samples: Sample[], globalState: IState, objectives: Objective[]) {

  // Prepare inputs for flask backend calculation
  let locations : number[] = [];
  let measurements : number[] = [];
  let moistureValues : number[][] = [];
  let shearValues : number[][] = [];

  for (let i = 0; i < samples.length; i++) {
    locations.push(samples[i].index);
    measurements.push(samples[i].measurements);
    moistureValues.push(Array.from(samples[i].moisture));
    shearValues.push(Array.from(samples[i].shear));
  }

  // Extract human input parameters from existing global state
  const { currUserStep } = globalState;
  
  // Extract human objectives from objectives array (assuming first objective is info, second is discrepancy)
  const human_objectives = objectives.length >= 2 ? [objectives[0].ranking, objectives[1].ranking] : [1, 0];
  
  // Use hypoConfidence as human confidence
  const human_confidence = currUserStep.hypoConfidence;
  
  // Use humanSuggestedLocation if available, otherwise null
  const human_selected_location = globalState.humanSuggestedLocation;
  
  // Calculate human weights based on objectives ranking (normalize to sum to 1)
  const totalRanking = human_objectives.reduce((sum, rank) => sum + rank, 0);
  const human_weights = totalRanking > 0 
    ? [human_objectives[0] / totalRanking, human_objectives[1] / totalRanking] as [number, number]
    : [1.0, 0.0] as [number, number];

  // Compute the robot suggestions based on each objective (limit to 3 suggestions)
  let robotSuggestions : any = await flaskCalculations(
    locations, 
    measurements, 
    moistureValues, 
    shearValues,
    human_objectives,
    human_weights,
    human_confidence,
    human_selected_location
  );
  console.log(robotSuggestions)
  
  let final_suggestion = [robotSuggestions.final_suggestion]
  let discrepancy_selection = [0.1,0.2,0.4]
  let spatial_reward = []
  let variable_reward = []
  let discrepancy_reward = []
  // Return the top 3 suggested locations unordered
  let locs;
  locs = final_suggestion;
  let results : PreSample[] = locs.map((loc) => {
    let suggestion : PreSample = {
      index: loc,
      type: 'robot',
      measurements: NUM_MEASUREMENTS,
      normOffsetX: 300,
      normOffsetY: 300,
      isHovered: false
    }
    return suggestion;
  });
  
  // Extract weights from the response and update objectives if weights are not 0
  if (robotSuggestions.weights && robotSuggestions.weights.length > 0) {
    const weights = robotSuggestions.weights;
    console.log('Received weights from backend:', weights);
    console.log('Current objectives count:', objectives.length);
    
    // Check if any weight is not 0 and update objectives accordingly
    if (weights.some((weight: number) => weight > 0)) {
      // Create new objectives based on weights and objectiveOptions constants
      let updatedObjectives: Objective[] = [];
      
      for (let i = 0; i < weights.length; i++) {
        if (weights[i] > 0 && i < objectiveOptions.length) {
          const newRanking = weights[i] > 0.5 ? 1 : 2;
          updatedObjectives.push({
            objective: objectiveOptions[i],
            ranking: newRanking,
            addressedRating: 1
          });
          console.log(`Created objective ${i} (${objectiveOptions[i]}) with ranking ${newRanking} based on weight ${weights[i]}`);
        }
      }
      
      console.log('Updated objectives based on weights:', updatedObjectives);
      
      // Return the updated objectives along with the results
      return {
        results: results,
        spatialReward: spatial_reward,
        variableReward: variable_reward,
        discrepancyReward: discrepancy_reward,
        updatedObjectives: updatedObjectives,
        weights: weights
      };
    }
  }

  console.log({locations, measurements, moistureValues, shearValues, robotSuggestions, results});
  
  return {
    results: results,
    spatialReward: spatial_reward,
    variableReward: variable_reward,
    discrepancyReward: discrepancy_reward
  };
}

function flaskCalculations(
  locations: number[], 
  measurements: number[], 
  moistureValues: number[][], 
  shearValues: number[][],
  human_objectives: number[] = [1, 0],
  human_weights: number[] = [1.0, 0.0],
  human_confidence: number = 0,
  human_selected_location: number | null = null
) {

  let inputs = {
    locations : locations,
    measurements: measurements,
    moistureValues: moistureValues,
    shearValues: shearValues,
    human_objectives: human_objectives,
    human_weights: human_weights,
    human_confidence: human_confidence,
    human_selected_location: human_selected_location,
  }
  
  return new Promise((resolve, reject) => {
    // fetch('https://fling.seas.upenn.edu/~foraging/cgi-bin/application.cgi/process', { //production URL
    fetch('http://127.0.0.1:5000/process', { //local development URL
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
        console.log({data});
        resolve(data);
      }
    ).catch((err) => {
      reject(err);
    });
  });
}
