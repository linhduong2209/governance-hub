import React from 'react';
import {type IconType} from '..';

export const IconSpinner: IconType = ({height = 16, width = 16, ...props}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        d="M14.3784 11.6827L13.7275 11.3067C13.554 11.2067 13.4918 10.9892 13.5815 10.8105C14.5233 8.93891 14.4671 6.6961 13.4131 4.87466C12.3615 3.04966 10.4475 1.87988 8.3559 1.75966C8.15621 1.7481 7.99902 1.58529 7.99902 1.38529V0.633724C7.99902 0.417974 8.18027 0.248193 8.3959 0.259037C11.0068 0.393412 13.401 1.84854 14.7118 4.12373C16.0262 6.39548 16.089 9.1961 14.9003 11.5247C14.8021 11.7165 14.5643 11.789 14.3775 11.6812L14.3784 11.6827Z"
        fill="currentColor"
      />
    </svg>
  );
};
