import { useState, useEffect, useCallback, useMemo } from "react"
// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import Checkbox from '@material-ui/core/Checkbox'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import FormControlLabel from "@material-ui/core/FormControlLabel"
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
  const stakeContract = getContracts('bankStaking', chainId )
  const { methods } = useContract( stakeContract.abi, stakeContract.address )
  const [rewardToDistribute, setRewardToDistribute ] = useState<BigNumber>( new BigNumber(0) )
  const [hydrate, setHydrate] = useState<boolean>(false)

  const [ showWarning, setShowWarning ] = useState<boolean>(false)
  
  const toggleHydrate = useCallback(() => setHydrate(p => !p) ,[setHydrate])

  const getRewards = useCallback( async () => {
    return fetch('/api/contracts/compounderCalculator',{
      method: "POST",
      body: JSON.stringify({
        chain: chainId
      })
    })
      .then( res => res.json() )
      .then( data => {
        setRewardToDistribute( new BigNumber(data.compounderBounty) )
      })
      .catch( e => {
        console.log(e)
        setRewardToDistribute( new BigNumber(0) )
      })
      .finally( () => setTimeout( toggleHydrate, 5000 ) )

  },[chainId, setRewardToDistribute, toggleHydrate])
  
  useEffect(() => {
    getRewards()
  },[hydrate, getRewards])

  const usdReward = rewardToDistribute.times(tokenInfo?.crushUsdPrice || 0)
  console.log( usdReward, usdReward.toNumber(), rewardToDistribute.toNumber(), tokenInfo.crushUsdPrice )
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

  return <>
  <Card background="light" shadow="dark" className={ css.claimCard } >
    <CardContent className={ css.cardContent }>
      <Grid container justifyContent="space-between" alignItems="center">
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
                This bounty is given as a reward for providing a service to other users.{'\n\n'}
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
            {rewardToDistribute.toFixed(18)}
          </Typography>} arrow>
            <Typography color="primary" variant="h5" component="p">
              {currencyFormat(rewardToDistribute.toNumber(), { decimalsToShow: 4, isWei: false })}
            </Typography>
          </Tooltip>
          <Typography color="textSecondary" variant="caption" component="p">
            $&nbsp;{currencyFormat(usdReward.toNumber(), { decimalsToShow: 2, isWei: false })}
          </Typography>
        </Grid>
        <Grid item>
          <Button size="small" width={80} color="primary" onClick={claim} disabled={!methods || !account }>
            Claim
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
  </>
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
    [theme.breakpoints.down(888)]:{
      marginTop: theme.spacing(4)
    },
    width: 280,
  },
}))