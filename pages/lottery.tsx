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
import GButton from 'components/basics/GeneralUseButton'
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
// Types
import { RoundInfo, TicketInfo } from 'types/lottery'

const Lottery = () => {

  const { account, chainId } = useWeb3React()
  const lotteryContract = getContracts('lottery', chainId)
  const { methods: lotteryMethods } = useContract( lotteryContract.abi, lotteryContract.address )

  const [ openBuy, setOpenBuy ] = useState<boolean>(false)
  const toggleOpenBuy = () => setOpenBuy( p => !p )

  const [ currentRound, setCurrentRound ] = useState<number>(0)
  const [ currentTickets, setCurrentTickets ] = useState<Array<TicketInfo> | null>(null)
  const [ currentRoundInfo, setCurrentRoundInfo ] = useState< RoundInfo | null>(null)
  const [ lastRoundInfo, setLastRoundInfo ] = useState< RoundInfo | null>(null)
  const [ viewHistory, setViewHistory ] = useState<null>(null)
  const [ selectedTicket, setSelectedTicket ] = useState<{ticketNumber: string, claimed: boolean, ticketRound: number, instant: boolean} | null>(null)
  const [ selectedRoundInfo, setSelectedRoundInfo ] = useState<RoundInfo | null>(null)

  const getCurrentTickets = useCallback( async () => {
    if(!lotteryMethods || !account) return 
    const contractRound = new BigNumber(await lotteryMethods.currentRound().call()).toNumber()
    const roundInfo = await lotteryMethods.roundInfo(contractRound).call()
    const userTickets = await lotteryMethods.getRoundTickets(contractRound).call({ from: account })
    const bonus = await lotteryMethods.bonusCoins(contractRound).call()
    setCurrentRound(contractRound)
    setCurrentTickets(userTickets)
    setCurrentRoundInfo({
      ...roundInfo,
      userTickets,
      bonusInfo: bonus
    })
  },[setCurrentRound, setCurrentTickets, setCurrentRoundInfo, lotteryMethods, account])
  
  useEffect(() => {
    const interval = setInterval(getCurrentTickets,30000)
    return () => {
      clearInterval(interval)
    }
  },[getCurrentTickets])

  const getRoundInfo = useCallback( async (round: number) => {
    if(!lotteryMethods) return null
    return (await lotteryMethods.roundInfo(round).call())
  },[lotteryMethods])

  const getTabData = useCallback( async (newTab: number) => {
    if(newTab === 0 || !lotteryMethods || !account) return
    if(newTab === 1){
      // get last round info
      const userTickets = currentRound > 1 && await lotteryMethods.getRoundTickets(currentRound -1).call({ from: account }) || []
      const prevRound = currentRound > 1 && await getRoundInfo( currentRound - 1 ) || null
      const prevBonus = currentRound > 1 && await lotteryMethods.bonusCoins(currentRound -1).call()
      console.log({ userTickets, prevRound })
      setLastRoundInfo({ 
        ...prevRound,
        winnerNumber: new BigNumber(prevRound.winnerNumber).toString(),
        userTickets,
        bonusInfo: prevBonus
      })
    }
    if(newTab === 2){
      // gethistory
    }
  },[lotteryMethods, account, currentRound, getRoundInfo, setLastRoundInfo])

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
  const selectedWinner = selectedRoundInfo?.winnerNumber.split('')
  const matches = selectedDigits?.reduce( (acc, number, index) => {
    acc.base += number
    if(acc.base === (selectedRoundInfo?.winnerNumber || "1123456").substring(0,index +1))
      acc.matches ++
    return acc
  },{base: "", matches: 0})

  return <PageContainer customBg="/backgrounds/lotterybg.png">
     <Head>
      <title>BITCRUSH - Lottery</title>
      <meta name="description" content="The lottery where everyone wins."/>
    </Head>
    <SummaryCard onBuy={toggleOpenBuy}/>
    <Grid container sx={{mt: 4}} justifyContent="space-between">
      <Grid item xs={12} lg={6}>
        <LotteryHistory 
          currentRound={currentRound} currentTickets={currentTickets}
          currentInfo={currentRoundInfo}
          tabChange={getTabData} selectTicket={selectTicket}
          lastRound={lastRoundInfo}
        />
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
                  <Typography variant="body2" component="div" display="inline" color="white">
                    Partner Bonus for this round:
                  </Typography>
                  <Typography color="secondary" variant="h5" component="div" display="inline" align="center">
                    5000 KNIGHT
                  </Typography>
                </Stack>
                <Image src="/assets/thirdPartyLogos/partners/knightswap-logo.png" height={272/2.2} width={272/2.2} alt="partner Logo"/>
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
            <Typography variant="h5" align="center" color="white">
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
                <Typography align="center" color="white">
                  You matched&nbsp;
                  <Typography display="inline" color="primary" component="span">
                    {(matches?.matches || 1) -1}
                  </Typography> 
                  &nbsp;of 6
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack>
                  <Typography variant="subtitle2" color="textSecondary" align="left">
                    Squadron Reward
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight={600}>
                    Reward Amount in CRUSH
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary" align="left">
                    Reward Amount in USD
                  </Typography>
                  <GButton disabled={selectedTicket.claimed} color="secondary" width={"80%"} sx={{mt: 1}}>
                    {selectedTicket.claimed ? "Already Claimed" : "Claim"}
                  </GButton>
                </Stack>
              </Grid>
              <Grid item xs={false} md={6} sx={{ display:{ xs: 'none', md: 'block', height: 267, position:'relative'}}}>
                <Box sx={{position:'absolute', top: 20, left: 55 }}>
                  <Image src="/assets/launcher/explosion.png" width={100/1.5} height={77/1.5} alt="Rocket Explosion"/>
                </Box>
                <Box sx={{position:'absolute', top: 'calc(50% - 25px)', left: -20 }}>
                  <Image src="/assets/launcher/explosion.png" width={100/1.4} height={77/1.4} alt="Satellite Explosion"/>
                </Box>
                <Box sx={{position:'absolute', bottom: '25%', left: 65 }}>
                  <Image src="/assets/launcher/explosion.png" width={100/1.9} height={77/1.9} alt="Antennae Explosion"/>
                </Box>
                <Box sx={{position:'absolute', bottom: '5%', left: '38%' }}>
                  <Image src="/assets/launcher/explosion.png" width={100/1.5} height={77/1.5} alt="Truck Explosion"/>
                </Box>
                <Box sx={{position:'absolute', top: '40%', right: 0 }}>
                  <Image src="/assets/launcher/explosion.png" width={100/1.2} height={77/1.2}  alt="Big Antennae Explosion"/>
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
      onReceipt={getCurrentTickets}
    />
  </PageContainer>
}

export default Lottery