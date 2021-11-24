import { useState, useRef } from 'react'
import AnimatedNumber from 'animated-number-react'
// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import ButtonBase from '@material-ui/core/ButtonBase'
import Grid from '@material-ui/core/Grid'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Typography from '@material-ui/core/Typography'
// Icons
import ArrowDropIcon from '@material-ui/icons/ArrowDropDownCircleOutlined'
// utils
import { currencyFormat } from 'utils/text/text'
import BigNumber from 'bignumber.js'

type TokenDisplayProps ={
  color: 'primary' | 'secondary',
  amount: BigNumber,
  label?: string | React.ReactNode,
  icon: JSX.Element,
  actions?: Array< { name: string, onClick?: () => void, url?: string, highlight?: boolean } >,
  token?: {
    icon?:  React.ReactNode,
    symbol?: string,
  }
}

const TokenDisplay = ( props: TokenDisplayProps ) => {

  const { amount, icon, actions, color, token, label } = props
  const [ showActions, setShowActions ] = useState<boolean>(false)

  const css = useStyles({ showActions, ...props })
  const toggleActions = () => setShowActions( p => !p )

  const btnRef = useRef<HTMLButtonElement>(null)

  const numberVal = amount.div(10**18).toString()
  return <>
    <ButtonBase 
      onClick={toggleActions}
      className={ css.button }
      disabled={!actions || !actions.length}
      ref={btnRef}
    >
      <Grid container alignItems="center" aria-controls="token-menu">
        {
          token?.icon &&
          <Grid item style={{ paddingRight: 8 }}>
            <Avatar className={ css.avatarIcon }>
              {token.icon}
            </Avatar>
          </Grid>
        }
        <Grid item>
          <Typography variant="body2" color={color} style={{marginRight: 8}}>
            {
              label || 
              <>
                <AnimatedNumber
                  value={numberVal}
                  formatValue={ v => currencyFormat(v,{decimalsToShow: 4})}
                />
              </>
            }
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
    {actions && actions.length > 0 && <Menu
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

        return <MenuItem onClick={ actionFn } key={`action-key-${idx}`} className={ action.highlight ? css.itemHighlight : ''}>
          {action.name}
        </MenuItem>
      })}
    </Menu>}
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
  },
  "@keyframes fundsInV1":{
    "0%": { 
      color: theme.palette.text.primary,
      fontSize: theme.typography.body1.fontSize,
    },
    "50%": { 
      color: 'red',
      fontSize: `calc(${theme.typography.body1.fontSize} * 0.95)`,
    },
    "100%": { 
      color: theme.palette.text.primary,
      fontSize: theme.typography.body1.fontSize,
    },
  },
  itemHighlight:{
    animationName: '$fundsInV1',
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount:'infinite',
    height: 35
  },
  avatarIcon:{
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white
  },
}))