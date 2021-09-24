// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import ButtonBase from "@material-ui/core/ButtonBase"
// Icons
import PlayIcon from '@material-ui/icons/PlayCircleFilled';
// Bitcrush
import Card from 'components/basics/Card'

const GameCard = (props: GameCardProps ) => {

  const css = useStyles(props)

  return (
    <Card className={css.card}>
      <ButtonBase className={ css.button } href="/games/" target=" _blank">
        <PlayIcon className={ css.playIcon } />
      </ButtonBase>
    </Card>
  )
}

export default GameCard

type GameCardProps ={
  imgSrc: string,
  gameKey: string,
}

const useStyles = makeStyles<Theme, GameCardProps>( theme => createStyles({
  card:{
    width: 200,
    height: 150,
    backgroundImage: props => `url(${props.imgSrc})`,
    backgroundSize: 'cover',
    display: 'flex',
  },
  button: {
    heigth: '100%',
    width: '100%',
    opacity: 0,
    '&:hover':{
      background: `linear-gradient( 90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
      opacity: 0.75
    }
  },
  playIcon:{
    color: theme.palette.background.default,
    opacity: 1,
    fontSize: 64,
  },
}))