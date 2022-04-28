import * as React from 'react';
import { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { HashRouter as Router, Route, Switch, Redirect, useHistory, useLocation } from "react-router-dom";
import { createMuiTheme } from '@material-ui/core/styles';
import { StateProvider, useStateValue, Action } from './state';
import Intro from './pages/intro';
import Decision from './pages/decision';
import Conclusion from './pages/conclusion';
import Survey from './pages/survey';
import { SavedProgress } from './pages/savedProgress';
import { GlobalDialog } from './components/GlobalDialog';
import { logTrace } from './logger';
import { TraceType, Sample } from './types';
import ThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { storeState, stateExists, removeStoredState, getStoredState } from './handlers/LocalStorageHandler';
import { AUTO_LOAD_MS } from './constants';
import { getMoistureData, getShearData, getMeasurements } from './util';
import { initialSamples } from './sampleTemplates';

const theme = createMuiTheme({
  palette: {
    primary: { main: '#114B5F' },
    secondary: { main: '#028090' },
  },
});

const useStyles = makeStyles(theme => {
  return {
    body: {
      margin: 0
    }
  };
});

let currentPathname = '', currentSearch = '';

// A wrapper in order to access the state value
function RouteWrapper() {
  const [globalState, dispatch] = useStateValue();
  const { dataVersion, transectIdx } = globalState;
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    history.listen((newLocation, action) => {
      logTrace(TraceType.ENTER_PAGE, newLocation.pathname);
      // This will activate anytime any extension is pushed to the URL (e.g., "geo", "strategy", "decision", etc.)
      if (action === "PUSH") {
        if (
          newLocation.pathname !== currentPathname ||
          newLocation.search !== currentSearch
        ) {
          // Save new location
          currentPathname = newLocation.pathname;
          currentSearch = newLocation.search;
  
          // Clone location object and push it to history
          history.push({
            pathname: newLocation.pathname,
            search: newLocation.search
          });
        }
      } else {
        // Send user back to current page if they try to navigate back to previous page.
        history.go(1);
      }
    });
  }, [history]);

  // Load initial samples
  useEffect(() => {
    dispatch({ type: Action.SET_SAMPLES, value: initialSamples })
    dispatch({ type: Action.SET_CURR_SAMPLE_IDX, value: 0 });
  }, []);

  // When user closes the tab, save the user's progress
  useEffect(() => {

    // This is called before tab closes
    window.addEventListener('beforeunload', (e) => {
      e.preventDefault();
      // Execute this if the user is past the intro section and if the full survey hasn't been submitted yet
      if (location.pathname !== "/" && !globalState.submitted) {
        let { chart } = globalState;
        // Clear the chart data because it contains circular references on the "data" and "datasets" properties.
        // If this data isn't cleared, it causes issues when trying to stringify the globalState in the "storeState"
        // function below. The chart is cleared in the "dispatch" function in this 'beforeunload' step prior to
        // storing the globalState in the 'unload' step because the globalState wasn't updating immediately when 
        // combining the "dispatch" and "storeState" functions together in one step.
        if (chart) {
          dispatch({ type: Action.SET_CHART, value: null });
        }
      }
    });

    // This is called when the tab closes
    window.addEventListener('unload', () => {
      // Execute this if the user is past the intro section and if the full survey hasn't been submitted yet
      if (location.pathname !== "/" && !globalState.submitted) {
        // Store the global state so it can be retrieved again when the user returns to the site 
        storeState(location.pathname, globalState);

      // If the user is still on the intro section or if the survey has already been submitted, remove the
      // stored state so that the user starts on a fresh survey form when returning to the site
      } else if (globalState.submitted) {
        removeStoredState();
      }
    });
  });

  // If there is a previously saved state, display a temporary screen asking whether the user wants to continue
  // the previous session.
  if (stateExists()) {
    const data = getStoredState();
    if (!data) {
      removeStoredState();
      history.push("/");
    } else {
      const {path, state, date} = data;
      // If the last save was recent, automatically load that state.
      if ((Date.now() - date) < AUTO_LOAD_MS) {
        removeStoredState();
        dispatch({type: Action.SET_STATE, value: state});
        history.push(path);
      }
    }

    return <SavedProgress
      onNew={() => {
        const data = getStoredState();
        const { robotVersion } = data.state;
        removeStoredState();
        history.push("/");
      }}
      onContinue={() => {
        const {path, state} = data;
        removeStoredState();
        dispatch({type: Action.SET_STATE, value: state});
        history.push(path);
      }}/>
  }

  // Page router - Redirect the user to the intro section if the user has not yet completed it yet
  return (
    <div>
      <Switch>
        <Route exact path="/" component={Intro}/>
        <Route path="/decision" render={props => (
          globalState.introCompleted ? <Decision/> : <Redirect to={{ pathname: '/'}}/> )} />
        <Route path="/conclusion" render={props => (
          globalState.introCompleted ? <Conclusion/> : <Redirect to={{ pathname: '/'}}/> )} />
        <Route path="/survey" render={props => (
          globalState.introCompleted ? <Survey/> : <Redirect to={{ pathname: '/'}}/> )} />
      </Switch>
      <GlobalDialog />
    </div>
  );
}

export function App(){
  const classes = useStyles();
  document.title = "Geologic Field Decision Making";
 
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