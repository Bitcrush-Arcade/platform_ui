import Image from 'next/image'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

const HowToPlay = () => {
  return <Typography whiteSpace="pre-line" component="div">
    {`The Bitcrush Arcade Crush n’Burn Lottery is an “everyone wins” lottery utilizing the Chainlink VFR protocol. 
    
    The goal of the lottery, is to pick the correct squadron of 3 Invaders and attack a nearby planet for resources. If you pick the correct 3 invaders, in the correct colors, you bypass their radar resulting in a successful attack, winning the jackpot. Based on the how well you picked, you can win between 1 and 6 correct numbers resulting in the splitting of the correlated winning pots. Even if you pick zero correctly, you are still rewarded and able to claim your share of the 0 pot. 
    
    To play, simply pick your Invader, and Color, which are each represented by a number. 
    
    For instance, if you picked Invader “insert Invader shape 2” and Color “insert Color 3”, the number chosen would be 23. Repeat this so you have a total of 3 colorful Invaders. This is your squadron. If you prefer, you may choose Lucky Pick and your Squadron will be picked randomly. 
    `}
    <Grid container sx={{ my: 2, }} justifyContent="center">
      <Grid item>
        <Image src="/assets/invaderPickerPreview.png" alt="invader picker preview" width={320} height={590} />
      </Grid>
    </Grid>
    {`Rounds will last 12 hours each, and at the end of that 12 hours, a user called function to progress the round will appear. By helping to keep the protocol moving forward at a regular pace, the user who calls this function will receive 0.75% of the entire wins for that round. This is in itself a gambling mechanism. If nobody wins you may not break even in gas fees. If someone wins the jackpot, or a have a bunch of winners, it could be quite profitable. Please note when you claim, it will take a few minutes as Chainlink does its thing for your reward to be calculated and distributed. 
    
    After each round you may check your tickets to view winners, and see your cumulative rewards. You can wait to claim until you have won enough to cover gas fees. 
    
    Additionally, the lottery features partner tokens, that act as an airdrop. Each round you will be allocated your share of partner tokens based on your winnings. Please note not every round might feature a partner. This is just a delicious little bonus for playing!

    To win, numbers must be matched in the exact order. 

    For example, if the winning number is 236536;

    If your ticket is is 239636, You matched the first two numbers consecutively so you win for match 2. 

    If you your tickets 336536, you did not match the first number correctly so unfortunately you did not win. Try again and Crush It next time!
    
    See this medium article for more details and breakdown:
    `}
    <a href="/" rel="noopener nonreferrer" target="_blank">
      Flight of the Navigator v17
    </a>
  </Typography>
}
export default HowToPlay