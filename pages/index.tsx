import Head from 'next/head'
import Image from 'next/image'
// Material
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
// Bitcrush Components
import Menu from 'components/Menu'

export default function Home() {
  return (
    <div>
      <AppBar>
        <Toolbar>
          <Button>
            Connect Wallet
          </Button>
        </Toolbar>
      </AppBar>
      <Menu/>
      <Container style={{ marginTop: 64 }}>
        <Typography variant="h1">
          BITCRUSH
        </Typography>
      </Container>
    </div>
  )
}
