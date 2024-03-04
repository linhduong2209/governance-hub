import React, {useCallback, useEffect} from 'react';
import {
  Controller,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {
  DropdownInput,
  Label,
  ValueInput,
  InputValue as WalletInputValue,
} from '@aragon/ods-old';
import {AlertInline} from '@aragon/ods';

import {WrappedWalletInput} from 'components/wrappedWalletInput';
import {useActionsContext} from 'context/actions';
import {useAlertContext} from 'context/alert';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA} from 'utils/constants';
import {Web3Address, handleClipboardActions, toDisplayEns} from 'utils/library';
import {fetchBalance, getTokenInfo, isNativeToken} from 'utils/tokens';
import {ActionIndex} from 'utils/types';
import {
  validateTokenAddress,
  validateTokenAmount,
  validateWeb3Address,
} from 'utils/validators';
import {useTokenAsync} from 'services/token/queries/use-token';

type ConfigureWithdrawFormProps = ActionIndex; //extend if necessary

const ConfigureWithdrawForm: React.FC<ConfigureWithdrawFormProps> = ({
  actionIndex,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {network} = useNetwork();
  const {address} = useWallet();
  const {api: provider} = useProviders();
  const {setSelectedActionIndex} = useActionsContext();
  const {alert} = useAlertContext();
  const {data: daoDetails} = useDaoDetailsQuery();

  const fetchTokenAsync = useTokenAsync();

  const {control, getValues, trigger, resetField, setFocus, setValue} =
    useFormContext();

  const {errors, dirtyFields} = useFormState({control});
  const [name, from, tokenAddress, isCustomToken, tokenBalance, tokenSymbol] =
    useWatch({
      name: [
        `actions.${actionIndex}.name`,
        `actions.${actionIndex}.from`,
        `actions.${actionIndex}.tokenAddress`,
        `actions.${actionIndex}.isCustomToken`,
        `actions.${actionIndex}.tokenBalance`,
        `actions.${actionIndex}.tokenSymbol`,
      ],
    });
  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  /*************************************************
   *                    Hooks                      *
   *************************************************/
  useEffect(() => {
    if (isCustomToken) setFocus(`actions.${actionIndex}.tokenAddress`);

    if (from === '' && daoDetails?.address) {
      setValue(`actions.${actionIndex}.from`, daoDetails?.address);
    }
  }, [
    address,
    daoDetails?.address,
    from,
    actionIndex,
    isCustomToken,
    setFocus,
    setValue,
    nativeCurrency,
  ]);

  useEffect(() => {
    if (!name) {
      setValue(`actions.${actionIndex}.name`, 'withdraw_assets');
    }
  }, [actionIndex, name, setValue]);

  // Fetch custom token information
  useEffect(() => {
    if (!address || !isCustomToken || !tokenAddress) return;

    const fetchTokenInfo = async () => {
      if (errors.tokenAddress !== undefined) {
        if (dirtyFields.amount)
          trigger([
            `actions.${actionIndex}.amount`,
            `actions.${actionIndex}.tokenSymbol`,
          ]);
        return;
      }

      try {
        // fetch token balance and token metadata
        const allTokenInfoPromise = Promise.all([
          isNativeToken(tokenAddress)
            ? provider.getBalance(daoDetails?.address as string)
            : fetchBalance(
                tokenAddress,
                daoDetails?.address as string,
                provider,
                nativeCurrency
              ),
          fetchTokenAsync({
            address: tokenAddress,
            network,
            symbol: tokenSymbol,
          }),
          getTokenInfo(tokenAddress, provider, nativeCurrency),
        ]);

        const [balance, apiData, chainData] = await allTokenInfoPromise;
        if (apiData) {
          setValue(`actions.${actionIndex}.tokenName`, apiData.name);
          setValue(`actions.${actionIndex}.tokenSymbol`, apiData.symbol);
          setValue(`actions.${actionIndex}.tokenImgUrl`, apiData.imgUrl);
          setValue(`actions.${actionIndex}.tokenPrice`, apiData.price);
        }

        if (!apiData && chainData) {
          setValue(`actions.${actionIndex}.tokenName`, chainData.name);
          setValue(`actions.${actionIndex}.tokenSymbol`, chainData.symbol);
        }

        setValue(
          `actions.${actionIndex}.tokenDecimals`,
          Number(chainData.decimals)
        );
        setValue(`actions.${actionIndex}.tokenBalance`, balance);
      } catch (error) {
        /**
         * Error is intentionally swallowed. Passing invalid address will
         * return error, but should not be thrown.
         * Also, double safeguard. Should not actually fall into here since
         * tokenAddress should be valid in the first place for balance to be fetched.
         */
        console.error(error);
      }
      if (dirtyFields.amount)
        trigger([
          `actions.${actionIndex}.amount`,
          `actions.${actionIndex}.tokenSymbol`,
        ]);
    };

    if (daoDetails?.address) {
      fetchTokenInfo();
    }
  }, [
    address,
    dirtyFields.amount,
    errors.tokenAddress,
    actionIndex,
    isCustomToken,
    provider,
    setValue,
    fetchTokenAsync,
    tokenAddress,
    trigger,
    network,
    daoDetails?.address,
    nativeCurrency,
    tokenSymbol,
  ]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const renderWarning = useCallback(
    (value: string) => {
      // Insufficient data to calculate warning
      if (!tokenBalance || value === '') return null;

      if (Number(value) > Number(tokenBalance))
        return (
          <AlertInline
            message={t('warnings.amountGtDaoToken')}
            variant="warning"
          />
        );
    },
    [tokenBalance, t]
  );

  // add maximum amount to amount field
  const handleMaxClicked = useCallback(
    (onChange: React.ChangeEventHandler<HTMLInputElement>) => {
      if (tokenBalance) {
        onChange(tokenBalance);
        alert(t('alert.chip.max'));
      }
    },
    [alert, t, tokenBalance]
  );

  // clear field when there is a value, else paste
  const handleAdornmentClick = useCallback(
    (value: string, onChange: (value: string) => void) => {
      // when there is a value clear it
      if (value) {
        onChange('');
        alert(t('alert.chip.inputCleared'));
      } else handleClipboardActions(value, onChange, alert);
    },
    [alert, t]
  );

  /*************************************************
   *                Field Validators               *
   *************************************************/
  const addressValidator = useCallback(
    async (address: string) => {
      if (isNativeToken(address)) return true;

      const validationResult = await validateTokenAddress(address, provider);

      // address invalid, reset token fields
      if (validationResult !== true) {
        resetField(`actions.${actionIndex}.tokenName`);
        resetField(`actions.${actionIndex}.tokenImgUrl`);
        resetField(`actions.${actionIndex}.tokenSymbol`);
        resetField(`actions.${actionIndex}.tokenBalance`);
      }

      return validationResult;
    },
    [actionIndex, provider, resetField]
  );

  const amountValidator = useCallback(
    async (amount: string) => {
      const tokenAddress = getValues(`actions.${actionIndex}.tokenAddress`);

      // check if a token is selected using its address
      if (tokenAddress === '') return t('errors.noTokenSelected');

      // check if token selected is valid
      if (errors.tokenAddress) return t('errors.amountWithInvalidToken');

      try {
        const {decimals} = await getTokenInfo(
          tokenAddress,
          provider,
          nativeCurrency
        );

        // run amount rules
        return validateTokenAmount(amount, decimals);
      } catch (error) {
        // catches miscellaneous cases such as not being able to get token decimal
        console.error('Error validating amount', error);
        return t('errors.defaultAmountValidationError');
      }
    },
    [errors.tokenAddress, getValues, actionIndex, provider, t, nativeCurrency]
  );

  const recipientValidator = useCallback(
    async (value: WalletInputValue) => {
      const recipient = new Web3Address(provider, value.address, value.ensName);

      // withdrawing to DAO
      if (
        recipient.address === daoDetails?.address ||
        recipient.ensName === toDisplayEns(daoDetails?.ensDomain)
      )
        return 'Cant withdraw to your own address';

      return validateWeb3Address(recipient, t('errors.required.recipient'), t);
    },
    [daoDetails?.address, daoDetails?.ensDomain, provider, t]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <>
      {/* Recipient (to) */}
      <FormItem>
        <Label
          label={t('labels.recipient')}
          helpText={t('newWithdraw.configureWithdraw.toSubtitle')}
        />
        <Controller
          name={`actions.${actionIndex}.to`}
          control={control}
          defaultValue={{address: '', ensName: ''}}
          rules={{validate: recipientValidator}}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <WrappedWalletInput
              name={name}
              state={error && 'critical'}
              value={value}
              onBlur={onBlur}
              onChange={onChange}
              error={error?.message}
              resolveLabels="enabled"
            />
          )}
        />
      </FormItem>

      {/* Select token */}
      <FormItem>
        <Label
          label={t('labels.token')}
          helpText={t('newWithdraw.configureWithdraw.tokenSubtitle')}
        />
        <Controller
          name={`actions.${actionIndex}.tokenSymbol`}
          control={control}
          defaultValue=""
          rules={{required: t('errors.required.token')}}
          render={({field: {name, value}, fieldState: {error}}) => (
            <>
              <DropdownInput
                name={name}
                mode={error ? 'critical' : 'default'}
                value={value}
                onClick={() => {
                  setSelectedActionIndex(actionIndex);
                  open('token');
                }}
                placeholder={t('placeHolders.selectToken')}
              />
              {error?.message && (
                <AlertInline message={error.message} variant="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      {/* Custom token address */}
      {isCustomToken && (
        <FormItem>
          <Label
            label={t('labels.address')}
            helpText={t('newDeposit.contractAddressSubtitle')}
          />
          <Controller
            name={`actions.${actionIndex}.tokenAddress`}
            control={control}
            defaultValue=""
            rules={{
              required: t('errors.required.tokenAddress'),
              validate: addressValidator,
            }}
            render={({
              field: {name, onBlur, onChange, value, ref},
              fieldState: {error},
            }) => (
              <>
                <ValueInput
                  mode={error ? 'critical' : 'default'}
                  ref={ref}
                  name={name}
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  adornmentText={value ? t('labels.clear') : t('labels.paste')}
                  onAdornmentClick={() => handleAdornmentClick(value, onChange)}
                />
                {error?.message && (
                  <AlertInline message={error.message} variant="critical" />
                )}
              </>
            )}
          />
        </FormItem>
      )}

      {/* Token amount */}
      <FormItem>
        <Label
          label={t('labels.amount')}
          helpText={t('newWithdraw.configureWithdraw.amountSubtitle')}
        />
        <Controller
          name={`actions.${actionIndex}.amount`}
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.amount'),
            validate: amountValidator,
          }}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <>
              <StyledInput
                mode={error ? 'critical' : 'default'}
                name={name}
                type="number"
                value={value}
                placeholder="0"
                onBlur={onBlur}
                onChange={onChange}
                adornmentText={t('labels.max')}
                onAdornmentClick={() => handleMaxClicked(onChange)}
              />
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  {error?.message && (
                    <AlertInline message={error.message} variant="critical" />
                  )}
                  {renderWarning(value)}
                </div>
                {tokenBalance && (
                  <TokenBalance>
                    {`${t(
                      'labels.maxBalance'
                    )}: ${tokenBalance} ${tokenSymbol}`}
                  </TokenBalance>
                )}
              </div>
            </>
          )}
        />
      </FormItem>
    </>
  );
};

export default ConfigureWithdrawForm;

/*************************************************
 *               Styled Components               *
 *************************************************/

const FormItem = styled.div.attrs({
  className: 'space-y-3',
})``;

const TokenBalance = styled.p.attrs({
  className: 'flex-1 px-2 text-xs leading-normal text-right text-neutral-600',
})``;

const StyledInput = styled(ValueInput)`
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;
