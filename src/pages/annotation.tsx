import * as React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import GeoMap from '../components/GeoMap';
import { DataLayer } from '../types';
import { initialViewState } from '../constants';

const useStyle = makeStyles(theme => ({
  label: {
    position: 'absolute',
    zIndex: 999,
    left: 40,
    top: 40,
    '& p': {
      fontWeight: 600,
      fontFamily: theme.typography.fontFamily
    }
  },
  arrow: {
    transform: 'rotate(160deg) scale(2) translate(-65px, -10px)',
    transformOrigin: 'center left',
  },
  line: {
    width: 50,
    height: 2,
    backgroundColor: 'rgb(0, 0, 0)',
  },
  arrowUp: {
    width: 8,
    marginBottom: 1,
    transform: 'rotate(135deg)'
  },
  arrowDown: {
    width: 8,
    marginTop: 1,
    transform: 'rotate(45deg)'
  },
  panel: {
    '& p': {
      textAlign: 'center'
    }
  }
}));


export function Annotation() {
  const classes = useStyle();

  return (
    <GeoMap
      onTransectClick={() => {}}
      onTransectHover={() => {}}
      useAnnotation={true}
      viewState={initialViewState}
      setViewState={() => {}}
      setMapResetOpen={() => {}}
    />
  );
};