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
      paper: 'rgb(23,24,54)',
    },
    type: 'dark'

  },
});

export default responsiveFontSizes(theme)