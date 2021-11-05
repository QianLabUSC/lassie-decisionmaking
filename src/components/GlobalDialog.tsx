import * as React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { useStateValue, Action } from '../state';

export function GlobalDialog() {
  const [globalState, dispatch] = useStateValue();  
  const { dialogProps } = globalState;
  if (!dialogProps) {
    return null;
  }
  const { text, onOk, onCancel } = dialogProps;
  let { title, okText, cancelText, onClose } = dialogProps;
  onClose = onClose || (() => dispatch({ type: Action.SET_DIALOG_PROPS, value: null }));
  const textSections = (typeof text) === "string" ? [text as string] : text as string[];

  return (
    <Dialog
      open={true}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        {
          textSections.map((text, i) => <DialogContentText key={i} id="alert-dialog-description">{text}</DialogContentText>)
        }
      </DialogContent>
      <DialogActions>
        {
          onCancel && <Button onClick={onCancel} color="primary">{cancelText || 'Cancel'}</Button>
        }
        <Button onClick={onOk} color="primary">{okText || 'OK'}</Button>
      </DialogActions>
    </Dialog>
  );
}