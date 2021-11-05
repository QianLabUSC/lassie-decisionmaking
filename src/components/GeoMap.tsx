import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';

import DeckGL from '@deck.gl/react';
import { LineLayer, TextLayer, PathLayer, ScatterplotLayer, IconLayer } from '@deck.gl/layers';
import { StaticMap } from 'react-map-gl';
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '@material-ui/icons/Settings';
import DeleteIcon from '@material-ui/icons/Delete';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import CollapsablePaper from '../components/CollapsablePaper';
import { transectLines, ZOOM_RANGE, LATITUDE_RANGE, LONGITUDE_RANGE, rhexLocations } from '../constants';
import { TransectType } from '../types';
import { getVector2Angle } from '../util';
import { useStateValue } from '../state';

// TODO: Fetch in backend
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2hlbnl1ZWMiLCJhIjoiY2s3N3h6NGF4MGN0ZzNmcGN4dHI3OGFudiJ9.A5xioyr24VIjv_IFiSGZWA';

interface TextEle {
  coordinates: number[],
  text: string,
  transectId?: number
}

const pathLines : PathSegment[] = [];
const clickableAreas: any = [];

// linear interpolation to draw the transect lines on the map
const lerp = (a : number, b: number, x: number) => ((1 - x) * a + x * b); 

for (let i = 0; i < transectLines.length; i++) {
  const line = transectLines[i];
  pathLines.push({
    // each item in "path" represents an (x,y,z) coordinate that the path of the transect line connects
    path: [
      [...transectLines[i].from, 0],
      [lerp(line.from[0], line.to[0], 0.4), lerp(line.from[1], line.to[1], 0.4), 22],
      [lerp(line.from[0], line.to[0], 0.7), lerp(line.from[1], line.to[1], 0.7), 30],
      [lerp(line.from[0], line.to[0], 0.8), lerp(line.from[1], line.to[1], 0.8), 15],
      [...transectLines[i].to, 0]
    ],
    color: transectLines[i].color,
    id: transectLines[i].id
  });
  clickableAreas.push({
    coordinates: [
      (line.from[0] + line.to[0]) / 2,
      (line.from[1] + line.to[1]) / 2
    ],
    transectId: transectLines[i].id
  });
}

function getTransectLabels(transectLines: LineSegment[]) : TextEle[] {
  const transectLabels : TextEle[] = [];
  for (let i = 0; i < transectLines.length; i++) {
    const trans = transectLines[i];
    const x = (trans.from[0] + trans.to[0]) / 2;
    let y = (trans.from[1] + trans.to[1]) / 2;
    y -= (trans.to[1] - trans.from[1]) * 0.4;
    transectLabels.push({
      coordinates: [x, y],
      text: `${trans.id + 1}`,
      transectId: trans.id
    });
  }
  return transectLabels;
}

const transectLabels = getTransectLabels(transectLines);

interface IProps {
  onTransectClick: (info: any) => void,
  onTransectHover: (info: any) => void,
  onMapRotation?: (angle: number) => void,
  viewState: any,
  setViewState: (info: any) => void,
  setMapResetOpen: (value: boolean) => void,
  useAnnotation?: boolean
}

export default function GeoMap({ onTransectClick, onTransectHover, onMapRotation, viewState, setViewState, setMapResetOpen, useAnnotation } : IProps) {
  useAnnotation = useAnnotation === undefined ? false : useAnnotation;

  // Event handlers
  const [inAnnotation, setInAnnotation] = useState(false);
  const [coordArr, setCoordArr] = useState<number[][]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredTransectId, setHoveredTransectId] = useState(-1);

  // Global state management for updating map view when template transects for initial strategy change
  const [globalState, dispatch] = useStateValue();
  const { robotVersion, strategy, sampleState, actualStrategyData } = globalState;
  const { curTransectIdx, transectIndices } = strategy;

  const lineLayerProps = {
    id: 'line-layer',
    getWidth: 10,
    getSourcePosition: d => d.from,
    getTargetPosition: d => d.to,
    getColor: d => d.color
  };
  
  const clickableAreaLayerProps = {
    id: "clickableAreasLayer",
    getRadius: 150,
    getFillColor: [0, 0, 0, 0],
    pickable: true, // makes the transects clickable
    getPosition: d => d.coordinates
  }
  
  const scatterLayerProps = {
    id: 'scatterplot-layer',
    getRadius: 10,
    getLineWidth: 0,
    getFillColor: [255, 140, 0],
  };
  
  const pathLayerProps = {
    id: 'path-layer',
    data: pathLines,
    getWidth: d => (transectIndices.reduce((acc, v) => {
      acc.push(v.number);
      return acc;
    }, [] as number[])).includes(d.id) ? 25 : 10,
    pickable: false,
    getPath: d => d.path,
    getColor: d => d.id === hoveredTransectId ? [252, 202, 3] : // yellow (hovered transects)
      (transectIndices.reduce((acc, v) => {
        if (v.type !== TransectType.DISCARDED) {
          acc.push(v.number);
        }
        return acc;
      }, [] as number[])).includes(d.id) ? [0, 204, 0] : // green (undiscarded transects within strategy)
      (transectIndices.reduce((acc, v) => {
        if (v.type === TransectType.DISCARDED) {
          acc.push(v.number);
        }
        return acc;
      }, [] as number[])).includes(d.id) ? [249, 36, 36] : // red (discarded transects from strategy) 
        [28, 76, 132], // navy (default color for transects)
    updateTriggers: {
      getColor: {hoveredTransectId, transectIndices},
      getWidth: {hoveredTransectId, transectIndices}
    }
  };
  
  const textLayerProps = {
    id: 'text-layer',
    getPosition: (d : TextEle) => d.coordinates,
    getText: (d: TextEle) => d.text,
    getSize: 32,
    getAngle: 0,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'bottom'
  };

  const textLayerPropsAnnotation = {
    id: 'text-layer-annotation',
    getPosition: (d : TextEle) => d.coordinates,
    getText: (d: TextEle) => d.text,
    getSize: 32,
    getAngle: 0,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'bottom'
  };

  // Rhex icon layer for indicating which transects have been visited
  // The useEffect enables the Rhex icon at the current transect to bounce up and down repeatedly
  const [bounceUp, setBounceUp] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setBounceUp(!bounceUp);
    }, 1000);
    return () => clearInterval(interval);
  });
  const rhexImage = require('../../assets/rhex_no_background_sprite.png')
  const ICON_MAPPING = {
    marker: {x: 0, y: 0, width: 1000, height: 1000}
  };
  const iconLayerPropsInitialStrategy = {
    id: 'rhex-icon-layer',
    pickable: false,
    iconAtlas: rhexImage,
    iconMapping: ICON_MAPPING,
    getIcon: d => 'marker',
    sizeScale: 75,
    getPosition: d => curTransectIdx === 0 ? d.coordinatesStart : bounceUp && d.id === transectIndices[curTransectIdx - 1].number ? d.coordinatesEnd : d.coordinatesStart,
    getSize: d => 5,
    sizeUnits: 'meters',
    updateTriggers: {
      getPosition: [bounceUp]
    }
  };
  const iconLayerPropsActualStrategy = {
    id: 'rhex-icon-layer',
    pickable: false,
    iconAtlas: rhexImage,
    iconMapping: ICON_MAPPING,
    getIcon: d => 'marker',
    sizeScale: 75,
    getPosition: d => bounceUp && d.id === transectIndices[curTransectIdx].number ? d.coordinatesEnd : d.coordinatesStart,
    getSize: d => 5,
    sizeUnits: 'meters',
    updateTriggers: {
      getPosition: [bounceUp]
    }
  };
  
  const annotationLines = useMemo<LineSegment[]>(() => {
    const lines : LineSegment[] = [];
    for (let i = 1; i < coordArr.length; i += 2) {
      lines.push({
        from: coordArr[i - 1],
        to: coordArr[i],
        color: [28, 76, 132],
        id: -1
      });
    }
    return lines;
  }, [coordArr]);

  const annotationLabels = useMemo<TextEle[]>(() => {
    const labels : TextEle[] = [];
    for (let i = 1; i < coordArr.length; i += 2) {
      labels.push({
        coordinates: [
          (coordArr[i][0] + coordArr[i - 1][0]) / 2,
          (coordArr[i][1] + coordArr[i - 1][1]) / 2
        ],
        text: ((i + 1) / 2).toString() 
      });
    }
    return labels;
  }, [coordArr]);

  const AnnotationPaper = 
    <CollapsablePaper
      icon={<SettingsIcon />}
      // className={classes.panel}
      right={20}
      top={200}
    >
      <div style={{ maxHeight: 450, overflowY: 'scroll' }}>
      <Button variant="contained" color="primary" style={{ marginLeft: '15px' }} 
        onClick={() => {
          let filecontent = '';
          for (const coord of coordArr) {
            filecontent += coord[0].toString() + '\n';
            filecontent += coord[1].toString() + '\n';
          }
          const element = document.createElement('a');
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(filecontent));
          element.setAttribute('download', 'transects.txt');
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }}>
          Export
      </Button>
      <Button variant="contained" color="primary" style={{ marginLeft: '15px' }}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.onchange = e => { 
            const files = input.files;
            if (!files || files.length < 0) {
              return;
            }
            const reader = new FileReader();
            reader.readAsText(files[0],'UTF-8');
            // here we tell the reader what to do when it's done reading...
            reader.onload = readerEvent => {
              const content = readerEvent.target?.result as string; // this is the content!
              const coordNums = content.split('\n')
                .map(f => parseFloat(f))
                .filter(f => !isNaN(f));
              const newCoordArr : number[][] = [];
              for (let i = 0; i < coordNums.length; i += 2) {
                newCoordArr.push([coordNums[i], coordNums[i + 1]]);
              }
              setCoordArr(newCoordArr);
            }
          }
          document.body.appendChild(input);
          input.click();
          document.body.removeChild(input);
        }}>
          Load
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Index</TableCell>
            <TableCell>Coordinate</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            annotationLines.map((line, idx) => {
              return (
                <TableRow key={idx.toString()}>
                  <TableCell> { idx + 1 } </TableCell>
                  <TableCell>
                    <p>From: {line.from[0]} {line.from[1]}</p>
                    <p>To: {line.to[0]} {line.to[1]}</p>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      style={{ marginLeft: 10 }}
                      onClick={() => {
                        const newArr = [...coordArr];
                        newArr.splice(idx * 2, 2);
                        setCoordArr(newArr)
                      }}
                    >
                      <DeleteIcon color="secondary" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
          }
        </TableBody>
      </Table>
      </div>
    </CollapsablePaper>;

  return (
    <React.Fragment>
      { useAnnotation && AnnotationPaper }
      <DeckGL
        viewState={viewState}
        onViewStateChange={e => setViewState(e.viewState)}
        controller={true}
        onHover={event => {
            const id = event && event.object ? event.object.transectId : -1;
            setHoveredTransectId(id);
            setIsHovering(event && event.layer && event.layer.id === "clickableAreasLayer")
            onTransectHover(id)
          }
        }
        getCursor={({isDragging}) => isDragging ? "grabbing" : isHovering ? "pointer" : "default"}
        onClick={event => {
          if (useAnnotation) {
            const curCoord : number[] = event.coordinate;
            setCoordArr([...coordArr, curCoord]);
            if (!inAnnotation) {
              setInAnnotation(true);
            } else {
              setInAnnotation(false);
            }
          } else {
            const id = event && event.object ? event.object.transectId : -1;
            onTransectClick(id);
          }
        }}
      > 
        {
          // Callback function for when the map view changes
          event => {
            let direction = [event.viewport.cameraDirection[0], event.viewport.cameraDirection[1]];
            const angle = getVector2Angle(direction) * 180 / Math.PI;
            if (onMapRotation) onMapRotation(angle);
          }
        }
        {
          // Show the map view reset button when the user has zoomed out beyond the threshold 
          setMapResetOpen(viewState.zoom <= ZOOM_RANGE[0] || viewState.zoom >= ZOOM_RANGE[1])
        }
        {
          // Show the map view reset button when the user has panned too far from the initial latitude/longitude
          (viewState.zoom >= ZOOM_RANGE[0] && viewState.zoom <= ZOOM_RANGE[1]) 
            && setMapResetOpen(viewState.latitude <= LATITUDE_RANGE[0] || viewState.latitude >= LATITUDE_RANGE[1]
            || viewState.longitude <= LONGITUDE_RANGE[0] || viewState.longitude >= LONGITUDE_RANGE[1])
        }

        <LineLayer
          {...lineLayerProps}
          data={annotationLines}
          visible={useAnnotation}
        />
        <ScatterplotLayer
          {...clickableAreaLayerProps}
          data={(robotVersion && sampleState === 0) ? clickableAreas.filter(transect => (transectIndices.reduce((acc, v) => {
            acc.push(v.number);
            return acc;
          }, [] as number[])).includes(transect.transectId)) : clickableAreas}
        />
        <ScatterplotLayer
          {...scatterLayerProps}
          data={coordArr.map(c => ({ position: c }))}
          visible={useAnnotation}
        />
        <TextLayer
          {...textLayerPropsAnnotation}
          data={annotationLabels}
          visible={useAnnotation}
        />
        <PathLayer
          {...pathLayerProps}
        />
        <TextLayer
          {...textLayerProps}
          data={transectLabels}
        />
        <IconLayer
          {...(sampleState === 0 ? iconLayerPropsInitialStrategy : iconLayerPropsActualStrategy)}
          data={
            sampleState === 0 ? 
              rhexLocations.filter((transect) => (transectIndices.reduce((acc, v, idx) => {
                if (v.type !== TransectType.DISCARDED) {
                  acc.push(v.number);
                }
                return acc;
              }, [] as number[])).includes(transect.id))
            :
              rhexLocations.filter((transect) => (transectIndices.reduce((acc, v, idx) => {
                if (v.type !== TransectType.DISCARDED && idx <= curTransectIdx && actualStrategyData.transects.length !== 0) {
                  acc.push(v.number);
                }
                return acc;
              }, [] as number[])).includes(transect.id))
          }
        />
        <StaticMap
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle="mapbox://styles/mapbox/satellite-v9"
        />
      </DeckGL>
    </React.Fragment>  
  );
}