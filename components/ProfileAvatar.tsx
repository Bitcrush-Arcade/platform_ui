import { useState, useContext } from 'react'
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
// Hooks
import { useAuth } from 'hooks/web3Hooks'
// Context
import { TransactionContext } from 'components/context/TransactionContext'

const ProfileAvatar = () => {

  const [openMenu, setOpenMenu] = useState<boolean>(false)
  const css = useStyles({})
  const { login, logout, account } = useAuth()

  const { tokenInfo } = useContext(TransactionContext)

  const hasAccount = Boolean(account)
  const toggleDrawer = () => setOpenMenu( p => !p )

  return <>
    <IconButton size="small" onClick={toggleDrawer}>
      <Badge color="secondary" badgeContent=" " variant="dot" overlap="circle">
        <Avatar src="/invader_zero.png" className={ css.avatar } classes={{img: css.avatarImg}}>
          ?
        </Avatar>
      </Badge>
    </IconButton>
    <Drawer
      anchor="right"
      open={openMenu}
      onBackdropClick={toggleDrawer}
      PaperProps={{
        className: css.drawer
      }}
    >
      <List>
        <ListItem 
          button={ hasAccount || undefined }
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
    filter: 'invert(1) opacity(35%)',
    width: 22,
    height: 16,
  },
  drawer:{
    minWidth: 285,
  }
}))