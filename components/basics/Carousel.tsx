import { useState, useRef, useEffect, ReactNode, forwardRef, useImperativeHandle, useLayoutEffect } from 'react'

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
    zIndex: 1200,
  },
  rightArrow:{
    right: 0,
    zIndex:1200,
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
    overflow: 'hidden',
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

const useGridStyle = makeStyles<Theme, PartialBy<CarouselPropsType, 'items'> & { containerWidth: number }>( theme => createStyles({
  itemContainer:{
    // scrollSnapAlign: 'start'
    [theme.breakpoints.only('xs')]:{
      minWidth: props => `calc( ${props.containerWidth}px / ${props.xs})`
    },
    [theme.breakpoints.only('sm')]:{
      minWidth: props => `calc( ${props.containerWidth}px / ${props.sm})`
    },
    [theme.breakpoints.only('md')]:{
      minWidth: props => `calc( ${props.containerWidth}px / ${props.md})`
    },
    [theme.breakpoints.up('lg')]:{
      minWidth: props => `calc( ${props.containerWidth}px / ${props.lg})`
    },
  },
  showItem:{
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
  LeftScroll?: any,
  RightScroll?: any,
}
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T,K>>

export type CarouselHandles = {
  scrollNext: () => void,
  scrollPrev: () => void,
}

const Carousel = forwardRef<CarouselHandles, CarouselPropsType>(( props, ref ) => {

  const { items, xs = 1, sm, md, lg, spacing, LeftScroll, RightScroll } = props

  const smVal = sm ?? xs
  const mdVal = md ?? sm ?? xs
  const lgVal = lg ?? md ?? sm ?? xs
  const count = items.length
  const css = useStyles({ ...props, sm: smVal, md: mdVal, lg: lgVal })
  const [minScroll, setMinScroll] = useState<boolean>(true)
  const [maxScroll, setMaxScroll] = useState<boolean>(false)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    setContainerWidth(document.getElementById('carousel-id').clientWidth)
    const resizeContainer = () => {
      const getWidth = document.getElementById('carousel-id').clientWidth
      setContainerWidth( getWidth ) 
    }
    window?.addEventListener('resize', resizeContainer )
    return () => {
      window.removeEventListener('resize', resizeContainer)
    }
  },[setContainerWidth])
  // On resize, reset State
  useLayoutEffect(() => {
    const currentCarouselRef = carouselRef.current
    const snapToGrid = () => {
      setTimeout( ()=>{
        if(!carouselRef.current) return
        const currentPos = carouselRef.current?.scrollLeft || 0
        const carouselWidth = carouselRef.current?.scrollWidth || 0
        const itemWidth = parseInt(`${carouselWidth/count}`)
        
        const mod = parseInt(`${currentPos%itemWidth}`)
        console.log( { carouselWidth, itemWidth, currentPos, mod, more:  mod > itemWidth/2, less: mod < itemWidth * 0.9 })
        if( mod > itemWidth*0.2 && mod < itemWidth * 0.9 ){
          carouselRef.current.scrollLeft = mod > (itemWidth/2) ? (currentPos + mod) : (currentPos - mod)
        }
  
        setMaxScroll( currentPos + containerWidth >= (carouselWidth - (carouselWidth/count)) )
        setMinScroll( currentPos < itemWidth)
      
      },300)
    }
    currentCarouselRef?.addEventListener('scroll', snapToGrid )
    return () => {
      currentCarouselRef?.removeEventListener('scroll', snapToGrid )
    };
  }, [ containerWidth, count ])

  const scrollNext = () => {
    if(!carouselRef.current) return
    const width = carouselRef.current.scrollWidth
    carouselRef.current.scrollLeft += Math.floor(width/count)
  }

  const scrollPrev = () => {
    if(!carouselRef.current) return
    const width = carouselRef.current.scrollWidth
    carouselRef.current.scrollLeft -= Math.floor(width / count)
  }

  const shownItems = items.map( (item, itemIndex) => {
    return( <CarouselItem {...props} item={item} key={`carousel-item-${itemIndex}`} containerWidth={containerWidth} />
    )
  })

  useImperativeHandle(ref, () => ({
    scrollNext,
    scrollPrev
  }))

  
  return (<div className={ css.carouselContainer } id={'carousel-id'}>
    <div className={ `${css.arrows} ${css.leftArrow}` } >
      {LeftScroll && <LeftScroll disabled={minScroll} onClick={scrollPrev}/> 
      || <IconButton disabled={minScroll} onClick={ scrollPrev }>
        <ChevronLeftIcon/>
      </IconButton>}
    </div>
    <Grid container justifyContent="flex-start" alignItems="center" spacing={spacing} className={css.slider} wrap="nowrap"
      innerRef={carouselRef}
    >
      {shownItems}
    </Grid>
    <div className={ `${css.arrows} ${css.rightArrow}` } >
      {RightScroll 
      && <RightScroll disabled={maxScroll} onClick={scrollNext}/>
      ||<IconButton disabled={ maxScroll } onClick={ scrollNext }>
        <ChevronRightIcon/>
      </IconButton>}
    </div>
  </div>
  )
})

export default Carousel

function CarouselItem( props: PartialBy<CarouselPropsType, 'items'> & { item: any, containerWidth: number}) {
  const { item, xs, sm, md, lg, containerWidth } = props
  const smVal = sm ?? xs
  const mdVal = md ?? sm ?? xs
  const lgVal = lg ?? md ?? sm ?? xs
  const gridCss = useGridStyle( { xs, sm: smVal, md: mdVal, lg: lgVal, containerWidth: containerWidth})
  return (<Grid item className={ gridCss.itemContainer }>
    <Grid container justifyContent="center" className={gridCss.showItem}>
      <Grid item>
        {item}
      </Grid>
    </Grid>
  </Grid>
  )
}
