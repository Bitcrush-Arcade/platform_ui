// React imports
import { useState } from 'react'
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
import HomeIcon from '@material-ui/icons/Home';
import GitHubIcon from '@material-ui/icons/GitHub';


const Menu = () => {
    
    const [open, setOpen] = useState<boolean>(true)

    const css = useStyles({ open })

    const linkArray = [
        { name: 'Home', icon: <HomeIcon color="secondary"/>, url_link: '/' },
        { name: 'Intergalactic Trade', icon: null, url_link: '/' },
        { name: 'Warp Speed', icon: null, url_link: '/' },
        { name: 'Galactic Mining', icon: null, url_link: '/' },
        { name: 'GAMES', icon: null, url_link: '/' },
        { name: 'MORE', icon: null, subMenu: [ { name: 'GitHub', icon: <GitHubIcon color="secondary"/>, url_link: 'https://www.github.com'} ] },
    ]

    const linkItems = linkArray.map( link => {
        const { name, icon, url_link, subMenu } = link
        const [ openSubMenu, setOpenSubMenu ] = useState<boolean>(false)
        const click = () =>  subMenu && setOpenSubMenu( p => !p )
        return(<>
            <ListItem key={`nav-menu-item-${name}`} button={subMenu ? true: undefined} onClick={ click }>
                <ListItemIcon>
                    {icon}
                </ListItemIcon>
                <ListItemText primary={name} primaryTypographyProps={{ noWrap: true }}/>
            </ListItem>
            {subMenu && <Collapse in={openSubMenu}>
                <List dense className={css.subList}>
                    {subMenu.map( sub => {
                        const isLink = sub.url_link ? true: undefined
                        return <ListItem button={isLink} component={ isLink ? "a" : 'button'} href={sub.url_link} key={`sub-menu-${link.name}-${sub.name}`} target="_blank">
                            <ListItemIcon>
                                {sub.icon}
                            </ListItemIcon>
                            <ListItemText primary={sub.name}/>
                        </ListItem>
                    })}
                </List>
            </Collapse>}
        </>)
    })

    return <>
      <Drawer open={open} variant="permanent" className={ `${css.drawerContainer}` } PaperProps={{ className: css.drawer}}>
        <Paper className={ `${css.drawerContainer} ${css.paper}` }>
            <List>
                {linkItems}
            </List>
            <Button onClick={ () => setOpen(p => !p)}>OPEN</Button>
        </Paper>
      </Drawer>
    </>
}

export default Menu

const useStyles = makeStyles( (theme: Theme) => createStyles({
    drawerContainer:{
        width: (props: { open: boolean}) => props.open ? 240 : theme.spacing(7)
    },
    drawer:{
        backgroundColor: 'transparent',
        borderRight: 'none'
    },
    paper:{
        marginTop: 64,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        backgroundColor: 'rgb(23,24,54)',
        color:  'white'
    },
    subList: {
        backgroundColor: 'rgba(23,24,54, 0.5)'
    }

}))