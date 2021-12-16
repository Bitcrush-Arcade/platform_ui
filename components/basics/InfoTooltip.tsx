import Tooltip, {TooltipProps} from '@mui/material/Tooltip'
import { SvgIconProps } from '@mui/material/SvgIcon';
// Icon
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type InfoProps ={
  info: TooltipProps['title'],
  tooltipProps?: Omit<TooltipProps, 'title' | 'arrow' | 'children'>,
  color?: SvgIconProps['color'],
}

const InfoTooltip = (props: InfoProps) => {
  const { info, tooltipProps, color } = props
  return <Tooltip arrow 
    title={info}
    {...tooltipProps}
  >
    <InfoOutlinedIcon color={color}/>
  </Tooltip>
}

export default InfoTooltip