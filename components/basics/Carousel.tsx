import { useState, useRef, useEffect, ReactNode, forwardRef, useImperativeHandle } from 'react'

// Material
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
// Icons
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

const useStyles = makeStyles((theme: Theme) => createStyles({
  leftArrow:{
    left: 0,
  },
  rightArrow:{
    right: 0,
  },
  arrows:{
    position: 'absolute',
    top: 'calc(50% - 24px)',
    [theme.breakpoints.only('xs')]:{
      display: (props : CarouselPropsType) => props.xs >= props.items.length ? 'none' : 'block'
    },
    [theme.breakpoints.only('sm')]:{
      display: (props : CarouselPropsType) => props.sm >= props.items.length ? 'none' : 'block'
    },
    [theme.breakpoints.only('md')]:{
      display: (props : CarouselPropsType) => props.md >= props.items.length ? 'none' : 'block'
    },
    [theme.breakpoints.up('lg')]:{
      display: (props : CarouselPropsType) => props.lg >= props.items.length ? 'none' : 'block'
    },
  },
  carouselContainer: {
    position: 'relative',
    width: '100%',
    overflowX: 'hidden',
  },
  slider:{
    overflowX: 'scroll',
    left: 0,
    scrollSnapType: 'x mandatory',
    scrollBehavior: 'smooth',
    WebkitOverflowScrolling: 'touch',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar':{
      display: 'none',
    },
  }
}))

const useGridStyle = makeStyles<Theme, PartialBy<CarouselPropsType, 'items'> & { itemIndex: number }>( theme => createStyles({
  itemContainer:{
    // scrollSnapAlign: 'start'
  },
  showItem:{
    [theme.breakpoints.only('xs')]:{
      width: props => `calc( 100vw / ${props.xs})`
    },
    [theme.breakpoints.only('sm')]:{
      width: props => `calc( 100vw / ${props.sm})`
    },
    [theme.breakpoints.only('md')]:{
      width: props => `calc( 100vw / ${props.md})`
    },
    [theme.breakpoints.up('lg')]:{
      width: props => `calc( 100vw / ${props.lg})`
    },
  }
}))


type CarouselPropsType = {
  items: Array<JSX.Element | ReactNode>,
  xs: number,
  sm?: number,
  md?: number,
  lg?: number,
  notInfinite?: boolean, //NOT IMPLEMENTED
  centerMode?: boolean, // NOT IMPLEMENTED
  spacing?: 1|2|3|4|5,
  otherScroll?: boolean
}
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T,K>>

export type CarouselHandles = {
  scrollNext: () => void,
  scrollPrev: () => void,
}

const Carousel = forwardRef<CarouselHandles, CarouselPropsType>(( props, ref ) => {

  const { items, xs = 1, sm, md, lg, spacing, otherScroll } = props

  const smVal = sm ?? xs
  const mdVal = md ?? sm ?? xs
  const lgVal = lg ?? md ?? sm ?? xs
  const count = items.length
  const css = useStyles({ ...props, sm: smVal, md: mdVal, lg: lgVal })
  const [shown, setShown] = useState<number>(0)
  const [scrollPos, setScrollPos] = useState<number>(0)
  const [maxScroll, setMaxScroll] = useState<boolean>(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  // On resize, reset State
  useEffect(() => {
    const snapToGrid = () => {
      if(!carouselRef.current) return
      const currentPos = carouselRef.current?.scrollLeft || 0
      const carouselWidth = carouselRef.current?.scrollWidth || 0
      const screenWidth = window.innerWidth
      const maxRightScroll = currentPos + screenWidth >= carouselWidth
      setScrollPos(currentPos)
      setMaxScroll(maxRightScroll)
    }
    const resetShown = () => setShown( 0 )
    carouselRef.current?.addEventListener('scroll', snapToGrid)
    window.addEventListener('resize', resetShown )
    return () => {
      window.removeEventListener('resize', resetShown )
      carouselRef.current?.removeEventListener('scroll', snapToGrid)
    };
  }, [])

  useEffect(()=>{
    const timeout = setTimeout(() => {
      if(!carouselRef.current) return
      const width = carouselRef.current.scrollWidth
      const itemWidth = width/count
      const curPos = carouselRef.current.scrollLeft
      const mod = curPos%itemWidth
      const dif = mod - Math.floor(itemWidth/2)
      if( mod ){
        carouselRef.current.scrollLeft = mod > (itemWidth/2) ? (curPos + mod) : (curPos - mod)
      }
    },200)
    return () => clearTimeout(timeout)
  },[scrollPos])

  const scrollNext = () => {
    if(!carouselRef.current) return
    const width = carouselRef.current.scrollWidth
    setShown( prev => prev + 1 )
    const curPos = carouselRef.current.scrollLeft + width/count
    const mod = width%curPos
    carouselRef.current.scrollLeft = mod > (width/count/2) ? curPos + mod : curPos - mod 
  }

  const scrollPrev = () => {
    if(!carouselRef.current) return
    const width = carouselRef.current.scrollWidth
    setShown( prev => prev - 1 )
    carouselRef.current.scrollLeft -= width / count
  }

  const shownItems = items.map( (item, itemIndex) => {
    const shownIndex = itemIndex - shown + 1
    return( <CarouselItem {...props} item={item} shownIndex={shownIndex} key={`carousel-item-${itemIndex}`} />
    )
  })

  useImperativeHandle(ref, () => ({
    scrollNext,
    scrollPrev
  }))

  
  return (<div className={ css.carouselContainer } >
    {!otherScroll && <div className={ `${css.arrows} ${css.leftArrow}` } >
      <IconButton disabled={scrollPos <= 0} onClick={ scrollPrev }>
        <ChevronLeftIcon/>
      </IconButton>
    </div>}
    <Grid container justify="flex-start" alignItems="center" spacing={spacing} className={css.slider} wrap="nowrap"
      innerRef={carouselRef}
    >
      {shownItems}
    </Grid>
    {!otherScroll && <div className={ `${css.arrows} ${css.rightArrow}` } >
      <IconButton disabled={ maxScroll } onClick={ scrollNext }>
        <ChevronRightIcon/>
      </IconButton>
    </div>}
  </div>
  )
})

export default Carousel

function CarouselItem( props: PartialBy<CarouselPropsType, 'items'> & { item: any, shownIndex: number}) {
  const { item, shownIndex, xs, sm, md, lg } = props
  const smVal = sm ?? xs
  const mdVal = md ?? sm ?? xs
  const lgVal = lg ?? md ?? sm ?? xs
  const gridCss = useGridStyle( { xs, sm: smVal, md: mdVal, lg: lgVal, itemIndex: shownIndex})
  return (<Grid item className={ gridCss.itemContainer }>
    <Grid container justify="center" className={gridCss.showItem}>
      <Grid item>
        {item}
      </Grid>
    </Grid>
  </Grid>
  )
}