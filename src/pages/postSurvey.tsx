import * as React from 'react';
import { useState, useEffect } from 'react';
import { Route, Switch, useHistory, Redirect } from 'react-router-dom';
import * as _ from 'lodash';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Input from '@material-ui/core/Input';

import { putItem } from '../dbHelper';
import { useStateValue } from '../state';
import { Transect, TransectType, ResultTransect, ResultRow, Record } from '../types';
import { traces } from '../logger';

const p1 = require('../../assets/p1-black.jpg');
const p2 = require('../../assets/p2-black.jpg');
const p3 = require('../../assets/p3-black.jpg');
const p4 = require('../../assets/p4-black.jpg');

const useStyles = makeStyles(theme => createStyles({
  form: {
    width: '60vw', 
    margin: '0 auto'
  },
  formControl: {
    display: 'block',
    marginBottom: 40,
    '& img': {
      width: '50%',
      display: 'block',
      margin: '0 auto'
    },
    '& legend': {
      '&::before': {
        display: 'inline-block',
        position: 'absolute',
        width: 10,
        height: 10,
        left: -20,
        top: 3,
        borderRadius: 10,
        backgroundColor: theme.palette.primary.main,
        content: "''"
      }
    },
    '& .MuiInputBase-root': {
      width: '40%'
    },
    '& .MuiInputBase-fullWidth': {
      width: '100%'
    }
  },
  formControlInput: {
   
  },
  formControlSelect: {
    '& .description': {
      marginTop: 10,
      fontFamily: theme.typography.fontFamily,
      color: 'rgba(0, 0, 0, 0.54)',
    }
  },
  formControlRadioGroup: {
    marginTop: 10,
    '& .MuiInput-formControl': {
      marginTop: 0
    }
  },
  action: {
    textAlign: 'center',
    '& button': {
      marginLeft: 10
    }
  },
  export: {
    textAlign: 'center' as 'center',
    '& h3': {
      fontFamily: theme.typography.h3.fontFamily
    }    
  }
}));

interface FormSelectProps {
  id: string,
  label: React.ReactNode,
  form: any,
  options: any[],
  setFunc: any,
  children?: React.ReactNode,
  required?: boolean
}

interface FormInputProps {
  id: string,
  label: React.ReactNode,
  form: any,
  setFunc: any,
  type?: string,
  validFunc?: (str :string) => boolean,
  required?: boolean,
  multiline?: boolean,
  fullWidth?: boolean
};

function MyFormInput({ id, label, form, setFunc, type, validFunc, required, multiline, fullWidth }: FormInputProps) {
  const value = (form[id] && form[id].value) || '';
  const error = (form[id] && form[id].error) || false;
  required = required === undefined ? true : required;

  useEffect(() => {
    setFunc(id, { required });
  }, [id]);
  
  const onChange = ev => {
    setFunc(id, { value: ev.target.value }, ev);
  };
  const validate = validFunc || (val => val.toString().length > 0);
  const onBlur = ev => {
    // If required or the user has input some value, check the value
    // Otherwise we skip the check
    const val = ev.target.value;
    if (required || val.toString().length > 0) {
      setFunc(id, { error: !validate(val) }, ev);
    }
  };
  const classes = useStyles();
  return (
    <FormControl
      required={required}
      error={error}
      className={`${classes.formControl} ${classes.formControlInput}`}
      component="fieldset"
    >
      <FormLabel id={id} component="legend">{label}</FormLabel>
      <Input
        inputProps={{ type }}
        multiline={multiline}
        fullWidth={fullWidth}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
    </FormControl>
  );
}

function MyFormSelect({ id, label, form, options, setFunc, children, required } : FormSelectProps) {
  options = options || [];
  required = required === undefined ? true : required
  const optionWithInput = options.filter(opt => !!opt.input)[0];
  const hasInput = !!optionWithInput;
  const value = (form[id] && form[id].value) || '';
  const error = (form[id] && form[id].error) || false;
  const reasonValue = (hasInput && form[id] && form[id].reason) || '';
  const classes = useStyles();

  useEffect(() => {
    setFunc(id, { required });
  }, [id]);

  const setVal = ev => {
    // Selected value is always string
    const selectedValue = ev.target.value;
    const hasError = hasInput &&
      selectedValue === optionWithInput.value.toString() &&
      reasonValue.toString().length === 0;
    setFunc(id, hasInput
              ? { value: selectedValue, reason: reasonValue, error: hasError }
              : { value: selectedValue, error: hasError },
            ev);
  };
  const setReason = ev => {
    setFunc(
      id,
      { value: value, reason: ev.target.value, error: ev.target.value.length === 0},
      ev
    );
  };
  const onInputBlur = ev => {
    if (hasInput && 
        form[id] && form[id].value === optionWithInput.value.toString() &&
        ev.target.value.toString().length === 0) {
      setFunc(id, { error: true }, ev);
    }
  };
  return (
    <FormControl required={required} error={error}
      className={`${classes.formControl} ${classes.formControlSelect}`} component="fieldset"
    >
      <FormLabel id={id} component="legend">{label}</FormLabel>
      <div className="description">
        { children }
      </div>
      <RadioGroup className={classes.formControlRadioGroup} name={id} value={value}
        onChange={setVal}>
      {
        options.map(({ label, value, input }) => {
          return (
            <div key={value}>
              <FormControlLabel value={value.toString()} control={<Radio />} label={label} />
              { input && <Input value={reasonValue} error={error} onChange={setReason} onBlur={onInputBlur} /> }
            </div>
          );
        })
      }
      </RadioGroup>
    </FormControl>
  );
}

const confidenceOptions = [
  'Very confident in this conclusion',
  'Moderately confident in this conclusion',
  'Slightly confident in this conclusion',
  'Not at all confident in this conclusion'
].map(t => ({ label: t, value: t }));

const supportOptions = [
  { label: 'Yes, the data appears to support the hypothesis', value: 'Yes'},
  { label: 'No, the data does not support the hypothesis', value: 'No' }
];

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other', input: true }
];

// const educationOptions = ['Undergraduate', 'Graduate', 'Postdoctoral', 'Professional'].map(t => ({ label: t, value: t }));

const identificationOptions = [
  { label: 'Field geoscientist', value: 'Field Geoscientist' },
  { label: 'Lab geoscientist', value: 'Lab Geoscientist' },
  { label: 'Computational geoscientist', value: 'Computational Geoscientist' },
  { label: 'Other', value: 'other', input: true }
];

const acedemiaOptions = ['Graduate Students', 'Postdoctoral', 'Adjunct', 'Assistant Professor', 'Associate Professor', 'Full Professor', 'Emeritus'].map(
  t => ({ label: t, value: t })
);

export function PostSurvey(props) {
  const [form, setForm] = useState({});
  const classes = useStyles();
  const history = useHistory();
  const [globalState] = useStateValue();
  const { match } = props;

  const setFunc = (id, value, ev) => {
    setForm(oldform => ({
      ...oldform,
      [id]: { ...oldform[id], ...value }
    }));
  };
  
  const routeNames = [0, 1, 2, 3, 4, 5].map(i => i.toString());
  const hashArr = window.location.hash.split('/');
  const pageIndex = parseInt(hashArr[hashArr.length - 1], 10); 

  const onContinueClick = () => {
    const allLegends = Array.from(document.getElementsByTagName('legend'));
    const allIds : string[] = allLegends.map(i => i.id);
    const errorIds = new Set<string>();
    const emptyIds = new Set<string>();
    allIds.forEach(id => {
      if (!form[id]) {
        return;
      }
      if (form[id].error) {
        errorIds.add(id);
        return;
      }
      if (form[id].required) {
        if (form[id].value === undefined || form[id].value.toString() === 0) {
          emptyIds.add(id);
          return;
        }
      }
    })
    const hasError = emptyIds.size > 0 || errorIds.size > 0;
    if (hasError) {
      const newForm = { ...form };
      emptyIds.forEach(id => {
        newForm[id] = Object.assign(newForm[id] || {}, { error: true });
      });
      setForm(newForm);
      return;
    }
    history.push(`${match.path}/${pageIndex + 1}`);
  };

  const onBackClick = () => { 
    history.push(`${match.path}/${pageIndex - 1}`); 
  };

  const imgPaths = [p1, p2, p3, p4];

  const saveResult = () => {
    const {
      strategy,
      concludeQuestions,
      isAlternativeHypo, 
      initialHypos
    } = globalState;
    const { transectSamples, transectIndices } = strategy;
    // Parsing post-survey
    const resultForm = {};
    for (const key in form) {
      resultForm[key] = _.omit(form[key], ['error', 'required']);
    }
    // Parsing transects
    const resultTransects : ResultTransect[] = [];
    for (let i = 0, j = 0; i < transectIndices.length; i++) {
      const transect = transectIndices[i];
      if (transect.type === TransectType.DISCARDED) {
        resultTransects.push({
          ...transect,
          samples: []
        });
        continue;
      }
      const samples = transectSamples[j];
      const resultSamples : ResultRow[] = [];
      for (const row of samples) {
        const newRow = _.omit(row, 'isHovered');
        resultSamples.push(newRow);
      }
      resultTransects.push({
        ...transect,
        samples: resultSamples
      });
      j++;
    }
    const result : Record = {
      initialHypos,
      concludeQuestions,
      isAlternativeHypo,
      traces,
      form: resultForm,
      transects: resultTransects,
    };

    putItem(JSON.stringify(result), function(err, data) {
      if (err) {
        console.log('Err', err);
      }
      console.log(data);
    });
  };

  // Show 
  if (pageIndex === parseInt(routeNames[routeNames.length - 1], 10) + 1) {
    saveResult();
    return (
      <div className={classes.export}>
        <Typography variant="h6">Thanks for your time! Your response has been saved</Typography>
      </div>
    );
  }

  const nonBachelorQuestions = <div>
    <MyFormInput
      id="years-of-undergraduate"
      label="Years of undergraduate education completed:"
      form={form}
      type="text"
      setFunc={setFunc}
    />
    <MyFormInput
      id="undergraduate-major"
      label="Major:"
      form={form}
      type="text"
      setFunc={setFunc}
    />
    <MyFormInput
      id="undergraduate-minor"
      label="Minor:"
      form={form}
      type="text"
      setFunc={setFunc}
    />
  </div>;

  return (
    <div className={classes.form}>
      <Switch>
        <Redirect exact from={`${match.path}`} to={`${match.path}/${routeNames[0]}`} />
        <Route path={`${match.path}/${routeNames[0]}`}>
          <Typography variant="h6" style={{
            fontWeight: 700,
            marginBottom: 20
          }}>
            Thank you! You are almost finished. Please respond to a few final questions.
          </Typography>
          <MyFormSelect
            id="consistent"
            label="In your initial sampling strategy, did you take a consistent number of measurements at each location?"
            form={form}
            options={[
              { label: 'Yes', value: 'Yes'},
              { label: 'No', value: 'No'}
            ]}
            setFunc={setFunc}
          />
          {
            form['consistent'] && form['consistent'].value && (
              <MyFormInput
                id="consistent-reason"
                type="text"
                multiline
                fullWidth
                label={
                  form['consistent'].value === 'Yes'
                    ? 'Explain why you took the number of measurements you did. For example, if you took 3 measurements at each location, why the number 3? If you aren’t sure, put “Not Sure”'
                    : 'Explain why you took the number of measurements you did. If you aren’t sure, put “Not Sure”'
                }
                form={form}
                setFunc={setFunc}
              /> 
            )
          }
          <MyFormSelect
            id="evenly-space"
            label="In your initial sampling strategy, did you select locations that were (roughly) evenly spaced?"
            form={form}
            options={[
              { label: 'Yes', value: 'Yes'},
              { label: 'No', value: 'No'}
            ]}
            setFunc={setFunc}
          />
          {
            form['evenly-space'] && form['evenly-space'].value && (
              <MyFormInput
                id="evenly-space-reason"
                type="text"
                multiline
                fullWidth
                label={
                  form['evenly-space'].value === 'Yes'
                    ? 'Explain why you evenly spaced your sampling locations. If you aren’t sure, put “Not Sure”'
                    : 'Explain why you selected the spacing you did. If you aren’t sure, put “Not Sure”'
                }
                form={form}
                setFunc={setFunc}
              /> 
            )
          }
        </Route>
        {
          [1, 2, 3, 4].map(ind => (
            <Route key={ind} path={`${match.path}/${routeNames[ind]}`}>
              <MyFormSelect
                id={`p${ind}-support`}
                label="Imagine a trusted student or colleague also collected data at White Sands using RHex. They found the following relationship between sand moisture and shear stress:"
                form={form}
                options={supportOptions}
                setFunc={setFunc}
              >
                <img src={imgPaths[ind - 1]} />
                Does this data support the previously stated hypothesis? i.e., that moisture and shear stress increase until sand is saturated, at which point shear stress is constant as moisture increases.
              </MyFormSelect> 
              <MyFormSelect
                id={`p${ind}-confidence`}
                label="How confident are you in this conclusion?"
                form={form}
                options={confidenceOptions}
                setFunc={setFunc}
              />
            </Route>
          ))
        }
        <Route path={`${match.path}/${routeNames[5]}`}>
          <MyFormInput
            id="age"
            type="number"
            required={false}
            label="Age (in years):"
            form={form}
            setFunc={setFunc}
          />
          <MyFormSelect
            id="gender"
            label="Gender:"
            required={false}
            form={form}
            setFunc={setFunc}
            options={genderOptions}
          />
          <MyFormSelect
            id="if-bachelor"
            label={<span>Have you <u>completed</u> a bachelor's degree?</span>}
            required={true}
            form={form}
            setFunc={setFunc}
            options={[
              { label: 'Yes', value: 'Yes'},
              { label: 'No', value: 'No' }
            ]}
          />
          {
            form['if-bachelor'] && form['if-bachelor']['value'] === 'Yes' &&
              <div>
              <MyFormInput
                id="years-of-practice"
                label="Years of practice (beginning after your undergraduate education):"
                type="number"
                form={form}
                setFunc={setFunc}
              />
              <MyFormSelect
                id="geoscientist-or-psychologist"
                label="Are you a geoscientist or a psychologist?"
                form={form}
                setFunc={setFunc}
                options={[
                    { label: 'Geoscientist', value: 'Geoscientist'},
                    { label: 'Psychologist', value: 'Psychologist' },
                    { label: 'Others', value:'Others', input: true }
                  ]}
              />
              {
                form['geoscientist-or-psychologist'] && form['geoscientist-or-psychologist']['value'] === 'Geoscientist' && 
                  <div>
                    <MyFormSelect
                      id="familiarity"
                      label={`Are you familiar with any of the features of this decision making scenario? Have you ever collected data
                      at White Sands National Monument before or investigated a similar research question?`}
                      form={form}
                      setFunc={setFunc}
                      options={[
                        { label: 'I am familiar with some features', value: 'I am familiar with some features', input: true },
                        { label: 'I am not familiar with any features', value: 'I am not familiar with any features' }
                      ]}
                    >
                      If you are familiar with some of the features of the scenario, explain which ones.
                    </MyFormSelect>
                    <MyFormSelect
                      id="academia-or-industry"
                      label="Are you in academia or industry?"
                      form={form}
                      setFunc={setFunc}
                      options={[
                        { label: 'Academia', value: 'Academia' },
                        { label: 'Industry', value: 'Industry' },
                        { label: 'Other', input: true, value: 'Other' },
                      ]}
                    />
                    {
                      form['academia-or-industry'] && form['academia-or-industry']['value'] === 'Academia' && 
                      <MyFormSelect
                        id="academia-position"
                        label="Current position in academia:"
                        form={form}
                        setFunc={setFunc}
                        options={acedemiaOptions}
                      />
                    }
                    <MyFormSelect
                      id="identification"
                      label="Do you identify more as a field, lab, or computational geoscientist?"
                      form={form}
                      setFunc={setFunc}
                      options={identificationOptions}
                    />
                    <MyFormInput
                      id="geoscience-specialization"
                      label="Geoscience specialization:"
                      form={form}
                      setFunc={setFunc}
                    />
                  </div>
              }
              {
                form['geoscientist-or-psychologist'] && form['geoscientist-or-psychologist']['value'] === 'Psychologist' && 
                  <div>
                    <MyFormSelect
                      id="academia-or-industry"
                      label="Are you in academia or industry?"
                      form={form}
                      setFunc={setFunc}
                      options={[
                        { label: 'Academia', value: 'Academia' },
                        { label: 'Industry', value: 'Industry' },
                        { label: 'Other', input: true, value: 'Other' },
                      ]}
                    />
                    {
                      form['academia-or-industry'] && form['academia-or-industry']['value'] === 'Academia' && 
                      <MyFormSelect
                        id="academia-position"
                        label="Current position in academia:"
                        form={form}
                        setFunc={setFunc}
                        options={acedemiaOptions}
                      />
                    }
                    <MyFormInput
                      id="psychology-specialization"
                      label="Psychology specialization:"
                      form={form}
                      setFunc={setFunc}
                    />
                  </div>
              }
            </div>
          }
          {
            form['if-bachelor'] && form['if-bachelor']['value'] === 'No' && nonBachelorQuestions
          }
        </Route>
      </Switch>
      <div className={classes.action}>
        {
          pageIndex !== 0 && 
          <Button variant="contained" color="primary" onClick={onBackClick}>
            Back
          </Button>
        }
        <Button variant="contained" color="primary" onClick={onContinueClick}>
          Continue
        </Button>
      </div>
      
    </div>
  );
};