import React, {useEffect, useState} from 'react';
import Blockies from 'react-blockies';
import {styled} from 'styled-components';

import {IsAddress} from '../../utils/addresses';

export type AvatarProps = {
  /** Change Avatar's border Radius */
  mode?: 'circle' | 'square';
  /** Changes a Avatar's size */
  size: 'small' | 'default' | 'large';
  /** URL of the Avatar's src */
  src: string;
};

type SizesType = Record<AvatarProps['size'], {sizes: string; scale: number}>;

const BLOCKIES_SQUARES = 8;
const sizes: SizesType = {
  small: {sizes: 'w-6 h-6', scale: 3},
  default: {sizes: 'w-10 h-10', scale: 5},
  large: {sizes: 'w-12 h-12', scale: 6},
};

/** Simple Avatar*/
export const Avatar: React.FC<AvatarProps> = ({
  mode = 'circle',
  size = 'default',
  src,
}) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!error) {
    return (
      <AvatarContainer mode={mode} size={size}>
        {IsAddress(src) || src?.endsWith('.eth') ? (
          <Blockies
            seed={src}
            size={BLOCKIES_SQUARES}
            scale={sizes[size].scale}
          />
        ) : (
          <StyledAvatar
            {...{mode, size, src}}
            onError={() => {
              setError(true);
            }}
          />
        )}
      </AvatarContainer>
    );
  }

  return <FallbackAvatar />;
};

type StyledAvatarProps = Pick<AvatarProps, 'size'>;
type StyledContainerProps = Pick<AvatarProps, 'mode' | 'size'>;

const StyledAvatar = styled.img.attrs<StyledAvatarProps>(({size}) => {
  const className = `${sizes[size].sizes}`;
  return {className};
})<StyledAvatarProps>``;

const AvatarContainer = styled.div.attrs<StyledContainerProps>(
  ({size, mode}) => {
    const className = `overflow-hidden bg-neutral-100
    ${sizes[size].sizes}
    ${mode === 'circle' ? 'rounded-full' : 'rounded-2xl'}
    `;
    return {className};
  }
)<StyledContainerProps>``;

const FallbackAvatar = styled.div.attrs({
  className: 'w-6 h-6 rounded-full bg-gradient-to-tl from-neutral-900',
})``;
