import * as React from 'react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import YouTubeIcon from '@mui/icons-material/YouTube';
import RedditIcon from '@mui/icons-material/Reddit';
import TwitterIcon from '@mui/icons-material/Twitter';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import { closeModal } from '../../ui/uiSlice';
import { setPlatform } from './querySlice';

export default function PlatformPicker() {
  const { platform } = useSelector((state) => state.query);
  const dispatch = useDispatch();

  const handleChangePlatform = (event) => {
    dispatch(setPlatform(event.target.value));
    dispatch(closeModal());
  };

  const PLATFORM_TWITTER = 'twitter';
  const PLATFORM_REDDIT = 'reddit';
  const PLATFORM_YOUTUBE = 'youtube';
  const PLATFORM_ONLINE_NEWS = 'onlinenews';
  const [open, setOpen] = useState(true);
  if (platform === 'Choose a Platform') {
    return (
      <div>
        {/* <Button variant="outlined" onClick={handleClickOpen}>
                    Open form dialog
                </Button> */}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Choose A Platform</DialogTitle>
          <DialogContent>
            <DialogContentText>
              First, Choose a Platform to query against.
            </DialogContentText>
            <Select
              value="Choose A Platform"
              onChange={handleChangePlatform}
            >
              <MenuItem defaultValue disabled value="Choose A Platform">Choose A Platform</MenuItem>
              <MenuItem value={PLATFORM_ONLINE_NEWS}>Online News Archive</MenuItem>
              <MenuItem value={PLATFORM_REDDIT}>Reddit</MenuItem>
              <MenuItem value={PLATFORM_TWITTER}>Twitter</MenuItem>
              <MenuItem value={PLATFORM_YOUTUBE}>Youtube</MenuItem>
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-12 text-center">
        <div className="query-section">
          <ToggleButtonGroup
            value={platform}
            exclusive
            onChange={handleChangePlatform}
            aria-label="platform"
            color="primary"
          >
            <ToggleButton value={PLATFORM_ONLINE_NEWS}>
              <NewspaperIcon />
              {' '}
&nbsp;Online News
            </ToggleButton>
            <ToggleButton value={PLATFORM_REDDIT}>
              <RedditIcon />
              {' '}
&nbsp;Reddit
            </ToggleButton>
            <ToggleButton value={PLATFORM_TWITTER}>
              <TwitterIcon />
              {' '}
&nbsp;Twitter
            </ToggleButton>
            <ToggleButton value={PLATFORM_YOUTUBE}>
              <YouTubeIcon />
              {' '}
&nbsp;YouTube
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>
    </div>
  );
}