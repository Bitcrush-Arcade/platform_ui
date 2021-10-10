// Next
import { useRouter } from 'next/router'
// Material
import { makeStyles, createStyles, Theme, useTheme } from "@material-ui/core/styles"
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Container from "@material-ui/core/Container"
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import IconButton from '@material-ui/core/IconButton'
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
// Icons
import TelegramIcon from '@material-ui/icons/Telegram';
import TwitterIcon from '@material-ui/icons/Twitter'
// Components
import Logo from 'components/displays/Logo'

const Footer = () => {

  const css = useStyles()
  const router = useRouter()
  const isGame = router.basePath.indexOf('games') > -1
  const logoRoute = isGame ? '/games' : '/'
  const theme = useTheme()
  const isSm = useMediaQuery( theme.breakpoints.down('sm') )
  const logoFactor = isSm ? 26 : 18

  return <footer className={css.footer} >
    <Divider className={ css.divider } />
    <Container maxWidth="lg">
      <Grid container justifyContent="space-evenly" alignItems="flex-start">
        <Grid item xs={12} md={6}>
          <Grid container>
            <Grid item xs={6}>
              <List>
                {links1.map( link => <LinkItem link={link}/>)}
                <ListItem>
                  <Grid container alignItems="center">
                    <IconButton href="https://t.me/Bcarcadechat" component="a" target="_blank" rel="noopener noreferrer" size="small" style={{ marginLeft: -8 }}>
                      <TelegramIcon fontSize="large" />
                    </IconButton>
                    <IconButton href="https://twitter.com/bitcrusharcade" component="a" target="_blank" rel="noopener noreferrer" size="small" style={{ marginLeft: 16 }}>
                      <TwitterIcon fontSize="large"/>
                    </IconButton>
                  </Grid>
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={6}>
              <List>
                {links2.map( link => <LinkItem link={link}/>)}
                <ListItem>
                  <ListItemText
                    primary={"©2021 COPYRIGHT BITCRUSH ARCADE"}
                    primaryTypographyProps={{
                      color: 'textSecondary',
                      variant: 'caption',
                      component: "div",
                    }}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Logo
            isGame={ isGame }
            href={logoRoute}
            sizeFactor={logoFactor}
          />
        </Grid>
      </Grid>
    </Container>
  </footer>
}

export default Footer

const useStyles = makeStyles<Theme>( theme => createStyles({
  footer:{
    backgroundColor: theme.palette.background.default,
    paddingBottom: theme.spacing(6),
  },
  divider:{
    height: 2,
    backgroundColor: theme.palette.primary.main,
    marginBottom: theme.spacing(6),
  },
}))

type FooterLink = {
  name: string,
  href: string,
}

const links1: FooterLink[] = [
  {
    name: 'contact',
    href: 'mailto:admin@bitcrush.com'
  },
  {
    name: 'blog',
    href: 'https://bitcrusharcade.medium.com/'
  },
  {
    name: 'community',
    href: 'https://t.me/Bcarcadechat'
  },
]
const links2: FooterLink[] = [
  {
    name: 'customer support',
    href: 'https://t.me/Bcarcadechat'
  },
  {
    name: 'audits',
    href: 'https://github.com/HashEx/public_audits/blob/master/bitcrush%20arcade/Bitcrush%20Arcade%20report.pdf'
  },
  {
    name: 'whitepaper',
    href: 'https://bitcrusharcade.io'
  },
]

const LinkItem = (props:{ link: FooterLink }) => {
  const { link } = props
  const linkCss = linkStyles()
  return <ListItem button component="a" href={link.href} target="_blank" rel="noopener nonreferrer" title={link.name}>
    <ListItemText
      primary={link.name}
      primaryTypographyProps={{
        variant: "body1",
        className: linkCss.linkText
      }}
    />
  </ListItem>
}

const linkStyles = makeStyles<Theme>(theme => createStyles({
  linkText:{
    fontWeight: 500,
    textTransform: 'uppercase',
    color: theme.palette.type == 'dark' ? theme.palette.text.secondary : theme.palette.text.primary
  }
}))