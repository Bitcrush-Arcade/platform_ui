// Material
import Fab, {FabProps} from '@mui/material/Fab'
// Libs
import { styled } from '@mui/system'

type SmallFabProps = {
  color?: 'primary' | 'secondary',
  hasIcon?: boolean
} & FabProps

const SmallFab = styled(Fab,{
  shouldForwardProp: prop => prop !== 'hasIcon'
})<SmallFabProps>( ({theme, color, hasIcon }) => ({
  borderColor: theme.palette[color || 'primary'].main,
  borderWidth: 1,
  borderStyle: 'solid',
  borderRadius: theme.spacing(10),
  borderTopRightRadius: '0',
  height: '24px !important',
  backgroundColor: 'transparent',
  boxShadow: `inset 0 0 15px rgba(${color == 'secondary' ? '29,233,182' : '174,82,227'},0.65)`,
  color: theme.palette.mode == "dark" ? theme.palette.grey[200] : theme.palette.common.black,
  fontSize: "0.75rem",
  fontWeight: 400,
  paddingLeft: hasIcon ? theme.spacing(1) : 0,
  paddingRight: hasIcon ? theme.spacing(1) : 0,
  paddingTop: hasIcon ? 0 : theme.spacing(0.5),
  '&:hover':{
    color: theme.palette.grey[200],
  }
}))

export default SmallFab