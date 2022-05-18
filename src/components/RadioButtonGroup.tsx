import * as React from 'react';
import '../styles/inputs.scss';

type RadioButtonGroupProps = {
    options: string[],
    selectedIndex: number,
    onChange: (i: number) => any,
};

export const Checkbox = props => (
    <div className='checkbox' onClick={() => props.onChange(!props.checked)}>
        <div className={`filling ${!props.checked && 'empty'}`}></div>
    </div>
)

export default function RadioButtonGroup(props: RadioButtonGroupProps) {
    return (
        <table className="radioButtonGroup">
            <tbody>
                {
                    props.options && props.options.map((option, i) => (
                        <tr key={option.slice(0, 10) + i}>
                            <td>
                                <Checkbox checked={props.selectedIndex === i} onChange={() => {
                                    if (props.selectedIndex !== i) {
                                        props.onChange(i);
                                    }
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