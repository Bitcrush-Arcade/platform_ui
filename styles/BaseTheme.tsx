import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: 'rgb(174,82,227)', // Purple
    },
    secondary: {
      main: 'rgb(43,216,180)', // Specified Black
    },
    background: {
      default: 'rgb(12,15,32)',
      paper: 'rgb(23,24,54)',
    },
    type: 'dark'

  },
});

export default responsiveFontSizes(theme)