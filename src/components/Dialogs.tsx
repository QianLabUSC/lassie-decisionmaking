import * as React from 'react';
import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyle = makeStyles(() => ({
  dialog: {
    overflow: 'scroll',
  },
  helpDialogTitle: {
    position: 'relative',
    left: '50%',
    transform: 'translate(-50%, 0%)',
    textAlign: "center",
  },
}));

interface ConfirmProps {
  open: boolean,
  onOk: () => void,
  onClose?: () => void,
  onCancel: () => void,
  allowCancel: boolean,
  title?: string,
  text: string | string[], 
  okText?: string,
  cancelText?: string
};

export function ConfirmDialog({ open, onOk, onClose, onCancel, allowCancel, title, text, okText, cancelText } : ConfirmProps) {
  const classes = useStyle();
  title = title || "";
  okText = okText || "OK";
  cancelText = cancelText || 'Cancel';
  const textSections: string[] = (typeof text) === "string" ? [text as string] : text as string[];
  onClose = onClose || onCancel;
  return (
    <Dialog
      className={classes.dialog}
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      disableBackdropClick
      disableEscapeKeyDown
    >
      <DialogTitle id="alert-dialog-title" className={classes.helpDialogTitle}>{title}</DialogTitle>
      <DialogContent>
        {
          textSections.map((t, i) => <DialogContentText id="alert-dialog-description" key={i}>{t}</DialogContentText>)
        }
      </DialogContent>
      <DialogActions>
        {allowCancel && <Button onClick={onCancel} color="primary">{cancelText}</Button>}
        <Button onClick={onOk} color="primary">{okText}</Button>
      </DialogActions>
    </Dialog>
  );
};

export function MultiStepDialog({ open, title, steps, setOpen, allowCancel}) {
  const [idx, setIdx] = useState(0);
  const isFirstStep = idx == 0;
  const isLastStep = idx == steps.length - 1;
  const onOk = () => {
    if (isLastStep) {
      setOpen(false);
      setTimeout(() => {
        setIdx(0);
      }, 200);
    } else {
      setIdx(idx + 1);
    }
  };
  return (
    <ConfirmDialog
      open={open}
      title={isFirstStep ? title : ""}
      onOk={onOk}
      onClose={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      allowCancel={allowCancel}
      text={steps[idx]}
      okText={isLastStep ? "OK" : "Next"}
    />
  );
}
