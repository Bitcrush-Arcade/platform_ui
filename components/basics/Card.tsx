import Card, {CardProps} from '@mui/material/Card'

// V5 MUI
import { styled } from '@mui/system'

type BasicCardProps = {
  background?: 'transparent' | 'light' | 'dark',
  opacity?: number,
  shadow?: 'primary' | 'secondary' | 'dark',
  noBorder?: boolean,
} & CardProps

const BasicCard = styled( Card, {
  shouldForwardProp: prop => prop !== 'noBorder' && prop !=='background' && prop !== 'opacity' && prop !== 'shadow'
})<BasicCardProps>(({theme, shadow, background, opacity, noBorder }) => ({
  borderRadius: theme.spacing(4),
  borderColor: theme.palette[ shadow !== "dark" && theme.palette.mode !=="light" && shadow ||'primary'][shadow == 'dark' ? 'dark': 'main'],
  borderStyle: noBorder ? 'none' : 'solid',
  borderWidth: 1,
  boxShadow: theme.palette.mode == 'light' ? 'none' : `inset 0 0 ${shadow === 'dark' ? 15 : 20}px ${theme.palette.shadow?.[ shadow === 'secondary' ? 'secondary' : 'primary'][shadow === 'dark'? "main" : 'dark']}`,
  ...( background && 
      (background == 'transparent' &&
        {
          background: theme.palette.mode == 'dark' ? `rgba(0,0,0,${opacity || '0'})` : theme.palette.common.white,
        }
      )||
      (background == 'light' &&
        {
          background: `linear-gradient(54deg, ${theme.palette.background[theme.palette.mode == 'dark' ? 'default' : 'paper']} 0%,${theme.palette.background[theme.palette.mode == 'dark' ? 'default' : 'paper']} 10%, ${theme.palette.background.paper} 75%, ${theme.palette.background.paper} 100%)`,
        }
      )||
      (background == 'dark' &&
        {
          background: `${theme.palette.background.paper}`,
        }
      )||
      (
        {
          background: theme.palette.background.default,
        }
      )
    )
}))

export default BasicCard