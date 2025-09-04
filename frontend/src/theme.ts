import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-date-pickers/themeAugmentation';

const theme = createTheme({
  components: {
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiDatePicker: {
      defaultProps: {
        slotProps: { textField: { size: 'small' } },
      },
    },
  },
});

export default theme;
