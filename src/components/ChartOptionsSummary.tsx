import * as React from 'react';
import "../styles/chartOptionsSummary.scss";
import Tooltip from '@material-ui/core/Tooltip';

interface ChartOptionsSummaryProps {
    displayOption: number,
    onOptionsClick: () => any
}

export default function ChartOptionsSummary(props: ChartOptionsSummaryProps) {
    const chartButtonTip = "Click here to select transects or change display mode";
    const charButtonTipStyle = {
        fontSize: '12px'
    }

    return (
        <div className="chartOptionsSummary">
            <div className="block">
                Collected Data from the Transect
            </div>
            <div className="block">
                Display Mode <b>{ props.displayOption === 0 ? "Raw" : "Averaged" }</b>
            </div>
            <Tooltip title={<span style={charButtonTipStyle}>{chartButtonTip}</span>} placement="top">
                <button onClick={props.onOptionsClick}>Update Chart Options</button>
            </Tooltip>
        </div>
    );
}
