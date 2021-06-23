import { useState, useRef } from 'react'
// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import ButtonBase from '@material-ui/core/ButtonBase'
import Grid from '@material-ui/core/Grid'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Typography from '@material-ui/core/Typography'
// Icons
import ArrowDropIcon from '@material-ui/icons/ArrowDropDownCircleOutlined'
// utils
import { currencyFormat } from 'utils/text/text'

type TokenDisplayProps ={
  color: 'primary' | 'secondary',
  amount: number,
  icon: JSX.Element,
  actions?: Array< { name: string, onClick?: () => void, url?: string } >,
  symbol?: string
}

const TokenDisplay = ( props: TokenDisplayProps ) => {

  const { amount, icon, actions, color, symbol } = props
  const [ showActions, setShowActions ] = useState<boolean>(false)

  const css = useStyles({ showActions, ...props })
  const toggleActions = () => setShowActions( p => !p )

  const btnRef = useRef<HTMLButtonElement>(null)

  return <>
    <ButtonBase 
      onClick={toggleActions}
      className={ css.button }
      ref={btnRef}
    >
      <Grid container alignItems="center" spacing={1} aria-controls="token-menu">
        <Grid item>
          <Typography variant="body2" color={color}>
            {symbol ? `${symbol} `: ''}{currencyFormat(amount, { isWei: true })}
          </Typography>
        </Grid>
        <Grid item>
          {icon}
        </Grid>
        {actions && <Grid item>
          <ArrowDropIcon fontSize="small" className={ css.dropdown }/>
        </Grid>}
      </Grid>
    </ButtonBase>
    <Menu
      id={`token-menu`}
      open={showActions}
      anchorEl={btnRef.current}
      onClose={toggleActions}
      anchorOrigin={ { horizontal: 'center', vertical: "bottom" }}
      anchorReference="anchorEl"
      getContentAnchorEl={null}
      PaperProps={{
        className: css.menu
      }}
    >
      {actions?.map( (action, idx) => {
        
        const actionFn = () => {
          action?.onClick && action.onClick()
          toggleActions()
        }

        return <MenuItem onClick={ actionFn } key={`action-key-${idx}`}>
          {action.name}
        </MenuItem>
      })}
    </Menu>
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
  },
  menu:{
    boxShadow: ` 0px 10px 60px ${theme.palette.primary.main}`
  }
}))