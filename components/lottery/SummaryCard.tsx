import { useMemo, useState } from 'react'
import format from 'date-fns/format'
// MaterialUi
import Box from '@mui/material/Box'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
// Icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// BitcrushUI
import Card from 'components/basics/Card'
import Currency from 'components/basics/Currency'
import SmButton from 'components/basics/SmallButton'
// hooks
import { useTransactionContext } from 'hooks/contextHooks'
// utils
import { differenceFromNow } from 'utils/dateFormat'

import BigNumber from 'bignumber.js'

const Summary = () => {
  // These will come from props
  const [round, setRound] = useState({ id: 123, tickets: 3, endTime: new Date().getTime()+(3600*24*1000), pool: new BigNumber(10).pow(23) })
  // Context
  const { tokenInfo } = useTransactionContext()

  const [ showDetail, setShowDetail ] = useState<boolean>(false)
  const toggleDetail = () => setShowDetail( p => !p )

  const timeDiff = differenceFromNow(round.endTime, 'object')

  return <Card background="dark">
    {/* CARD HEADER */}
    <Grid container justifyContent="space-between" alignItems="center" 
      sx={{ px: 3, py:1, background: 'rgba(25,10,41,0.7)' }}
    >
      <Grid item>
        <Typography color="textSecondary" variant="body2" component="div">
          Tickets:&nbsp;
          <Typography variant="body2" display="inline" color="textPrimary">
            You have&nbsp;
            <Typography color="primary" variant="body2" display="inline" fontWeight={500}>
              {round.tickets}
            </Typography>
            &nbsp;&nbsp;tickets this round
          </Typography>
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="body2" fontWeight={500} color="secondary" display="inline">
          NEXT DRAW <ArrowForwardIcon sx={{fontSize: 18, bottom: -4, position: 'relative' }} /> &nbsp;&nbsp;
        </Typography>
        <Typography variant="body2" color="textSecondary" display="inline">
          #{round.id}&nbsp;
        </Typography>
        <Typography variant="body2" display="inline">
          {format(round.endTime, 'MMMM dd - HH aa')}
        </Typography>
      </Grid>
    </Grid>
    <CardContent>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="body2" color="textSecondary">
            PRIZE POT:
          </Typography>
          <Typography variant="h5" color="primary" fontWeight="bold">
            <Currency value={round.pool} isWei/>&nbsp;CRUSH
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h4" color="secondary" display="inline">
            <sup>$</sup>
            <strong>
              <Currency value={round.pool.times(tokenInfo.crushUsdPrice)} isWei/>
            </strong>
              &nbsp;
            <Typography display="inline" color="textSecondary">
              |
            </Typography>
              &nbsp;
              {timeDiff.hours > 0 && <>
                <strong>{timeDiff.hours || ''}</strong>
                <sub>H</sub>
              </>}
              <strong>{timeDiff.minutes || '0'}</strong>
              <sub>M</sub>
              <strong>{timeDiff.seconds || '0'}</strong>
              <sub>S</sub>
          </Typography>
          UNTIL ATTACK TIME
        </Grid>
        <Grid item>
          BUY TICKETS CTA
        </Grid>
      </Grid>
      <Collapse in={showDetail}>
        NEED COLLAPSE WITH EXTRA DATA
      </Collapse>
    </CardContent>
      <SmButton color="secondary" onClick={toggleDetail}>
        Hide Button
      </SmButton>
  </Card>
}

export default Summary