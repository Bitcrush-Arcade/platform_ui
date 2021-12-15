import { useMemo } from 'react'
import Image from 'next/image'
// Material
import { Theme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import Grid from "@mui/material/Grid"
import Slider from "@mui/material/Slider"
import Typography from "@mui/material/Typography"
// Bitcrush
import Currency from 'components/basics/Currency'
import LauncherSlider from 'components/pools/bank/LauncherSlider'
import { currencyFormat } from 'utils/text/text'

type InvaderLauncherProps = {
  percent: number,
  crushBuffer: number,
  frozen: number,
}

function InvaderLauncher( props: InvaderLauncherProps ) {
  const { percent, crushBuffer, frozen } = props
  const textProperties:{ color: string, text: string} = useMemo( () => {
    if( frozen > 0 ){
      return {
        color: 'error',
        text: 'frozen'
      }
    }
    if(percent >= 100)
      return {
        color: 'secondary',
        text: 'ready'
      }
    if(percent > 20)
      return {
        color: 'yellow',
        text: 'pending'
      }
    return {
      color: 'error',
      text: 'stalled'
    }
  },[percent, frozen])
  const css = useStyles(textProperties)

  return (<div>
    <Grid container justifyContent="space-between" alignItems="stretch">
      <Grid item xs={3}>
        <div className={css.sliderContainer}>
          <MarkerSlider
            disabled
            orientation="vertical"
            track={false}
            marks={marks}
            step={10}
            min={0}
            max={100}
          />
        </div>
      </Grid>
      <Grid item xs={9}>
        <Grid container justifyContent="flex-end" alignItems="flex-end" style={{ height: '100%' }}>
          <Grid item xs={3} style={{ height: '100%', }}>
            <LauncherSlider
              disabled
              orientation="vertical"
              step={1}
              min={0}
              max={100}
              value={percent || 0}
              percent={percent || 0}
              isFrozen={ Math.abs(frozen) > 0 }
            />
          </Grid>
          <Grid item xs={6}>
            <Typography className={ css.colorChange }>
              { (crushBuffer || 0 ) >= 0 
                ? `${currencyFormat( (percent || 0) > 100 ? 100 : (percent || 0 ), { decimalsToShow: 0 })}%`
                : <>
                    <Currency value={crushBuffer} decimals={0} isWei/>
                    &nbsp;CRUSH
                  </>
              }
            </Typography>
            <Typography className={ css.colorChange }>
              Blastoff {textProperties.text}
            </Typography>
            {Math.abs(frozen) > 0 && <Typography className={ css.frozen }>
              Frozen {currencyFormat( Math.abs(frozen) || 0, { decimalsToShow: 0, isWei: true })}
            </Typography>}
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <div style={{ maxHeight: 40 }}>
          <Image src='/assets/launcher/planet.png' width={406} height={81} layout="responsive" alt="Launching from planet" />
        </div>
      </Grid>
    </Grid>
  </div>)
}

const marks = [
  { value: 0, label: '0%' },
  { value: 20, label: '20%' },
  { value: 40, label: '40%' },
  { value: 60, label: '60%' },
  { value: 80, label: '80%' },
  { value: 100, label: '100%' },
]

export default InvaderLauncher

const useStyles = makeStyles<Theme,{ color: string, text: string }>( theme => createStyles({
  sliderContainer:{
    height: 180,
  },
  frozen:{
    color: theme.palette.blue?.main || 'blue',
  },
  colorChange:{
    color: props => {
      switch(props.color){
        case 'secondary':
          return theme.palette.secondary.main
        case 'yellow':
          return theme.palette.mode == 'dark' ? 'yellow' : theme.palette.primary.main
        default: 
          return theme.palette.error.main
      }
    }
  }
}))

const MarkerSlider = withStyles({
  thumb:{
    display:'none',
  },
  mark:{
    height: 1,
    width: 12,
    marginLeft: -4.5
  }
})(Slider)