import { Theme, withStyles, WithStyles, createStyles } from '@material-ui/core/styles'
import Card, {CardProps} from '@material-ui/core/Card'
// utils
import { styledBy } from 'utils/styles/styling'

const styles = (theme:Theme) => createStyles({
  root:{
    boxShadow: styledBy( 'shadow', {
      default: `inset 0 0 10px ${theme.palette.primary.main}`,
      primary: `inset 0 0 10px ${theme.palette.primary.main}`,
      secondary: `inset 0 0 10px ${theme.palette.secondary.main}`
    }),
    background: (props: CardStyles ) => styledBy<CardStyles, BackgroundMapping>('background',{
        transparent: `rgba(0,0,0,${props.opacity})`,
        light: `linear-gradient(90deg, ${theme.palette.background.default} 0%,${theme.palette.background.default} 42%, ${theme.palette.background.paper} 58%, ${theme.palette.background.paper} 100%)`,
        dark: `${theme.palette.background.paper}`,
        default: theme.palette.background.default
      }
    )(props)
  }
})

type CardStyles ={
  background?: 'transparent' | 'light' | 'dark',
  opacity?: number,
  shadow?: 'primary' | 'secondary'
} & WithStyles< typeof styles > & CardProps

interface BackgroundMapping {
  default: string,
  transparent: string,
  dark: string,
  light: string,
}

export default withStyles(styles)( (props: CardStyles) => <Card {...props}/> )