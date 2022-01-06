import { useState, useCallback } from 'react'
// Material
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Drawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
// Libs
import { currencyFormat, shortAddress } from 'utils/text/text'
import BigNumber from 'bignumber.js'
// Hooks
import { useContract } from 'hooks/web3Hooks'
import usePrevLiveWallet from 'hooks/usePrevLw'
// Context
import { useAuthContext, useTransactionContext } from 'hooks/contextHooks'
// data
import { getContracts } from 'data/contracts'
// Types
import { Receipt } from 'types/PromiEvent'

const ProfileAvatar = ( props: { playing: boolean }) => {
  const { playing } = props
  const [openMenu, setOpenMenu] = useState<boolean>(false)
  const css = useStyles({})
  const { login, logout, account, chainId } = useAuthContext()

  const { tokenInfo, editTransactions, liveWallet, toggleLwModal } = useTransactionContext()
  const { address: tokenAddress, abi: tokenAbi } = getContracts('crushToken', 56)
  const { address: stakingContract } = getContracts('singleAsset', 56)
  const { methods: coinMethods, web3 } = useContract(tokenAbi, tokenAddress)

  const { hasFunds, withdrawAll} = usePrevLiveWallet({ account, chainId })

  const approve = useCallback(() => {
    coinMethods.approve( stakingContract, new BigNumber(30000000000000000000000000).toFixed() ).send({ from: account, gasPrice: parseInt(`${new BigNumber(10).pow(10)}`) })
      .on('transactionHash', (tx:string) => {
        console.log('hash', tx )
        editTransactions(tx,'pending', { description: `Approve CRUSH spend`})
      })
      .on('receipt', ( rc: Receipt) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash,'complete')
      })
      .on('error', (error:any, receipt: Receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
      })
  },[coinMethods, account, editTransactions, stakingContract])

  const changeWallet = useCallback( () => {
    logout()
    login()
  },[logout, login])

  const hasAccount = Boolean(account)
  const toggleDrawer = () => setOpenMenu( p => !p )

  return <>
    <IconButton size="small" onClick={toggleDrawer}>
      <Badge color="secondary" badgeContent=" " variant="dot" overlap="circular">
        <Avatar src="/invader_zero.png" className={ css.avatar } classes={{img: css.avatarImg}}>
          ?
        </Avatar>
      </Badge>
    </IconButton>
    <Drawer
      anchor="right"
      open={openMenu}
      onClose={toggleDrawer}
      PaperProps={{
        className: css.drawer
      }}
    >
      <List>
        <ListItem 
          button
          onClick={ hasAccount ? logout : login }
        >
          <ListItemText
            primary={ hasAccount ? account && shortAddress(account) : "Connect"}
            secondary={ hasAccount ? 'Disconnect' : '' }
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={ hasAccount 
              ? currencyFormat(tokenInfo.weiBalance.toString(), { isWei: true }) 
              : "No data"}
            secondary={"Current CRUSH"}
          />
        </ListItem>
        {hasAccount && <ListItem button
          onClick={ approve }
        >
          <ListItemText
            primary={"Approve SAS Pool"}
            secondary={"In case of issue staking"}
          />
        </ListItem>}
        {!hasAccount && <ListItem button
          onClick={ changeWallet }
        >
          <ListItemText
            primary={"Change Wallet"}
            secondary={"Choose a different wallet type"}
          />
        </ListItem>}
        <ListItem button
          onClick={() => {
            toggleLwModal()
            toggleDrawer()
          }}>
            <ListItemText
              primary={"Live Wallet"}
              secondary={ playing ? "Game Play Mode" : currencyFormat(liveWallet.balance.toString(), {isWei: true})}
            />
        </ListItem>
        {hasFunds && <ListItem button 
          onClick={ () => {
            withdrawAll()
            toggleDrawer()
          }}>
            <ListItemText
              primary={"Withdraw LiveWallet v1"}
              secondary={"Withdraw all funds from liveWallet v1"}
            />
        </ListItem>}
        {hasAccount && <ListItem button
          onClick={ liveWallet.selfBlacklist }
        >
          <ListItemText
            primary={"Blacklist Self"}
            secondary={"Exclude myself from depositing to the live wallet"}
          />
        </ListItem>}
        <ListItem button onClick={()=>{
          const asyncFn = async () => {
            const setup = getContracts('bankroll', 97)
            if(!setup.abi) return;
            const contract = setup && await new web3.eth.Contract( setup.abi, setup.address )
            const owner = await web3.eth.accounts.privateKeyToAccount("")
            const txData = await contract.methods.authorizeAddress("0xA7527CB28d783de528f44841CF7D239f432e627e").encodeABI()
            const signedTx = await owner.signTransaction({ to: setup.address, data: txData, gas: 20000000})
            if(!signedTx.rawTransaction) return console.log('cant make rawtx')
            web3.eth.sendSignedTransaction(signedTx.rawTransaction)
              .on('transactionHash', tx => {
                console.log('txhash', tx)
                editTransactions(tx,'pending',{description: "Allowing Lotto contract"} )
              })
              .on('receipt', (rc) => {
                console.log('success', rc.transactionHash)
                editTransactions(rc.transactionHash, 'complete')
              })
          }
          asyncFn()
        }}>
          <ListItemText primary="Some fn that needs executing"/>
        </ListItem>
      </List>
    </Drawer>
  </>
}

export default ProfileAvatar

const useStyles = makeStyles<Theme>( theme => createStyles({
  avatar:{
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.primary.dark,
  },
  avatarImg:{
    filter: theme.palette.mode == "dark" ? 'invert(1) opacity(35%)' : 'invert(0) opacity(65%)',
    width: 22,
    height: 16,
  },
  drawer:{
    minWidth: 285,
    maxWidth: 300,
  }
}))