import React from 'react';
import styled from 'styled-components';
import {AvatarToken} from '@aragon/ods-old';

export type TokenProps = {
  tokenName: string;
  tokenLogo: string;
  tokenSymbol: string;
  tokenBalance: string;
};

export default function TokenBox({
  tokenName,
  tokenLogo,
  tokenSymbol,
  tokenBalance,
}: TokenProps) {
  return (
    <Box>
      <AvatarTokenWrapper>
        <AvatarToken size="medium" src={tokenLogo} />
      </AvatarTokenWrapper>
      <TextWrapper>
        <Name>{tokenName}</Name>
        <Price>{tokenBalance ? `${tokenBalance} ${tokenSymbol}` : '-'}</Price>
      </TextWrapper>
    </Box>
  );
}

const Box = styled.div.attrs({
  className: `flex items-center gap-x-4 py-3 px-4
    bg-neutral-0 rounded-xl cursor-pointer
    hover:text-neutral-800 hover:bg-neutral-100`,
})``;

const AvatarTokenWrapper = styled.span``;

const TextWrapper = styled.div.attrs({
  className: 'flex overflow-hidden gap-x-4 w-full',
})``;

const Name = styled.span.attrs({
  className:
    'ft-text-base font-semibold ft-text-base flex-1 text-left truncate text-neutral-600',
})``;

const Price = styled.span.attrs({
  className:
    'ft-text-base font-normal flex-none w-1/3 text-neutral-500 text-right truncate',
})``;
