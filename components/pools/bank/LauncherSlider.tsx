import Image from 'next/image'
// Material
import { withStyles, WithStyles, createStyles, Theme, makeStyles } from "@material-ui/core/styles"
import Slider, { SliderProps } from '@material-ui/core/Slider'
import InvaderIcon, { invaderGradient } from 'components/svg/InvaderIcon'

const styles = (theme: Theme) => createStyles({
  root:{
    width: 20
  },
  track:{
    width: `${theme.spacing(0.5)}px !important`,
    color: (props: LauncherSliderProps) => {
      if(props.percent > 90)
        return theme.palette.secondary.light
      if(props.percent > 20)
        return 'yellow'
      return 'red'
    }
  },
  rail:{
    width: `${theme.spacing(0.5)}px !important`,
    color: theme.palette.text.secondary
  },
})

type LauncherSliderProps = {
  percent: number
} & WithStyles <typeof styles> & SliderProps

export default withStyles(styles)( (props: LauncherSliderProps) => {
  const { percent, ...otherProps } = props
  return <Slider {...otherProps}
    ThumbComponent={ p => <InvaderRocketThumb thumbProps={p} percent={percent}/> }
  />
})

export const InvaderRocketThumb = (allProps: { thumbProps: any, percent: number }) => {
  const { thumbProps, percent } = allProps
  const [ gradient, gradientId ] = invaderGradient()
  const cloudSize = 2 - (percent / 90)
  const css = useInvaderStyle({ gradientId, cloudSize })
  return(
    <span {...thumbProps}>
      <div style={{position: 'relative'}}>
        {gradient}
        <InvaderIcon color="secondary" className={ css.gradient } style={{position: 'absolute',left: -30, bottom: -10}}/>
      </div>
      <div style={{position: 'relative'}}>
        { percent > 90 && <div className={ css.blast }>
          <Image src="/assets/launcher/blast.png" width={32} height={54} layout="fixed"/>
        </div>}
        { percent > 5 && percent <= 90 && <div className={ css.cloud }>
          <Image src="/assets/launcher/cloud.png" width={48/cloudSize} height={54/cloudSize} layout="fixed"/>
        </div>}
      </div>
    </span>
)}

const useInvaderStyle = makeStyles<Theme, { gradientId: string, cloudSize: number }>( theme => createStyles({
  gradient: {
    fill: props => `url(#${ props.gradientId })`,
    fontSize: 60,
    zIndex: 50,
  },
  blast:{
    position: 'absolute',
    bottom: -58,
    left: -16,
  },
  cloud:{
    position: 'absolute',
    bottom: props => -64 / props.cloudSize ,
    left: props => -24 / props.cloudSize ,
  }
}))