import { useState } from 'react'
// Material
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
//Bitcrush UI
import Card from 'components/basics/Card'
import History from 'components/lottery/LotteryViews/History'
import Current from 'components/lottery/LotteryViews/Current'


const LotteryHistory = () => {
    const [tabSelected, setTabSelected] = useState<number>(0)
    const [selectedPage, setSelectedPage] = useState<number>(1)

    const shownHistoryRounds = testHistoryArray.slice(selectedPage * 5, selectedPage*5 + 5 )
    const selectTab = ( e:React.SyntheticEvent, v: number) =>{
        setTabSelected(v)
    }

    return <>
    {/*Tab changer*/}
    <Tabs value={tabSelected} onChange={selectTab} indicatorColor="secondary" textColor="inherit">
        <Tab label={<Typography variant="body1">CURRENT</Typography>}/>
        <Tab label={<Typography variant="body1">HISTORY</Typography>}/>
        
    </Tabs>
    {/* History Content */}
    <Card background="light" shadow="primary" sx={{p: 3}}>
        {tabSelected == 0 && <Current/>}
        {tabSelected == 1 && <History rounds={shownHistoryRounds}  totalRounds={testHistoryArray.length} currentPageView={selectedPage} onPagination={(p) => setSelectedPage(p)}/>}
    </Card>
    </>
}
export default LotteryHistory

const testHistoryArray=[
    {id: 1, date: new Date(), totalTickets: 1000, userTickets: 3},
    {id: 2, date: new Date(), totalTickets: 1000, userTickets: 3},
    {id: 3, date: new Date(), totalTickets: 1000, userTickets: 3},
    {id: 4, date: new Date(), totalTickets: 1000, userTickets: 3},
    {id: 5, date: new Date(), totalTickets: 1000, userTickets: 3},
    {id: 6, date: new Date(), totalTickets: 1000, userTickets: 3},
    {id: 7, date: new Date(), totalTickets: 1000, userTickets: 3},
]
