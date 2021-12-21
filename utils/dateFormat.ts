import differenceInDays from 'date-fns/differenceInDays'
import differenceInHours from 'date-fns/differenceInHours'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import differenceInSeconds from 'date-fns/differenceInSeconds'

export const differenceFromNow = ( epochTime: number, type?: 'string' | 'object' ) => {
  
  let finalString = ''

  const epochInUtc = epochTime * 1000
  const comparedDate = new Date()
  const dayDiff = differenceInDays( new Date(epochInUtc), comparedDate )
  const allDiff = { 
    days: dayDiff,
    hours: 0,
    minutes: 0,
    seconds: 0,
  }

  if( dayDiff > 0 )
    finalString += `${dayDiff} D `
  
  const hourAdjust = epochInUtc - (dayDiff * 3600 * 1000 * 24 )
  const hourDiff = differenceInHours( new Date(hourAdjust), comparedDate)
  allDiff.hours = hourDiff
  if( hourDiff > 0 || dayDiff > 0 )
    finalString += `${hourDiff} H `
  
  const minuteAdjust = hourAdjust - (hourDiff * 3600 * 1000)
  const minDiff =  differenceInMinutes( new Date( minuteAdjust ), comparedDate )
  allDiff.minutes = minDiff
  if( minDiff > 0 || dayDiff > 0 || hourDiff > 0)
    finalString += `${minDiff} M`
  
  if(type === "object"){
    const secondAdjust = minuteAdjust - (minDiff * 60*1000)
    const secDiff = differenceInSeconds( new Date(secondAdjust), comparedDate)
    allDiff.seconds = secDiff
    return allDiff
  }


  return finalString
}