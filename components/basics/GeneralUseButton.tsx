// Material
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles'
import Fab, {FabProps} from '@material-ui/core/Fab'
// Libs
import { styledBy } from 'utils/styles/styling'

export type FabStyles ={
  width?: string | number,
  href?: string,
  target?: string,
  background?: 'default' | 'primary' | 'secondary',
  solidDisabledText?: boolean,
} & WithStyles< typeof styles > & FabProps


const styles = (theme:Theme) => createStyles({
  root:{
    width: (props : FabStyles) => props.width || null,
    backgroundColor: styledBy('background',{
      default: 'transparent',
      primary: theme.palette.primary.dark,
      secondary: theme.palette.secondary.dark
    }),
    borderColor: (props : FabStyles) => theme.palette[props.color || 'primary'].main,
    borderWidth: 1,
    borderStyle: 'solid',
    boxShadow: styledBy('color', {
      default: `inset 0 0 15px ${theme.palette.shadow.primary.main}`,
      primary: `inset 0 0 15px ${theme.palette.shadow.primary.main}`,
      secondary:`inset 0 0 15px rgba(29, 233, 182,0.65)`
    }),
    color: theme.palette.type == "dark" ? theme.palette.grey[200] : theme.palette.common.black,
    '&:hover':{
      color: props => !props.color ? theme.palette.common.black : theme.palette.grey[200],
    }
  },
  disabled:{
    backgroundColor: 'transparent !important',
    color:  props => (props.solidDisabledText && theme.palette.type == 'light') ? `${theme.palette.grey[600]} !important` : `${theme.palette.grey[200]} !important`,
    boxShadow: (props : FabStyles) => `inset 0 0 15px ${theme.palette[props.color || 'primary'].dark} !important`,
    borderColor: (props : FabStyles) => theme.palette[props.color || 'primary'].dark,
  },
  sizeSmall:{
    width: (props : FabStyles) => props.width && (typeof(props.width) == 'string' ? props.width : `${props.width}px`) + ' !important' || null,
  },
  extended:{
    width: (props : FabStyles) => props.width && (typeof(props.width) == 'string' ? props.width : `${props.width}px`) + ' !important' || null,
  }
})

export default withStyles(styles)( (props: FabStyles) => <Fab {...props} variant={props.variant || "extended"} component={ props.href ? 'a' : 'button' } target={props.target} />)