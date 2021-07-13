import { useState, useEffect, useCallback, useMemo } from "react"
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
// libs
import { currencyFormat } from 'utils/text/text'
import { useWeb3React } from "@web3-react/core"
import { useContract } from "hooks/web3Hooks"
// Context
import { useTransactionContext } from "hooks/contextHooks"
// data
import { getContracts } from "data/contracts"
import BigNumber from 'bignumber.js'

const CompoundingCard = (props: CompoundingCardProps ) => {

  const css = useStyles({})

  const { chainId, account } = useWeb3React()

  const { tokenInfo, editTransactions } = useTransactionContext()
  const stakeContract = getContracts('singleAsset', chainId )
  const { methods } = useContract( stakeContract.abi, stakeContract.address )
  const [rewardToDistribute, setRewardToDistribute ] = useState<BigNumber>( new BigNumber(0) )
  const [hydrate, setHydrate] = useState<boolean>(false)
  
  const toggleHydrate = useCallback(() => setHydrate(p => !p) ,[setHydrate])
  
  useEffect(() => {
    if(!methods) return
    async function getRewards(){
      const totalPool = await methods.totalPool().call()
      const totalPending = await methods.totalPendingRewards().call()
      const claimFee = await methods.performanceFeeCompounder().call()
      const divisor = 10000
      if( new BigNumber(totalPool).isLessThanOrEqualTo(0) )
        setRewardToDistribute( new BigNumber(0) )
      else 
        setRewardToDistribute( new BigNumber(totalPending).times(claimFee).div(divisor)  )
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
      .on('transactionHash', tx => editTransactions(tx, 'pending', { description: "Execute Auto Compound" }))
      .on('receipt', rct =>{
        editTransactions(rct.transactionHash, 'complete')
        console.log('receipt', rct)
      })
      .on('error', (error, rct) => {
        console.log('error compounding', error, 'receipt', rct)
        rct?.transactionHash && editTransactions(rct.transactionHash, 'error')
      } )
  }

  return <Card background="light" shadow="dark" className={ css.claimCard } >
    <CardContent className={ css.cardContent }>
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <Typography className={ css.cardTitle }>
            CRUSH Auto Bounty
          </Typography>
        </Grid>
        <Grid item>
          <Tooltip
            arrow
            title={
              <Typography variant="body2" style={{ whiteSpace: 'pre-line', margin: 8}}>
                This bounty is given as a reward for prividing a service to other users.{'\n\n'}
                Whenever you successfully claim the bounty, you&apos;re also helping out by activating the Auto CRUSH Pool&apos;s compounding function for everyone.{'\n\n'}
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
            {rewardToDistribute.div( new BigNumber(10).pow(18) ).toFixed(18)}
          </Typography>} arrow>
            <Typography color="primary" variant="h5" component="p">
              {currencyFormat(rewardToDistribute.toNumber(), { decimalsToShow: 4, isWei: true })}
            </Typography>
          </Tooltip>
          <Typography color="textSecondary" variant="caption" component="p">
            $&nbsp;{currencyFormat(usdReward.toNumber(), { decimalsToShow: 2, isWei: true })}
          </Typography>
        </Grid>
        <Grid item>
          <Button size="small" width={80} color="primary" onClick={claim} disabled={!methods || !account}>
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