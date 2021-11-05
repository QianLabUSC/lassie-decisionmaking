import { reducer, initialState, Action, IAction } from '../state';
import { dataset } from '../data/rhexDataset';
import { getGrainData } from '../util';

describe('reducer', () => {
   it('sets grain data', function() {
        const action: IAction = {
            type: Action.SET_GRAIN_DATA,
            value: getGrainData(0)
        };
        const finalState = reducer(initialState, action);
        expect(finalState.grainData).toEqual(dataset.grain1);
   })
});


