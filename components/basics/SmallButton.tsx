// Material
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles'
import Fab, {FabProps} from '@material-ui/core/Fab'
// Libs
import { styledBy } from 'utils/styles/styling'

type FabStyles = {
  color?: 'primary' | 'secondary'
} & WithStyles< typeof styles > & FabProps

const styles = (theme: Theme) => createStyles({
  root:{
    borderColor: (props: FabStyles) => theme.palette[props.color || 'primary'].main,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: theme.spacing(10),
    borderTopRightRadius: '0 !important',
    height: '24px !important',
    backgroundColor: 'transparent',
    boxShadow: styledBy('color', {
      default: `inset 0 0 15px rgba(174,82,227,0.65)`,
      primary: `inset 0 0 15px rgba(174,82,227,0.65)`,
      secondary:`inset 0 0 15px rgba(29, 233, 182,0.65)`
    }),
  },
  label:{
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 400, 
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
})

export default withStyles(styles)( (props: FabStyles) => <Fab {...props} variant="extended" />)