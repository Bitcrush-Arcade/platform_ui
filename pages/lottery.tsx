import { useState, useEffect } from 'react'
import { useImmer } from 'use-immer'
import BigNumber from 'bignumber.js'
// Next
import Head from 'next/head'
// Material
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
// Bitcrush UI
import Card from 'components/basics/Card'
import LotteryHistory from 'components/lottery/LotteryHistory'
import PageContainer from 'components/PageContainer'
import SummaryCard from 'components/lottery/SummaryCard'
import TicketBuyModal from 'components/lottery/TicketBuyModal'
import TicketSelectCard from 'components/lottery/TicketSelectCard'
// Hooks
import { useContract } from 'hooks/web3Hooks'
import { useWeb3React } from '@web3-react/core'
// Utils & Data
import { getContracts } from 'data/contracts'

const Lottery = () => {

  const { account, chainId } = useWeb3React()
  const lotteryContract = getContracts('lottery', chainId)
  const { methods: lotteryMethods } = useContract( lotteryContract.abi, lotteryContract.address )

  const [ openBuy, setOpenBuy ] = useState<boolean>(false)
  const toggleOpenBuy = () => setOpenBuy( p => !p )

  const [ currentRound, setCurrentRound ] = useState<number>(0)
  const [ currentTickets, setCurrentTickets ] = useState<Array<{ ticketNumber: string, claimed: boolean}> | null>(null)

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


  return <PageContainer customBg="/backgrounds/lotterybg.png">
     <Head>
      <title>BITCRUSH - Lottery</title>
      <meta name="description" content="The lottery where everyone wins."/>
    </Head>
    <SummaryCard onBuy={toggleOpenBuy}/>
    <Grid container sx={{mt: 4}} justifyContent="space-between">
      <Grid item xs={12} md={6}>
        <LotteryHistory currentRound={currentRound} currentTickets={currentTickets}/>
      </Grid>
      <Grid item xs={12} md={5}>
        <Box
          sx={theme => ({
            p: 2,
            m: 2,
            position:'relative',
            backgroundColor: theme.palette.primary.main,
            maxWidth: 350,
            height: 80,
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
              clipPath: 'polygon(92% 0, 100% 25%, 100% 100%, 8% 100%, 0% 75%, 0 0)'
            }}
          >
            Bonus for this round:
            5000 KNIGHT pool
          </Box>
        </Box>
      </Grid>
    </Grid>
    <TicketBuyModal
      open={openBuy}
      onClose={toggleOpenBuy}
    />
  </PageContainer>
}

export default Lottery