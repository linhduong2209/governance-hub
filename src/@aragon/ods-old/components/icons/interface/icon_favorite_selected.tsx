import React from 'react';
import {type IconType} from '..';

export const IconFavoriteSelected: IconType = ({
  height = 16,
  width = 16,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        d="M15.9413 5.98803C15.8734 5.76427 15.7463 5.56516 15.5748 5.41371C15.4033 5.26225 15.1944 5.16463 14.9721 5.13211L10.884 4.48658L9.0748 0.646884C8.96555 0.450113 8.80882 0.286797 8.62029 0.173274C8.43175 0.0597504 8.21802 0 8.00048 0C7.78294 0 7.56921 0.0597504 7.38067 0.173274C7.19214 0.286797 7.03541 0.450113 6.92617 0.646884L5.07354 4.51885L1.02886 5.13211C0.807154 5.16533 0.59878 5.26285 0.427353 5.41361C0.255925 5.56436 0.128299 5.76233 0.0589391 5.98508C-0.0104209 6.20783 -0.0187413 6.44644 0.0349209 6.67388C0.0885831 6.90132 0.202082 7.10849 0.362554 7.27191L3.31464 10.3131L2.6289 14.5353C2.591 14.7658 2.61554 15.0028 2.69974 15.2194C2.78394 15.4361 2.92444 15.6237 3.10533 15.7612C3.28622 15.8987 3.50029 15.9804 3.72331 15.9972C3.94633 16.014 4.16938 15.9652 4.36724 15.8562L8.02563 13.8587L11.6452 15.8514C11.843 15.9604 12.0661 16.0092 12.2891 15.9924C12.5121 15.9756 12.7262 15.8939 12.9071 15.7564C13.088 15.619 13.2285 15.4313 13.3127 15.2146C13.3968 14.998 13.4214 14.761 13.3835 14.5305L12.7092 10.2569L15.6384 7.26832C15.7984 7.10596 15.9116 6.89988 15.9651 6.67354C16.0187 6.44721 16.0104 6.20969 15.9413 5.98803Z"
        fill="currentColor"
      />
    </svg>
  );
};
