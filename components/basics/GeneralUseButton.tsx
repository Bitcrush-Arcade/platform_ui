// Material
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles'
import Fab, {FabProps} from '@material-ui/core/Fab'

type FabStyles ={
  width?: string | number,
  href?: string,
  target?: string,
} & WithStyles< typeof styles > & FabProps


const styles = (theme:Theme) => createStyles({
  root:{
    width: (props : FabStyles) => props.width || null,
    backgroundColor: 'transparent',
    borderColor: (props : FabStyles) => theme.palette[props.color || 'primary'].main,
    borderWidth: 1,
    borderStyle: 'solid',
    boxShadow: (props : FabStyles) => `inset 0 0 15px ${theme.palette[props.color || 'primary'].main}`,
    color: theme.palette.grey[200],
  },
  disabled:{
    backgroundColor: 'transparent !important',
    color: `${theme.palette.grey[200]} !important`,
    boxShadow: (props : FabStyles) => `inset 0 0 15px ${theme.palette[props.color || 'primary'].dark} !important`,
    borderColor: (props : FabStyles) => theme.palette[props.color || 'primary'].dark,
  },
  sizeSmall:{
    width: (props : FabStyles) => props.width && (typeof(props.width) == 'string' ? props.width : `${props.width}px`) + ' !important' || null,
  }
})

export default withStyles(styles)( (props: FabStyles) => <Fab {...props} variant="extended" component={ props.href ? 'a' : 'button' } target={props.target} />)