import differenceInDays from 'date-fns/differenceInDays'
import differenceInHours from 'date-fns/differenceInHours'
import differenceInMinutes from 'date-fns/differenceInMinutes'

export const differenceFromNow = ( epochTime: number ) => {
  
  let finalString = ''

  const epochInUtc = epochTime * 1000
  const comparedDate = new Date()
  const dayDiff = differenceInDays( new Date(epochInUtc), comparedDate )

  if( dayDiff > 0 )
    finalString += `${dayDiff} D `
  
  const hourAdjust = epochInUtc - (dayDiff * 3600 * 1000 * 24 )
  const hourDiff = differenceInHours( new Date(hourAdjust), comparedDate)
  if( hourDiff > 0 || dayDiff > 0 )
    finalString += `${hourDiff} H `
  
  const minuteAdjust = hourAdjust - (hourDiff * 3600 * 1000)
  const minDiff =  differenceInMinutes( new Date( minuteAdjust ), comparedDate )
  if( minDiff > 0 || dayDiff > 0 || hourDiff > 0)
    finalString += `${minDiff} M`

  return finalString
}