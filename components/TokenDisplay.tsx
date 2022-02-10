import { useState, useRef } from 'react'
// Material
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import Avatar from '@mui/material/Avatar'
import ButtonBase from '@mui/material/ButtonBase'
import Grid from '@mui/material/Grid'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
// Bitcrush
import Currency from 'components/basics/Currency'
// Icons
import ArrowDropIcon from '@mui/icons-material/ArrowDropDownCircleOutlined'
// utils
import BigNumber from 'bignumber.js'

type TokenDisplayProps ={
  color: 'primary' | 'secondary',
  amount: BigNumber,
  label?: string | React.ReactNode,
  icon: JSX.Element,
  actions?: Array< { name: string, onClick?: () => void, url?: string, highlight?: boolean } >,
  tokenIcon?: string
}

const TokenDisplay = ( props: TokenDisplayProps ) => {

  const { amount, icon, actions, color, tokenIcon, label } = props
  const [ showActions, setShowActions ] = useState<boolean>(false)

  const css = useStyles({ showActions, ...props })
  const toggleActions = () => setShowActions( p => !p )

  const btnRef = useRef<HTMLButtonElement>(null)

  return <>
  <Tooltip arrow title={ amount.div(10**18).toFixed(18)} disableFocusListener={!!label} disableHoverListener={!!label} disableTouchListener={!!label}>
    <ButtonBase 
      onClick={toggleActions}
      className={ css.button }
      disabled={!actions || !actions.length}
      ref={btnRef}
    >
      <Grid container alignItems="center" aria-controls="token-menu">
        {
          tokenIcon &&
          <Grid item style={{ paddingRight: 8 }}>
            <Avatar src={tokenIcon} sx={{ height: 32, width: 32}}>
              N/A
            </Avatar>
          </Grid>
        }
        <Grid item>
          <Typography variant="body2" color={color} style={{marginRight: 8}}>
            {
              label ||
                <Currency value={amount.div(10**18).toFixed(18)} decimals={4} />
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
    </Tooltip>
    {actions && actions.length > 0 && <Menu
      id={`token-menu`}
      open={showActions}
      anchorEl={btnRef.current}
      onClose={toggleActions}
      anchorOrigin={ { horizontal: 'center', vertical: "bottom" }}
      anchorReference="anchorEl"
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