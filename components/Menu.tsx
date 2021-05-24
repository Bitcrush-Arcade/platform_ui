// React imports
import { useState, Fragment } from 'react'
// Next
import { useRouter } from 'next/router'
import Link from 'next/link'
// Material imports
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Collapse from '@material-ui/core/Collapse'
import Drawer from '@material-ui/core/Drawer'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
// Icons
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import GitHubIcon from '@material-ui/icons/GitHub';
import GameIcon from '@material-ui/icons/VideogameAsset';
import HomeIcon from '@material-ui/icons/Home';

const Menu = ( props: { open: boolean, toggleOpen: () => void }) => {
    const { open, toggleOpen } = props
    const router = useRouter()
    const css = useStyles({ open })

    const linkArray = [
        { name: 'Home', icon: <HomeIcon color="inherit"/>, url_link: '/' },
        { name: 'Intergalactic Trade', icon: null, url_link: '/trade' },
        { name: 'Warp Speed', icon: null, url_link: '/warp' },
        { name: 'Galactic Mining', icon: null, url_link: '/mining' },
        { name: 'GAMES', icon: <GameIcon/>, url_link: '/games' },
        { name: 'MORE', icon: null, subMenu: [ { name: 'GitHub', icon: <GitHubIcon color="inherit"/>, url_link: 'https://www.github.com'} ] },
    ]

    const linkItems = linkArray.map( link => {
        const { name, icon, url_link, subMenu } = link
        const [ openSubMenu, setOpenSubMenu ] = useState<boolean>(false)
        const click = () => {
            subMenu && setOpenSubMenu( p => !p )
            !open && toggleOpen()
        }
        const selected = url_link == router.pathname
        const mainColor = selected ? 'primary' :
            subMenu ? 'secondary' : 'textSecondary'
        const listItem = <Fragment key={`nav-menu-item-${name}`} >
            <ListItem 
                button={subMenu || url_link ? true: undefined}
                onClick={ click } component={url_link ? 'a' : 'button'}  href={url_link}
                className={ `${ selected ? css.selectedItem : ''} ${css.baseItem}`}
            >
                <ListItemIcon className={ `${selected ? css.selectedIcon : css.baseIcon } ${css.listIcon}` }>
                    {icon}
                </ListItemIcon>
                <ListItemText
                    primary={subMenu
                        ? <>
                            {name} {<ExpandMoreIcon fontSize="inherit" style={{transform: openSubMenu ? 'rotate( 180deg )' : undefined}}/>}
                          </> 
                        : name}
                    primaryTypographyProps={{ noWrap: true, color: mainColor, variant: 'body1', className: css.menuTextPrimary  }}
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
    },
    listIcon:{
        minWidth: theme.spacing(6),
    },
    menuTextPrimary:{
        fontSize: 10,
    },
    menuTextSecondary:{
        fontSize: 10,
    }
}))