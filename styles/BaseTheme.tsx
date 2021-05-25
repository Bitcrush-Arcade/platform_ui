import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';
import deepPurple from '@material-ui/core/colors/deepPurple'
// import purple from '@material-ui/core/colors/purple'
import teal from '@material-ui/core/colors/teal'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: 'rgb(174,82,227)', // Purple
      dark: deepPurple['A700']
    },
    secondary: {
      main: teal['A400'],
    },
    background: {
      default: 'rgb(12,15,32)',
      paper: 'rgb(27,30,65)',
    },
    type: 'dark'
  },
  typography:{
    fontFamily:[
      'Zebulon-Condensed',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1:{
      letterSpacing: 5,
    },
    h2:{
      letterSpacing: 5,
    },
    h3:{
      letterSpacing: 5,
    },
    h4:{
      letterSpacing: 3,
    },
    h5:{
      letterSpacing: 3,
    },
    h6:{
      letterSpacing: 3,
    },
    body1:{
      letterSpacing: 3,
    },
    body2:{
      letterSpacing: 2,
    },
    button: {
      letterSpacing: 2,
    }
  }
});

export default responsiveFontSizes(theme)