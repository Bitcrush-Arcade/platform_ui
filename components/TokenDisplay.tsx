import { useState } from 'react'
// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import ButtonBase from '@material-ui/core/ButtonBase'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
// Icons
import ArrowDropIcon from '@material-ui/icons/ArrowDropDownCircleOutlined'

type TokenDisplayProps ={
  color: 'primary' | 'secondary',
  amount: number,
  icon: JSX.Element,
  actions: Array< { name: string, onClick: () => void } >
}

const TokenDisplay = ( props: TokenDisplayProps ) => {

  const { amount, icon, actions, color } = props
  const [ showActions, setShowActions ] = useState<boolean>(false)

  const css = useStyles({ showActions, ...props })
  const toggleActions = () => setShowActions( p => !p )

  return <>
    <ButtonBase onClick={toggleActions} className={ css.button }>
      <Grid container alignItems="center" spacing={1}>
        <Grid item>
          <Typography variant="body2" color={color}>
            $&nbsp;{amount}
          </Typography>
        </Grid>
        <Grid item>
          {icon}
        </Grid>
        <Grid item>
          <ArrowDropIcon fontSize="small" className={ css.dropdown }/>
        </Grid>
      </Grid>
    </ButtonBase>
  </>
}

export default TokenDisplay

const useStyles = makeStyles<Theme, { showActions : boolean } & TokenDisplayProps >( (theme: Theme ) => createStyles({
  dropdown:{
    transform: props => props.showActions ? 'rotate( 180deg )' : 'rotate( 0deg)',
    color: props => props.showActions ? theme.palette[props.color].main : theme.palette.grey[500],
  },
  button:{
    borderRadius: theme.spacing(5),
    padding: theme.spacing(1)
  }
}))