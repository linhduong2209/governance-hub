import {ListItemAddress} from '@aragon/ods-old';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod} from 'components/accordionMethod';
import AccordionSummary from 'containers/actionBuilder/addAddresses/accordionSummary';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {CHAIN_METADATA} from 'utils/constants';
import {Web3Address} from 'utils/library';
import {ActionRemoveAddress} from 'utils/types';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';

export const RemoveAddressCard: React.FC<{
  action: ActionRemoveAddress;
}> = ({action: {inputs}}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {data: daoDetails} = useDaoDetailsQuery();
  const {api: provider} = useProviders();

  const [addresses, setAddresses] = useState<Web3Address[]>([]);

  /*************************************************
   *                    Effects                    *
   *************************************************/
  useEffect(() => {
    async function mapToWeb3Addresses() {
      try {
        const response = await Promise.all(
          inputs.memberWallets.map(
            async ({address, ensName}) =>
              await Web3Address.create(provider, {address, ensName})
          )
        );

        setAddresses(response);
      } catch (error) {
        console.error('Error creating Web3Addresses', error);
      }
    }

    if (inputs.memberWallets) mapToWeb3Addresses();
  }, [inputs.memberWallets, network, provider]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleAddressClick = useCallback(
    (addressOrEns: string | null) => {
      window.open(
        `${CHAIN_METADATA[network].explorer}address/${addressOrEns}`,
        '_blank'
      );
    },
    [network]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <AccordionMethod
      verified
      type="execution-widget"
      methodName={t('labels.removeWallets')}
      smartContractName={`Multisig v${daoDetails?.plugins[0].release}.${daoDetails?.plugins[0].build}`}
      smartContractAddress={daoDetails?.plugins[0].instanceAddress}
      blockExplorerLink={
        daoDetails?.plugins[0].instanceAddress
          ? `${CHAIN_METADATA[network].explorer}address/${daoDetails?.plugins[0].instanceAddress}`
          : undefined
      }
      methodDescription={t('labels.removeWalletsDescription')}
    >
      <Container>
        {inputs.memberWallets.map(({address, ensName}, index) => {
          const label = ensName || addresses[index]?.ensName || address;

          return (
            <ListItemAddress
              label={label}
              src={addresses[index]?.avatar || address}
              key={address}
              onClick={() => handleAddressClick(label)}
            />
          );
        })}
      </Container>
      <AccordionSummary
        type="execution-widget"
        total={inputs.memberWallets.length}
        IsRemove
      />
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className: 'bg-neutral-50 border border-t-0 border-neutral-100 space-y-2 p-4',
})``;
