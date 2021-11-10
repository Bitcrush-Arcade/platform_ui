import Tooltip, {TooltipProps} from '@material-ui/core/Tooltip'
import { SvgIconProps } from '@material-ui/core/SvgIcon';
// Icon
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

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