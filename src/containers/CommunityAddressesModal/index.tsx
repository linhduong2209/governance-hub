import React from 'react';
import {useFormContext} from 'react-hook-form';

import ModalBottomSheetSwitcher from 'src/components/ModalBottomSheetSwitcher';
import {useGlobalModalContext} from 'src/context/globalModals';
import {FilteredAddressList} from 'src/components/FilteredAddressList';
import {DaoMember} from 'src/utils/paths';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {useNetwork} from 'src/context/network';
import {CHAIN_METADATA} from 'src/utils/constants';

const CommunityAddressesModal: React.FC = () => {
  const {getValues} = useFormContext();
  const {isOpen, close} = useGlobalModalContext('addresses');
  const [wallets, tokenSymbol, multisigWallets] = getValues([
    'wallets',
    'tokenSymbol',
    'multisigWallets',
  ]);

  const {network} = useNetwork();
  const navigate = useNavigate();
  const {dao} = useParams();

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <ModalBottomSheetSwitcher
      isOpen={isOpen}
      onClose={close}
      data-testid="communityModal"
    >
      <FilteredAddressList
        wallets={tokenSymbol ? wallets : multisigWallets}
        tokenSymbol={tokenSymbol}
        onVoterClick={user => {
          dao
            ? navigate(
                generatePath(DaoMember, {
                  network,
                  dao,
                  user,
                })
              )
            : window.open(
                `${CHAIN_METADATA[network].explorer}address/${user}`,
                '_blank'
              );
        }}
      />
    </ModalBottomSheetSwitcher>
  );
};

export default CommunityAddressesModal;
