
// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Fab from '@material-ui/core/Fab'

const GeneralUseButton = (props: GeneralBtnProps ) => {

  const { color = 'primary' } = props
  const css = useStyles(props)

  return <Fab variant="extended" color={color} className={css.walletBtn}>
    Connect
  </Fab>
}

type GeneralBtnProps ={
  color?: "primary" | "secondary"
}

export default GeneralUseButton

const useStyles = makeStyles<Theme, GeneralBtnProps>( (theme:Theme) => createStyles({
  walletBtn:{
    backgroundColor: 'transparent',
    borderColor: props => theme.palette[props.color || 'primary'].main,
    borderWidth: 1,
    borderStyle: 'solid',
    boxShadow: props => `inset 0 0 16px ${theme.palette[props.color || 'primary'].main}`,
    
  }
}))