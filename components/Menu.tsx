// React imports
import React, { Fragment } from 'react'
import { useImmer } from 'use-immer'
// Next
import { useRouter } from 'next/router'
import Image from 'next/image'
// Material imports
import { makeStyles, createStyles, Theme, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Button from '@material-ui/core/Button'
import Collapse from '@material-ui/core/Collapse'
import ClickAwayListener from "@material-ui/core/ClickAwayListener"
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import Grid from "@material-ui/core/Grid"
import IconButton from "@material-ui/core/IconButton"
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
// Icons
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import GitHubIcon from '@material-ui/icons/GitHub'
import HomeIcon from '@material-ui/icons/Home'
import RateReviewIcon from '@material-ui/icons/RateReview';
import TwitterIcon from '@material-ui/icons/Twitter'
import TelegramIcon from '@material-ui/icons/Telegram'
import TrendingUpIcon from '@material-ui/icons/TrendingUp'
// BitCrush
// Components
import Coin from 'components/tokens/Token2'
// Utils
import { useTransactionContext } from 'hooks/contextHooks'
import { currencyFormat } from 'utils/text/text'
import { ConditionalLinkWrapper } from 'utils/wrappers'
// Icons
import ArcadeIcon from 'components/svg/ArcadeIcon'
import RocketIcon from 'components/svg/RocketIcon'
import UfoIcon from 'components/svg/UfoIcon'
import Ufo2Icon from 'components/svg/Ufo2Icon'
import RechargeIcon from 'components/svg/RechargeIcon'
import BlackHoleIcon from 'components/svg/BlackHoleIcon'
import TradeIcon from 'components/svg/TradeIcon'
import WarpIcon from 'components/svg/WarpIcon'
import NightIcon from 'components/svg/Night'
import DayIcon from 'components/svg/Day'

const hashexScale = 5

const Menu = ( props: { open: boolean, toggleOpen: () => void }) => {
    const { open, toggleOpen } = props
    const router = useRouter()
    const css = useStyles({ open })
    const theme = useTheme()
    const isSm = useMediaQuery( theme.breakpoints.down('sm') )

    const { tokenInfo, toggleDarkMode, isDark } = useTransactionContext()
    
    const linkArray: Array<LinkItem> = [
        { name: 'Home', icon: <HomeIcon color="inherit"/>, url_link: '/' },
        { name: 'Intergalactic Trade', icon: <TradeIcon/>, url_link: '/trade', disabled: true },
        // { name: 'Warp Speed', icon: <WarpIcon/>, url_link: '/warp', disabled: true },
        { name: 'Galactic Mining', icon: <UfoIcon/>, url_link: '/mining' },
        { name: 'ARCADE', icon: <ArcadeIcon/>, url_link: '/games' },
        // { name: `Recharging`, icon: <RechargeIcon/>, url_link: '/recharge', disabled: true },
        { name: `Crush n'Burn Lottery`, icon: <RocketIcon/>, url_link: '/lottery', disabled: true },
        // { name: `NFTs`, icon: <Ufo2Icon/>, url_link: '/nft', disabled: true },
        { name: `Black Hodle Referral`, icon: <BlackHoleIcon/>, url_link: '/referral', disabled: true },
        { name: 'MORE', icon: null, subMenu: [ 
            { name: 'GitHub', icon: <GitHubIcon color="inherit" fontSize="small"/>, url_link: 'https://github.com/Bitcrush-Arcade'},
            { name: <Grid container alignItems="center">
                    <Grid item>
                        <Image src="/hashex_logo.png" width={295 / hashexScale } height={81 / hashexScale} className={ css.hashexLogo } alt="HashEx Logo"/>
                    </Grid>
                    <Grid item>
                        &nbsp;Audit&nbsp;
                    </Grid>
                </Grid>, 
                icon: <RateReviewIcon color="inherit" fontSize="small"/>, url_link: 'https://github.com/HashEx/public_audits/blob/master/bitcrush%20arcade/Bitcrush%20Arcade%20report.pdf'},
            { name: 'Charts', icon: <TrendingUpIcon color="inherit" fontSize="small"/>, url_link: 'https://charts.bogged.finance/?token=0x0Ef0626736c2d484A792508e99949736D0AF807e'},
        ] },
    ]

    const [subMenuOpen, setSubMenuOpen] = useImmer<Array<boolean>>( new Array(linkArray.length).fill(false) )

    const linkItems = linkArray.map( (link, linkIndex) => {
        const { name, icon, url_link, subMenu, disabled } = link
        const click = (e : any) => {
            e.stopPropagation()
            subMenu && setSubMenuOpen( draft => {
                draft[linkIndex] = !draft[linkIndex]
            } )
            !open && toggleOpen()
        }
        const selected = url_link == router.pathname
        const mainColor = selected ? 'primary' :
            subMenu ? 'secondary' : undefined
        const component = disabled ? 'li' :
            url_link ? 'a' : 'button'

        return <Fragment key={`nav-menu-item-${name}`} >
            <ConditionalLinkWrapper url={url_link} LinkProps={{ passHref: true }}>
                <ListItem 
                    button={subMenu || url_link && !disabled ? true: undefined}
                    onClick={ click } component={component}
                    className={ `${ selected ? css.selectedItem : ''} ${css.baseItem}`}
                >
                    <ListItemIcon className={ `${selected ? css.selectedIcon : css.baseIcon } ${css.listIcon}` }>
                        {icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={<>
                            {name} {subMenu && <ExpandMoreIcon fontSize="inherit" style={{transform: subMenuOpen[linkIndex] ? 'rotate( 180deg )' : undefined}}/>}
                            {disabled && <Typography variant="caption" className={ css.disabled }>(coming soon)</Typography>}
                        </>}
                        primaryTypographyProps={{ noWrap: true, color: mainColor, variant: 'body1', className: `${css.menuTextPrimary} ${!selected && !subMenu ? css.menuTextPrimaryNotSelected : ''} ${ subMenu ? css.subMenu : ''}`  }}
                    />
                </ListItem>
            </ConditionalLinkWrapper>
            {subMenu && <Collapse in={subMenuOpen[linkIndex]}>
                <List dense className={css.subList}>
                    {subMenu.map( sub => {
                        const isLink = sub.url_link ? true: undefined
                        return <ListItem
                            key={`sub-menu-${link.name}-${sub.name}`}
                            button={isLink}
                            component={ isLink ? "a" : 'button'}
                            href={sub.url_link}
                            target="_blank"
                        >
                            <ListItemIcon className={ `${css.listIcon} ${css.baseIcon}` }>
                                {sub.icon}
                            </ListItemIcon>
                            <ListItemText primary={sub.name} primaryTypographyProps={{ variant: 'body1', className: css.menuTextSecondary }}/>
                        </ListItem>
                    })}
                </List>
            </Collapse>}
        </Fragment>
    })

    return <>
      <Drawer open={open} variant={ isSm ? "temporary" : "permanent"} className={ `${css.drawerContainer}` } PaperProps={{ className: css.drawer}}>
        <ClickAwayListener onClickAway={() => { 
            if(!isSm || !open) return
            toggleOpen()
            
            } }>
            <Paper className={ `${css.drawerContainer} ${css.paper}` } square onClick={() => !open && toggleOpen() }>
                <List>
                    {linkItems}
                </List>
                <Grid container className={ css.footer } alignItems="center" justify="space-between">
                    <Grid item>
                        <Grid container alignItems="center">
                            <Grid item style={{paddingRight: 8}}>
                                <Coin scale={0.35}/>
                            </Grid>
                            <Grid item>
                                <Typography variant="body2" color="textPrimary">
                                    $ {currencyFormat( tokenInfo.crushUsdPrice , { decimalsToShow: 2 })}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <IconButton size="small" component="a" href="https://t.me/Bcarcadechat" target="_blank">
                            <TelegramIcon className={ css.baseIcon }/>
                        </IconButton>
                        <IconButton size="small" component="a" href="https://twitter.com/bitcrusharcade" target="_blank">
                            <TwitterIcon className={ css.baseIcon }/>
                        </IconButton>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider orientation="horizontal" style={{marginBottom: 4, marginTop: 4}}/>
                    </Grid>
                    <Grid item>
                        <Button onClick={toggleDarkMode} style={{ width: 80, paddingLeft: 4, paddingRight:4 }}>
                            <Grid container justify="space-between" alignItems="center">
                                <DayIcon color={ isDark ? "disabled" : "primary"}/>
                                <Divider orientation="vertical" flexItem/>
                                <NightIcon color={ !isDark ? "disabled" : "primary"}/>
                            </Grid>
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button onClick={toggleOpen}>
                            <ArrowBackIosIcon color="disabled"/>
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </ClickAwayListener>
      </Drawer>
    </>
}

export default Menu

const useStyles = makeStyles<Theme, { open: boolean}>( (theme) => createStyles({
    drawerContainer:{
        width: props => props.open ? theme.spacing(30) : theme.spacing(8),
    },
    drawer:{
        backgroundColor: 'transparent',
        borderRight: 'none',
        boxShadow: 'none',
    },
    paper:{
        position: 'relative',
        marginTop: 96,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        overflowX: 'hidden',
        backgroundColor: theme.palette.background.menu,
        color: 'white',
        paddingLeft: theme.spacing(1),
        paddingTop: theme.spacing(1),
        borderTopRightRadius: theme.spacing(3),
        borderBottomRightRadius: theme.spacing(3),
        borderColor: theme.palette.border[ theme.palette.type ],
        borderWidth: 1,
        borderStyle: 'solid',
        borderLeftStyle: 'none',
        height: `calc( 100vh - 96px - ${theme.spacing(3)}px )`
    },
    footer:{
        position:'absolute',
        bottom: 0,
        overflowX: 'hidden',
        padding: theme.spacing(2),
        paddingTop: 0,
        width: theme.spacing(28)
    },
    subList: {
        backgroundColor: theme.palette.type =="dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderBottomLeftRadius: theme.spacing(4),
        borderTopLeftRadius: theme.spacing(4),
    },
    selectedIcon:{
        color: theme.palette.primary.main
    },
    baseIcon:{
        color: theme.palette.text.secondary,
    },
    selectedItem:{
        borderRightStyle: 'solid',
        borderColor: theme.palette.primary.main,
        borderWidth: 4,
        background: props => props.open ? `linear-gradient(90deg, ${theme.palette.background.highlight} 67%, rgba(0,0,0,0) 95%)` : theme.palette.background.highlight,
    },
    baseItem:{
        borderTopLeftRadius: theme.spacing(2),
        borderBottomLeftRadius: theme.spacing(2),
        marginTop: theme.spacing(0.5)
    },
    listIcon:{
        minWidth: theme.spacing(6),
    },
    menuTextPrimary:{
        fontSize: 12,
    },
    menuTextPrimaryNotSelected:{
        color: theme.palette.text.secondary,
    },
    menuTextSecondary:{
        fontSize: 11,
        color: theme.palette.text.secondary,
    },
    disabled:{
        fontSize: 8,
        textTransform: 'uppercase',
        color: theme.palette.type =='dark' ? theme.palette.grey[200] : theme.palette.grey[400],
    },
    subMenu:{
        color: theme.palette.type =="light" ? theme.palette.secondary.light : theme.palette.secondary.main
    },
    hashexLogo:{
        filter: `brightness(0) invert(${theme.palette.type =='dark'? '0.75' : '0.05'}) opacity(50%)`
    }
}))

type LinkItem ={
    name: string | JSX.Element,
    icon: JSX.Element | null,
    url_link?: string,
    disabled?: boolean,
    subMenu?: Array< {
        name: string | JSX.Element,
        icon: JSX.Element | null,
        url_link?: string,
        disabled?: boolean,
    } >
}