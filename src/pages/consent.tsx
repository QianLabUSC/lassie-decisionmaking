import * as React from 'react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

const consentPdf = require('../../assets/IRB_Consent_Expert_MultiTransect.pdf');

const useStyles = makeStyles({
  iframe: {
    width: '60vw',
    height: '60vh',
    display: 'block',
    margin: '0 auto'
  },
  box: {
    textAlign: 'center'
  },
  form: {
    width: '50vw',
    margin: '0 auto',
    textAlign: 'center'
  },
  formControl: {
    display: 'block',
    marginTop: '20px',
    '& legend': {
      textAlign: 'left',
      lineHeight: '1.5rem'
    }
  }
});

export default function Consent() {
  const classes = useStyles();
  const [age, setAge] = useState('false');
  const [accepted, setAccepted] = useState('false');
  const history = useHistory();

  const onContinueClick = () => history.push('/instruction');

  return (
    <div className={classes.box} id="consent">
      <Typography variant="h4" style={{ marginBottom: 20, fontWeight: 700 }}>
        Consent form
      </Typography>
      <iframe className={classes.iframe} src={consentPdf}></iframe>
      <div className={classes.form}>
        <FormControl className={classes.formControl} component="fieldset">
          <FormLabel component="legend">I affirm that I am at least 18 years old</FormLabel>
          <RadioGroup name="age" value={age} onChange={ev => setAge(ev.target.value)}>
            <FormControlLabel value="true" control={<Radio />} label="I am at least 18 years of age" />
            <FormControlLabel value="false" control={<Radio />} label="I am not 18" />
          </RadioGroup>
        </FormControl>
        <FormControl className={classes.formControl} component="fieldset">
          <FormLabel component="legend">
            By clicking “I Accept” I consent to this study. I may withdraw at any time. By clicking “I Decline”, I do not
          consent to this study and do not wish to participate.
          </FormLabel>
          <RadioGroup name="accept" value={accepted} onChange={ev => setAccepted(ev.target.value)}>
            <FormControlLabel value="true" control={<Radio />} label="I accept" />
            <FormControlLabel value="false" control={<Radio />} label="I decline" />
          </RadioGroup>
        </FormControl>
        <Button
          variant="contained" color="primary"
          disabled={age === 'false' || accepted === 'false'}
          onClick={onContinueClick}>
            Continue
        </Button>
      </div>
    </div>
  );
}