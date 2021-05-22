// Material
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import Badge from '@material-ui/core/Badge'


const ProfileAvatar = () => {

  const css = useStyles({})

  return <Badge color="secondary" badgeContent=" " variant="dot" overlap="circle">
    <Avatar src="/invader_zero.png" className={ css.avatar } classes={{img: css.avatarImg}}>
      ?
    </Avatar>
  </Badge>
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
}))