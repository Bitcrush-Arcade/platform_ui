import { Fragment } from 'react'
import { Formik, Form, Field } from 'formik'
import { TextField } from 'formik-material-ui'
import BigNumber from 'bignumber.js'
// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import MButton from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import Slider from "@material-ui/core/Slider"
import Typography from "@material-ui/core/Typography"

// Bitcrush
import Button from 'components/basics/GeneralUseButton'
import Card from 'components/basics/Card'
import SmallButton from 'components/basics/SmallButton'
// Icons
import InvaderIcon from 'components/svg/InvaderIcon'
// libs
import { currencyFormat } from 'utils/text/text'

type StakeModalProps = {
  open: boolean,
  onClose: () => void,
  options: Array<{ name: string, maxValue: number, description: string }>,
  onSubmit: ( values : { stakeAmount: number, actionType: number }, second: { setSubmitting: (newSubmit: boolean) => void } ) => void,
  coinInfo?: { symbol: string, name: string, decimals?: number }
}

function StakeModal( props: StakeModalProps ) {
  const {open, onClose, options, onSubmit, coinInfo } = props
  const css = useStyles({})
  return (
    <Dialog 
      PaperComponent={FormComponent}
      open={open}
      onBackdropClick={ onClose }
    >
      <Formik
        initialValues = {{
          stakeAmount: 0,
          actionType: 0
        }}
        onSubmit={onSubmit}
        validate ={ ( values ) => {
          let errors: any = {}
          if( new BigNumber(values.stakeAmount).isGreaterThan( options[values.actionType].maxValue ) )
            errors.stakeAmount = "Insufficient Funds"
          if(values.stakeAmount <= 0)
            errors.stakeAmount = "Invalid Input"
          return errors
        }}
        validateOnChange
      >
      { ({values, setFieldValue, isSubmitting}) =>{
        const { actionType, stakeAmount } = values
        const maxUsed = options[actionType].maxValue
        const percent = new BigNumber( stakeAmount ).div( new BigNumber(maxUsed).div( new BigNumber(10).pow(coinInfo.decimals || 18 ) ) ).times(100)
        const sliderChange = (e: any, value: number) => {
          const newValue = value === 100 ? maxUsed : new BigNumber(value).times( maxUsed ).div(100)
          setFieldValue('stakeAmount', new BigNumber(newValue).div( new BigNumber(10).pow(coinInfo.decimals || 18 ) ) )
        }
        const switchAction = (stakeActionValue: number) => {
          setFieldValue('actionType', stakeActionValue )
          setFieldValue('stakeAmount', 0 )
        }
        return(<Form>
          <Grid container className={ css.stakeActionBtnContainer }>
            {options.map((option, index) => {
              const { name, description, maxValue } = option
              return <Fragment key={`stake-option-${description}-${index}`}>
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
          </Grid>
          <Typography variant="body2" color="textSecondary" component="div" align="right" className={ css.currentTokenText }>
            {options[actionType].description} {coinInfo.symbol}: {currencyFormat( maxUsed || 0, { isWei: true })}
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
              endAdornment: <MButton color="secondary" onClick={ () => setFieldValue('stakeAmount', maxUsed )}>
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
          <Grid container justify="space-evenly">
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
          <Button color="primary" type="submit" width="100%" className={ css.submitBtn } disabled={isSubmitting}>
            {options[actionType].name} {coinInfo.symbol}
          </Button>
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