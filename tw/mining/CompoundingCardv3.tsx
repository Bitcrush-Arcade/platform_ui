import { useEffect } from "react"
// Material
import { Theme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import CardContent from "@mui/material/CardContent"
import Tooltip from "@mui/material/Tooltip"
// Icons
import InfoIcon from '@mui/icons-material/InfoOutlined';
// Bitcrush
import Button from 'components/basics/GeneralUseButton'
import Card from 'components/basics/Card'
import Currency from 'components/basics/Currency'
// libs
import { currencyFormat } from 'utils/text/text'
import { useWeb3React } from "@web3-react/core"
import useCalculator from 'hooks/compounder/useCalculator'
// Context
import { useTransactionContext } from "hooks/contextHooks"
import { Receipt } from "types/PromiEvent";

const CompoundingCard = (props: CompoundingCardProps) => {

  const css = useStyles({})

  const { account } = useWeb3React()

  const { tokenInfo, editTransactions } = useTransactionContext()
  const { compounderReward, calculate, contractMethods } = useCalculator()

  const usdReward = compounderReward.times(tokenInfo?.crushUsdPrice || 0)

  const claim = () => {
    contractMethods.compoundAll().send({ from: account })
      .on('transactionHash', (tx: string) => editTransactions(tx, 'pending', { description: "Execute Auto Compound" }))
      .on('receipt', (rct: Receipt) => {
        editTransactions(rct.transactionHash, 'complete')
        console.log('receipt', rct)
        calculate()
      })
      .on('error', (error: any, rct: Receipt) => {
        console.log('error compounding', error, 'receipt', rct)
        rct?.transactionHash && editTransactions(rct.transactionHash, 'error')
        calculate()
      })
  }

  useEffect(() => {
    const interval = setInterval(calculate, 10000)
    return () => {
      clearInterval(interval)
    }
  }, [calculate])

  return <>
    <Card background="light" shadow="dark" className={css.claimCard} >
      <CardContent className={css.cardContent}>

        <div className="relative flex text-center justify-center text-md font-bold whitespace-pre-line">
          CRUSH &amp; NICE {'\n'} Auto Bounty
          <div className="absolute top-0 right-0">
            <Tooltip
              arrow
              title={
                <Typography variant="body2" style={{ whiteSpace: 'pre-line', margin: 8 }}>
                  This bounty is given as a reward for providing a service to other users.{'\n\n'}
                  Whenever you successfully claim the bounty, you&apos;re also helping out by activating the Auto CRUSH Pool&apos;s compounding function for everyone.{'\n\n'}
                  <strong>
                    Auto-compound Bounty of 0.1% of all Auto CRUSH pool users pending yield.
                  </strong>
                </Typography>
              }
            >
              <InfoIcon color="disabled" />
            </Tooltip>
          </div>
        </div>
        <div className="flex flex-row justify-center gap-12 my-4">
          <div className="flex flex-col">
            <Tooltip title={<Typography>
              <Currency value={compounderReward} decimals={18} isWei />&nbsp;CRUSH
            </Typography>} arrow>
              <Typography color="primary" variant="h5" component="p">
                <Currency value={compounderReward} decimals={4} isWei />
              </Typography>
            </Tooltip>
            <Typography color="textSecondary" variant="caption" component="p">
              $&nbsp;<Currency value={usdReward} decimals={2} isWei />
            </Typography>
          </div>
          <div className="flex flex-col">
            <Tooltip title={<Typography>
              <Currency value={compounderReward} decimals={18} isWei />&nbsp;CRUSH
            </Typography>} arrow>
              <Typography color="primary" variant="h5" component="p">
                <Currency value={compounderReward} decimals={4} isWei />
              </Typography>
            </Tooltip>
            <Typography color="textSecondary" variant="caption" component="p">
              $&nbsp;<Currency value={usdReward} decimals={2} isWei />
            </Typography>
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <Button size="small" width={80} color="primary" onClick={claim} disabled={!contractMethods || !account}>
            Claim All
          </Button>
        </div>
      </CardContent>
    </Card>
  </>
}

export default CompoundingCard

type CompoundingCardProps = {

}

const useStyles = makeStyles<Theme>(theme => createStyles({
  cardTitle: {
    fontWeight: 'bold'
  },
  cardContent: {
    padding: theme.spacing(3)
  },
  claimCard: {
    [theme.breakpoints.down(888)]: {
      marginTop: theme.spacing(4)
    },
    width: 280,
  },
}))