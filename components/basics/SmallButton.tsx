// Material
import { Theme } from '@mui/material/styles';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import Fab, {FabProps} from '@mui/material/Fab'
// Libs
import { styledBy } from 'utils/styles/styling'

type FabStyles = {
  color?: 'primary' | 'secondary',
  hasIcon?: boolean
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
    color: theme.palette.mode == "dark" ? theme.palette.grey[200] : theme.palette.common.black,
    '&:hover':{
      color: theme.palette.grey[200],
    }
  },
  label:{
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 400, 
    paddingLeft: props => props.hasIcon ? theme.spacing(1) : 0,
    paddingRight: props => props.hasIcon ? theme.spacing(1) : 0,
    paddingTop: props => props.hasIcon ? 0 : theme.spacing(0.5)
  },
})

export default withStyles(styles)( (props: FabStyles) => {
  const { hasIcon, ...filteredProps } = props
  return <Fab {...filteredProps} variant="extended" />
})