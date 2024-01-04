import * as React from 'react';
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
                    [1, 2, 3, 4, 5, 6, 7].map(i => <Checkbox number={i} checked={props.selectedIndex === i.toString()} key={props.id + i} onChange={() => {
                        if (props.selectedIndex !== i) {
                            props.onChange(i);
                        }
                    }}/>)
                }
            </div>
        </div>
    );
}
