import { useState, useCallback, useEffect } from 'react'
import format from 'date-fns/format'
// OtherLibs
import BigNumber from 'bignumber.js'
import Countdown from 'react-countdown'
// MaterialUi
import { keyframes, Theme } from '@mui/system'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
// Icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// BitcrushUI
import GButton from 'components/basics/GeneralUseButton'
import Card from 'components/basics/Card'
import Currency from 'components/basics/Currency'
import InfoTooltip from 'components/basics/InfoTooltip'
import SmButton from 'components/basics/SmallButton'
// hooks
import { useTransactionContext } from 'hooks/contextHooks'
import { useWeb3React } from '@web3-react/core'
import { useContract } from 'hooks/web3Hooks'
// utils
import { getContracts } from 'data/contracts'
// Types
import { Receipt } from 'types/PromiEvent'

type LotterySummaryProps = {
  onBuy?: () => void,
  buyHref?: string,
}

type LotteryRoundInfo = {
  id: number,
  isActive: boolean,
  tickets: number,
  endTime: number,
  pool: BigNumber,
  distribution: Array<BigNumber>,
  burn: BigNumber,
  bonusToken?: {
    address: string,
    amount: BigNumber,
  } | null
}

const SummaryCard = (props: LotterySummaryProps) => {
  const { onBuy, buyHref } = props
  // These will come from props
  const [round, setRound] = useState<LotteryRoundInfo | null>(null)
  const [roundTimeEnded, setRoundTimeEnded] = useState<boolean>(false)
  const [ showDetail, setShowDetail ] = useState<boolean>(false)
  const toggleDetail = () => setShowDetail( p => !p )
  
  const { account, chainId } = useWeb3React()
  const lotteryContract = getContracts('lottery', chainId)
  const { methods: lotteryMethods } = useContract( lotteryContract.abi, lotteryContract.address )
  
  const percentBase = new BigNumber('100000000000')
  // Context
  const { tokenInfo, editTransactions } = useTransactionContext()

  const getLotteryInfo = useCallback(async () => {
    const currentRound = await lotteryMethods.currentRound().call()
    const roundInfo = await lotteryMethods.roundInfo(currentRound).call()
    const isActive = await lotteryMethods.currentIsActive().call()
    const userTickets = await lotteryMethods.userRoundTickets(account,currentRound).call()
    const bonusToken = await lotteryMethods.bonusCoins(currentRound).call()
    const distribution = await lotteryMethods.getRoundDistribution(currentRound).call()
    const burn = await lotteryMethods.burn().call()
    console.log( new BigNumber(burn).toString() )
    setRound( {
      id: new BigNumber(currentRound).toNumber(),
      endTime: new BigNumber(roundInfo.endTime).times(1000).toNumber(),
      tickets: userTickets.totalTickets,
      isActive: isActive,
      pool: new BigNumber(roundInfo.pool),
      distribution: distribution?.map( (d: string) => new BigNumber(d)),
      burn: new BigNumber(burn),
      bonusToken: new BigNumber(bonusToken.bonusAmount).isGreaterThan(0)
        ? { address: bonusToken.bonusToken, amount: new BigNumber( bonusToken.bonusAmount ) }
        : null
    })

  }, [lotteryMethods, account,setRound])

  useEffect(()=>{
    if(!lotteryMethods) return
    const interval = setInterval(getLotteryInfo, 10000)
    return () => {
      clearInterval(interval)
    }
  },[lotteryMethods, getLotteryInfo])


  const onAttack = useCallback( ()=>{
    if(!lotteryMethods) return
    lotteryMethods.endRound().send({ from: account })
      .on('transactionHash', (tx:string) => {
        console.log('hash', tx )
        editTransactions(tx,'pending', { description: `Launch Lottery Invasion`})
      })
      .on('receipt', ( rc: Receipt ) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash,'complete')
        getLotteryInfo()
      })
      .on('error', (error: any, receipt: Receipt ) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
        getLotteryInfo()
      })
  },[ lotteryMethods, account, editTransactions, getLotteryInfo ])
  
  
  
  const matchDisplays = new Array(7).fill(null).map( (x,i) => {
    let percent: BigNumber = round?.distribution?.[6-i] || new BigNumber(0)
    const text = i== 0 ? 'JACKPOT!' : `Match ${6-i}`
    const crushReward = round?.pool.times(percent || 0).div(percentBase) || new BigNumber(0)
    return <Grid item xs={5} md={3} lg={'auto'} key={`match-amounts-${i}`}>
      <Typography align="center">
        {text}
      </Typography>
      <Typography align="center" variant="h5" color="secondary" fontWeight={600}>
        <Currency value={crushReward} isWei decimals={0}/>
      </Typography>
      <Typography align="center" variant="subtitle2" color="textSecondary">
        $<Currency value={crushReward.times(tokenInfo.crushUsdPrice)} isWei decimals={2}/>
      </Typography>

    </Grid>
  } )

  const roundEnded = (round?.endTime || 0) < new Date().getTime()

  return <Card background="dark">
    {/* CARD HEADER */}
    <Stack justifyContent="space-between" alignItems="center" direction={{ xs: "column", md: "row"}}
      sx={ theme => ({ px: 3, py:1, background: theme.palette.mode == 'dark' ? 'rgba(25,10,41,0.7)' : 'rgba(25,10,41,0.4)' })}
    >
      <div>
        <Typography color="textSecondary" variant="body2" component="div">
          Tickets:&nbsp;
          <Typography variant="body2" display="inline" color="textPrimary" component="div">
            You have&nbsp;
            <Typography color="primary" variant="body2" display="inline" fontWeight={500}>
              {round?.tickets ?? ' - '}
            </Typography>
            &nbsp;&nbsp;tickets this round
          </Typography>
        </Typography>
      </div>
      { round && (roundEnded || roundTimeEnded) && round.isActive &&
        <div>
          <Button onClick={onAttack}
            sx={theme => ({
              fontWeight: 600,
              borderRadius: 20,
              px: 2,
              color: 'white',
              fontSize: theme.typography.body2.fontSize,
              textShadow: `0 0 5px #FFF, 0 0 10px #FFF, 0 0 15px #FFF, 0 0 20px #49ff18, 0 0 30px #49FF18, 0 0 40px #49FF18, 0 0 55px #49FF18, 0 0 75px #49ff18,
                2px 2px 0 ${theme.palette.common.black}, 2px -2px 0 ${theme.palette.common.black}, -2px 2px 0 ${theme.palette.common.black}, -2px -2px 0 ${theme.palette.common.black}, 2px 0px 0 ${theme.palette.common.black}, 0px 2px 0 ${theme.palette.common.black}, -2px 0px 0 ${theme.palette.common.black}, 0px -2px 0 ${theme.palette.common.black}
              `,
              backgroundImage: `repeating-linear-gradient(
                45deg,
                yellow,
                yellow 20px,
                black 20px,
                black 40px
              )`
            })}
          >
            Initiate Attack for 0.75% of winning pot
            <InfoTooltip color="inherit"
              info={
                <Typography variant="body2">
                  Help start the attack and may the best team survive the invasion. Signaling the attack awards you 0.75% of the winning pot once the attack is over.
                </Typography>
              }
            />
          </Button>
        </div>
      }
      <div>
        {
          round && <>
            <Typography variant="body2" fontWeight={500} color="secondary" display="inline">
              NEXT DRAW <ArrowForwardIcon sx={{fontSize: 18, bottom: -4, position: 'relative' }} /> &nbsp;&nbsp;
            </Typography>
            <Typography variant="body2" color="textSecondary" display="inline">
              { 
                round && <>
                    #{round?.id}&nbsp;
                  </>
              }
            </Typography>
            <Typography variant="body2" display="inline">
              {round && format(round.endTime, 'MMMM dd - HH aa')}
            </Typography>
          </>
          ||
          <Skeleton width={200}/>
        }
      </div>
    </Stack>
    <CardContent>
      <Stack direction={{ xs: "column", lg: "row"}} justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="body2" color="textSecondary">
            PRIZE POT:
          </Typography>
          <Stack>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {round && <>
                <Currency value={round.pool} isWei decimals={0}/>&nbsp;CRUSH
              </>
              || <Skeleton width={200}/>}
            </Typography>
            <Typography variant="caption" color="textSecondary" component="div">
              { round ? <>
                  $
                  <Currency value={round.pool.times(tokenInfo.crushUsdPrice)} isWei decimals={2}/>
                  &nbsp;
                </>
                : <Skeleton width={400}/>
              }
            </Typography>
          </Stack>
        </div>
        <Stack 
          direction={{ xs: 'column', lg: 'row'}}
          divider={<Divider orientation="vertical" flexItem />}
          alignItems="center"
          spacing={2}
        >
          { round &&
            (round.isActive ?
              <Typography color="secondary" variant="h5" display="inline" component="div">
                <Countdown
                  onStart={()=> setRoundTimeEnded(false)}
                  onComplete={ () => setRoundTimeEnded(true)}
                  date={ new Date(round.endTime) }
                  renderer={({ days, hours, minutes, seconds }) => {
                    return <>
                      {
                        days ? <>
                          <strong>{days < 10 && `0${days}` || days}</strong>
                          <sub>D</sub>
                          &nbsp;
                          </>
                        : null
                      }
                      <strong>{hours < 10 && `0${hours}` || hours}</strong>
                      <sub>H</sub>
                      &nbsp;
                      <strong>{minutes < 10 && `0${minutes}` || minutes}</strong>
                      <sub>M</sub>
                      &nbsp;
                      <strong>{seconds < 10 && `0${seconds}` || seconds}</strong>
                      <sub>S</sub>
                      &nbsp;
                      <Typography color="primary" variant="h5" display="inline">
                        UNTIL ATTACK TIME
                      </Typography>
                    </>
                  }}
                />
                &nbsp;
              </Typography>
              :
              <Typography color="secondary" variant="h4" fontWeight={600} sx={ theme => ({ animation: `${winnerFlash(theme)} 1s ease infinite`})}>
                Picking Winner
              </Typography>)
          }
        </Stack>
        <GButton
          onClick={onBuy}
          href={buyHref}
          background="primary"
          disabled={!round?.isActive}
          sx={{ width: { xs: '60%', lg: '200px' }, mt:{ xs: 3, lg: 0}}}
          component={buyHref ? 'a' : 'button'}
        >
          Buy Tickets
        </GButton>
      </Stack>
      {!round && <LinearProgress color="secondary"/>}
      <Collapse in={showDetail}>
        <Typography variant="h5" sx={{pt:3, pb:3}} align="center">
          Match Invaders and their colors in exact order to win!
        </Typography>
        <Grid container justifyContent="space-evenly" spacing={4}>
            {matchDisplays}
        </Grid>
        <Typography variant="h6" sx={{pt:3}} align="center" color="textSecondary">
          {round?.burn.div(percentBase).times(100).toFixed(2,1)}% is burned when tickets bought are more than 10% of prize pool
        </Typography>
      </Collapse>
    </CardContent>
      <SmButton color="secondary" onClick={toggleDetail} sx={{ pl: 4, pr:2, borderTopLeftRadius: 0, borderTopRightRadius: 80, borderBottomRightRadius: 0, borderBottom: 'none'}}>
        Details&nbsp;<ExpandMoreIcon sx={{ transform: showDetail ? 'rotate(180deg)' : 'none', position: 'relative', bottom: 2}}/>
      </SmButton>
  </Card>
}

export default SummaryCard

const winnerFlash = (theme:Theme) =>  keyframes`
  0% { 
    color: ${theme.palette.primary.main};
  }
  75% { 
    color: ${theme.palette.secondary.light};
  }
  100% { 
    color: ${theme.palette.primary.main};
  }
`