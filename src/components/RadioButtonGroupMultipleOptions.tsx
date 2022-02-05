import * as React from 'react';
import { Checkbox } from './RadioButtonGroup';
import '../styles/inputs.scss';


type RadioButtonGroupMultipleOptionsProps = {
    options: string[],
    selectedIndices: number[],
    onChange: (i: number) => any
};

export default function RadioButtonGroupMultipleOptions(props: RadioButtonGroupMultipleOptionsProps) {
    return (
        <table className="radioButtonGroup">
            <tbody>
                {
                    props.options && props.options.map((option, i) => (
                        <tr key={option.slice(0, 10) + i}>
                            <td>
                                <Checkbox checked={props.selectedIndices.includes(i)} onChange={() => {
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