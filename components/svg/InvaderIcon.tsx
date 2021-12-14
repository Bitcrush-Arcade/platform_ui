import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

const InvaderIcon = ( props: SvgIconProps ) => <SvgIcon {...props} viewBox="0 0 27 16.21" id="Warstwa_1" data-name="Warstwa 1" xmlns="http://www.w3.org/2000/svg">
  <path d="M23.47,10.8V3.6H19.84V1.79H18.05V3.57h-1.8V5.36H10.82V3.6H9V1.79H7.21V3.58H3.6v7.2H0v3.61H1.77V12.63H3.58V14.4H5.39v1.81H7.2V12.63h3.61v1.78H9v1.8h1.8c0-.6,0-1.19,0-1.79h5.41v1.79H18v-1.8h-1.8V12.63h3.61v3.58h1.8V14.42h1.81v-1.8h1.79v1.79H27V10.8ZM9,9H7.22V7.21H9ZM19.83,9H18.06V7.21h1.77ZM7.2,1.78h0ZM3.61,0V1.78H7.2V0ZM19.85,1.78h0ZM23.43,0H19.85V1.78h3.58Z"/>
</SvgIcon>

export default InvaderIcon

export const invaderGradient = () :[JSX.Element, string] => {
  const id = "invader_gradient"
  const svg = <svg width={1} height={1} >
    <linearGradient spreadMethod="pad" id={id} x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0" stopColor="rgb(65, 180, 200)" />
      <stop offset="16%" stopColor="rgb(65, 180, 200)" />
      <stop offset="72%" stopColor="rgb(130, 42, 224)" />
      <stop offset="100" stopColor="rgb(131, 43, 225)" />
    </linearGradient>
  </svg>
  return [svg,id]
}