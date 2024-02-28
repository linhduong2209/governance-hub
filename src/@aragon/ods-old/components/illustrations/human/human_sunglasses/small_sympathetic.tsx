import React from 'react';
import {type IconType} from '../../../icons';

export const SmallSympathetic: IconType = ({
  height = 160,
  width = 160,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 400 225"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M183.2 74C183.2 70.7967 185.797 68.2 189 68.2C192.203 68.2 194.8 70.7967 194.8 74V75.0408L203.2 75.0408V74C203.2 70.7967 205.797 68.2 209 68.2C212.203 68.2 214.8 70.7967 214.8 74V74.6222L220.56 70.8317C220.929 70.5888 221.425 70.6911 221.668 71.0602C221.911 71.4293 221.809 71.9254 221.44 72.1682L214.843 76.5092C214.829 76.5185 214.814 76.5273 214.8 76.5356V80.6666C214.8 82.3971 213.397 83.8 211.667 83.8H206.333C204.603 83.8 203.2 82.3971 203.2 80.6666V76.6408L194.8 76.6408V80.6666C194.8 82.3971 193.397 83.8 191.667 83.8H186.333C184.603 83.8 183.2 82.3971 183.2 80.6666V76.5357C183.14 76.5012 183.083 76.4581 183.031 76.4065L177.434 70.8098C177.122 70.4974 177.122 69.9908 177.434 69.6784C177.747 69.366 178.253 69.366 178.566 69.6784L183.2 74.3127V74ZM189 69.8C186.68 69.8 184.8 71.6804 184.8 74V80.6666C184.8 81.5135 185.486 82.2 186.333 82.2H191.667C192.513 82.2 193.2 81.5135 193.2 80.6666V74C193.2 71.6804 191.32 69.8 189 69.8ZM204.8 74C204.8 71.6804 206.68 69.8 209 69.8C211.32 69.8 213.2 71.6804 213.2 74V80.6666C213.2 81.5135 212.513 82.2 211.667 82.2H206.333C205.486 82.2 204.8 81.5135 204.8 80.6666V74Z"
        fill="#001F5C"
      />
    </svg>
  );
};
