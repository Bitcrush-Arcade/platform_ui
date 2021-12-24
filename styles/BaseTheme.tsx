import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { deepPurple, teal } from '@mui/material/colors';

declare module '@mui/material/styles'{
  interface Palette {
    blue?: Palette['primary'];
    menu?: Palette['primary'];
    shadow?: {
      primary: Palette['primary'];
      secondary: Palette['primary'];
    };
    border: Palette['primary'];
    moreBg: {
      highlight: string;
      menu: string;
      header: string;
    }
  }
  interface PaletteOptions {
    blue?: PaletteOptions['primary'];
    menu?: PaletteOptions['primary'];
    shadow?: {
      primary: PaletteOptions['primary'];
      secondary: PaletteOptions['primary'];
    };
    border: PaletteOptions['primary'];
    moreBg: {
      highlight: React.CSSProperties['color']
      menu: React.CSSProperties['color']
      header: React.CSSProperties['color']
    };
  }
}

const theme = (isDark?: boolean) => createTheme({
  palette: {
    primary: {
      main: 'rgb(174,82,227)', // Purple
      dark: deepPurple['A700']
    },
    secondary: {
      main: isDark ? teal['A400'] : teal['A700'],
      light: 'rgb(27,168,139)', // This is slightly darker than main
      dark: 'rgb(9,130,105)'
    },
    background: {
      default: isDark ? 'rgb(5,6,16)' : 'rgb(222,211,241)',
      paper: isDark ? 'rgb(27,30,65)' : 'white',
    },
    moreBg:{
      header: isDark ? 'rgb(13,12,44)' : 'rgb(231,171,247)',
      highlight: isDark ? 'rgb(13,12,44)' : 'rgba(214,199,239)',
      menu: isDark ? 'rgb(23,24,54)' : 'white',
    },
    info:{
      main: 'rgb(102,105,139)',
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
    blue: {
      main: 'rgb(86,166,246)'
    },
    mode: isDark ? 'dark' : 'light',
  },
  typography:{
    fontFamily:[
      'Oxanium',
      'Zebulon-Condensed',
      'Zebulon-Hollow',
      'Zebulon-Condensed-Hollow',
      'Zebulon',
      'MarsAttacks',
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
  },
  components: {
    MuiCssBaseline:{
      styleOverrides: `
      @font-face{
        font-family: 'MarsAttacks';
        font-weigth: normal;
        font-style: normal;
        src: url('/fonts/MarsAttacks/MarsAttacks.ttf');
      }
      @font-face {
        font-family: 'Zebulon-Condensed';
        font-weight: normal;
        font-style: normal;
        src: url('/fonts/Zebulon/Zebulon-Condensed.ttf');
      }
      @font-face {
        font-family: 'Zebulon-Condensed';
        font-weight: bold;
        font-style: normal;
        src: url('/fonts/Zebulon/Zebulon-Condensed-Bold.ttf');
      }
      @font-face {
        font-family: 'Zebulon-Condensed';
        font-weight: bold;
        font-style: italic;
        src: url('/fonts/Zebulon/Zebulon-Condensed-Bold-Italic.ttf');
      }
      @font-face {
        font-family: 'Zebulon-Condensed';
        font-weight: normal;
        font-style: italic;
        src: url('/fonts/Zebulon/Zebulon-Condensed-Italic.ttf');
      }
      /* ZEBULON CONDENSED HOLLOW */
      @font-face {
        font-family: 'Zebulon-Condensed-Hollow';
        font-weight: normal;
        font-style: normal;
        src: url('/fonts/Zebulon/Zebulon-Condensed-Hollow.ttf');
      }
      @font-face {
        font-family: 'Zebulon-Condensed-Hollow';
        font-weight: bold;
        font-style: normal;
        src: url('/fonts/Zebulon/Zebulon-Condensed-Hollow-Bold.ttf');
      }
      @font-face {
        font-family: 'Zebulon-Hollow';
        font-weight: bold;
        font-style: italic;
        src: url('/fonts/Zebulon/Zebulon-Hollow-Bold-Italic.ttf');
      }
      @font-face {
        font-family: 'Zebulon-Hollow';
        font-weight: normal;
        font-style: italic;
        src: url('/fonts/Zebulon/Zebulon-Hollow-Italic.ttf');
      }

      @font-face {
        font-family: 'Zebulon';
        font-weight: bold;
        font-style: italic;
        src: url('/fonts/Zebulon/Zebulon\ Bold\ Italic.ttf');
      }
      @font-face {
        font-family: 'Zebulon';
        font-weight: normal;
        font-style: normal;
        src: url('/fonts/Zebulon/Zebulon.ttf');
      }
      @font-face {
        font-family: 'Zebulon';
        font-weight: normal;
        font-style: italic;
        src: url('/fonts/Zebulon/Zebulon-Italic.ttf');
      }
      @font-face {
        font-family: 'Oxanium';
        font-weight: 200;
        font-style: normal;
        src: url('/fonts/Oxanium/Oxanium-VariableFont_wght.ttf');
      }
      @font-face {
        font-family: 'Oxanium';
        font-weight: 300;
        font-style: normal;
        src: url('/fonts/Oxanium/Oxanium-Light.ttf');
      }
      @font-face {
        font-family: 'Oxanium';
        font-weight: 400;
        font-style: normal;
        src: url('/fonts/Oxanium/Oxanium-Regular.ttf');
      }
      @font-face {
        font-family: 'Oxanium';
        font-weight: 500;
        font-style: normal;
        src: url('/fonts/Oxanium/Oxanium-Medium.ttf');
      }
      @font-face {
        font-family: 'Oxanium';
        font-weight: 600;
        font-style: normal;
        src: url('/fonts/Oxanium/Oxanium-SemiBold.ttf');
      }
      @font-face {
        font-family: 'Oxanium';
        font-weight: 700;
        font-style: normal;
        src: url('/fonts/Oxanium/Oxanium-Bold.ttf');
      }
      @font-face {
        font-family: 'Oxanium';
        font-weight: 800;
        font-style: normal;
        src: url('/fonts/Oxanium/Oxanium-ExtraBold.ttf');
      }
      `
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'unset' } },
    },
    MuiFab:{
      defaultProps:{
        variant: 'extended'
      }
    }
  },
});

export default function getTheme( isDark?: boolean ) { return responsiveFontSizes( theme(isDark) ) }