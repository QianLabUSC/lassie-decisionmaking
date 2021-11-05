import { Component } from 'react';
import './App.scss';
import Chart from './chart';
// Import to run the data script, which calculates average transect distances.
// import {} from './data';

const calculateAverageSamples = (costPerSample, costPerDistance, numLocations, distanceBetweenLocations, averageSteps) => {
    let averageSamples = [];

    for (let locations = 1; locations <= numLocations; locations++) {
        let travelCost = costPerDistance * distanceBetweenLocations * averageSteps * (locations - 1);
        let sampleCost = 1 - travelCost;
        let sampleCostPerTransect = sampleCost / locations;
        let samplesPerTransect = costPerSample === 0 ? 0 :
            Math.max(sampleCostPerTransect / costPerSample, 0);
        averageSamples.push(samplesPerTransect);
    }

    return averageSamples;
};

class App extends Component {

    constructor() {
        super();
        this.state = {
            costPerSample: 0.005,
            costPerDistance: 3,
            locations: 24,
            distance: 0.0015,
            averageSteps: 1
        };
    }

    render() {
        const averageSamplesPerLocations = calculateAverageSamples(this.state.costPerSample, this.state.costPerDistance, this.state.locations, this.state.distance, this.state.averageSteps);

        return (
            <div className="root">
                <h1>Battery Estimator</h1>
                <div className="container">

                    <div className="col">

                        <div className="block">
                            <h3>Presets</h3>
                            <div className="inputRow">
                                <span>Cost Per Sample</span>
                                <input type="number" value={this.state.costPerSample} onChange={e => this.setState({costPerSample: Number.parseFloat(e.target.value)})}/>
                            </div>
                            <div className="inputRow">
                                <span>Cost Per Unit Distance</span>
                                <input type="number" value={this.state.costPerDistance} onChange={e => this.setState({costPerDistance: Number.parseFloat(e.target.value)})}/>
                            </div>
                            <div className="inputRow">
                                <span>Number of Locations</span>
                                <input type="number" value={this.state.locations} onChange={e => this.setState({locations: Number.parseFloat(e.target.value)})}/>
                            </div>
                            <div className="inputRow">
                                <span>Average Distance between Locations</span>
                                <input type="number" value={this.state.distance} onChange={e => this.setState({distance: Number.parseFloat(e.target.value)})}/>
                            </div>
                        </div>

                        <div className="block">
                            <h3>Expected User Behavior</h3>
                            <div className="inputRow">
                                <span>Average Steps Between Transects in Strategy</span>
                                <input type="number" value={this.state.averageSteps} onChange={e => this.setState({averageSteps: Number.parseFloat(e.target.value)})}/>
                            </div>
                        </div>

                    </div>

                    <div className="col">
                        <div className="block">
                            <h3>Approximate Maximum Samples</h3>
                            <Chart data={averageSamplesPerLocations}/>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

export default App;
