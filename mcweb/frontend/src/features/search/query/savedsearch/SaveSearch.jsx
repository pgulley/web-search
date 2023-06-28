import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useCreateSavedSearchMutation } from '../../../../app/services/savedsearchApi';
import urlSerializer from '../../util/urlSerializer';

export default function SaveSearch() {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const queryState = useSelector((state) => state.query);
  // const serializedSearch = `https://search.mediacloud.org/search?${urlSerializer([queryState])}`;
  const [createSavedSearch] = useCreateSavedSearchMutation();

  const handleSaveSearch = async () => {
    const serializedSearch = `https://search.mediacloud.org/search?${urlSerializer([queryState])}`;
    await createSavedSearch({ name, serializedSearch });
    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setName('');
    setOpen(false);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  return (
    <>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Save Search
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Save Search</DialogTitle>
        <DialogContent>
          <TextField label="Search Name" value={name} onChange={handleNameChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSaveSearch}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
