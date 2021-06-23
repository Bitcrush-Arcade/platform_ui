import { useState, useEffect, useContext, useCallback, useMemo } from "react"
// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import CardContent from "@material-ui/core/CardContent"
import Tooltip from "@material-ui/core/Tooltip"
// Icons
import InfoIcon from '@material-ui/icons/InfoOutlined';
// Bitcrush
import Button from 'components/basics/GeneralUseButton'
import Card from 'components/basics/Card'
import { TransactionContext } from "components/context/TransactionContext"
// libs
import { currencyFormat } from 'utils/text/text'
import { useWeb3React } from "@web3-react/core"
import { useContract } from "hooks/web3Hooks"
// data
import { getContracts } from "data/contracts"
import BigNumber from 'bignumber.js'

const CompoundingCard = (props: CompoundingCardProps ) => {

  const css = useStyles({})

  const { chainId, account } = useWeb3React()

  const { tokenInfo, editTransactions } = useContext( TransactionContext )
  const stakeContract = getContracts('singleAsset', chainId )
  const { methods } = useContract( stakeContract.abi, stakeContract.address )
  const [rewardToDistribute, setRewardToDistribute ] = useState<BigNumber>( new BigNumber(0) )
  const [hydrate, setHydrate] = useState<boolean>(false)
  
  const toggleHydrate = useCallback(() => setHydrate(p => !p) ,[setHydrate])
  
  useEffect(() => {
    if(!methods) return
    async function getRewards(){
      const totalPending = await methods.totalPendingRewards().call()
      const claimFee = await methods.PerformanceFeeCompounder().call()
      setRewardToDistribute( new BigNumber(totalPending).times(claimFee).div(1000)  )
    }
    getRewards()
  },[hydrate,methods])

  useEffect( () => {
    const hydrateInterval = setInterval( toggleHydrate, 5000 )
    return () => clearInterval(hydrateInterval)
  },[setHydrate, toggleHydrate])

  const usdReward = useMemo( () => {
    return rewardToDistribute.times(tokenInfo.crushUsdPrice)
  }, [rewardToDistribute, tokenInfo])

  const claim = () => {
    methods.compoundAll().send({ from: account })
      .on('transactionHash', tx => editTransactions(tx, 'pending'))
      .on('receipt', rct => editTransactions(rct.transactionHash, 'complete'))
      .on('error', (error, rct) => {
        console.log('error compounding', error)
        rct?.transactionHash && editTransactions(rct.transactionHash, 'error')
      } )
  }

  return <Card background="light" shadow="dark" className={ css.claimCard } >
    <CardContent className={ css.cardContent }>
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <Typography className={ css.cardTitle }>
            House Profit Distribution
          </Typography>
        </Grid>
        <Grid item>
          <Tooltip
            arrow
            title={
              <Typography variant="body2" style={{ whiteSpace: 'pre-line', margin: 8}}>
                This bounty is given as a reward for prividing a service to other users.{'\n\n'}
                Whenever you successfully claim the bounty, you're also helping out by activating the Auto CRUSH Pool's compounding function for everyone.{'\n\n'}
                <strong>
                  Auto-compound Bounty of 0.1% of all Auto CRUSH pool users pending yield.
                </strong>
              </Typography>
            }
          >
            <InfoIcon color="disabled"/>
          </Tooltip>
        </Grid>
        <Grid item xs={12} style={{height: 16}}/>
        <Grid item>
          <Tooltip title={<Typography>
            {rewardToDistribute.toFixed()}
          </Typography>} arrow>
            <Typography color="primary" variant="h5" component="p">
              {currencyFormat(rewardToDistribute.toNumber(), { decimalsToShow: 4 })}
            </Typography>
          </Tooltip>
          <Typography color="textSecondary" variant="caption" component="p">
            $&nbsp;{currencyFormat(usdReward.toNumber(), { decimalsToShow: 2 })}
          </Typography>
        </Grid>
        <Grid item>
          <Button size="small" width={80} color="primary" onClick={claim}>
            Claim
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
}

export default CompoundingCard

type CompoundingCardProps = {

}

const useStyles = makeStyles<Theme>( theme => createStyles({
  cardTitle:{
    fontWeight: 'bold'
  },
  cardContent:{
    padding: theme.spacing(3)
  },
  claimCard:{
    [theme.breakpoints.down('sm')]:{
      marginTop: theme.spacing(4)
    },
    width: 280,
  },
}))