import SvgIcon, { SvgIconProps } from "@material-ui/core/SvgIcon";

const MenuIcon = ( props: SvgIconProps ) => <SvgIcon {...props} viewBox="0 0 31 31" id="Warstwa_1" data-name="Warstwa 1" xmlns="http://www.w3.org/2000/svg">
  <path d="M0,5H5V0H0ZM13,5h5V0H13ZM26,0V5h5V0ZM0,18H5V13H0Zm13,0h5V13H13Zm13,0h5V13H26ZM0,31H5V26H0Zm13,0h5V26H13Zm13,0h5V26H26Z"/>
</SvgIcon>

export default MenuIcon

export const gradient = ():[JSX.Element, string] => {
  const id = "menu_gradient_icon"
  const svg = <svg width="1" height="1" >
    <linearGradient id={id} x1="-8.09" y1="-7.1" x2="35.48" y2="34.64" gradientUnits="userSpaceOnUse">
      <stop offset="0.14" stopColor="#0c0e22"/>
      <stop offset="1" stopColor="#ad43ef"/>
    </linearGradient>
  </svg>
  return [svg, id]
}
export const gradient2 = ():[JSX.Element, string] => {
  const id = "menu_gradient_icon_close"
  const svg = <svg width="1" height="1" >
    <linearGradient id={id} x1="-8.09" y1="-7.1" x2="35.48" y2="34.64" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#ad43ef"/>
      <stop offset="0.92" stopColor="#0c0e22"/>
    </linearGradient>
  </svg>
  return [svg, id]
}