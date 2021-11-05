import * as React from 'react';
import { useState } from 'react';
import '../styles/inputs.scss';

const Checkbox = props => (
    <div className='checkbox' onClick={() => props.onChange(!props.checked)}>
        <div className={`filling ${!props.checked && 'empty'}`}>
            { !props.checked && props.number }
        </div>
    </div>
)

export default function RadioButtonGroup(props) {
    return (
        <div className="rankedScale">
            <div className="inputs">
                {
                    [1, 2, 3, 4, 5].map(i => <Checkbox number={i} checked={props.selectedIndex === i.toString()} onChange={() => {
                        if (props.selectedIndex !== i) {
                            props.onChange(i);
                        }
                    }}/>)
                }
            </div>
            <span>Not At All</span>
            <span>Very Much</span>
        </div>
    );
}
