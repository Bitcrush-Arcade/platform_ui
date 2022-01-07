import { useState, useEffect, useCallback } from 'react'
import { useImmer } from 'use-immer'
import format from 'date-fns/format'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
//Material
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
// Icons
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
// Bitcrush UI
// Components
import LastRound from 'components/lottery/LotteryViews/LastRound'
// hooks
import { useContract } from 'hooks/web3Hooks';
import { useTransactionContext } from 'hooks/contextHooks'
// data
import { getContracts } from 'data/contracts'
// types
import { RoundInfo } from 'types/lottery'

{/* History table props */}
type HistoryViewProps = {
  rounds: Array<{
    id: number,
    date: Date,
    totalTickets: number,
    userTickets: number,
    tokenAmount: number,
    token: string,
  }>,
  totalRounds: number,
  currentPageView: number,
  onPagination: (newPage: number) => void,
  onLastRoundView: (isCurrent?: boolean) => void,
  rowsPerPage:number,
  isInView: boolean,
}

{/* History table props and formatting */}
const History = (props: HistoryViewProps) => {
  const { rounds, totalRounds, currentPageView, onPagination, rowsPerPage, isInView, onLastRoundView } = props

  // BLOCKCHAIN
  const { account, chainId } = useWeb3React()
  const lotteryContract = getContracts('lottery', chainId)
  const { methods: lotteryMethods } = useContract( lotteryContract.abi, lotteryContract.address )
  const { editTransactions } = useTransactionContext()

  // STATE
  const [ currentRound, setCurrentRound ] = useState<string>('0')
  const [ history, setHistory ] = useImmer<Array< RoundInfo&{id: string} | null >>(new Array(4).fill(null))
  const [ selectedRound, setSelectedRound ] = useState<number | null>(null)

  const getRoundData = useCallback( async (roundId: string) => {
    if(!lotteryMethods) return
    const roundInfo = await lotteryMethods.roundInfo(roundId).call()
    const roundBonus = await lotteryMethods.bonusCoins(roundId).call()
    const userTickets = !account ? [] : await lotteryMethods.getRoundTickets(roundId).call({from: account})
    setHistory( draft => {
      const roundToChange = new BigNumber(roundId).mod(rowsPerPage).toNumber()
      draft[roundToChange -1] = {
        ...roundInfo,
        bonusInfo: roundBonus,
        userTickets,
        id: roundId
      }
    })
  },[lotteryMethods, account, setHistory, rowsPerPage])

  const getCurrentRound = useCallback(async () => {
    if(!lotteryMethods) return
    console.log('this gets called')
    const currentRound = new BigNumber(await lotteryMethods.currentRound().call())
    setCurrentRound(currentRound.toString())
    const roundFetchStart = currentRound.minus(3).isGreaterThan(0) ? currentRound.minus(3) : new BigNumber(0)
    for(let initRound = roundFetchStart; currentRound.isGreaterThanOrEqualTo(initRound) ; initRound = initRound.plus(1)){
      getRoundData(initRound.toString())
    }
  },[lotteryMethods, setCurrentRound, getRoundData])

  const onRoundView = useCallback( (selectedRound: number) => {
    if(history[selectedRound] && new BigNumber(history[selectedRound].id).isEqualTo( currentRound ))
      onLastRoundView(true)
    else if(history[selectedRound] && new BigNumber(history[selectedRound].id).isEqualTo( new BigNumber(currentRound).minus(1) ))
      onLastRoundView()
    else
      setSelectedRound(selectedRound)
  },[setSelectedRound, currentRound, onLastRoundView, history])

  // EFFECTS
  useEffect( () => {
    if(!lotteryMethods)  return
    getCurrentRound()
  },[lotteryMethods, getCurrentRound])

  {/*History table rows data formatting*/}
  const tableRows = history.map( (roundInfo, index) => {
    if(!roundInfo)
      return <TableRow key={`roundData-${index}-nullValue`}>
        <TableCell colSpan={5}>
          -
        </TableCell>
      </TableRow> 
    return <TableRow key={`roundData-${index}-${roundInfo.id}`}>
      <TableCell>{roundInfo.id}</TableCell>
      <TableCell>
        { format(new Date( new BigNumber(roundInfo.endTime).times(1000).toNumber()), 'yyyy-MMM-dd HHaa')}
      </TableCell>
      <TableCell 
        align ="center">{roundInfo.totalTickets}
      </TableCell>
      <TableCell align ="center">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <div>
            {(roundInfo.userTickets || []).length}
          </div>
          <div>
            { roundInfo.userTickets && roundInfo.userTickets.length > 0 &&
                <IconButton color="primary" onClick={() => onRoundView(index)} sx ={{ml: 0.5}}>
                <RemoveRedEyeIcon/>
              </IconButton>
            }
          </div>

        </Stack>
      </TableCell>
      <TableCell align="center">
        { parseInt(roundInfo.bonusInfo?.bonusToken || '0',16) || '-'}
        {/* {roundInfo.tokenAmount}&nbsp;{roundInfo.token} */}
      </TableCell>
   
    </TableRow>
  })

  if(!isInView)
    return null
  {/*Building the table with header*/}
  if(typeof(selectedRound) == 'number'){
    const roundToView = history[selectedRound]
    if(!roundToView)
      return null
    return <Stack>
        <Button color="secondary" onClick={() => setSelectedRound(null)}>
          Back to History
        </Button>
        <LastRound
          winningTeamTicket={roundToView.winnerNumber} 
          tickets={roundToView.userTickets || []}
          lastDate={ new BigNumber(roundToView.endTime).toNumber()} 
          selectTicket={() => {}} 
          lastRound={roundToView.id}
          token={roundToView.bonusInfo?.bonusToken}
          tokenAmount={roundToView.bonusInfo?.bonusAmount}
          globalTickets={new BigNumber(roundToView.totalTickets).toNumber()}
        />
      </Stack>
  }
  return <Table>
    <TableHead>
      <TableRow> 
        <TableCell align="center">ID</TableCell>
        <TableCell align="center">DATE</TableCell>
        <TableCell align="center">TOTAL TICKETS</TableCell>
        <TableCell align="center">USER TICKETS</TableCell>
        <TableCell align="center">PARTNER BONUS</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      { currentRound 
        ? <>
          {tableRows}
          <TableRow>
            <TablePagination rowsPerPageOptions={[]} rowsPerPage={rowsPerPage} count={parseInt(currentRound) || 1} page={currentPageView} onPageChange={(e,p) => onPagination(p)}/>
          </TableRow>
        </>
        : <>
          <TableRow>
            <TableCell colSpan={5}>
              <Skeleton/>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={5}>
              <Skeleton/>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={5}>
              <Skeleton/>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={5}>
              <Skeleton/>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={5}>
              <Skeleton/>
            </TableCell>
          </TableRow>
        </>
      }
    </TableBody>
  </Table>
}

export default History