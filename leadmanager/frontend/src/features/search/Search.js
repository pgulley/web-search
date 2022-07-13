import * as React from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { Button } from '@mui/material';

export default function MaterialUIPickers() {
  const [value, setValue] = React.useState();

  const handleChange = (newValue) => {
    setValue(newValue);
  };

  return (
    <div style={{ paddingTop: "200px" }}>


      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack spacing={2} direction="row">


          {/* From Date */}
          <DesktopDatePicker
            label="From"
            inputFormat="MM/dd/yyyy"
            value={value}
            onChange={handleChange}
            renderInput={(params) => <TextField {...params} />}
          />

          {/* To Date */}
          <DesktopDatePicker
            label="To"
            inputFormat="MM/dd/yyyy"
            value={value}
            onChange={handleChange}
            renderInput={(params) => <TextField {...params} />}
          />

          {/* Submit */}
          <Button
            variant="outlined"
            onClick={async () => {
              console.log('Submit')
            }}
          >
            Submit
          </Button>
        </Stack>
      </LocalizationProvider>
    </div >
  );
}