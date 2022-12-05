import * as React from 'react';
import '../styles/inputs.scss';

type RadioButtonGroupProps = {
    options: string[],
    selectedIndex: number,
    onChange: (i: number) => any
};

export const Checkbox = props => (
    <div className='checkbox' onClick={() => props.onChange(!props.checked)}>
        <div className={`filling ${!props.checked && 'empty'}`}></div>
    </div>
)

export default function RadioButtonGroupHorizontal(props: RadioButtonGroupProps) {
    return (
        <table className="radioButtonGroupHorizontal">
            <tbody>
                <tr>
                    {props.options && props.options.map((option, i) => (
                        <td className="radioButton" key={option.slice(0, 10) + i} width="15%" style={{verticalAlign: "top" }} rowSpan={2}>
                            <Checkbox checked={props.selectedIndex === i} onChange={() => {
                                if (props.selectedIndex !== i) {
                                    props.onChange(i);
                                }
                            }}/>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>
                                            { option }
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    );
}