// Material
import Typography from '@material-ui/core/Typography'
import CardContent from '@material-ui/core/CardContent'
// Bitcrush Components
import PageContainer from 'components/PageContainer'
import Card from 'components/basics/Card'

export default function Home() {


  return (
    <div>
      <PageContainer >
          <Typography variant="h3" align="center" component="h1">
            <Typography variant="caption" component="p">
              THE FIRST
            </Typography>
            HYBRID CASINO
            <Typography variant="caption" component="p">
              ON BSC
            </Typography>
          </Typography>
          <Card style={{ width: '100%'}}>
            <CardContent>

              <Typography>
                card here
              </Typography>
            </CardContent>
          </Card>
      </PageContainer>
    </div>
  )
}
