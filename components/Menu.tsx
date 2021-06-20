// React imports
import React, { useState, Fragment, useContext } from 'react'
import { useImmer } from 'use-immer'
// Next
import { useRouter } from 'next/router'
import Link from 'next/link'
// Material imports
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Collapse from '@material-ui/core/Collapse'
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
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import GitHubIcon from '@material-ui/icons/GitHub'
import HomeIcon from '@material-ui/icons/Home'
import TwitterIcon from '@material-ui/icons/Twitter'
import TelegramIcon from '@material-ui/icons/Telegram'
// BitCrush
// Components
import Coin from 'components/tokens/Token2'
import { TransactionContext } from 'components/context/TransactionContext'
// Utils
import { currencyFormat } from 'utils/text/text'
// Icons
import ArcadeIcon from 'components/svg/ArcadeIcon'
import RocketIcon from 'components/svg/RocketIcon'
import UfoIcon from 'components/svg/UfoIcon'
import Ufo2Icon from 'components/svg/Ufo2Icon'
import RechargeIcon from 'components/svg/RechargeIcon'
import BlackHoleIcon from 'components/svg/BlackHoleIcon'
import TradeIcon from 'components/svg/TradeIcon'
import WarpIcon from 'components/svg/WarpIcon'

const Menu = ( props: { open: boolean, toggleOpen: () => void }) => {
    const { open, toggleOpen } = props
    const router = useRouter()
    const css = useStyles({ open })

    const { tokenInfo } = useContext( TransactionContext )

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
        { name: 'MORE', icon: null, subMenu: [ { name: 'GitHub', icon: <GitHubIcon color="inherit"/>, url_link: 'https://www.github.com'} ] },
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
        const listItem = <Fragment key={`nav-menu-item-${name}`} >
            <ListItem 
                button={subMenu || url_link && !disabled ? true: undefined}
                onClick={ click } component={component}  href={url_link}
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
                    primaryTypographyProps={{ noWrap: true, color: mainColor, variant: 'body1', className: `${css.menuTextPrimary} ${!selected && !subMenu ? css.menuTextPrimaryNotSelected : ''}`  }}
                />
            </ListItem>
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

        return url_link 
            ? <Link href={url_link} key={`nav-link-menu-item-${name}`} passHref>
                {listItem}
            </Link>
            : listItem
    })

    return <>
      <Drawer open={open} variant="permanent" className={ `${css.drawerContainer}` } PaperProps={{ className: css.drawer}}>
        <Paper className={ `${css.drawerContainer} ${css.paper}` } square onClick={() => !open && toggleOpen() }>
            <List>
                {linkItems}
            </List>
            <Grid container className={ css.footer } alignItems="center" justify="space-between">
                <Grid item>
                    <Grid container alignItems="center" spacing={1}>
                        <Grid item>
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
                        <TelegramIcon color="disabled"/>
                    </IconButton>
                    <IconButton size="small" component="a" href="https://twitter.com/bitcrusharcade" target="_blank">
                        <TwitterIcon color="disabled"/>
                    </IconButton>
                </Grid>
            </Grid>
        </Paper>
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
        borderRight: 'none'
    },
    paper:{
        position: 'relative',
        marginTop: 96,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        overflowX: 'hidden',
        backgroundColor: 'rgb(23,24,54)',
        color: 'white',
        paddingLeft: theme.spacing(1),
        paddingTop: theme.spacing(1),
        borderTopRightRadius: theme.spacing(3),
        borderBottomRightRadius: theme.spacing(3),
        borderColor: 'rgb(34,35,63)',
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
        backgroundColor: 'rgba(255,255,255,0.1)'
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
        background: 'linear-gradient(90deg, rgba(13,12,44,1) 67%, rgba(0,0,0,0) 95%)'
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
        color: theme.palette.grey[200],
    },
    menuTextSecondary:{
        fontSize: 10,
    },
    disabled:{
        fontSize: 8,
        textTransform: 'uppercase',
        color: theme.palette.text.secondary,
    }
}))

type LinkItem ={
    name: string,
    icon: JSX.Element | null,
    url_link?: string,
    disabled?: boolean,
    subMenu?: Array< {
        name: string,
        icon: JSX.Element | null,
        url_link?: string,
        disabled?: boolean,
    } >
}