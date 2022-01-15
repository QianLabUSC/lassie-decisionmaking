import { reducer, initialState, Action, IAction } from '../state';
import { dataset } from '../data/rhexDataset';
import { getMoistureData } from '../util';

describe('reducer', () => {
   it('sets moisture data', function() {
        const action: IAction = {
            type: Action.SET_MOISTURE_DATA,
            value: getMoistureData()
        };
        const finalState = reducer(initialState, action);
        expect(finalState.moistureData).toEqual(dataset.moisture);
   })
});


