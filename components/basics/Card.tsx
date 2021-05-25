import { Theme, withStyles, WithStyles } from '@material-ui/core/styles'
import Card, {CardProps} from '@material-ui/core/Card'

const styles = (theme:Theme) => ({
  root:{
    boxShadow: `inset 0 0 10px ${theme.palette.primary.main}`,
    // background
  }
})

interface CardStyles extends WithStyles< typeof styles >{
  background?: 'transparent' | 'light' | 'dark',
  opacity?: number
}

export default withStyles(styles)( ({ classes, background, opacity, ...other }: CardStyles & CardProps) => <Card classes={classes} {...other} />)