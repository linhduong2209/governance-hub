import React, {useCallback} from 'react';
import {Button, AlertInline} from '@aragon/ods';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'src/components/ModalBottomSheetSwitcher';
import {WrappedWalletInput} from 'src/components/WrappedWalletInput';
import {useGlobalModalContext} from 'src/context/globalModals';
import {useNetwork} from 'src/context/network';
import {useDaoDetailsQuery} from 'src/hooks/useDaoDetails';
import {useWallet} from 'src/hooks/useWallet';
import {CHAIN_METADATA, ENS_SUPPORTED_NETWORKS} from 'src/utils/constants';
import {toDisplayEns} from 'src/utils/library';
import {AllTransfers} from 'src/utils/paths';

const DepositModal: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {isOpen, open, close} = useGlobalModalContext('deposit');
  const {status, isConnected, isOnWrongNetwork} = useWallet();

  const {data: daoDetails} = useDaoDetailsQuery();

  const networkSupportsENS = ENS_SUPPORTED_NETWORKS.includes(network);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleCtaClicked = useCallback(() => {
    close();
    navigate(
      generatePath(AllTransfers, {
        network,
        dao: toDisplayEns(daoDetails?.ensDomain) || daoDetails?.address,
      })
    );
  }, [close, daoDetails?.address, daoDetails?.ensDomain, navigate, network]);

  // close modal and initiate the login/wrong network flow
  const handleConnectClick = useCallback(() => {
    const modalState = {onSuccess: () => open('deposit')};

    if (!isConnected) {
      open('wallet', modalState);
    } else if (isOnWrongNetwork) {
      open('network', modalState);
    }
  }, [open, isConnected, isOnWrongNetwork]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (!daoDetails) {
    return null;
  }

  return (
    <ModalBottomSheetSwitcher
      isOpen={isOpen}
      onClose={close}
      title={t('modal.deposit.headerTitle')}
      subtitle={t('modal.deposit.headerDescription')}
    >
      <Container>
        <div>
          <Title>{t('modal.deposit.inputLabelBlockchain')}</Title>
          <Subtitle>{t('modal.deposit.inputHelptextBlockchain')}</Subtitle>
          <NetworkDetailsWrapper>
            <HStack>
              <Logo src={CHAIN_METADATA[network].logo} />
              <NetworkName>{CHAIN_METADATA[network].name}</NetworkName>
              {status === 'connected' && !isOnWrongNetwork ? (
                <AlertInline
                  message={t('modal.deposit.statusBlockchain')}
                  variant="success"
                />
              ) : (
                <ConnectButton onClick={handleConnectClick}>
                  {t('modal.deposit.ctaBlockchain')}
                </ConnectButton>
              )}
            </HStack>
          </NetworkDetailsWrapper>
        </div>

        <div>
          <Title>{t('modal.deposit.inputLabelEns')}</Title>
          <Subtitle>{t('modal.deposit.inputHelptextEns')}</Subtitle>
          <WrappedWalletInput
            value={{
              ensName: networkSupportsENS
                ? toDisplayEns(daoDetails.ensDomain)
                : '',
              address: daoDetails.address,
            }}
            onChange={() => {}}
            disabled
          />
        </div>

        <HStack>
          <Button variant="primary" size="lg" onClick={handleCtaClicked}>
            {t('modal.deposit.ctaLabel')}
          </Button>
          <Button variant="tertiary" size="lg" onClick={() => close()}>
            {t('modal.deposit.cancelLabel')}
          </Button>
        </HStack>
      </Container>
    </ModalBottomSheetSwitcher>
  );
};

const Container = styled.div.attrs({
  className: 'p-6 space-y-6',
})``;

const Title = styled.h2.attrs({
  className: 'ft-text-base font-semibold text-neutral-800',
})``;

const Subtitle = styled.p.attrs({
  className: 'mt-1 text-neutral-600 ft-text-sm mb-3',
})``;

const NetworkName = styled.p.attrs({
  className: 'flex-1 font-semibold text-neutral-800',
})``;

const ConnectButton = styled.button.attrs({
  className: 'font-semibold text-primary-500',
})``;

const NetworkDetailsWrapper = styled.div.attrs({
  className: 'py-3 px-4 bg-neutral-0 rounded-xl',
})``;

const HStack = styled.div.attrs({
  className: 'flex space-x-3',
})``;

const Logo = styled.img.attrs({className: 'w-6 h-6 rounded-full'})``;

export default DepositModal;
