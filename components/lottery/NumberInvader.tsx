// Material
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
// Bitcrush UI
import Invader0 from 'components/svg/invaders/Invader0'
import Invader1 from 'components/svg/invaders/Invader1'
import Invader2 from 'components/svg/invaders/Invader2'
import Invader3 from 'components/svg/invaders/Invader3'
import Invader4 from 'components/svg/invaders/Invader4'
import Invader5 from 'components/svg/invaders/Invader5'
import Invader6 from 'components/svg/invaders/Invader6'
import Invader7 from 'components/svg/invaders/Invader7'
import Invader8 from 'components/svg/invaders/Invader8'
import Invader9 from 'components/svg/invaders/Invader9'

export const invaderList = [Invader0, Invader1, Invader2, Invader3, Invader4, Invader5, Invader6, Invader7, Invader8, Invader9]
export const invaderColor : { [key: string] : string } = {
  "0": "#E5087E",
  "1": "#01A0E3",
  "2": "#7AEA34",
  "3": "#66C3D0",
  "4": "#EF8143",
  "5": "#FFF483",
  "6": "#E03C31",
  "7": "#01FFFF",
  "8": "#F5B5D2",
  "9": "#A92682",
}

type NumberInvaderProps = {
  twoDigits: [string,string],
  size?: 'small' | 'medium' | 'large' | 'xl',
  matched?: 0 | 1 | 2
}

const NumberInvader = ( props : NumberInvaderProps) => {
  const { twoDigits, size, matched } = props
  const SelectedInvader = isNaN(parseInt(twoDigits[0])) ? null :  invaderList[parseInt(twoDigits[0])]

  const isSmall = size === "small"
  const isMedium = size === "medium"
  const isLarge = size === "large"

  const textVariant = isSmall ? "h6" : isMedium ? "h5" : isLarge? "h4" : "h3"
  const iconSize = isSmall ? 25 : isMedium ? 40 : isLarge? 55 : 70
  
  return <Grid container justifyContent="center" 
            sx={{ width: isSmall ? '60px' : isMedium ? '80px' : isLarge ? '100px' : '120px'}}
          > 
    <Grid item>
      {
        SelectedInvader && 
          <SelectedInvader 
            sx={{
              width: iconSize,
              height: iconSize,
              color: invaderColor[twoDigits[1]] || "white"
            }}
          />
      }
    </Grid>

    <Grid item xs={12}>
      <Stack direction="row" justifyContent="space-evenly">
        <Typography variant={textVariant} fontWeight={500} color={ matched && matched > 0 ? "secondary" : "primary"}>
          {twoDigits[0]}
        </Typography>
        <Typography variant={textVariant} fontWeight={500} color={ matched && matched > 1 ? "secondary" : "primary"}>
          {twoDigits[1]}
        </Typography>
      </Stack>
    </Grid>
  </Grid>
}

export default NumberInvader