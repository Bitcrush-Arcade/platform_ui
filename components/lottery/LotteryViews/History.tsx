import { useState, useEffect, useCallback } from 'react'
import { useImmer } from 'use-immer'
import format from 'date-fns/format'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
//Material
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
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
import { partnerTokens } from 'data/partnerTokens'
// types
import { RoundInfo } from 'types/lottery'

{/* History table props */}
type HistoryViewProps = {
  currentPageView: number,
  onPagination: (newPage: number) => void,
  onLastRoundView: (isCurrent?: boolean) => void,
  rowsPerPage:number,
  isInView: boolean,
}

{/* History table props and formatting */}
const History = (props: HistoryViewProps) => {
  const { currentPageView, onPagination, rowsPerPage, isInView, onLastRoundView } = props

  // BLOCKCHAIN
  const { account, chainId } = useWeb3React()
  const lotteryContract = getContracts('lottery', chainId)
  const { methods: lotteryMethods } = useContract( lotteryContract.abi, lotteryContract.address )
  const { editTransactions } = useTransactionContext()

  // STATE
  const [ currentRound, setCurrentRound ] = useState<string>('0')
  const [ history, setHistory ] = useImmer<Array< RoundInfo&{id: string} | null >>(new Array(4).fill(null))
  const [ loadingHistory, setLoadingHistory ] = useState<boolean>(false)
  const [ selectedRound, setSelectedRound ] = useState<number | null>(null)

  const getRoundData = useCallback( async (roundId: string) => {
    if(!lotteryMethods) return
    const roundInfo = await lotteryMethods.roundInfo(roundId).call()
    const roundBonus = await lotteryMethods.bonusCoins(roundId).call()
    const userTickets = !account ? [] : await lotteryMethods.getRoundTickets(roundId).call({from: account})
    setHistory( draft => {
      const modRound = new BigNumber(roundId).mod(rowsPerPage).toNumber()
      const roundToChange = modRound > 0 ? modRound - 1 : 3
      draft[roundToChange] = {
        ...roundInfo,
        bonusInfo: roundBonus,
        userTickets,
        id: roundId
      }
    })
  },[lotteryMethods, account, setHistory, rowsPerPage])

  const getCurrentRound = useCallback(async () => {
    if(!lotteryMethods) return
    const currentRound = new BigNumber(await lotteryMethods.currentRound().call())
    setCurrentRound(currentRound.toString())
    const roundFetchStart = currentRound.minus(3).isGreaterThan(0) 
      ? ( 
          currentRound.mod(rowsPerPage).isEqualTo(0)
            ? currentRound.minus( rowsPerPage )
            : currentRound.minus( currentRound.mod(rowsPerPage) )
        )
      : new BigNumber(0)

    for(let initRound = roundFetchStart; currentRound.isGreaterThanOrEqualTo(initRound) ; initRound = initRound.plus(1)){
      getRoundData(initRound.toString())
    }
  },[lotteryMethods, setCurrentRound, getRoundData, rowsPerPage])

  const onRoundView = useCallback( (selectedRound: number) => {
    if(new BigNumber(selectedRound).isEqualTo( currentRound ))
      onLastRoundView(true)
    else if(new BigNumber(selectedRound).isEqualTo( new BigNumber(currentRound).minus(1) ))
      onLastRoundView()
    else
      setSelectedRound(selectedRound)
  },[setSelectedRound, currentRound, onLastRoundView])

  // EFFECTS
  useEffect( () => {
    if(!lotteryMethods)  return
    getCurrentRound()
  },[lotteryMethods, getCurrentRound])


  const pagination = useCallback( ( newPage: number ) => {
    setLoadingHistory(true)
    const promises: Array<Promise<void>> = []
    for(let i = newPage*4 + 1; i<= (newPage+1)*4; i++)
      promises.push( getRoundData(`${i}`))
    Promise.all(promises)
      .finally( () => {
        setLoadingHistory(false)
        onPagination(newPage)
      })
  },[onPagination, getRoundData])


  {/*History table rows data formatting*/}
  const tableRows = history.map( (roundInfo, index) => {
    if(!roundInfo)
      return <TableRow key={`roundData-${index}-nullValue`}>
        <TableCell colSpan={5}>
          -
        </TableCell>
      </TableRow> 
    return <TableRow key={`roundData-${index}-${roundInfo.id}`}>
      <TableCell align='center'>{roundInfo.id}</TableCell>
      <TableCell align='center'>
        { format(new Date( new BigNumber(roundInfo.endTime).times(1000).toNumber()), 'yyyy-MMM-dd HHaa')}
      </TableCell>
      <TableCell 
        align ="center">{roundInfo.totalTickets}
      </TableCell>
      <TableCell align ="center">
        <Stack direction="row" justifyContent="center" alignItems="center">
          <div>
            {(roundInfo.userTickets || []).length}
          </div>
          <div>
            <IconButton color="primary" onClick={() => onRoundView(+roundInfo.id)} sx={{ml: 0.5}}>
              <RemoveRedEyeIcon/>
            </IconButton>
          </div>

        </Stack>
      </TableCell>
      <TableCell align="center">
        {/* { parseInt(roundInfo.bonusInfo?.bonusAmount || '0',16) || '-'} */}
        {
         new BigNumber(roundInfo.bonusInfo?.bonusAmount || 0).isGreaterThan(0) ? new BigNumber(roundInfo.bonusInfo?.bonusAmount || '0').div(10**18).toFixed(2) : '-'
        }
        &nbsp;
        {partnerTokens[roundInfo.bonusInfo?.bonusToken.toLowerCase() || '']?.name ?? ''}
      </TableCell>
   
    </TableRow>
  })

  if(!isInView)
    return null
  {/*Building the table with header*/}
  if(typeof(selectedRound) == 'number'){
    const roundSel = selectedRound%rowsPerPage > 0 ? selectedRound%rowsPerPage : 3
    const roundToView = history[roundSel]
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
        <TableCell align="center">Round</TableCell>
        <TableCell align="center">Played</TableCell>
        <TableCell align="center">Total Squads</TableCell>
        <TableCell align="center">Your Squads</TableCell>
        <TableCell align="center">Partner</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      { currentRound 
        ? <>
          {tableRows}
          <TableRow sx={{ position:"relative"}}>
            {loadingHistory && <TableCell>
              <CircularProgress thickness={5} size={30} sx={{position:'absolute', top: 10, right: 200}}/>
            </TableCell>
            }
            <TablePagination rowsPerPageOptions={[]} rowsPerPage={rowsPerPage} count={parseInt(currentRound) || 1} page={currentPageView} onPageChange={(e,p) => pagination(p)}/>
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