import * as React from 'react';
import "../styles/positionIndicatorRhex.scss";

const rhexImage = require('../../assets/rhex_no_background_sprite.png');

export default function PositionIndicatorRhex({ left, top }) {
  return (
      <div className="rhex-icon" style={{left, top}}>
          <img className="rhex-icon" src={rhexImage} width="25vw" height="20vh" />
      </div>
  );
}