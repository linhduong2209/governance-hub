import {Dropdown, InputValue as WalletInputValue} from 'src/@aragon/ods-old';
import {Button, IconType} from '@aragon/ods';
import React, {useCallback} from 'react';
import {
  Controller,
  useFormContext,
  useWatch,
  ValidateResult,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {WrappedWalletInput} from 'src/components/WrappedWalletInput';
import {useAlertContext} from 'src/context/alert';
import {useProviders} from 'src/context/providers';
import {DaoMember} from 'src/hooks/useDaoMembers';
import {Web3Address} from 'src/utils/library';
import {ActionAddAddress} from 'src/utils/types';
import {validateWeb3Address} from 'src/utils/validators';

/**
 * Type for row validation on the add row action builder component
 */
export type CustomRowValidator = (
  {address, ensName}: WalletInputValue,
  memberWallets: DaoMember[] | undefined,
  index: number
) => Promise<ValidateResult>;

type Props = {
  actionIndex: number;
  // TODO: when refactoring, this is what indicates whether the row
  // should be editable or not. Please rename.
  isRemove?: boolean;
  fieldIndex: number;
  dropdownItems: Array<{
    callback: (index: number) => void;
    component: React.ReactNode;
  }>;
  onBlur?: () => void;
  onClearRow?: () => void;
  currentDaoMembers?: DaoMember[];
  customRowValidator?: CustomRowValidator;
};

export const AddressRow = ({
  actionIndex,
  isRemove = false,
  fieldIndex,
  dropdownItems,
  onBlur,
  onClearRow,
  currentDaoMembers,
  customRowValidator,
}: Props) => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {api: provider} = useProviders();

  const {control} = useFormContext();

  const memberWalletsKey = `actions.${actionIndex}.inputs.memberWallets`;
  const memberWallets: ActionAddAddress['inputs']['memberWallets'] = useWatch({
    name: memberWalletsKey,
    control,
  });

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleRowClear = useCallback(() => {
    alert(t('alert.chip.inputCleared'));
    onClearRow?.();
  }, [alert, onClearRow, t]);

  const addressValidator = useCallback(
    async ({address, ensName}: WalletInputValue, index: number) => {
      const web3Address = new Web3Address(provider, address, ensName);

      // check if address is valid
      let validationResult = await validateWeb3Address(
        new Web3Address(provider, address, ensName),
        t('errors.required.walletAddress'),
        t
      );

      // check if there is duplicated address in the Multisig plugin
      if (
        currentDaoMembers?.some(
          member =>
            member.address.toLowerCase() === web3Address.address?.toLowerCase()
        )
      )
        validationResult = t('errors.duplicateAddressOnCurrentMembersList');

      // check if there is a duplicate in the form
      if (
        memberWallets?.some(
          ({address, ensName}, memberWalletIndex) =>
            (address === web3Address.address ||
              ensName === web3Address.ensName) &&
            memberWalletIndex !== index
        )
      )
        validationResult = t('errors.duplicateAddress');

      return validationResult;
    },
    [currentDaoMembers, memberWallets, provider, t]
  );

  /*************************************************
   *                    Render                    *
   *************************************************/
  return (
    <Controller
      name={`${memberWalletsKey}.${fieldIndex}`}
      defaultValue={{address: '', ensName: ''}}
      control={control}
      rules={{
        validate: value =>
          customRowValidator
            ? customRowValidator(value, memberWallets, fieldIndex)
            : addressValidator(value, fieldIndex),
      }}
      render={({field: {onChange, ref, value}, fieldState: {error}}) => (
        <Container>
          <InputContainer>
            <WrappedWalletInput
              state={error && 'critical'}
              disabled={isRemove}
              value={value}
              onBlur={onBlur}
              onChange={onChange}
              error={error?.message}
              resolveLabels="onBlur"
              ref={ref}
              onClearButtonClick={handleRowClear}
            />
          </InputContainer>
          <Dropdown
            disabled={memberWallets?.length === 1 && !isRemove}
            side="bottom"
            align="start"
            sideOffset={4}
            listItems={dropdownItems.map(item => ({
              component: item.component,
              callback: () => item.callback(fieldIndex),
            }))}
            trigger={
              <Button
                size="lg"
                variant="tertiary"
                iconLeft={IconType.DOTS_VERTICAL}
                data-testid="trigger"
              />
            }
          />
        </Container>
      )}
    />
  );
};

const Container = styled.div.attrs(() => ({
  className: 'flex gap-4 items-start',
}))``;

const InputContainer = styled.div.attrs(() => ({
  className: 'flex flex-col gap-2 flex-1',
}))``;
