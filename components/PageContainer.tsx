// React
import { useState, ReactNode, useEffect, useMemo } from 'react'
import { useImmer } from 'use-immer'
// 3p
import compact from 'lodash/compact'
// Material
import { makeStyles, createStyles, Theme, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Container from '@material-ui/core/Container'
// Components
import Footer from 'components/Footer'
import Header from 'components/HeaderBar'
import Menu from 'components/Menu'
import TxCard from 'components/context/TransactionCard'
// Hooks
import { useEagerConnect } from 'hooks/web3Hooks'
// Utils
// Context
import { useTransactionContext } from 'hooks/contextHooks'


const PageContainer = ( props: ContainerProps ) => {
  
  const { children } = props
  
  const theme = useTheme()
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [menuToggle, setMenuToggle] = useState<boolean>(!isSm)
  const [hiddenPending, setHiddenPending] = useImmer<{ [hash: string] : 'pending' | 'success' | 'error' }>({})
  
  const css = useStyles({ menuToggle, ...props })

  const { pending, completed } = useTransactionContext()

  useEagerConnect()

  const toggleMenu = () => setMenuToggle( p => !p )

  useEffect(()=>{
    setMenuToggle(!isSm)
  },[isSm])
  const allHashes = compact( Object.keys(pending).map( hash => hiddenPending[hash] && pending[hash].status == hiddenPending[hash] ? null : pending[hash] ) )
  const shownPending = useMemo( () => {
    const filteredPending = {...pending}
    Object.keys(hiddenPending).map( hash => {
      if( filteredPending[hash]?.status == hiddenPending[hash] )
        delete filteredPending[hash]
    })
    return filteredPending
  },[pending, hiddenPending ])

  return <div>
    <div className={ css.fullContainer }>
      <Header open={menuToggle} toggleOpen={toggleMenu}/>
      <Menu open={menuToggle} toggleOpen={toggleMenu}/>
      <Container maxWidth="xl" className={css.contentContainer}>
        {children}
        {Object.keys(allHashes).length > 0 && <div style={{ position: 'fixed', top: 90, zIndex: 1, left: 'auto', right: '32px'}}>
          <TxCard hashes={shownPending} onClose={ hash => setHiddenPending( draft => { draft[hash] = pending[hash].status } )}/>
        </div>}
      </Container>
    </div>
    <Footer/>
  </div>
}

export default PageContainer

type ContainerProps ={
  children?: ReactNode,
  fullPage?: boolean,
  background?: 'default' | 'galactic'
}

const useStyles = makeStyles<Theme, { menuToggle: boolean } & ContainerProps >( (theme: Theme) => createStyles({
  contentContainer:{
    paddingTop: 96,
    [theme.breakpoints.down('sm')]:{
      paddingTop: 0,
    },
    paddingLeft: theme.spacing(3),
    [theme.breakpoints.up('md')]:{
      paddingLeft: props => props.menuToggle ? theme.spacing(33) : theme.spacing(12),
    },
    transition: theme.transitions.create('padding', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  fullContainer:{
    transition: theme.transitions.create('background', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundImage: props =>  `url(${backgrounds[theme.palette.type][props.background || 'default']})`,
    backgroundSize: 'cover',
    [theme.breakpoints.down('sm')]:{
      backgroundSize: '200% auto',
      backgroundPosition: 'left calc(100% - 50% + 32px) top 0',
    },
    [theme.breakpoints.down(750)]:{
      backgroundSize: '400% auto',
      backgroundPosition: 'left calc(100% - 50% + 32px) top 0',
    },
    [theme.breakpoints.up('md')]:{
      backgroundPosition: props => (props.background || 'default') == 'default' ? 
        props.menuToggle ? `left calc( 50% + ${ theme.palette.type =='dark' ? 74 : 120}px) top 0` : `left calc( 50% - ${ theme.palette.type =='dark' ? 12 : 32}px ) top 0`
        : 'top',
    },
    [theme.breakpoints.up('xl')]:{
      backgroundSize: '120% auto',
    },
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    maxWidth: '100vw',
    position: 'relative',
    paddingBottom: theme.spacing(3)
  },
}))

const backgrounds = {
  dark:{
    default: '/backgrounds/defaultBg.jpg',
    galactic:'/backgrounds/Galactic.jpg',
  },
  light:{
    default: '/backgrounds/light/palms.jpg',
    galactic:'/backgrounds/light/cosmic.jpg',
  }
}