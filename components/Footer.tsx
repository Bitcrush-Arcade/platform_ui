// Next
import { useRouter } from 'next/router'
// Material
import { Theme, useTheme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import useMediaQuery from '@mui/material/useMediaQuery'
import Container from "@mui/material/Container"
import Divider from "@mui/material/Divider"
import Grid from "@mui/material/Grid"
import IconButton from '@mui/material/IconButton'
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
// Icons
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter'
// Components
import Logo from 'components/displays/Logo'

const Footer = () => {

  const css = useStyles()
  const router = useRouter()
  const isGame = router.basePath.indexOf('games') > -1
  const logoRoute = isGame ? '/games' : '/'
  const theme = useTheme()
  const isSm = useMediaQuery( theme.breakpoints.down('md') )
  const logoFactor = isSm ? 26 : 18

  return <footer className={css.footer} >
    <Divider className={ css.divider } />
    <Container maxWidth="lg">
      <Grid container justifyContent="space-evenly" alignItems="flex-start">
        <Grid item xs={12} md={6}>
          <Grid container>
            <Grid item xs={6}>
              <List>
                {links1.map( (link, idx) => <LinkItem link={link} key={`footer-column-1-${idx}`}/>)}
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
                {links2.map( (link, idx) => <LinkItem link={link} key={`footer-column-2-${idx}`}/>)}
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
    color: theme.palette.mode == 'dark' ? theme.palette.text.secondary : theme.palette.text.primary
  }
}))