import { useState, useMemo } from 'react'
// Material
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
//Bitcrush UI
import BasicButton from 'components/basics/GeneralUseButton';
import Card from 'components/basics/Card';
import Current from 'components/lottery/LotteryViews/Current';
import History from 'components/lottery/LotteryViews/History';
import LastRound from 'components/lottery/LotteryViews/LastRound';



type LotteryHistoryProps = {
    currentRound: number,
    visibleRounds?: Array<{id: number, date: Date, totalTickets: number, userTickets: number, token: string}>,
    currentTickets?: Array<{ticketNumber: string, claimed: boolean}> | null,
    lastArray?: Array<{ticket: string, claimed: boolean}>,
    lastWinner?: string,
    tabChange: (newTab: number) => void,
    selectTicket: (ticketNumber: string, claimed: boolean, roundNumber: number, instaClaim?:boolean ) => void;
}

const LotteryHistory = (props: LotteryHistoryProps) => {
    const { currentTickets, tabChange, selectTicket, currentRound } = props
    const [tabSelected, setTabSelected] = useState<number>(0)
    const [selectedPage, setSelectedPage] = useState<number>(1)
    const roundsPerPage = 4

    const shownHistoryRounds = testHistoryArray.slice(selectedPage * roundsPerPage, (selectedPage + 1)*roundsPerPage)
    const selectTab = ( e:React.SyntheticEvent, v: number) =>{
        setTabSelected(v)
        tabChange(v)
    }

    const parsedCurrentTickets = useMemo( () => {
        if(!currentTickets) return []
        return currentTickets.map( (ticket) => ticket.ticketNumber )
    },[currentTickets])

    return <>
    
    <Grid container justifyContent="space-between" alignItems="flex-end">
        <Grid item sx={{pl:1.5, pb: 1}}>
            
                {/*Tab changer*/}
                <Tabs value={tabSelected} onChange={selectTab} indicatorColor="secondary" textColor="inherit">
                    <Tab label={<Typography variant="body1">CURRENT</Typography>}/>
                    <Tab label={<Typography variant="body1">LAST ROUND</Typography>}/>
                    <Tab label={<Typography variant="body1">HISTORY</Typography>}/>
                    
                </Tabs>
        </Grid>
    </Grid>
        
    {/* History Content */}
    <Card background="light" shadow="primary" sx={{p: 3}}>
        {tabSelected == 0 && <Current tickets={ currentTickets && parsedCurrentTickets}/>}
        {tabSelected == 1 && <LastRound winningTeamTicket={winningTestTicket} tickets={testLastArray} lastDate={ new Date().getTime() - (3600*24*1000)} selectTicket={selectTicket} currentRound={currentRound}/>} 
        {tabSelected == 2 &&   
            <History rounds={shownHistoryRounds}
                totalRounds={testHistoryArray.length} 
                currentPageView={selectedPage} 
                onPagination={(p) => setSelectedPage(p)}
                rowsPerPage={roundsPerPage}
                onRoundView={(round) => console.log('selected Round ', round)}
            />
        }
    </Card>
    </>
}
export default LotteryHistory

const testHistoryArray=[
    {id: 1, date: new Date(), totalTickets: 1000, userTickets: 3, token: 'KNIGHT'},
    {id: 2, date: new Date(), totalTickets: 1000, userTickets: 3, token: 'KNIGHT'},
    {id: 3, date: new Date(), totalTickets: 1000, userTickets: 3, token: 'KNIGHT'},
    {id: 4, date: new Date(), totalTickets: 1000, userTickets: 3, token: 'KNIGHT'},
    {id: 5, date: new Date(), totalTickets: 1000, userTickets: 3, token: 'KNIGHT'},
    {id: 6, date: new Date(), totalTickets: 1000, userTickets: 3, token: 'KNIGHT'},
    {id: 7, date: new Date(), totalTickets: 1000, userTickets: 3, token: 'KNIGHT'},
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
    {ticket: '1123456', claimed: false},
    {ticket: '1123456', claimed: false},
    {ticket: '1123456', claimed: false},
    {ticket: '1123456', claimed: false},
    {ticket: '1123456', claimed: false},
    {ticket: '1123456', claimed: false},
    {ticket: '1123456', claimed: false},
    {ticket: '1123456', claimed: false},
    {ticket: '1123456', claimed: false},
    {ticket: '1123456', claimed: false},
    {ticket: '1123456', claimed: false},
]

const winningTestTicket="1456789"
