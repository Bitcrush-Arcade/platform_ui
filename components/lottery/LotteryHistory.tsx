import { useState, useMemo } from 'react'
import BigNumber from 'bignumber.js'
// Material
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
//Bitcrush UI
import Card from 'components/basics/Card';
import Current from 'components/lottery/LotteryViews/Current';
import History from 'components/lottery/LotteryViews/History';
import HowToPlay from 'components/lottery/LotteryViews/HowToPlay'
import LastRound from 'components/lottery/LotteryViews/LastRound';

// Types
import { RoundInfo, TicketInfo } from 'types/lottery'

type LotteryHistoryProps = {
    currentRound: number,
    visibleRounds?: Array<{id: number, date: Date, totalTickets: number, userTickets: number, token: string}>,
    currentTickets?: Array<TicketInfo> | null,
    currentInfo?: RoundInfo | null;
    lastRound?: RoundInfo | null;
    tabChange: (newTab: number) => void,
    selectTicket: (ticketNumber: string, claimed: boolean, roundNumber: number, instaClaim?:boolean ) => void;
    claimAll: (round: number) => void;
}

const LotteryHistory = (props: LotteryHistoryProps) => {
    const { currentTickets, tabChange, selectTicket, currentRound, lastRound, currentInfo,claimAll } = props
    const [tabSelected, setTabSelected] = useState<number>(0)
    const [selectedPage, setSelectedPage] = useState<number>(0)
    const roundsPerPage = 4

    const shownHistoryRounds = testHistoryArray.slice(selectedPage * roundsPerPage, (selectedPage + 1)*roundsPerPage)
    const selectTab = ( e:any, v: number) =>{
        setTabSelected(v)
        tabChange(v)
    }

    const parsedCurrentTickets = useMemo( () => {
        if(!currentInfo?.userTickets) return []
        return currentInfo?.userTickets.map( (ticket) => ticket.ticketNumber )
    },[currentInfo?.userTickets])

    return <>
    
    <Grid container justifyContent="space-between" alignItems="flex-end">
        <Grid item sx={{pl:1.5, pb: 1}}>
                {/*Tab changer*/}
                <Tabs value={tabSelected} onChange={selectTab} indicatorColor="secondary" textColor="inherit">
                    <Tab
                        label={
                            <Typography color='white' variant="body1" sx={{ typography: { xs: 'body2', sm: 'body1'} }}>
                                CURRENT
                            </Typography>
                        }
                    />
                    <Tab
                        label={
                            <Typography color='white' variant="body1" sx={{ typography: { xs: 'body2', sm: 'body1'} }} >
                                LAST ROUND
                            </Typography>
                        }
                        disabled={!currentRound || currentRound == 1}
                    />
                    <Tab
                        label={
                            <Typography color='white' variant="body1" sx={{ typography: { xs: 'body2', sm: 'body1'} }}>
                                HISTORY
                            </Typography>
                        }
                        disabled={!currentRound || currentRound == 1}
                    />
                    <Tab
                        label={
                            <Typography color='white' variant="body1" sx={{ typography: { xs: 'body2', sm: 'body1'} }}>
                                HOW TO PLAY
                            </Typography>
                        }
                    />
                    
                </Tabs>
        </Grid>
    </Grid>
        
    {/* History Content */}
    <Card background="light" shadow="primary" sx={{p: 3}}>
        {tabSelected == 0 &&
            <Current
                tickets={currentInfo && parsedCurrentTickets}
                currentDate={currentInfo ? new BigNumber(currentInfo.endTime).toNumber() : 0 }
                totalTickets={currentInfo ? new BigNumber(currentInfo.totalTickets).toNumber() : 0}
                currentRound={currentRound}
            />
        }
        {tabSelected == 1 && lastRound && 
            <LastRound winningTeamTicket={lastRound.winnerNumber} 
                tickets={lastRound.userTickets || []}
                lastDate={ new BigNumber(lastRound.endTime).toNumber()} 
                selectTicket={selectTicket} 
                lastRound={`${currentRound -1}`}
                token={lastRound.bonusInfo?.bonusToken}
                tokenAmount={lastRound.bonusInfo?.bonusAmount}
                globalTickets={new BigNumber(lastRound.totalTickets).toNumber()}
            />
        } 
        
        <History rounds={shownHistoryRounds}
            totalRounds={testHistoryArray.length} 
            currentPageView={selectedPage} 
            onPagination={(p) => setSelectedPage(p)}
            rowsPerPage={roundsPerPage}
            onLastRoundView={ (isCurrent) => selectTab(null, isCurrent ? 0 :  1)}
            isInView={tabSelected == 2}
        />
        {tabSelected == 3 &&
            <HowToPlay/>
        }
        
    </Card>
    </>
}
export default LotteryHistory

const testHistoryArray=[
    {id: 1, date: new Date(), totalTickets: 1000, userTickets: 3, tokenAmount: 5000, token: 'KNIGHT'},
    {id: 2, date: new Date(), totalTickets: 1000, userTickets: 3, tokenAmount: 5000, token: 'KNIGHT'},
    {id: 3, date: new Date(), totalTickets: 1000, userTickets: 3, tokenAmount: 5000, token: 'KNIGHT'},
    {id: 4, date: new Date(), totalTickets: 1000, userTickets: 3, tokenAmount: 5000, token: 'KNIGHT'},
    {id: 5, date: new Date(), totalTickets: 1000, userTickets: 3, tokenAmount: 5000, token: 'KNIGHT'},
    {id: 6, date: new Date(), totalTickets: 1000, userTickets: 3, tokenAmount: 5000, token: 'KNIGHT'},
    {id: 7, date: new Date(), totalTickets: 1000, userTickets: 3, tokenAmount: 5000, token: 'KNIGHT'},
]
const testCurrentArray=[
    '1123456',
    '1123456',
    '1123456',
    '1123456',
    '1123456',
    '1123456',
    '1123456',
    '1123456',
    '1123456',
    '1123456',
    '1123456',
]
const testLastArray=[
    {ticketNumber: '1123456', claimed: false},
    {ticketNumber: '1361535', claimed: false},
    {ticketNumber: '1371535', claimed: false},
    {ticketNumber: '1372535', claimed: false},
    {ticketNumber: '1372635', claimed: false},
    {ticketNumber: '1372645', claimed: false},
    {ticketNumber: '1372646', claimed: false},
    {ticketNumber: '1123456', claimed: false},
    {ticketNumber: '1123456', claimed: false},
    {ticketNumber: '1123456', claimed: false},
    {ticketNumber: '1123456', claimed: false},
]

const winningTestTicket="1456789"

const lastRoundToken = "KNIGHT"
const lastRoundTokenAmount =5000
const globalTicketsTest = 12408
