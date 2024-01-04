import * as React from 'react';
import Button from '@material-ui/core/Button';
import '../styles/savedProgress.scss';

export function SavedProgress(props) {
    return (
        <div className="savedProgressPage">
            <h2 className="title">You have an unfinished attempt...</h2>
            <p>You can load the data from your previous scenario to continue it, or start a new one.</p>
            <div>
                <Button color='primary' variant='contained' onClick={props.onNew}>Start New</Button>
                <Button color='primary' variant='contained' onClick={props.onContinue}>Continue Previous</Button>
            </div>
        </div>
    );
}