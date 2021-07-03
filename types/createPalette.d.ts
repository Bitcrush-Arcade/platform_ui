import {Palette, PaletteColorOptions, PaletteColorOptions, TypeBackground } from '@material-ui/core/styles/createPalette'

declare module '@material-ui/core/styles/createPalette' {
  interface PaletteOptions{
    shadow?: {
      primary: PaletteColorOptions;
      secondary: PaletteColorOptions;
    };
    border: PaletteColorOptions;
  }

  interface Palette{
    shadow: {
      primary: PaletteColor;
      secondary: PaletteColor;
    };
    border: PaletteColor;
  }

  interface TypeBackground{
    card: string,
    menu: string,
    highlight: string,
  }
}