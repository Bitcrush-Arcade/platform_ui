import Image from 'next/image'
// Material
import { Theme } from "@mui/material/styles";
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Slider, { SliderProps, SliderThumb } from '@mui/material/Slider'
import InvaderIcon, { invaderGradient } from 'components/svg/InvaderIcon'

const styles = (theme: Theme) => createStyles({
  root:{
    width: 20
  },
  track:{
    width: `${theme.spacing(0.5)} !important`,
    color: (props: LauncherProps) => {
      if(props.percent >= 100)
        return theme.palette.secondary.light
      if(props.percent > 20)
        return 'yellow'
      return 'red'
    }
  },
  rail:{
    width: `${theme.spacing(0.5)} !important`,
    color: theme.palette.text.secondary
  },
})

type LauncherProps = {
  percent: number,
  isFrozen?: boolean,
} 

type LauncherSliderProps =  LauncherProps & WithStyles <typeof styles> & SliderProps

export default withStyles(styles)( (props: LauncherSliderProps) => {
  const { percent, isFrozen, ...otherProps } = props
  return <Slider {...otherProps}
    components={{ Thumb: function RocketThumb (p){ return <InvaderRocketThumb thumbProps={p} percent={percent} isFrozen={isFrozen} />} }}
  />
})

export const InvaderRocketThumb = (allProps: { thumbProps: any, percent: number, isFrozen?: boolean }) => {
  const { thumbProps, percent, isFrozen } = allProps
  const [ gradient, gradientId ] = invaderGradient()
  const cloudSize = 2 - (percent / 90)
  const css = useInvaderStyle({ gradientId, cloudSize, isFrozen })
  return(
    <SliderThumb {...thumbProps} sx={{ zIndex:50, color: 'transparent' }}>
      <div style={{position: 'relative'}}>
        { gradient }
        <InvaderIcon color="secondary" className={ css.gradient } sx={{position: 'absolute',left:-29, bottom: -14, }}/>
      </div>
      <div style={{position: 'relative', zIndex: -1}}>
        { percent >= 100 && <div className={ css.blast }>
          <Image src="/assets/launcher/blast.png" width={32} height={54} layout="fixed" alt="rocket blast"/>
        </div>}
        { percent > 5 && percent < 100 && <div className={ css.cloud }>
          <Image src="/assets/launcher/cloud.png" width={48/cloudSize} height={54/cloudSize} layout="fixed" alt="rocket blast smoke"/>
        </div>}
      </div>
    </SliderThumb>
)}

const useInvaderStyle = makeStyles<Theme, { gradientId: string, cloudSize: number, isFrozen?: boolean }>( theme => createStyles({
  gradient: {
    fill: props => props.isFrozen ? theme.palette.blue.main : `url(#${ props.gradientId })`,
    fontSize: 60,
  },
  blast:{
    position: 'absolute',
    bottom: -62,
    left: -16,
  },
  cloud:{
    position: 'absolute',
    bottom: props => -62 / props.cloudSize ,
    left: props => -24 / props.cloudSize ,
  }
}))