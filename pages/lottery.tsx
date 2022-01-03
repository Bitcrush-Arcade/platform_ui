import { useState, useEffect, useCallback } from 'react'
import { useImmer } from 'use-immer'
import Image from 'next/image'
import BigNumber from 'bignumber.js'
// Next
import Head from 'next/head'
import { useWeb3React } from '@web3-react/core'
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
import { useTransactionContext } from 'hooks/contextHooks'
// Utils & Data
import { getContracts } from 'data/contracts'
import { currencyFormat } from 'utils/text/text'
import { partnerTokens } from 'data/partnerTokens'
// Types
import { RoundInfo, TicketInfo } from 'types/lottery'
import { Receipt } from 'types/PromiEvent'

const Lottery = () => {

  const { account, chainId } = useWeb3React()
  const lotteryContract = getContracts('lottery', chainId)
  const { methods: lotteryMethods } = useContract( lotteryContract.abi, lotteryContract.address )
  const { tokenInfo, editTransactions } = useTransactionContext()

  const [ openBuy, setOpenBuy ] = useState<boolean>(false)
  const toggleOpenBuy = () => setOpenBuy( p => !p )

  const [ currentRound, setCurrentRound ] = useState<number>(0)
  const [ currentTickets, setCurrentTickets ] = useState<Array<TicketInfo> | null>(null)
  const [ currentRoundInfo, setCurrentRoundInfo ] = useState< RoundInfo | null>(null)
  const [ lastRoundInfo, setLastRoundInfo ] = useImmer< RoundInfo | null>(null)
  const [ viewHistory, setViewHistory ] = useState<null>(null)
  const [ selectedTicket, setSelectedTicket ] = useState<{ ticketNumber: string, claimed: boolean, ticketRound: number } | null>(null)
  const [ selectedRoundInfo, setSelectedRoundInfo ] = useState<RoundInfo & {holders: number[]} | null>(null)

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

  const selectTicket = useCallback(async (ticketNumber: string, claimed: boolean, roundNumber: number, instaClaim?:boolean) => {
    
    const ticketRound = await getRoundInfo(roundNumber)
    const winnerHolders = new BigNumber(ticketRound.winnerNumber).toString().split('')
      .reduce( (acc: string[], number, index) => {
        acc.push( (acc[index - 1] || '') + number );
        return acc
      },[])
    const holderTotal: number[] = []
    for(let i = 0; i < winnerHolders.length; i ++){
      holderTotal.push( new BigNumber(await lotteryMethods.holders(roundNumber,winnerHolders[i]).call()).toNumber() )
    }
    holderTotal[0] = new BigNumber(ticketRound.totalTickets).minus(holderTotal.reduce( (acc, val) => acc + val, 0)).toNumber()

    setSelectedRoundInfo({...ticketRound, holders: holderTotal})
    setSelectedTicket({
      ticketNumber,
      claimed,
      ticketRound: roundNumber,
    })
    if(instaClaim){
      lotteryMethods.claimNumber(roundNumber,ticketNumber).send({from: account})
      .on('transactionHash', (tx: string) => {
        console.log('hash', tx )
        editTransactions(tx,'pending', { description: `Claim Number ${ticketNumber.substring(1)}`})
      })
      .on('receipt', ( rc: Receipt ) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash,'complete')
        setSelectedTicket({
          ticketNumber,
          claimed: true,
          ticketRound: roundNumber,
        })
      })
      .on('error', (error: any, receipt: Receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
      })
    }
  },[getRoundInfo,lotteryMethods,setSelectedRoundInfo,setSelectedTicket, account, editTransactions])

  const claimTicket = useCallback(( roundNumber: number, ticketNumber: string ) => {
    if(!lotteryMethods || !account) return
    lotteryMethods.claimNumber(roundNumber,ticketNumber).send({from: account})
      .on('transactionHash', (tx: string) => {
        console.log('hash', tx )
        editTransactions(tx,'pending', { description: `Claim Number ${ticketNumber.substring(1)}`})
      })
      .on('receipt', ( rc: Receipt ) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash,'complete')
        selectTicket(`${roundNumber}`, true, roundNumber)
      })
      .on('error', (error: any, receipt: Receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
      })
  },[lotteryMethods, editTransactions, account, selectTicket])

  const claimAllTickets = useCallback( (round: number) => {
    if(!lotteryMethods || !account) return
    lotteryMethods.claimAll(round).send({from: account})
      .on('transactionHash', (tx: string) => {
        console.log('hash', tx )
        editTransactions(tx,'pending', { description: `Claim All Round ${round}`})
      })
      .on('receipt', ( rc: Receipt ) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash,'complete')
        setLastRoundInfo( draft => {
          if(!draft?.userTickets?.length) return
          for( let i = 0; i < draft.userTickets.length; i ++){
            draft.userTickets[i].claimed = true
          }
        })
      })
      .on('error', (error: any, receipt: Receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
      })

  },[lotteryMethods, account, editTransactions,setLastRoundInfo])

  const selectedDigits = selectedTicket?.ticketNumber.split('')
  const matches = selectedDigits?.reduce( (acc, number, index) => {
    acc.base += number
    if(acc.base === (selectedRoundInfo?.winnerNumber || "1123456").substring(0,index +1))
      acc.matches ++
    return acc
  },{base: "", matches: 0})
  const matchPercents = [new BigNumber(selectedRoundInfo?.noMatch || 0), new BigNumber(selectedRoundInfo?.match1 || 0), new BigNumber(selectedRoundInfo?.match2 || 0), new BigNumber(selectedRoundInfo?.match3 || 0), new BigNumber(selectedRoundInfo?.match4 || 0), new BigNumber(selectedRoundInfo?.match5 || 0), new BigNumber(selectedRoundInfo?.match6 || 0),]
  const crushWin = new BigNumber(matchPercents[(matches?.matches || 1 ) -1 ]).div("100000000000").times(selectedRoundInfo?.pool || 1).div((selectedRoundInfo?.holders[(matches?.matches || 1) -1]) || 1).div(10**18)
  const usdCrushWin = crushWin.times(tokenInfo?.crushUsdPrice || 0)

  const partnerToken = partnerTokens[currentRoundInfo?.bonusInfo?.bonusToken || '0x0'] 

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
          claimAll={claimAllTickets}
        />
      </Grid>
      <Grid item xs={12} lg={5}>
        {partnerToken?.name && <Stack direction="row" justifyContent="flex-end">
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
                    {currencyFormat(new BigNumber(currentRoundInfo?.bonusInfo?.bonusAmount || 0).toString(), { decimalsToShow: 2, isWei: true})} {partnerToken.name}
                  </Typography>
                </Stack>
                {partnerToken.img && <Image src={partnerToken.img} height={272/2.2} width={272/2.2} alt="partner Logo"/>}
              </Stack>
            </Box>
          </Box>
        </Stack>}
        {selectedTicket && selectedDigits &&
          <Card
            sx={{
              background: {
                xs: 'none',
                md: 'url(/backgrounds/lotterybg.png) no-repeat'
              },
              backgroundSize: {
                xs: '100% 100%',
                md: '135% 100%'
              },
              backgroundPosition: {
                md: 'top 0 right 0'
              },
              position: 'relative',
              width: '100%',
              height: {
                xs: 'auto',
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
            <Grid container alignItems="center" sx={{pt: 2}} rowSpacing={1}>
              <Grid item xs={12} md={6}>
                <Stack direction="row" justifyContent="space-evenly">
                  <NumberInvader variant="fancy" twoDigits={[selectedDigits[1], selectedDigits[2]]} matched={matches ? matches.matches > 3 ? 2 : matches.matches - 1 : 0 }/>
                  <NumberInvader variant="fancy" twoDigits={[selectedDigits[3], selectedDigits[4]]} matched={matches ? matches.matches > 5 ? 2 : matches.matches -3 : 0 }/>
                  <NumberInvader variant="fancy" twoDigits={[selectedDigits[5], selectedDigits[6]]} matched={matches ? matches.matches - 5 : 0 }/>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
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
                <Stack alignItems={{xs: "center", md:'flex-start'}}>
                  {(matches?.matches || 1) > 1 ? 
                    <>
                      <Typography variant="h5" color="secondary" align="left" fontWeight={600}>
                        Congratulations!
                      </Typography>
                      <Typography variant="h6" color="white" align="left" fontWeight={600}>
                        You CRUSHED it!
                      </Typography>
                    </>
                    :
                    <>
                      <Typography variant="h5" color="primary" align="left" fontWeight={600}>
                        No matches
                      </Typography>
                      <Typography variant="h6" color="white" align="left" fontWeight={600}>
                        Still crushed it!
                      </Typography>
                    </>
                  }
                  <Typography variant="subtitle2" color="textSecondary" align="left">
                    Squadron Reward
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight={600}>
                    {currencyFormat(crushWin.toString(), { decimalsToShow: 4 })} CRUSH
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary" align="left">
                    $&nbsp;{currencyFormat(usdCrushWin.toString(), { decimalsToShow: 4})}
                  </Typography>
                  <GButton disabled={selectedTicket.claimed} color="secondary" width={"80%"} sx={{mt: 1}} onClick={ () => claimTicket(selectedTicket.ticketRound, selectedTicket.ticketNumber)}>
                    {selectedTicket.claimed ? "Already Claimed" : "Claim"}
                  </GButton>
                </Stack>
              </Grid>
              <Grid item xs={false} md={6} sx={{ display:{ xs: 'none', md: 'block', height: 267, position:'relative'}}}>
                {(matches?.matches || 0) >= 2 && 
                  <Box sx={{position:'absolute', top: 20, left: 55 }}>
                    <Image src="/assets/launcher/explosion.png" width={100/1.5} height={77/1.5} alt="Rocket Explosion"/>
                  </Box>
                }
                {(matches?.matches || 0) >= 4 && 
                  <Box sx={{position:'absolute', top: 'calc(50% - 25px)', left: -20 }}>
                    <Image src="/assets/launcher/explosion.png" width={100/1.4} height={77/1.4} alt="Satellite Explosion"/>
                  </Box>
                }
                {(matches?.matches || 0) >= 3 && 
                  <Box sx={{position:'absolute', bottom: '25%', left: 65 }}>
                    <Image src="/assets/launcher/explosion.png" width={100/1.9} height={77/1.9} alt="Antennae Explosion"/>
                  </Box>
                }
                {(matches?.matches || 0) >= 5 && 
                  <Box sx={{position:'absolute', bottom: '5%', left: '38%' }}>
                    <Image src="/assets/launcher/explosion.png" width={100/1.5} height={77/1.5} alt="Truck Explosion"/>
                  </Box>
                }
                {(matches?.matches || 0) >= 6 && 
                  <Box sx={{position:'absolute', top: '40%', right: 0 }}>
                    <Image src="/assets/launcher/explosion.png" width={100/1.2} height={77/1.2}  alt="Big Antennae Explosion"/>
                  </Box>
                }
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