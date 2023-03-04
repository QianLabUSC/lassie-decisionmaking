import * as React from 'react';
import { Checkbox } from './RadioButtonGroup';
import { objectiveOptions } from '../constants';
import '../styles/inputs.scss';


type RadioButtonGroupMultipleOptionsProps = {
    options: any[],
    searchObjective: (i: string) => any,
    onChange: (i: number) => any
};
// Resuable components for multi-choice options
export default function RadioButtonGroupMultipleOptions(props: RadioButtonGroupMultipleOptionsProps) {
    return (
        <table className="radioButtonGroup">
            <tbody>
                {
                    props.options && props.options.map((option, i) => (
                        <tr key={objectiveOptions[i].slice(0, 10) + i}>
                            <td>
                                <Checkbox 
                                    checked={props.searchObjective(objectiveOptions[i])}
                                    onChange={() => {
                                        props.onChange(i);
                                    }}
                                />
                            </td>
                            <td>
                                { option }
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}