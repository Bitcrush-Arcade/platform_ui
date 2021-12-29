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

type LotterySummaryProps = {
  onBuy: () => void,
}

type LotteryRoundInfo = {
  id: number,
  isActive: boolean,
  tickets: number,
  endTime: number,
  pool: BigNumber,
  match6: BigNumber,
  match5: BigNumber,
  match4: BigNumber,
  match3: BigNumber,
  match2: BigNumber,
  match1: BigNumber,
  noMatch: BigNumber,
  burn: BigNumber,
}

const SummaryCard = (props: LotterySummaryProps) => {
  const { onBuy } = props
  // These will come from props
  const [round, setRound] = useState<LotteryRoundInfo | null>(null)
  const [roundTimeEnded, setRoundTimeEnded] = useState<boolean>(false)
  const [ showDetail, setShowDetail ] = useState<boolean>(false)
  const toggleDetail = () => setShowDetail( p => !p )
  
  const { account, chainId } = useWeb3React()
  const lotteryContract = getContracts('lottery', chainId)
  const { methods: lotteryMethods } = useContract( lotteryContract.abi, lotteryContract.address )
  
  const burnPercent = 18000
  const percentBase = new BigNumber('100000000000')
  // Context
  const { tokenInfo } = useTransactionContext()

  const getLotteryInfo = useCallback(async () => {
    const currentRound = await lotteryMethods.currentRound().call()
    const roundInfo = await lotteryMethods.roundInfo(currentRound).call()
    const isActive = await lotteryMethods.currentIsActive().call()
    const userTickets = await lotteryMethods.getRoundTickets(currentRound).call({ from: account })
    console.log({currentRound, roundInfo, isActive,userTickets})
    setRound( {
      id: new BigNumber(currentRound).toNumber(),
      endTime: new BigNumber(roundInfo.endTime).times(1000).toNumber(),
      tickets: userTickets.length,
      isActive: isActive,
      pool: new BigNumber(roundInfo.pool),
      match6: new BigNumber(roundInfo.match6),
      match5: new BigNumber(roundInfo.match5),
      match4: new BigNumber(roundInfo.match4),
      match3: new BigNumber(roundInfo.match3),
      match2: new BigNumber(roundInfo.match2),
      match1: new BigNumber(roundInfo.match1),
      noMatch: new BigNumber(roundInfo.noMatch),
      burn: new BigNumber(0)
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
  },[ lotteryMethods, account ])
  
  
  
  const matchDisplays = new Array(7).fill(null).map( (x,i) => {
    let percent: BigNumber = new BigNumber(0)
    switch(i){
      case 6:
        percent = round?.noMatch || new BigNumber(0)
        break
      case 5:
        percent = round?.match1 || new BigNumber(0)
        break
      case 4:
        percent = round?.match2 || new BigNumber(0)
        break
      case 3:
        percent = round?.match3 || new BigNumber(0)
        break
      case 2:
        percent = round?.match4 || new BigNumber(0)
        break
      case 1:
        percent = round?.match5 || new BigNumber(0)
        break
      case 0:
        percent = round?.match6 || new BigNumber(0)
        break
    }
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
      { round && round.endTime < new Date().getTime() || roundTimeEnded &&
        <div>
          <Button
            sx={theme => ({
              fontWeight: 600,
              borderRadius: 20,
              px: 2,
              color: 'black',
              fontSize: theme.typography.body2.fontSize,
              textShadow: `0 0 5px #FFF, 0 0 10px #FFF, 0 0 15px #FFF, 0 0 20px #49ff18, 0 0 30px #49FF18, 0 0 40px #49FF18, 0 0 55px #49FF18, 0 0 75px #49ff18,
                2px 2px 0 ${theme.palette.primary.dark}, 2px -2px 0 ${theme.palette.primary.dark}, -2px 2px 0 ${theme.palette.primary.dark}, -2px -2px 0 ${theme.palette.primary.dark}, 2px 0px 0 ${theme.palette.primary.dark}, 0px 2px 0 ${theme.palette.primary.dark}, -2px 0px 0 ${theme.palette.primary.dark}, 0px -2px 0 ${theme.palette.primary.dark}
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
          background="primary"
          sx={{ width: { xs: '60%', lg: '200px' }, mt:{ xs: 3, lg: 0}}}
        >
          Buy Tickets
        </GButton>
      </Stack>
      <Collapse in={showDetail}>
        <Typography variant="h5" sx={{pt:3, pb:3}} align="center">
          Match Invaders and their colors in exact order to win!
        </Typography>
        <Grid container justifyContent="space-evenly" spacing={4}>
            {matchDisplays}
        </Grid>
        <Typography variant="h6" sx={{pt:3}} align="center" color="textSecondary">
          {new BigNumber(burnPercent).div(percentBase).times(100).toFixed(2,1)}% is burned when tickets bought are more than 10% of prize pool
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