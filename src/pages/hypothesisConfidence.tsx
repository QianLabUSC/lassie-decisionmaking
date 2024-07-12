import * as React from 'react';
import { FormControl, Select, MenuItem } from '@material-ui/core';

interface HypothesisConfidencePanelProps {
  open: boolean;
  hypoConfidence: number;
  confidenceTexts: string[];
  handleHypoResponse: (confidence: number, texts: string[]) => void;
  setHypothesisOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const HypothesisConfidencePanel: React.FC<HypothesisConfidencePanelProps> = ({
  open,
  hypoConfidence,
  confidenceTexts,
  handleHypoResponse,
  setHypothesisOpen,
}) => {
  return (
    <div className="update-hypothesis-confidence">
      <div className="hypothesisBlock">
        <div className="hypothesisTitle">
          <strong>Updated Hypothesis Confidence</strong>
        </div>
        <div className="hypothesisText">
          <div>
            Provide a new ranking of your certainty that the{' '}
            <span
              style={{ color: 'blue', textDecorationLine: 'underline', cursor: 'pointer' }}
              onClick={() => setHypothesisOpen(true)}
            >
              <strong>hypothesis</strong>
            </span>{' '}
            will be supported or refuted. If you have no preference, select "I am unsure":
          </div>
        </div>
        <FormControl style={{ border: '2.5px solid red', animation: 'blinker 2s linear infinite' }}>
          <Select
            style={{ fontSize: '1.5vh' }}
            value={hypoConfidence + 3}
            onChange={(event) => {
              handleHypoResponse(Number(event.target.value) - 3, confidenceTexts);
              // dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: false });
            }}
          >
            {confidenceTexts.map((text, i) => (
              <MenuItem key={i} value={i}>
                {text}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
  );
};

export default HypothesisConfidencePanel;
