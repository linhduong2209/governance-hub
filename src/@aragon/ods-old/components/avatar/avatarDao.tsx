import React, {useEffect, useMemo, useState, type HTMLAttributes} from 'react';
import {styled} from 'styled-components';

export interface AvatarDaoProps extends HTMLAttributes<HTMLElement> {
  daoName: string;
  src?: string;
  size?: 'small' | 'medium' | 'big' | 'hero' | 'unset';
  onClick?: () => void;
}

export const AvatarDao: React.FC<AvatarDaoProps> = ({
  daoName,
  src,
  size = 'medium',
  onClick,
  ...props
}) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const daoInitials = useMemo(() => {
    // To allow for no name daos - should not be a thing
    if (!daoName) {
      return '';
    }

    const arr = daoName.trim().split(' ');
    if (arr.length === 1) {
      return arr[0][0];
    } else {
      return arr[0][0] + arr[1][0];
    }
  }, [daoName]);

  return error || !src ? (
    <FallBackAvatar onClick={onClick} size={size} {...props}>
      <DaoInitials>{daoInitials?.toUpperCase()}</DaoInitials>
    </FallBackAvatar>
  ) : (
    <Avatar
      src={src}
      size={size}
      alt="dao avatar"
      onClick={onClick}
      onError={() => setError(true)}
      {...props}
    />
  );
};

type AvatarPropsType = {
  size: NonNullable<AvatarDaoProps['size']>;
};

const sizes = {
  small: 'w-6 h-6 ft-text-xs',
  medium: 'w-12 h-12 ft-text-base',
  big: 'w-20 h-20 ft-text-lg',
  hero: 'w-28 h-28 ft-text-xl',
};

const Avatar = styled.img.attrs<AvatarPropsType>(({size}) => ({
  className: `${size !== 'unset' && sizes[size]} rounded-full` as string,
}))<AvatarPropsType>``;

const FallBackAvatar = styled.div.attrs<AvatarPropsType>(({size}) => ({
  className:
    'flex items-center justify-center font-semibold text-neutral-0 bg-gradient-to-r' +
    ` from-primary-500 to-primary-800 ${
      size !== 'unset' && sizes[size]
    } rounded-full border`,
}))<AvatarPropsType>``;

const DaoInitials = styled.p.attrs({
  className: 'w-8 h-8 flex items-center justify-center',
})``;
