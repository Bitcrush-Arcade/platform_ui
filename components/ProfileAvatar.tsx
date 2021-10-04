import { useState, useCallback } from 'react'
// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import Badge from '@material-ui/core/Badge'
import Drawer from "@material-ui/core/Drawer"
import IconButton from "@material-ui/core/IconButton"
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
// Libs
import { currencyFormat, shortAddress } from 'utils/text/text'
import BigNumber from 'bignumber.js'
// Hooks
import { useContract } from 'hooks/web3Hooks'
// Context
import { useAuthContext, useTransactionContext } from 'hooks/contextHooks'
// data
import { getContracts } from 'data/contracts'

const ProfileAvatar = () => {

  const [openMenu, setOpenMenu] = useState<boolean>(false)
  const css = useStyles({})
  const { login, logout, account, chainId } = useAuthContext()

  const { tokenInfo, editTransactions } = useTransactionContext()
  const { address: tokenAddress, abi: tokenAbi } = getContracts('crushToken', 56)
  const { address: stakingContract } = getContracts('singleAsset', 56)
  const { methods: coinMethods } = useContract(tokenAbi, tokenAddress)
  const { address: liveWalletAddress, abi: liveAbi } = getContracts('liveWallet', chainId)
  const { methods: liveMethods } = useContract( liveAbi, liveWalletAddress)

  const approve = useCallback(() => {
    coinMethods.approve( stakingContract, new BigNumber(30000000000000000000000000).toFixed() ).send({ from: account, gasPrice: parseInt(`${new BigNumber(10).pow(10)}`) })
      .on('transactionHash', (tx) => {
        console.log('hash', tx )
        editTransactions(tx,'pending', { description: `Approve CRUSH spend`})
      })
      .on('receipt', ( rc) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash,'complete')
      })
      .on('error', (error, receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
      })
  },[coinMethods, account, editTransactions, stakingContract])

  const changeWallet = useCallback( () => {
    logout()
    login()
  },[logout, login])

  const selfBlacklist = useCallback(() => {
    liveMethods.blacklistSelf().send({ from: account })
      .on('transactionHash', (tx) => {
        editTransactions(tx, 'pending', { description: "Self Blacklist"})
      })
      .on('receipt', ( rc) => {
        console.log('receipt',rc)
        editTransactions(rc.transactionHash,'complete')
      })
      .on('error', (error, receipt) => {
        console.log('error', error, receipt)
        receipt?.transactionHash && editTransactions( receipt.transactionHash, 'error', error )
      })
  }, [ liveMethods, account, editTransactions])

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
            primary={ hasAccount ? shortAddress(account) : "Connect"}
            secondary={ hasAccount ? 'Disconnect' : '' }
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={ hasAccount 
              ? currencyFormat(tokenInfo.weiBalance, { isWei: true }) 
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
        {hasAccount && <ListItem button
          onClick={ selfBlacklist }
        >
          <ListItemText
            primary={"Blacklist Self"}
            secondary={"Disable myself from using the live wallet"}
          />
        </ListItem>}
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
    filter: theme.palette.type == "dark" ? 'invert(1) opacity(35%)' : 'invert(0) opacity(65%)',
    width: 22,
    height: 16,
  },
  drawer:{
    minWidth: 285,
  }
}))