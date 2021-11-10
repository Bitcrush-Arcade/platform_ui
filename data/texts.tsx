import Link from '@material-ui/core/Link'
import Typography from '@material-ui/core/Typography'

export const blacklistExplanation = <>{`
  Bitcrush.com is committed to support responsible gaming, so we added a Self Blacklist function to our contract that allows you to blacklist yourself from making deposits to the Live Wallet for gameplay. 

  Please note: BLACKLISTING WILL AFFECT LIVE WALLET DEPOSITS ONLY. 

  This means that any funds you have deposited can be claimed by you at any time. So if you feel in distress, you may blacklist yourself immediately and then claim your unused funds at any time. 

  Gambling should be for entertainment purposes and Bitcrush.com is focused on offering you the best gaming experience. However a small percentage of the population can have adverse effects to gambling. 

  Test to see if you have a gambling problem
  It's important to know if gambling is causing you or others around you harm. Please have a look at the following questions:

  - Is it difficult to stop playing?
  - Do you neglect work, studies, family, friends or personal needs because of      gambling?
  - Do you ever gamble more than you can afford to lose?
  - Does gambling make you feel irritable or depressed?

  If you have answered yes to any of these questions, you may have a gambling problem. We recommend looking at the following sites that can provide help and advice:

  Self Exclusion-

  Call the Self Blacklist function to stop yourself from being able to deposit funds into the Live Wallet, then withdraw your funds from the Live Wallet. 

  Seek Help-

  Here are a list of resources as you navigate the waters of Responsible Gaming:
  • `}<Link color="secondary" href="http://www.gamblersanonymous.org/ga/" rel="nonreferrer noopener">Gamblers Anonymous</Link>{`, probably the best-known organization for name recognition alone. This is a great place to receive support from other anonymous folks dealing with gambling addiction. Locate a meeting near you or talk to someone online with one click.
  • `}<Link color="secondary" href="https://www.ncpgambling.org/help-treatment/national-helpline-1-800-522-4700/" rel="nonreferrer noopener">National Council on Problem Gambling</Link>{`, which includes a toll-free helpline that’s available 24/7, is completely anonymous, and total confidential. If you’re unsure whether you have a problem, call them right now at 1-800-522-4700.
  • `}<Link color="secondary" href="https://www.icrg.org/" rel="nonreferrer noopener">International Center for Responsible Gaming</Link>{`, which helps folks around the world who are dealing with online gambling addiction. This is an especially useful resource for those who resort to illegal, offshore gambling sites to circumvent local laws.


  Questions?
  For any other questions regarding responsible gaming please contact our support.
`}</>

export const bankStakingInfo = <>
{`
  By entering this pool you agree that in circumstances of drawdown due to player wins, a portion of this pool could be frozen temporarily until losses are recouped. For taking on a higher risk, we share 60% of all game profits with stakers of this pool. 

  For a breakdown of the Staking Pool and risks associated, please read this article or ask the community:
`}<Link color="secondary" href="https://bitcrusharcade.medium.com/flight-of-the-navigator-update-v11-7b151272b8c1" rel="nonreferrer noopener">Flight of the Navigator Update v11</Link>{`

  This pool is auto-compounded with a 3% management fee. The breakdown is as follows

  .1% - Auto-Compound Bounty to the caller of the function.
  1% Burn of total pending compound. 
  1.9% Platform Reserve Fee. 

  To keep compound gas fees low, rewards are paid out in batches (groups) of stakers at a time. This means that calling an auto-compound function may or may not distribute your own rewards depending where you are in the queue. However you may call the function and claim the bounty as many times as you like. This will ensure that all users are paid out in a timely fashion, including yourself. Either way, you will get your rewards distributed. 

  Profit Distribution has 4 states. 

`}<Typography display="inline" color="secondary">Blastoff Ready (Green))</Typography>{` - Ready for profit distribution
`}<Typography display="inline" style={{color: 'yellow'}}>Blastoff Pending (Yellow)</Typography>{` - Almost past the profit threshold and will be ready      soon.
`}<Typography display="inline" color="error">Blastoff Stalled (Red)</Typography>{` – No profit to distribute/in a loss cycle
`}<Typography display="inline" style={{color: 'rgb(86,166,246)'}}>Frozen (Blue)</Typography>{` – Funds are frozen based on staked %.

  If funds are frozen, APY is still distributed based on full staked amount, and auto-compound can be called any time. 

  Withdrawing funds automatically withdraws your APY rewards, but not pending profits. Be sure your profits are claimed before withdrawing or they will be lost. 

  0.5% unstaking fee if withdrawn within 72h.
`}
</>

export const launcherTooltip = <>
{`Claiming the CRUSH Auto Bounty when launcher is at 100% distributes game profit to all stakers.

 Profits is paid out in batches, so claiming helps eveyone receive their rewards.
 
 Any time you see the launcher at 100%, it's time to start claiming!
`}
</>