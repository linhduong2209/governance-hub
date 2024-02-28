import React, {type ReactNode, type SyntheticEvent} from 'react';
import {styled} from 'styled-components';

import FallbackImg from '../../assets/avatar-token.svg';
import {Tag} from '../tag';

export type CardTokenProps = {
  tokenName: string;
  tokenSymbol: string;
  tokenImageUrl: string;
  treasurySharePercentage?: string;
  tokenCount: number | string;
  tokenUSDValue?: string;
  treasuryShare?: string;
  type?: 'vault' | 'transfer';
  bgWhite?: boolean;
  changeType?: 'Positive' | 'Negative';
  changeDuringInterval?: string;
  percentageChangeDuringInterval?: string;
};

// TODO: when refactoring, separate returns for vault and transfer
export const CardToken: React.FC<CardTokenProps> = ({
  type = 'vault',
  bgWhite = false,
  changeType = 'Positive',
  ...props
}) => {
  const isVault = type === 'vault';

  return (
    <Card data-testid="cardToken" bgWhite={bgWhite}>
      <CoinDetailsWithImage>
        <CoinImage
          src={props.tokenImageUrl}
          onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src = FallbackImg;
          }}
        />
        <CoinDetails>
          <CoinNameAndAllocation>
            <CoinName>{props.tokenName}</CoinName>
            <ToggleMobileVisibility visible={false}>
              {props.treasurySharePercentage && isVault && (
                <Tag label={props.treasurySharePercentage} />
              )}
            </ToggleMobileVisibility>
          </CoinNameAndAllocation>
          {isVault && (
            <SecondaryCoinDetails>
              <div className="flex space-x-1">
                <div className="truncate">{props.tokenCount}</div>{' '}
                <div>{props.tokenSymbol}</div>
              </div>
              {props.tokenUSDValue && (
                <ToggleMobileVisibility visible={false}>
                  <span>•</span>
                  <span> {props.tokenUSDValue}</span>
                </ToggleMobileVisibility>
              )}
            </SecondaryCoinDetails>
          )}
        </CoinDetails>
      </CoinDetailsWithImage>
      <MarketProperties>
        <FiatValue>
          {isVault ? (
            <div className="truncate">{props.treasuryShare}</div>
          ) : (
            <div className="flex justify-end space-x-1">
              <div className="truncate">{props.tokenCount}</div>{' '}
              <div>{props.tokenSymbol}</div>
            </div>
          )}
        </FiatValue>

        <SecondaryFiatDetails>
          {isVault ? (
            <>
              {props.changeDuringInterval && (
                <ToggleMobileVisibility visible={false}>
                  <span
                    className={
                      changeType === 'Positive'
                        ? 'text-success-800'
                        : 'text-critical-800'
                    }
                  >
                    {props.changeDuringInterval}
                  </span>
                </ToggleMobileVisibility>
              )}
              {props.percentageChangeDuringInterval && (
                <Tag
                  label={props.percentageChangeDuringInterval}
                  colorScheme={
                    changeType === 'Positive' ? 'success' : 'critical'
                  }
                />
              )}
            </>
          ) : (
            <div className="truncate">{props.treasuryShare}</div>
          )}
        </SecondaryFiatDetails>
      </MarketProperties>
    </Card>
  );
};

type CardProps = Pick<CardTokenProps, 'bgWhite'>;

const Card = styled.div.attrs<CardProps>(({bgWhite}) => ({
  className: `flex justify-between items-center py-5 px-6 overflow-hidden ${
    bgWhite ? 'bg-neutral-50' : 'bg-neutral-0'
  } rounded-xl`,
}))<CardProps>``;

const CoinDetailsWithImage = styled.div.attrs({
  className: 'flex items-center flex-auto overflow-hidden',
})``;

const CoinImage = styled.img.attrs(({src}) => ({
  className: 'w-6 h-6 md:h-10 md:w-10 rounded-full',
  src,
}))``;

const CoinDetails = styled.div.attrs({
  className: 'ml-4 space-y-2 overflow-hidden',
})``;

const CoinNameAndAllocation = styled.div.attrs({
  className: 'flex items-start space-x-2',
})``;

const CoinName = styled.h1.attrs({
  className: 'font-semibold text-neutral-800 truncate',
})``;

const SecondaryCoinDetails = styled.div.attrs({
  className: 'ft-text-sm text-neutral-500 space-x-1 md:flex',
})``;

const MarketProperties = styled.div.attrs({
  className: 'text-right space-y-2 flex-auto',
})``;

const FiatValue = styled.h1.attrs({
  className: 'font-semibold text-neutral-800',
})``;

const SecondaryFiatDetails = styled.div.attrs({
  className:
    'ft-text-sm text-neutral-500 space-x-2 flex justify-end items-center truncate',
})``;

type ToggleMobileVisibilityProps = {
  visible: boolean;
  children: ReactNode;
};

const ToggleMobileVisibility: React.FC<ToggleMobileVisibilityProps> = ({
  visible,
  children,
}) => {
  return (
    <div
      className={visible ? 'inline-block md:hidden' : 'hidden md:inline-block'}
    >
      {children}
    </div>
  );
};
