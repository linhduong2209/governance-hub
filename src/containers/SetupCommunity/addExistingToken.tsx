import {InputValue, Label} from 'src/@aragon/ods-old';
import {formatUnits} from 'ethers/lib/utils';
import React, {useCallback, useEffect} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import VerificationCard from 'src/components/VerificationCard';
import {WrappedWalletInput} from 'src/components/WrappedWalletInput';
import {useNetwork} from 'src/context/network';
import {CHAIN_METADATA} from 'src/utils/constants';
import {htmlIn} from 'src/utils/htmlIn';
import {Web3Address} from 'src/utils/library';
import {getTokenInfo} from 'src/utils/tokens';
import {validateGovernanceTokenAddress} from 'src/utils/validators';
import {usePluginClient} from 'src/hooks/usePluginClient';
import {TokenVotingClient} from '@aragon/sdk-client';
import {aragonGateway} from 'src/utils/aragonGateway';

const AddExistingToken: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {control, trigger, clearErrors, setValue, resetField} =
    useFormContext();

  const [tokenAddress, blockchain] = useWatch({
    name: ['tokenAddress', 'blockchain'],
  });

  // non-null assertion because blockchain comes from the list of
  // supported chains
  const provider = aragonGateway.getRpcProvider(blockchain.id)!;
  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;
  const tokenAddressBlockExplorerURL =
    CHAIN_METADATA[network].explorer + 'token/';

  // get plugin Client
  const pluginClient = usePluginClient('token-voting.plugin.dao.eth');

  // Trigger address validation on network change
  useEffect(() => {
    if (blockchain.id && tokenAddress.address !== '') {
      trigger('tokenAddress');
    }
  }, [blockchain.id, trigger, nativeCurrency, tokenAddress]);

  /*************************************************
   *            Functions and Callbacks            *
   *************************************************/
  const addressValidator = useCallback(
    async (value: InputValue) => {
      clearErrors('tokenAddress');
      resetField('tokenType');
      resetField('tokenName');
      resetField('tokenTotalSupply');

      const tokenContract = new Web3Address(
        provider,
        value.address,
        value.ensName
      );

      const {verificationResult, type} = await validateGovernanceTokenAddress(
        tokenContract.address as string,
        provider,
        pluginClient as TokenVotingClient
      );

      if (verificationResult === true) {
        if (type !== 'Unknown') {
          const {totalSupply, decimals, symbol, name} = await getTokenInfo(
            tokenContract.address as string,
            provider,
            CHAIN_METADATA[network].nativeCurrency
          );

          setValue('tokenName', name, {shouldDirty: true});
          setValue('tokenSymbol', symbol, {shouldDirty: true});
          setValue('tokenDecimals', decimals, {shouldDirty: true});
          setValue(
            'tokenTotalSupply',
            Number(formatUnits(totalSupply, decimals)),
            {shouldDirty: true}
          );
        }
        setValue('tokenType', type);
      }

      return verificationResult;
    },
    [clearErrors, network, pluginClient, provider, resetField, setValue]
  );

  return (
    <>
      <DescriptionContainer>
        <Title>{t('createDAO.step3.existingToken.title')}</Title>
        <Subtitle
          dangerouslySetInnerHTML={{
            __html: htmlIn(t)('createDAO.step3.existingToken.description'),
          }}
        />
      </DescriptionContainer>
      <FormItem>
        <DescriptionContainer>
          <Label label={t('createDAO.step3.existingToken.inputLabel')} />
          <p>
            <span>{t('createDAO.step3.existingToken.inputDescription')}</span>
          </p>
        </DescriptionContainer>
        <Controller
          name="tokenAddress"
          control={control}
          defaultValue={{address: '', ensName: ''}}
          rules={{
            required: t('errors.required.tokenAddress'),
            validate: addressValidator,
          }}
          render={({
            field: {name, value, onBlur, onChange},
            fieldState: {error, isDirty},
          }) => (
            <>
              <WrappedWalletInput
                name={name}
                state={error && 'critical'}
                value={value}
                onBlur={onBlur}
                placeholder={'0x…'}
                onChange={onChange}
                error={error?.message}
                blockExplorerURL={tokenAddressBlockExplorerURL}
              />
              {!error?.message && isDirty && value.address && (
                <VerificationCard tokenAddress={value.address} />
              )}
            </>
          )}
        />
      </FormItem>
    </>
  );
};

export default AddExistingToken;

const FormItem = styled.div.attrs({
  className: 'space-y-3',
})``;

const DescriptionContainer = styled.div.attrs({
  className: 'space-y-1',
})``;

const Title = styled.p.attrs({
  className: 'text-xl leading-normal font-semibold text-neutral-800',
})``;

const Subtitle = styled.p.attrs({className: 'text-neutral-600 text-bold'})``;
