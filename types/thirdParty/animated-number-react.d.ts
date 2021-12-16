declare module 'animated-number-react'{
  interface AnimatedNumberProps {
    value: string | number;
    duration?: number;
    delay?: number;
    className?: string;
    easing?: string;
    formatValue: (value: number) => string;
  }
  const AnimatedNumber: (props: AnimatedNumberProps) => React.ReactElement<AnimatedNumberProps>;
  export default AnimatedNumber;
}