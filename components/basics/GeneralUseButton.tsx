// Material
import Fab, {FabProps} from '@mui/material/Fab'
import { styled } from '@mui/system'

type FabBasicProps = {
  width?: string | number,
  href?: string,
  target?: string,
  background?: 'default' | 'primary' | 'secondary',
  solidDisabledText?: boolean,
} & FabProps

const BasicButton = styled( Fab ,{
  shouldForwardProp: prop => prop !== 'width' && prop !== 'background' && prop !== 'solidDisabledText'
})<FabBasicProps>( ({ theme, width, color, background, solidDisabledText}) => ({
  width: width || undefined,
  borderColor: theme.palette[ color || 'primary'].main,
  background: background === 'primary' && theme.palette.primary.dark || background === 'secondary' && theme.palette.secondary.dark || 'transparent',
  borderWidth: 1,
  borderStyle: 'solid',
  boxShadow: `inset 0 0 15px ${ color == "secondary" && "rgba(29,233,182,0.65)" || theme.palette.shadow?.primary.main}`,
  color: theme.palette.mode == "dark" || !!background ? theme.palette.grey[200] : theme.palette.common.black,
  "&:hover":{
    color: color ? theme.palette.common.black : theme.palette.grey[200],
    background: (background === 'primary' || color === "primary") && theme.palette.primary.light || (background === 'secondary' || color === 'secondary') && theme.palette.secondary.light || 'transparent',
  },
  "&.Mui-disabled":{
    backgroundColor: 'transparent !important',
    color: theme.palette.grey[ (solidDisabledText && theme.palette.mode == 'light') ? 800 : 200 ],
    boxShadow: `inset 0 0 15px ${theme.palette[color || 'primary'].dark} !important`,
    borderColor: theme.palette[color || 'primary'].dark,
  },
  "&.MuiFab-sizeSmall":{
    width: width && (typeof(width) == 'string' ? width : `${width}px`) + ' !important' || null,
  },
  "&.MuiFab-extended":{
    width: width && (typeof(width) == 'string' ? width : `${width}px`) + ' !important' || null,
  },
}))

export default BasicButton