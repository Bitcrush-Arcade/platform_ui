import { createMuiTheme, responsiveFontSizes,  } from '@material-ui/core/styles';
import deepPurple from '@material-ui/core/colors/deepPurple'
// import purple from '@material-ui/core/colors/purple'
import teal from '@material-ui/core/colors/teal'

const theme = (isDark?: boolean) => createMuiTheme({
  palette: {
    primary: {
      main: 'rgb(174,82,227)', // Purple
      dark: deepPurple['A700']
    },
    secondary: {
      main: teal['A400'],
      light: 'rgb(27,168,139)', // This is slightly darker than main
      dark: 'rgb(9,130,105)'
    },
    background: {
      default: isDark ? 'rgb(12,15,32)' : 'white',
      paper: isDark ? 'rgb(27,30,65)' : 'white',
      menu: isDark ? 'rgb(23,24,54)' : 'white',
      highlight: isDark ? 'rgb(13,12,44)' : 'rgba(214,199,239)'
    },
    text:{
      secondary: 'rgb(102,105,139)',
    },
    shadow:{
      primary: {
        main: 'rgba(174,82,227,0.65)',
        dark: 'rgba(98, 0, 234,0.75)',
      },
      secondary: {
        main: 'rgba(29, 233, 182,0.65)'
      },
    },
    border:{
      light: deepPurple['100'],
      dark: 'rgb(34,35,63)',
      main: 'rgb(174,82,227)',
    },
    type: isDark ? 'dark' : 'light',
  },
  typography:{
    fontFamily:[
      'Oxanium',
      'Zebulon-Condensed',
      'Zebulon-Hollow',
      'Zebulon-Condensed-Hollow',
      'Zebulon',
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
    button:{
      fontWeight: 200,
      textTransform: 'none',
    }
  }
});

export default function getTheme( isDark?: boolean ) { return responsiveFontSizes( theme(isDark) ) }