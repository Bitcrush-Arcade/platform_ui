import { useState, useEffect, useCallback } from 'react'
import { useImmer } from 'use-immer'
import Image from 'next/image'
import BigNumber from 'bignumber.js'
// Next
import Head from 'next/head'
// Material
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
// Icons
import CloseIcon from '@mui/icons-material/Close'
import FireIcon from '@mui/icons-material/LocalFireDepartment';
// Bitcrush UI
import Card from 'components/basics/Card'
import LotteryHistory from 'components/lottery/LotteryHistory'
import NumberInvader from 'components/lottery/NumberInvader'
import PageContainer from 'components/PageContainer'
import SummaryCard from 'components/lottery/SummaryCard'
import TicketBuyModal from 'components/lottery/TicketBuyModal'
// Hooks
import { useContract } from 'hooks/web3Hooks'
import { useWeb3React } from '@web3-react/core'
// Utils & Data
import { getContracts } from 'data/contracts'

type TicketInfo = { ticketNumber: string, claimed: boolean }
type RoundInfo = { totalTickets: BigNumber, winnerNumber: string, userTickets?: Array<TicketInfo> }

const Lottery = () => {

  const { account, chainId } = useWeb3React()
  const lotteryContract = getContracts('lottery', chainId)
  const { methods: lotteryMethods } = useContract( lotteryContract.abi, lotteryContract.address )

  const [ openBuy, setOpenBuy ] = useState<boolean>(false)
  const toggleOpenBuy = () => setOpenBuy( p => !p )

  const [ currentRound, setCurrentRound ] = useState<number>(0)
  const [ currentTickets, setCurrentTickets ] = useState<Array<TicketInfo> | null>(null)
  const [ lastRoundInfo, setLastRoundInfo ] = useState< RoundInfo | null>(null)
  const [ viewHistory, setViewHistory ] = useState<null>(null)
  const [ selectedTicket, setSelectedTicket ] = useState<{ticketNumber: string, claimed: boolean, ticketRound: number, instant: boolean} | null>(null)
  const [ selectedRoundInfo, setSelectedRoundInfo ] = useState<RoundInfo | null>(null)

  useEffect(() => {
    if(!lotteryMethods || !account) return

    const getCurrentTickets = async () => {
      const contractRound = new BigNumber(await lotteryMethods.currentRound().call()).toNumber()
      const userTickets = await lotteryMethods.getRoundTickets(contractRound).call({ from: account })
      setCurrentRound(contractRound)
      setCurrentTickets(userTickets)
    }

    getCurrentTickets()

  },[lotteryMethods, account])

  const getRoundInfo = useCallback( async (round: number) => {
    if(!lotteryMethods) return null
    return (await lotteryMethods.roundInfo(round).call())
  },[lotteryMethods])

  const getTabData = useCallback( async (newTab: number) => {
    if(newTab === 0 || !lotteryMethods || !account) return
    if(newTab === 1){
      // get last round info
      const userTickets = currentRound > 1 && await lotteryMethods.getRoundTickets(currentRound -1).call({ from: account }) || []
      const lastRoundInfo = currentRound > 1 && await getRoundInfo( currentRound - 1 ) || null
      console.log({ userTickets, lastRoundInfo })
      setLastRoundInfo({ 
        ...lastRoundInfo,
        userTickets,
      })
    }
    if(newTab === 2){
      // gethistory
    }
  },[lotteryMethods, account, currentRound, getRoundInfo])

  const selectTicket = async (ticketNumber: string, claimed: boolean, roundNumber: number, instaClaim?:boolean) => {
    setSelectedTicket({
      ticketNumber,
      claimed,
      ticketRound: roundNumber,
      instant: instaClaim || false
    })
    const ticketRound = await getRoundInfo(roundNumber)
    setSelectedRoundInfo(ticketRound)
  }

  const selectedDigits = selectedTicket?.ticketNumber.split('')


  return <PageContainer customBg="/backgrounds/lotterybg.png">
     <Head>
      <title>BITCRUSH - Lottery</title>
      <meta name="description" content="The lottery where everyone wins."/>
    </Head>
    <SummaryCard onBuy={toggleOpenBuy}/>
    <Grid container sx={{mt: 4}} justifyContent="space-between">
      <Grid item xs={12} lg={6}>
        <LotteryHistory currentRound={currentRound} currentTickets={currentTickets} tabChange={getTabData} selectTicket={selectTicket}/>
      </Grid>
      <Grid item xs={12} lg={5}>
        <Stack direction="row" justifyContent="flex-end">
          <Box
            sx={theme => ({
              p: 2,
              m: 2,
              position:'relative',
              backgroundColor: theme.palette.primary.main,
              width: 350,
              height: 120,
              clipPath: 'polygon(92% 0, 100% 25%, 100% 100%, 8% 100%, 0% 75%, 0 0)'
            })}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '2px',
                bottom: '2px',
                left: '2px',
                right: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'black',
                clipPath: 'polygon(92% 0, 100% 25%, 100% 100%, 8% 100%, 0% 75%, 0 0)',
              }}
            >
              <Stack direction="row" alignItems="center" px={2}>
                <Stack>
                  <Typography variant="body2" component="div" display="inline">
                    Partner Bonus for this round:
                  </Typography>
                  <Typography color="secondary" variant="h5" component="div" display="inline" align="center">
                    5000 KNIGHT
                  </Typography>
                </Stack>
                <Image src="/assets/thirdPartyLogos/partners/knightswap-logo.png" height={272/2.2} width={272/2.2}/>
              </Stack>
            </Box>
          </Box>
        </Stack>
        {selectedTicket && selectedDigits &&
          <Card
            sx={{
              background: 'url(/backgrounds/lotterybg.png) no-repeat',
              backgroundSize: '135% 100%',
              backgroundPosition: 'top 0 right 0',
              position: 'relative',
              width: '100%',
              height: {
                xs: 350,
                md: 450
              },
              p:2.5,
              mt:{
                xs: 1,
                lg: 1,
              }
            }}
          >
            <IconButton onClick={()=>setSelectedTicket(null)}
              sx={{ position: 'absolute', top: 12, right: 16 }}
            >
              <CloseIcon/>
            </IconButton>
            <Typography variant="h5" align="center">
              Squadron Details
            </Typography>
            <Divider sx={{ my: 1}}/>
            <Grid container alignItems="center" sx={{pt: 2}}>
              <Grid item xs={12} md={6}>
                <Stack direction="row" justifyContent="space-evenly">
                  <NumberInvader twoDigits={[selectedDigits[1], selectedDigits[2]]}/>
                  <NumberInvader twoDigits={[selectedDigits[3], selectedDigits[4]]}/>
                  <NumberInvader twoDigits={[selectedDigits[5], selectedDigits[6]]}/>
                </Stack>
              </Grid>
              <Grid item md={6}>
                <Typography align="center" color="textSecondary" variant="subtitle2">
                  Round # {selectedTicket.ticketRound}
                </Typography>
                <Typography align="center">
                  You matched <span>{}</span> of 6
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                stuff and data
              </Grid>
              <Grid item xs={false} md={6} sx={{ display:{ xs: 'none', md: 'block', height: 267, position:'relative'}}}>
                {/* Rocket Explosion */}
                <Box sx={{position:'absolute', top: 20, left: 55 }}>
                  <Image src="/assets/launcher/explosion.png" width={100/1.5} height={77/1.5}/>
                </Box>
                {/* Satellite  */}
                <Box sx={{position:'absolute', top: 'calc(50% - 25px)', left: -20 }}>
                  <Image src="/assets/launcher/explosion.png" width={100/1.4} height={77/1.4}/>
                </Box>
                <Box sx={{position:'absolute', bottom: '25%', left: 85 }}>
                  <Image src="/assets/launcher/explosion.png" width={100/2} height={77/2}/>
                </Box>
                <Box sx={{position:'absolute', bottom: '13%', left: '50%' }}>
                  <Image src="/assets/launcher/explosion.png" width={100/2} height={77/2} />
                </Box>
                <Box sx={{position:'absolute', top: '50%', right: 15 }}>
                  <Image src="/assets/launcher/explosion.png" width={100/2} height={77/2} />
                </Box>
              </Grid>
            </Grid>
          </Card>
        
        }
      </Grid>
    </Grid>
    <TicketBuyModal
      open={openBuy}
      onClose={toggleOpenBuy}
    />
  </PageContainer>
}

export default Lottery