import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Typography, 
  Grid, 
  Box,
  Paper
} from '@material-ui/core';
import { 
  Person as PersonIcon, 
  Settings as SettingsIcon 
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    maxWidth: 800,
    margin: '0 auto',
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  },
  cardContent: {
    flexGrow: 1,
    textAlign: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  title: {
    marginBottom: theme.spacing(2),
    fontWeight: 'bold',
  },
  description: {
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  features: {
    textAlign: 'left',
    marginBottom: theme.spacing(2),
  },
  feature: {
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 16,
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

interface ModeSelectionProps {
  onModeSelect?: (mode: 'manual' | 'autonomous') => void;
}

export default function ModeSelection({ onModeSelect }: ModeSelectionProps) {
  const classes = useStyles();
  const history = useHistory();

  const handleModeSelect = (mode: 'manual' | 'autonomous') => {
    if (onModeSelect) {
      onModeSelect(mode);
    } else {
      // Default navigation
      if (mode === 'manual') {
        history.push('/decision');
      } else {
        history.push('/autonomous-decision');
      }
    }
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Choose Your Data Collection Mode
      </Typography>
      <Typography variant="body1" align="center" color="textSecondary" paragraph>
        Select how you would like to interact with the data collection system
      </Typography>

      <Grid container spacing={4} style={{ marginTop: 32 }}>
        <Grid item xs={12} md={6}>
          <Card 
            className={classes.card}
            onClick={() => handleModeSelect('manual')}
          >
            <CardContent className={classes.cardContent}>
              <PersonIcon className={classes.icon} />
              <Typography variant="h5" component="h2" className={classes.title}>
                Manual Mode
              </Typography>
              <Typography variant="body1" className={classes.description}>
                Full control over the data collection process. Make all decisions about objectives, 
                sampling locations, and hypothesis testing.
              </Typography>
              
              <div className={classes.features}>
                <Typography variant="h6" gutterBottom>
                  Features:
                </Typography>
                <div className={classes.feature}>
                  <span className={classes.featureIcon}>✓</span>
                  <Typography variant="body2">
                    Select and rank your objectives
                  </Typography>
                </div>
                <div className={classes.feature}>
                  <span className={classes.featureIcon}>✓</span>
                  <Typography variant="body2">
                    Review AI suggestions and accept/reject them
                  </Typography>
                </div>
                <div className={classes.feature}>
                  <span className={classes.featureIcon}>✓</span>
                  <Typography variant="body2">
                    Manually input data measurements
                  </Typography>
                </div>
                <div className={classes.feature}>
                  <span className={classes.featureIcon}>✓</span>
                  <Typography variant="body2">
                    Control the entire decision-making process
                  </Typography>
                </div>
              </div>
            </CardContent>
            <CardActions>
              <Button 
                size="large" 
                color="primary" 
                fullWidth
                variant="contained"
              >
                Start Manual Mode
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card 
            className={classes.card}
            onClick={() => handleModeSelect('autonomous')}
          >
            <CardContent className={classes.cardContent}>
              <SettingsIcon className={classes.icon} />
              <Typography variant="h5" component="h2" className={classes.title}>
                Autonomous Mode
              </Typography>
              <Typography variant="body1" className={classes.description}>
                Let the AI system handle data collection automatically while you monitor 
                and can intervene when needed.
              </Typography>
              
              <div className={classes.features}>
                <Typography variant="h6" gutterBottom>
                  Features:
                </Typography>
                <div className={classes.feature}>
                  <span className={classes.featureIcon}>✓</span>
                  <Typography variant="body2">
                    Automatic data collection based on predefined objectives
                  </Typography>
                </div>
                <div className={classes.feature}>
                  <span className={classes.featureIcon}>✓</span>
                  <Typography variant="body2">
                    Real-time monitoring and control panel
                  </Typography>
                </div>
                <div className={classes.feature}>
                  <span className={classes.featureIcon}>✓</span>
                  <Typography variant="body2">
                    Pause, resume, or stop autonomous operation
                  </Typography>
                </div>
                <div className={classes.feature}>
                  <span className={classes.featureIcon}>✓</span>
                  <Typography variant="body2">
                    Switch to manual mode at any time
                  </Typography>
                </div>
              </div>
            </CardContent>
            <CardActions>
              <Button 
                size="large" 
                color="primary" 
                fullWidth
                variant="contained"
              >
                Start Autonomous Mode
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="textSecondary">
          You can switch between modes at any time during the session
        </Typography>
      </Box>
    </div>
  );
} 