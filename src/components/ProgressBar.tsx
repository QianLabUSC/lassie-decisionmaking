import * as React from "react";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    progressBarContainer: {
        width: 200,
        textAlign: "left",
        margin: "auto",
        marginTop: 10,
        marginBottom: 10,
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0
    },
    progressBarBack: {
        height: 10,
        /* border: solid 1px black; */
        backgroundColor: "#f3f3f3",
    },
    progressbarFront: {
        height: 10,
        display: "inline-block",
        color: "rgba(0, 0, 0, 0)",
        backgroundColor: "#114B5F",
        transition: "0.5s ease-in-out"
    },
    progressBarText: {
        textAlign: "center"
    }
});

export default function ProgressBarComponent(props) {
    const styles = useStyles(); 
    return (
        <div className={styles.progressBarContainer}>
            <div className={styles.progressBarBack}>
                <div className={styles.progressbarFront} style={{width: `${props.value * 100}%`}}>.</div>
            </div>
            {/* <div className={styles.progressBarText}>
                {Math.round(props.value)}%
                {props.extraText}
            </div> */}
        </div>
    )
}
