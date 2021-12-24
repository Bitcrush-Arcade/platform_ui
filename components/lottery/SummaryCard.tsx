import { useState } from 'react'
import format from 'date-fns/format'
// OtherLibs
import BigNumber from 'bignumber.js'
import Countdown from 'react-countdown'
// MaterialUi
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
// Icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// BitcrushUI
import GButton from 'components/basics/GeneralUseButton'
import Card from 'components/basics/Card'
import Currency from 'components/basics/Currency'
import SmButton from 'components/basics/SmallButton'
// hooks
import { useTransactionContext } from 'hooks/contextHooks'
// utils

type LotterySummaryProps = {
  onBuy: () => void
}

const SummaryCard = (props: LotterySummaryProps) => {
  const { onBuy } = props
  // These will come from props
  const [round, setRound] = useState({ id: 123, tickets: 3, endTime: new Date().getTime()+(3600*24*1000), pool: new BigNumber(10).pow(23), match6: 40000, match5: 20000, match4: 10000, match3: 5000, match2: 3000, match1:2000, noMatch: 2000, burn: new BigNumber(1800).times(10**18) })
  const burnPercent = 18000
  const percentBase = 100000
  // Context
  const { tokenInfo } = useTransactionContext()
  
  const [ showDetail, setShowDetail ] = useState<boolean>(false)
  const toggleDetail = () => setShowDetail( p => !p )
  
  const matchDisplays = new Array(7).fill(null).map( (x,i) => {
    let percent: number = 0
    switch(i){
      case 6:
        percent = round.noMatch
        break
      case 5:
        percent = round.match1
        break
      case 4:
        percent = round.match2
        break
      case 3:
        percent = round.match3
        break
      case 2:
        percent = round.match4
        break
      case 1:
        percent = round.match5
        break
      case 0:
        percent = round.match6
        break
    }
    const text = i== 0 ? 'JACKPOT!' : `Match ${6-i}`
    const crushReward = round.pool.times(percent || 0).div(percentBase)
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
              {round.tickets}
            </Typography>
            &nbsp;&nbsp;tickets this round
          </Typography>
        </Typography>
      </div>
      <div>
        <Typography variant="body2" fontWeight={500} color="secondary" display="inline">
          NEXT DRAW <ArrowForwardIcon sx={{fontSize: 18, bottom: -4, position: 'relative' }} /> &nbsp;&nbsp;
        </Typography>
        <Typography variant="body2" color="textSecondary" display="inline">
          #{round.id}&nbsp;
        </Typography>
        <Typography variant="body2" display="inline">
          {format(round.endTime, 'MMMM dd - HH aa')}
        </Typography>
      </div>
    </Stack>
    <CardContent>
      <Stack direction={{ xs: "column", lg: "row"}} justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="body2" color="textSecondary">
            PRIZE POT:
          </Typography>
          <Typography variant="h5" color="primary" fontWeight="bold">
            <Currency value={round.pool} isWei decimals={0}/>&nbsp;CRUSH
          </Typography>
        </div>
        <Stack 
          direction={{ xs: 'column', lg: 'row'}}
          divider={<Divider orientation="vertical" flexItem />}
          alignItems="center"
          spacing={2}
        >
          <Typography variant="h4" color="secondary" display="inline" component="div">
            <Typography variant="h5" color="secondary" display="inline">
              <sup>$</sup>
            </Typography>
            <strong>
              <Currency value={round.pool.times(tokenInfo.crushUsdPrice)} isWei decimals={2}/>
            </strong>
            &nbsp;
          </Typography>
          <Typography color="secondary" variant="h5" display="inline" component="div">
            <Countdown
              date={ new Date(round.endTime) }
              renderer={({hours, minutes, seconds}) => {
                return <>
                  <strong>{hours < 10 && `0${hours}` || hours}</strong>
                  <sub>H</sub>
                  &nbsp;
                  <strong>{minutes < 10 && `0${minutes}` || minutes}</strong>
                  <sub>M</sub>
                  &nbsp;
                  <strong>{seconds < 10 && `0${seconds}` || seconds}</strong>
                  <sub>S</sub>
                </>
              }}
            />
            &nbsp;
            <Typography color="primary" variant="h5" display="inline">
              UNTIL ATTACK TIME
            </Typography>
          </Typography>
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
          {burnPercent/percentBase*100}% is burned when tickets bought are more than 10% of prize pool
        </Typography>
      </Collapse>
    </CardContent>
      <SmButton color="secondary" onClick={toggleDetail} sx={{ pl: 4, pr:2, borderTopLeftRadius: 0, borderTopRightRadius: 80, borderBottomRightRadius: 0, borderBottom: 'none'}}>
        Details&nbsp;<ExpandMoreIcon sx={{ transform: showDetail ? 'rotate(180deg)' : 'none', position: 'relative', bottom: 2}}/>
      </SmButton>
  </Card>
}

export default SummaryCard