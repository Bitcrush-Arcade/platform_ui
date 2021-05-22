import { ReactNode, Ref } from 'react'
// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Fab from '@material-ui/core/Fab'

const GeneralUseButton = (props: GeneralBtnProps ) => {

  const { color = 'primary', onClick, href, target, children, ref } = props
  const css = useStyles(props)

  return <Fab 
    variant="extended"
    color={color}
    className={css.walletBtn}
    onClick={onClick}
    component={ href ? 'a' : 'button'}
    href={href}
    target={target}
    ref={ref}
  >
    {children}
  </Fab>
}

type GeneralBtnProps ={
  color?: "primary" | "secondary",
  onClick?: (e) => void,
  href?: string,
  target?: string,
  children?: ReactNode
  ref?: Ref<HTMLAnchorElement>
  width?: string | number
}

export default GeneralUseButton

const useStyles = makeStyles<Theme, GeneralBtnProps>( (theme:Theme) => createStyles({
  walletBtn:{
    width: props => props.width || null,
    backgroundColor: 'transparent',
    borderColor: props => theme.palette[props.color || 'primary'].main,
    borderWidth: 1,
    borderStyle: 'solid',
    boxShadow: props => `inset 0 0 15px ${theme.palette[props.color || 'primary'].main}`,
    color: 'white'
  }
}))