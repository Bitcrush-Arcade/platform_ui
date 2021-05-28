import { Theme, withStyles, WithStyles, createStyles } from '@material-ui/core/styles'
import Card, {CardProps} from '@material-ui/core/Card'
// utils
import { styledBy } from 'utils/styles/styling'

const styles = (theme:Theme) => createStyles({
  root:{
    boxShadow: styledBy( 'shadow', {
      default: `inset 0 0 20px ${theme.palette.primary.main}`,
      primary: `inset 0 0 20px ${theme.palette.primary.main}`,
      dark: `inset 0 0 15px ${theme.palette.primary.dark}`,
      secondary: `inset 0 0 20px ${theme.palette.secondary.main}`
    }),
    background: (props: CardStyles ) => styledBy<CardStyles, BackgroundMapping>('background',{
        transparent: `rgba(0,0,0,${props.opacity || '0'})`,
        light: `linear-gradient(45deg, ${theme.palette.background.default} 0%,${theme.palette.background.default} 10%, ${theme.palette.background.paper} 75%, ${theme.palette.background.paper} 100%)`,
        dark: `${theme.palette.background.paper}`,
        default: theme.palette.background.default
      }
    )(props),
    borderRadius: theme.spacing(4),
    borderColor: props => theme.palette[props.shadow !== 'dark' && props.shadow ||'primary'][props.shadow == 'dark' ? 'dark': 'main'],
    borderStyle: 'solid',
    borderWidth: 1,
  }
})

type CardStyles ={
  background?: 'transparent' | 'light' | 'dark',
  opacity?: number,
  shadow?: 'primary' | 'secondary' | 'dark'
} & WithStyles< typeof styles > & CardProps

interface BackgroundMapping {
  default: string,
  transparent: string,
  dark: string,
  light: string,
}

export default withStyles(styles)( (props: CardStyles) => <Card {...props}/> )