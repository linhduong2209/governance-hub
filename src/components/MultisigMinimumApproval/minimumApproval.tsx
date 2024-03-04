import React from 'react';
import {NumberInput, NumberInputProps} from 'src/@aragon/ods-old';
import {Progress, AlertInline, IAlertInlineProps} from '@aragon/ods';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

type Props = NumberInputProps & {
  max: number;
  min: number;
  value: number | string;
  error?: IAlertInlineProps;
};
const MinimumApproval: React.FC<Props> = ({max, min, ...rest}) => {
  const {t} = useTranslation();

  const value = Number(rest.value);

  return (
    <>
      <Container>
        <InputWrapper>
          <NumberInput
            {...rest}
            max={max}
            min={min}
            disableIncrement={max === value}
            disableDecrement={min === value}
          />
        </InputWrapper>

        <ProgressWrapper>
          <LinearProgressContainer>
            <Progress value={((value <= max ? value : max) / max) * 100} />
            <ProgressInfo>
              <ApprovalAddresses
                style={{
                  flexBasis: `${((value <= max ? value : max) / max) * 100}%`,
                }}
              >
                {value <= max ? value : max}
              </ApprovalAddresses>
              <TotalAddresses>
                {t('createDAO.step4.minApprovalAddressCount', {count: max})}
              </TotalAddresses>
            </ProgressInfo>
          </LinearProgressContainer>
        </ProgressWrapper>
      </Container>
      {rest.error && <AlertInline {...rest.error} />}
    </>
  );
};

export default MinimumApproval;

const Container = styled.div.attrs({
  className:
    'flex flex-col xl:flex-row items-center p-4 pt-8 xl:p-6 gap-x-6 gap-y-8 rounded-xl bg-neutral-0',
})``;

const LinearProgressContainer = styled.div.attrs({
  className: 'flex relative flex-1 items-center',
})``;

const ProgressInfo = styled.div.attrs({
  className:
    'flex absolute whitespace-nowrap -top-5 justify-between space-x-1 w-full text-sm leading-normal ',
})``;

const ApprovalAddresses = styled.p.attrs({
  className: 'font-semibold text-right text-primary-500',
})``;

const TotalAddresses = styled.p.attrs({
  className: 'text-neutral-600 ft-text-sm',
})``;

const InputWrapper = styled.div.attrs({
  className: 'order-2 xl:order-1 w-full xl:w-1/4',
})``;

const ProgressWrapper = styled.div.attrs({
  className: 'flex flex-1 xl:order-2 items-center w-full',
})``;
