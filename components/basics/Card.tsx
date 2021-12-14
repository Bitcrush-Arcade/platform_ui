import { Theme } from '@mui/material/styles';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import Card, {CardProps} from '@mui/material/Card'
// utils
import { styledBy } from 'utils/styles/styling'

const styles = (theme:Theme) => createStyles({
  root:{
    boxShadow: styledBy( 'shadow', {
      default: theme.palette.mode =="light" ? "none" : `inset 0 0 20px ${theme.palette.shadow.primary.main}`,
      primary: theme.palette.mode =="light" ? "none" : `inset 0 0 20px ${theme.palette.shadow.primary.main}`,
      dark: theme.palette.mode =="light" ? "none" : `inset 0 0 15px ${theme.palette.shadow.primary.dark}`,
      secondary: theme.palette.mode =="light" ? "none" : `inset 0 0 20px ${theme.palette.shadow.secondary.main}`,
    }),
    background: (props: CardStyles ) => styledBy<CardStyles, BackgroundMapping>('background',{
        transparent: theme.palette.mode == 'dark' ? `rgba(0,0,0,${props.opacity || '0'})` : theme.palette.common.white ,
        light: `linear-gradient(54deg, ${theme.palette.background[theme.palette.mode == 'dark' ? 'default' : 'paper']} 0%,${theme.palette.background[theme.palette.mode == 'dark' ? 'default' : 'paper']} 10%, ${theme.palette.background.paper} 75%, ${theme.palette.background.paper} 100%)`,
        dark: `${theme.palette.background.paper}`,
        default: theme.palette.background.default
      }
    )(props),
    borderRadius: theme.spacing(4),
    borderColor: props =>  theme.palette[ props.shadow !== "dark" && theme.palette.mode !=="light" && props.shadow ||'primary'][props.shadow == 'dark' ? 'dark': 'main'],
    borderStyle: props => props.noBorder ? 'none' : 'solid',
    borderWidth: 1,
  }
})

type CardStyles ={
  background?: 'transparent' | 'light' | 'dark',
  opacity?: number,
  shadow?: 'primary' | 'secondary' | 'dark',
  noBorder?: boolean,
} & WithStyles< typeof styles > & CardProps

interface BackgroundMapping {
  default: string,
  transparent: string,
  dark: string,
  light: string,
}

export default withStyles(styles)( (props: CardStyles) => {
  const { noBorder, ...cardProps} = props
  return <Card {...cardProps}/>
} )