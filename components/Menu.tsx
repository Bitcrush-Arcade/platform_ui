// React imports
import { useState, Fragment } from 'react'
// Next
import { useRouter } from 'next/router'
import Link from 'next/link'
// Material imports
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Collapse from '@material-ui/core/Collapse'
import Drawer from '@material-ui/core/Drawer'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
// Icons
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import GitHubIcon from '@material-ui/icons/GitHub';
import HomeIcon from '@material-ui/icons/Home';
// BitCrush
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

    const linkArray: Array<LinkItem> = [
        { name: 'Home', icon: <HomeIcon color="inherit"/>, url_link: '/' },
        { name: 'Intergalactic Trade', icon: <TradeIcon/>, url_link: '/trade', disabled: true },
        { name: 'Warp Speed', icon: <WarpIcon/>, url_link: '/warp', disabled: true },
        { name: 'Galactic Mining', icon: <UfoIcon/>, url_link: '/mining' },
        { name: 'ARCADE', icon: <ArcadeIcon/>, url_link: '/games' },
        { name: `Recharging`, icon: <RechargeIcon/>, url_link: '/recharge', disabled: true },
        { name: `Crush n'Burn Lottery`, icon: <RocketIcon/>, url_link: '/lottery', disabled: true },
        { name: `NFTs`, icon: <Ufo2Icon/>, url_link: '/nft', disabled: true },
        { name: `Black Hodle Referral`, icon: <BlackHoleIcon/>, url_link: '/referral', disabled: true },
        { name: 'MORE', icon: null, subMenu: [ { name: 'GitHub', icon: <GitHubIcon color="inherit"/>, url_link: 'https://www.github.com'} ] },
    ]

    const linkItems = linkArray.map( link => {
        const { name, icon, url_link, subMenu, disabled } = link
        const [ openSubMenu, setOpenSubMenu ] = useState<boolean>(false)
        const click = () => {
            subMenu && setOpenSubMenu( p => !p )
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
                        {name} {subMenu && <ExpandMoreIcon fontSize="inherit" style={{transform: openSubMenu ? 'rotate( 180deg )' : undefined}}/>}
                        {disabled && <Typography variant="caption" className={ css.disabled }>(coming soon)</Typography>}
                    </>}
                    primaryTypographyProps={{ noWrap: true, color: mainColor, variant: 'body1', className: `${css.menuTextPrimary} ${!selected && !subMenu ? css.menuTextPrimaryNotSelected : ''}`  }}
                />
            </ListItem>
            {subMenu && <Collapse in={openSubMenu}>
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
        <Paper className={ `${css.drawerContainer} ${css.paper}` } square>
            <List>
                {linkItems}
            </List>
        </Paper>
      </Drawer>
    </>
}

export default Menu

const useStyles = makeStyles( (theme: Theme) => createStyles({
    drawerContainer:{
        width: (props: { open: boolean}) => props.open ? theme.spacing(30) : theme.spacing(8)
    },
    drawer:{
        backgroundColor: 'transparent',
        borderRight: 'none'
    },
    paper:{
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
        fontSize: 10,
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