import Link from 'next/link'
import { useState } from 'react'
// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import ButtonBase from "@material-ui/core/ButtonBase"
import CircularProgress from '@material-ui/core/CircularProgress'
// Icons
import PlayIcon from '@material-ui/icons/PlayCircleFilled';
// Bitcrush
import Card from 'components/basics/Card'

const GameCard = (props: GameCardProps ) => {

  const [loading, setLoading] = useState<boolean>(false)
  const css = useStyles({...props, loading})


  return (
    <Card className={css.card}>
      <Link passHref href={`/games/${props.gameKey}`}>
        <ButtonBase className={ css.button } onClick={ () => setLoading( true )}>
          { loading ? <CircularProgress className={ css.playIcon } thickness={10} /> : <PlayIcon className={ css.playIcon } />}
        </ButtonBase>
      </Link>
    </Card>
  )
}

export default GameCard

type GameCardProps ={
  imgSrc: string,
  gameKey: string,
}

const useStyles = makeStyles<Theme, GameCardProps & { loading: boolean } >( theme => createStyles({
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
    opacity: props => props.loading ? 0.75 : 0,
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