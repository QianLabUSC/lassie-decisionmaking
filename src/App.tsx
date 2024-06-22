import * as React from 'react';
import { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
  useHistory,
  useLocation,
} from 'react-router-dom';
import { createMuiTheme } from '@material-ui/core/styles';
import { StateProvider, useStateValue, Action } from './state';
import Intro from './pages/intro';
import Decision from './pages/decision';
import RightComponent from './pages/RightComponent';
import Conclusion from './pages/conclusion';
import Survey from './pages/survey';
import { SavedProgress } from './pages/savedProgress';
import { GlobalDialog } from './components/GlobalDialog';
import { logTrace } from './logger';
import { TraceType } from './types';
import ThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import {
  storeState,
  stateExists,
  removeStoredState,
  getStoredState,
} from './handlers/LocalStorageHandler';
import { AUTO_LOAD_MS } from './constants';
import { getMoistureData, getShearData, getMeasurements } from './util';
import { initialSamplesSet } from './sampleTemplates';

const theme = createMuiTheme({
  palette: {
    primary: { main: '#114B5F' },
    secondary: { main: '#028090' },
  },
});

const useStyles = makeStyles((theme) => ({
  body: {
    margin: 0,
  },
}));

// A wrapper in order to access the state value
function RouteWrapper() {
  const [globalState, dispatch] = useStateValue();
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const unlisten = history.listen((newLocation, action) => {
      logTrace(TraceType.ENTER_PAGE, newLocation.pathname);
      if (action === 'PUSH') {
        if (
          newLocation.pathname !== currentPathname ||
          newLocation.search !== currentSearch
        ) {
          currentPathname = newLocation.pathname;
          currentSearch = newLocation.search;
          history.push({
            pathname: newLocation.pathname,
            search: newLocation.search,
          });
        }
      } else {
        history.go(1);
      }
    });

    return () => {
      unlisten(); // Cleanup the event listener
    };
  }, [history]);

  useEffect(() => {
    const moistureData = getMoistureData();
    const shearData = getShearData(globalState.dataVersion.local);
    const initialSamples = initialSamplesSet[globalState.dataVersion.local];
    dispatch({ type: Action.SET_MOISTURE_DATA, value: moistureData });
    dispatch({ type: Action.SET_FULL_DATA, value: shearData });
    dispatch({ type: Action.SET_SAMPLES, value: initialSamples });
    dispatch({ type: Action.SET_CURR_SAMPLE_IDX, value: 0 });
  }, [dispatch, globalState.dataVersion.local]);

  useEffect(() => {
    const beforeUnloadHandler = (e) => {
      e.preventDefault();
      if (location.pathname !== '/' && !globalState.submitted) {
        const { chart } = globalState;
        if (chart) {
          dispatch({ type: Action.SET_CHART, value: null });
        }
      }
    };

    const unloadHandler = () => {
      if (location.pathname !== '/' && !globalState.submitted) {
        storeState(location.pathname, globalState);
      } else if (globalState.submitted) {
        removeStoredState();
      }
    };

    window.addEventListener('beforeunload', beforeUnloadHandler);
    window.addEventListener('unload', unloadHandler);

    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      window.removeEventListener('unload', unloadHandler);
    };
  }, [dispatch, globalState.submitted, globalState.chart, location.pathname]);

  if (stateExists()) {
    const data = getStoredState();
    if (!data) {
      removeStoredState();
      history.push('/');
    } else {
      const { path, state, date } = data;
      if (Date.now() - date < AUTO_LOAD_MS) {
        removeStoredState();
        dispatch({ type: Action.SET_STATE, value: state });
        history.push(path);
      }
    }

    return (
      <SavedProgress
        onNew={() => {
          const data = getStoredState();
          removeStoredState();
          history.push('/');
        }}
        onContinue={() => {
          const { path, state } = data;
          removeStoredState();
          dispatch({ type: Action.SET_STATE, value: state });
          history.push(path);
        }}
      />
    );
  }


  return (
    <div>
      <Switch>
        <Route exact path="/" component={Intro} />
        <Route
          path="/decision"
          render={(props) =>
            globalState.introCompleted ? (
              <>
               <RightComponent />
            </>
             
              // <Decision />
            ) : (
              <Redirect to={{ pathname: '/' }} />
            )
          }
        />
         {/* <Route
          path="/right"
          render={(props) => (
              <Decision />
            ) 
          }
        /> */}
        <Route
          path="/conclusion"
          render={(props) =>
            globalState.introCompleted ? (
              <Conclusion />
            ) : (
              <Redirect to={{ pathname: '/' }} />
            )
          }
        />
        <Route
          path="/survey"
          render={(props) =>
            globalState.introCompleted ? (
              <Survey />
            ) : (
              <Redirect to={{ pathname: '/' }} />
            )
          }
        />
      </Switch>
      <GlobalDialog />
    </div>
  );
}

let currentPathname = '',
  currentSearch = '';

export function App() {
  const classes = useStyles();
  document.title = 'Geologic Field Decision Making';

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.body}>
        <StateProvider>
          <Router>
            <RouteWrapper />
          </Router>
        </StateProvider>
      </div>
    </ThemeProvider>
  );
}
