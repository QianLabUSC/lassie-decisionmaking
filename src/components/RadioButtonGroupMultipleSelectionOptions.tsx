import * as React from 'react';
import { Checkbox } from './RadioButtonGroup';
import '../styles/inputs.scss';

type RadioButtonGroupMultipleSelectionOptionsProps = {
    options: any[],
    selectedIndexs: number[],
    onChange: (i: number) => any
};
// Resuable components for multi-choice options
export default function RadioButtonGroupMultipleSelectionOptions(props: RadioButtonGroupMultipleSelectionOptionsProps) {
    return (
        <table className="radioButtonGroup">
            <tbody>
                {
                    props.options && props.options.map((option, i) => (
                        <tr key={props.options[i].slice(0, 10) + i}>
                            <td>
                            <Checkbox 
                                checked={props.selectedIndexs.includes(i)} 
                                onChange={() => {
                                        props.onChange(i);
                            }}/>
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