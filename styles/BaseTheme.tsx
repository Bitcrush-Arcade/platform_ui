import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: 'rgb(173,67,238)', // Purple
    },
    secondary: {
      main: 'rgb(43,216,180)', // Specified Black
    },
    background: {
      default: 'rgb(23,24,54)'
    }
  },
});

export default responsiveFontSizes(theme)