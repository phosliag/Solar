declare module 'rc-slider' {
  import * as React from 'react';
  export interface RangeProps {
    min?: number;
    max?: number;
    step?: number | null;
    value?: number[];
    defaultValue?: number[];
    allowCross?: boolean;
    onChange?: (value: number[] | number) => void;
    onAfterChange?: (value: number[] | number) => void;
    disabled?: boolean;
    className?: string;
  }
  export const Range: React.FC<RangeProps>;
  const Slider: React.FC<any>;
  export default Slider;
}

