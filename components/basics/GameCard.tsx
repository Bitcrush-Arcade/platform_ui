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
      <ButtonBase className={ css.button } >
        <PlayIcon className={ css.playIcon } />
      </ButtonBase>
    </Card>
  )
}

export default GameCard

type GameCardProps ={
  imgSrc: string
}

const useStyles = makeStyles<Theme, GameCardProps>( theme => createStyles({
  card:{
    width: theme.spacing(30),
    height: theme.spacing(18),
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