import * as Chart from 'chart.js';
import { RGBAtoRGB } from './util';

// These should match the canvas dimensions used in "transectDiagramPoints.html"
export const NORMALIZED_WIDTH = 1100;
export const NORMALIZED_HEIGHT = 321;

// These are the min and max normOffsetX values (refer to "ClickableImage.tsx") that allow for user to input a measurement number 
// when user clicks on the dune transect image). These are calculated by subtracting the square root of the "maxSquare" value in 
// the "getNearestIndex" function in "util.ts" from the minimum x value in "sampleLocations" below and adding the value to the 
// maximum x value in "sampleLocations."
export const NORMALIZED_CREST_RANGE = {min: 209, max: 1089} // {209 = 229 - sqrt(400)}, {1089 = 1069 + sqrt(400)}

export const NUM_OF_LOCATIONS = 22;
export const NUM_MEASUREMENTS = 3;
export const MAX_NUM_OF_MEASUREMENTS = 30;
export const MAX_NUM_OF_TRANSECTS = 5;
export const POPOVER_TIME = 3000;
export const NUM_OF_HYPOS = 3;
export const DISABLE_ROC = true;
export const BATTERY_COST_PER_SAMPLE = 0.005;
export const BATTERY_COST_PER_DISTANCE = 0.00005;
export const BATTERY_COST_PER_TRANSECT_DISTANCE = 3;
export const DOMINANT_WIND_DIRECTION = 50;
export const MOISTURE_BINS = 19;
// Milliseconds within which progress is automatically loaded on page load.
export const AUTO_LOAD_MS = 1000;

export const sampleLocations = [
	[229, 70],
	[269, 72],
	[309, 75],
	[349, 81],
	[389, 87],
	[429, 95],
	[469, 105],
	[509, 116],
	[549, 129],
	[589, 144],
	[629, 160],
	[669, 179],
	[709, 199.5],
	[749, 222.5],
	[789, 247.5],
	[829, 275],
	[869, 289],
	[909, 289],
	[949, 289],
	[989, 289],
	[1029, 289],
	[1069, 289],
];

// Starting points for the transect lines on the map page
const startPoints = [
	[-106.26928360156869, 32.85162167123761],
	[-106.26529940991175, 32.847353247729494],
	[-106.26193282386595, 32.844373506919155],
	[-106.26668874128731, 32.85475792207893],
	[-106.26165156500755, 32.8509280332359],
	[-106.25795691938033, 32.84829630388709],
	[-106.2635795501701, 32.85902175150445],
	[-106.25860036963778, 32.85581316766943],
	[-106.25499358776841, 32.851687875848775],
	[-106.26100693271327, 32.863859906532134],
	[-106.25617266972388, 32.859652607081316],
	[-106.25104805644285, 32.854564724581344],
	[-106.25751085218438, 32.869093320362964],
	[-106.25201115822408, 32.86377891431054],
	[-106.24727944816382, 32.85846887602706],
	[-106.25466854101373, 32.87343881912305],
	[-106.24732210653758, 32.867814157865176],
	[-106.24206779880228, 32.86212543119846],
	[-106.25069665370864, 32.8778786567665],
	[-106.2426231270416, 32.87244639425466],
	[-106.23756437625691, 32.868235493675044],
	[-106.24753752687567, 32.88145161575366],
	[-106.24018625365095, 32.87539384955314],
	[-106.23488625303568, 32.87176975662168],
];

// Ending points for the transect lines on the map page
const endPoints = [
	[-106.26858342070356, 32.85257700593614],
	[-106.26446663793848, 32.848298019219335],
	[-106.26130810052051, 32.84511605741361],
	[-106.26603163619139, 32.855782013520034],
	[-106.26097518175534, 32.851750914328576],
	[-106.2571029693612, 32.84919613303188],
	[-106.2628314420193, 32.860261572253926],
	[-106.25774565681361, 32.85707678143372],
	[-106.2544027572664, 32.852472376867404],
	[-106.2603207388519, 32.865024537118266],
	[-106.25555316077995, 32.860633233092294],
	[-106.25012917681488, 32.855760770222965],
	[-106.25679784445457, 32.87077567471458],
	[-106.2506294183946, 32.865028674947084],
	[-106.24606558006272, 32.85941787802385],
	[-106.25393558578578, 32.87466022405076],
	[-106.24644153599101, 32.86873455404491],
	[-106.2411026639593, 32.8631348158884],
	[-106.24998874403248, 32.87902098969675],
	[-106.24188519392652, 32.873264444740876],
	[-106.2366635323014, 32.86942427360613],
	[-106.24683439460304, 32.88265840811009],
	[-106.23950405684177, 32.876449753033086],
	[-106.23396763463124, 32.872872893737465],
];

// Maps transect ID to an index [0:9] used for grain size calculation, since
// grain size uses 10 sets of values based on wind strength at a position.
export const windPositionIndices = [] as number[];
for (let i = 0; i < 24; i++) windPositionIndices.push(Math.floor(Math.random() * 10));

const chartTransparency = 1.0;
const locationBaseColors = [
	[194, 19, 19], //locations 1-3: red
	[240, 97, 97],
	[245, 157, 157],          
	[228, 124, 21], //locations 4-6: orange
	[238, 165, 92],
	[241, 196, 151],
	[202, 202, 31], //locations 7-8: yellow
	[220, 220, 96],
	[60, 173, 60], //locations 9-11: green
	[77, 228, 77],
	[168, 249, 168],
	[21, 203, 203], //locations 12-13: cyan
	[50, 234, 234],
	[39, 83, 179], //locations 14-16: blue
	[55, 115, 245],
	[142, 176, 249],
	[135, 39, 179], //locations 17-19: purple
	[204, 96, 255],
	[231, 192, 251],
	[190, 9, 200], //locations 20-22: pink
	[238, 20, 250],
	[249, 137, 255],
];
export const locationColors = locationBaseColors.map(c =>
  `rgb(${RGBAtoRGB([...c, chartTransparency], [255, 255, 255]).join(", ")})`
);

// Setting up the transect lines on the map page using the startPoints and endPoints defined above
const line : LineSegment[] = [];
for (let i = 0; i < startPoints.length; i++) {
  line.push({
    from: startPoints[i],
    to: endPoints[i],    
    color: [28, 76, 132],
    id: i
  });
}
export const transectLines = line; // called in GeoMap.tsx to set up the transect lines on the map

// Setting up the Rhex icons on the map page for indicating which transects have been visited.
// The Rhex icons are positioned a constant distance away from each transect.
const rhexToTransectGapLongitudeStart = -0.0015; 
const rhexToTransectGapLatitudeStart = 0.0004;
const rhexToTransectGapLongitudeEnd = -0.00129; 
const rhexToTransectGapLatitudeEnd = 0.0001;

const rhexPoints : any[] = [];
for (let i = 0; i < startPoints.length; i++) {
  rhexPoints.push({
    coordinatesStart: [startPoints[i][0] + rhexToTransectGapLongitudeStart, startPoints[i][1] + rhexToTransectGapLatitudeStart],
    coordinatesEnd: [startPoints[i][0] + rhexToTransectGapLongitudeEnd, startPoints[i][1] + rhexToTransectGapLatitudeEnd],
    id: i
  });
}
export const rhexLocations = rhexPoints;

export const initialConfidenceTexts = [
  'I am highly certain this hypothesis will be refuted',
  'I am moderately certain this hypothesis will be refuted',
  'I am somewhat certain this hypothesis will be refuted',
  'I am unsure',
  'I am somewhat certain this hypothesis will be supported',
  'I am moderately certain this hypothesis will be supported',
  'I am highly certain this hypothesis will be supported'
];

export const confidenceTexts = [
  'I am highly certain this hypothesis is refuted',
  'I am moderately certain this hypothesis is refuted',
  'I am somewhat certain this hypothesis is refuted',
  'I am unsure',
  'I am somewhat certain this hypothesis is supported',
  'I am moderately certain this hypothesis is supported',
  'I am highly certain this hypothesis is supported'
];

export const experimentTitles = {
  soil: "Soil Strength vs. Soil Moisture",
  grain: "Grain Size vs. Dune Location"
}

export const hypothesisTitles = {
  soil: [
      "Null Hypothesis",
      "Alternative hypothesis 1",
      "Alternative hypothesis 2"
  ],
  grain: [
      "Null Hypothesis",
      "Alternative hypothesis 1 - Single Sediment Source",
      "Alternative hypothesis 2 - Multiple Sediment Sources"
  ]
};

export const hypothesesTexts = {
  soil: [
      "Soil moisture has no discernible effect on soil strength.",
      "Soil moisture and soil strength increase together (moving from crest to interdune) until sand is saturated, at which point strength is constant as moisture continues to increase.",
      "Soil moisture and strength increase together (moving from crest to interdune) until sand is saturated, at which point strength drops before becoming constant and moisture continues to increase."
  ],
  grain: [
      "There is no discernible trend in grain size across the dune field.",
      "Grain size decreases gradually and systematically downwind.",
      "Grain size oscillates downwind, due to the presence of more than one sediment source."
  ]
};


export enum RowType {
  NORMAL = 'Normal',
  DEVIATE = 'Deviate',
  DISCARDED = 'Discarded',
  ROBOT_SUGGESTION = 'Robot_Suggestion'
};

export const PopboxTypeEnum = {
  INFO: 'info',
  ERROR: 'error'
};

export const shearChartOption = {
  type: 'scatter',
  data: {
    datasets: [
      {
        label: 'Shear',
        yAxisID: 'shear',
        data: []
      }
    ]
  },
  options: {
      title: {
        display: true,
        text: "Shear Strength vs Normalized Distance",
        fontStyle: "bold"
      },
      responsive: true,
      maintainAspectRatio: false,
      chartArea: { backgroundColor: '#FFF' },
      legend: { display: false },
      elements: {
        point: {
          radius: 6,
          hoverRadius: 6,
          borderWidth: 0,
          hoverBorderWidth: 0,
          backgroundColor(context) {
            const { dataIndex, dataset } = context;
            const point = dataset.data[dataIndex];
            return locationColors[point.index];
          }
        }
      },
      // Disable all animations
      animation: {
        duration: 0
      },
      hover: {
        animationDuration: 0
      },
      onHover: null as any,
      responsiveAnimationDuration: 0,
      scales: {
          yAxes: [{
            position: 'left',
            id: 'shear',
            scaleLabel: {
              display: true,
              labelString: 'Shear Strength (N)'
            },
            ticks: {
              min: 0,
              max: 1
            }
          }],
          xAxes: [{
              type: 'linear',
              position: 'bottom',
              scaleLabel: {
                display: true,
                labelString: 'Normalized distance from crest'
              },
              ticks: {
                min: 0,
                max: 1
              }
          }]
      },
      tooltips: {
        callbacks: {
            label: function(tooltipItem, data) {
              const { datasetIndex, index } = tooltipItem;
              const rawData = data.datasets[datasetIndex].data[index];
              const { x, y, rowIndex } = rawData;
              return `(${x.toFixed(2)}, ${y.toFixed(2)})`;
            }
        }
    }
  }
};

export const moistChartOption = {
  type: 'scatter',
  data: {
    datasets: [
      {
        label: 'Moisture',
        yAxisID: 'moisture',
        data: []
      }
    ]
  },
  options: {
      title: {
        display: true,
        text: "Moisture Percentage vs Normalized Distance",
        fontStyle: "bold"
      },
      responsive: true,
      maintainAspectRatio: false,
      chartArea: { backgroundColor: '#FFF' },
      legend: { display: false },
      elements: {
        point: {
          radius: 6,
          hoverRadius: 6,
          borderWidth: 0,
          hoverBorderWidth: 0,
          backgroundColor(context) {
            const { dataIndex, dataset } = context;
            const point = dataset.data[dataIndex];
            return locationColors[point.index];
          }
        }
      },
      // Disable all animations
      animation: {
        duration: 0
      },
      hover: {
        animationDuration: 0
      },
      onHover: null as any,
      responsiveAnimationDuration: 0,
      scales: {
          yAxes: [
          {
            id: 'moisture',
            scaleLabel: {
              display: true,
              labelString: 'Moisture Percentage'
            },
            ticks: {
              min: 0,
              max: 10
            }
          }],
          xAxes: [{
              type: 'linear',
              position: 'bottom',
              scaleLabel: {
                display: true,
                labelString: 'Normalized distance from crest'
              },
              ticks: {
                min: 0,
                max: 1
              }
          }]
      },
      tooltips: {
        callbacks: {
            label: function(tooltipItem, data) {
              const { datasetIndex, index } = tooltipItem;
              const rawData = data.datasets[datasetIndex].data[index];
              const { x, y, rowIndex } = rawData;
              return `(${x.toFixed(2)}, ${y.toFixed(2)})`;
            }
        }
    }
  }
};

export const shearMoistChartOption = {
  type: 'scatter',
  data: {
    datasets: [
      {
        label: 'Moisture',
        yAxisID: 'moisture',
        data: []
      }
    ]
  },
  options: {
      title: {
        display: true,
        text: "Shear Strength vs Moisture Percentage",
        fontStyle: "bold"
      },
      responsive: true,
      maintainAspectRatio: false,
      chartArea: { backgroundColor: '#FFF' },
      legend: { display: false },
      elements: {
        point: {
          radius: 6,
          hoverRadius: 6,
          borderWidth: 0,
          hoverBorderWidth: 0,
          backgroundColor(context) {
            const { dataIndex, dataset } = context;
            const point = dataset.data[dataIndex];
            return locationColors[point.index];
          }
        }
      },
      // Disable all animations
      animation: {
        duration: 0
      },
      hover: {
        animationDuration: 0
      },
      onHover: null as any,
      responsiveAnimationDuration: 0,
      scales: {
          yAxes: [
          {
            id: 'moisture',
            scaleLabel: {
              display: true,
              labelString: 'Shear Strength'
            },
            ticks: {
              min: 0,
              max: 10
            }
          }],
          xAxes: [{
              type: 'linear',
              position: 'bottom',
              scaleLabel: {
                display: true,
                labelString: 'Moisture Percentage'
              },
              ticks: {
                min: 0,
                max: 1
              }
          }]
      },
      tooltips: {
        callbacks: {
            label: function(tooltipItem, data) {
              const { datasetIndex, index } = tooltipItem;
              const rawData = data.datasets[datasetIndex].data[index];
              const { x, y, rowIndex } = rawData;
              return `(${x.toFixed(2)}, ${y.toFixed(2)})`;
            }
        }
    }
  }
};

export const grainChartOption = {
  type: 'scatter',
  data: {
    datasets: [
      {
        label: 'Grain Size',
        yAxisID: 'grainSize',
        pointStyle: 'circle',
        data: []
      }
    ]
  },
  options: {
      title: {
        display: true,
        text: "Grain Size vs Normalized Distance",
        fontStyle: "bold"
      },
      responsive: true,
      maintainAspectRatio: false,
      chartArea: { backgroundColor: '#FFF' },
      legend: { display: false },
      elements: {
        point: {
          radius: 6,
          hoverRadius: 6,
          borderWidth: 0,
          hoverBorderWidth: 0,
          backgroundColor(context) {
            const { dataIndex, dataset } = context;
            const point = dataset.data[dataIndex];
            return locationColors[point.index];
          }
        }
      },
      // Disable all animations
      animation: {
        duration: 0
      },
      hover: {
        animationDuration: 0
      },
      onHover: null as any,
      responsiveAnimationDuration: 0,
      scales: {
          yAxes: [
          {
            id: 'grainSize',
            scaleLabel: {
              display: true,
              labelString: 'Grain Size'
            },
            ticks: {
              min: 0,
              max: 10
            }
          }],
          xAxes: [{
              type: 'linear',
              position: 'bottom',
              scaleLabel: {
                display: true,
                labelString: 'Normalized distance from crest'
              },
              ticks: {
                min: 0,
                max: 1
              }
          }]
      },
      tooltips: {
        callbacks: {
            label: function(tooltipItem, data) {
              const { datasetIndex, index } = tooltipItem;
              const rawData = data.datasets[datasetIndex].data[index];
              const { x, y, rowIndex } = rawData;
              return `(${x.toFixed(2)}, ${y.toFixed(2)})`;
            }
        }
    }
  }
};

export const batteryWarningLevels: number[] = [0.75, 0.90, 0.95];

// Set background color for chart, not the entire canvas.
Chart.pluginService.register({
  beforeDraw: function (chart: any, easing) {
    if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
      var ctx = chart.chart.ctx;
      var chartArea = chart.chartArea;

      ctx.save();
      ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
      ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
      ctx.restore();
    }
  }
});


// Map view initial state
export const initialViewState = {
  latitude: 32.86877891431054,
  longitude: -106.24201115822408,
  zoom: 13.6,
  maxZoom: 20,
  pitch: 40.5,
  bearing: -27.396674584323023
};

// Thresholds for displaying map view reset button
export const ZOOM_RANGE = [12, 16]; 
export const LATITUDE_RANGE = [32.81, 32.91]; 
export const LONGITUDE_RANGE =  [-106.30, -106.20];

// Countdown timer period on decision page
export const countdownDuration = 10;

/********************************************************************** */
/* User feedback options for the robot during each data collection step */
/********************************************************************** */

export enum UserFeedbackState {
  OBJECTIVE,
  RANK_OBJECTIVES,
  OBJECTIVE_FREE_RESPONSE,
  ACCEPT_OR_REJECT_SUGGESTION,
  ACCEPT_FOLLOW_UP,
  REJECT_REASON,
  REJECT_REASON_FREE_RESPONSE,
  USER_LOCATION_SELECTION,
  HYPOTHESIS_CONFIDENCE,
  TRANSITION,
};

export const objectiveOptions = [
  "There are areas along the dune transect where data is needed", // Option 0 - spatial coverage algorithm
  "There are portions of the dynamic range of the moisture variable where data is needed", // Option 1 - variable coverage algorithm
  "There is a discrepancy between the data and the hypothesis that needs additional evaluation", // Option 2 - hypo invalidating algorithm
  "The data seems to be supporting the hypothesis so far but additional evaluation is needed", // Option 3 - hypo validating algorithm
  "I hold a different belief that is not described here" // Option 4 - free response
]

export const acceptFollowUpOptions = [
  "Definitely addressed the belief", 
  "Moderately addressed the belief",
  "Somewhat addressed the belief",
  "Barely addressed the belief",
  "Did not address the belief",
  "I am unsure",
]

export const transitionOptions = [
  "See RHex's suggestions for where to sample next based on your current belief rankings", 
  "Update belief rankings to receive new suggestions from RHex of where to sample next",
  "Ignore suggestions and select a location for RHex to sample next",
  "Stop data collection and make a conclusion about the hypothesis",
]