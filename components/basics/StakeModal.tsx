import { Fragment, ReactNode } from 'react'
import { Formik, Form, Field } from 'formik'
import { TextField } from 'formik-material-ui'
import BigNumber from 'bignumber.js'
// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import MButton from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import Skeleton from "@material-ui/lab/Skeleton"
import Slider from "@material-ui/core/Slider"
import Tooltip from '@material-ui/core/Tooltip'
import Typography from "@material-ui/core/Typography"
// Icons
import InfoIcon from '@material-ui/icons/InfoOutlined';

// Bitcrush
import Button from 'components/basics/GeneralUseButton'
import Card from 'components/basics/Card'
import SmallButton from 'components/basics/SmallButton'
// Icons
import InvaderIcon from 'components/svg/InvaderIcon'
// libs
import { fromWei } from 'web3-utils'
import { currencyFormat } from 'utils/text/text'

/**
  * @param maxValue Make sure this is always in WEI!! 10^18
 */
export type StakeOptionsType = {
  name: string,
  maxValue: BigNumber | number ,
  btnText: string,
  description: string,
  onSelectOption?: () => void,
  more?: (values: FormValues) => ReactNode,
  disableAction?: boolean,
}

export type FormValues = { stakeAmount: BigNumber, actionType: number }

export type SubmitFunction = ( values : FormValues, second: { setSubmitting: (newSubmit: boolean) => void } ) => void

export type StakeModalProps = {
  open: boolean,
  initAction?: number,
  onClose: () => void,
  options: Array<StakeOptionsType>,
  onSubmit: SubmitFunction,
  needsApprove?: boolean,
  coinInfo?: { symbol: string, name: string, decimals?: number },
  onApprove?: () => void,
  onActionSelected?: (actionType: number) => void,
}

BigNumber.config({ ROUNDING_MODE: 1})

function StakeModal( props: StakeModalProps ) {
  const {open, onClose, options, onSubmit, coinInfo, needsApprove, onApprove, onActionSelected, initAction} = props
  const css = useStyles({})

  const InfoText = () => {
    return <>
      {options.map( (option, opIdx) => <Typography key={`option-description-tooltip-${opIdx}-${option.name}`} paragraph>
        <strong>{option.name}:</strong>&nbsp;{option.description}
      </Typography>)}
    </>
  }
  return (
    <Dialog 
      PaperComponent={FormComponent}
      open={open}
      onClose={ onClose }
    >
      <Formik
        initialValues = {{
          stakeAmount: new BigNumber(0),
          actionType: initAction || 0
        }}
        onSubmit={ (vals, ops) => needsApprove ? onApprove && onApprove() : onSubmit(vals,ops)}
        validate ={ ( values ) => {
          let errors: any = {}
          const bigValue = new BigNumber(values.stakeAmount)
          const maxValue = new BigNumber( options[values.actionType].maxValue ).div( new BigNumber(10).pow(18) )
          if( bigValue.isGreaterThan( maxValue ) )
            errors.stakeAmount = "Insufficient Funds"
          if( bigValue.isLessThanOrEqualTo( 0 ) )
            errors.stakeAmount = "Invalid Input"
          return errors
        }}
        validateOnChange
      >
      { ({values, setFieldValue, isSubmitting, errors}) =>{
        const { actionType, stakeAmount } = values
        const {maxValue: maxUsed, disableAction} = options[actionType]
        const percent = new BigNumber( stakeAmount ).div( new BigNumber(maxUsed).div( new BigNumber(10).pow(coinInfo?.decimals || 18 ) ) ).times(100)
        const hasErrors = Object.keys( errors ).length > 0
        const sliderChange = (e: any, value: number) => {
          const newValue = value === 100 ? maxUsed : new BigNumber(value).times( maxUsed ).div(100)
          setFieldValue('stakeAmount', new BigNumber(newValue).div( new BigNumber(10).pow(coinInfo?.decimals || 18 ) ) )
        }
        const switchAction = (stakeActionValue: number) => {
          setFieldValue('actionType', stakeActionValue )
          setFieldValue('stakeAmount', 0 )
          options[stakeActionValue]?.onSelectOption && options[stakeActionValue]?.onSelectOption()
          onActionSelected && onActionSelected( stakeActionValue )
        }
        const maxUsedAvailable = maxUsed ?? false
        const isMaxAvailable = typeof(maxUsedAvailable) !== 'boolean'

        return(<Form>
          <Grid container className={ css.stakeActionBtnContainer } alignItems="center">
            {options.map((option, index) => {
              const { name, btnText, maxValue } = option
              return <Fragment key={`stake-option-${btnText}-${index}`}>
                { index > 0 && 
                  <Grid item>
                    <Divider orientation="vertical"/>
                  </Grid>
                }
                <Grid item>
                  <MButton className={ css.stakeActionBtn } color={ actionType == index ? "secondary" : "default"} onClick={() => switchAction(index)} disabled={ maxValue <=0 }>
                    {name}
                  </MButton>
                </Grid>
              </Fragment>
            })}
            <Grid item>
              <Tooltip 
                title={<InfoText/>}
              >
                <InfoIcon color="action" fontSize="small"/>
              </Tooltip>
            </Grid>
          </Grid>
          <Typography variant="body2" color="textSecondary" component="div" align="right" className={ css.currentTokenText }>
            {options[actionType].btnText} {coinInfo?.symbol}: {isMaxAvailable ? currencyFormat( maxUsed?.toString() || 0, { isWei: true }) : <Skeleton/>}
          </Typography>
          <Field
            type="number"
            fullWidth
            label={actionType ? 'Withdraw Amount' : `Stake Amount`}
            id="stakeAmount"
            name="stakeAmount"
            placeholder="0.00"
            variant="outlined"
            component={TextField}
            InputProps={{
              endAdornment: <MButton color="secondary" onClick={ () => sliderChange(null, 100)}>
                MAX
              </MButton>,
              className: css.textField,
              onFocus: e => e.target.select()
            }}
          />
          <div className={ css.sliderContainer }>
            <Slider
              value={ isNaN(percent.toNumber()) ? 0 : percent.toNumber() }
              onChange={sliderChange}
              step={ 10 }
              ThumbComponent={p => <InvaderThumb thumbProps={p} percent={percent}/>}
              valueLabelDisplay="on"
            />
          </div>
          <Grid container justifyContent="space-evenly">
            <SmallButton color="primary" onClick={() => sliderChange(null,25)}>
              25%
            </SmallButton>
            <SmallButton color="primary" onClick={() => sliderChange(null,50)}>
              50%
            </SmallButton>
            <SmallButton color="primary" onClick={() => sliderChange(null,75)}>
              75%
            </SmallButton>
            <SmallButton color="primary" onClick={() => sliderChange(null,100)}>
              MAX
            </SmallButton>
          </Grid>
          <Button color="primary" type="submit" width="100%" className={ css.submitBtn } disabled={ needsApprove ? false : (disableAction || isSubmitting || hasErrors) }
            onClick={ e => { 
              if(!needsApprove) return
              e.preventDefault()
              onApprove && onApprove()
          }}>
            {`${ needsApprove ? "Approve" : options[actionType].name } ${coinInfo?.symbol}`}
          </Button>
          {options[actionType]?.more && options[actionType]?.more(values)}
        </Form>)
        }}
      </Formik>
    </Dialog>
  )
}

export default StakeModal

const useStyles = makeStyles<Theme>( theme => createStyles({
  submitBtn:{
    marginTop: theme.spacing(2),
    textTransform: 'uppercase'
  },
  sliderContainer:{
    padding: theme.spacing(2),
  },
  textField:{
    borderRadius: theme.spacing(4),
    paddingLeft: theme.spacing(1),
  },
  currentTokenText:{
    marginBottom: theme.spacing(1.5),
    paddingRight: theme.spacing(2)
  },
  stakeActionBtn:{
    fontWeight: 600,
  },
  stakeActionBtnContainer:{
    marginBottom: theme.spacing(0.5),
  },
}))

const InvaderThumb = (allProps: {thumbProps: any, percent: BigNumber}) => {
  const isMax = allProps.percent.toNumber() === 100
  return(
    <span {...allProps.thumbProps}>
      <div style={{position: 'relative'}}>
        <InvaderIcon color="secondary" style={{position: 'absolute',left: -12, bottom: -10}}/>
        <Typography style={{ marginTop: 24, position:'absolute',left: isMax ? -12 : -15, bottom: -30 }} color="textPrimary" variant="caption">
          { isMax ? 'MAX' : `${allProps.percent.toFixed(2)}%`}
        </Typography>
      </div>
    </span>
)}
const FormComponent = p => <Card {...p} background="light" style={{ padding: 32, maxWidth: 360 }}/>