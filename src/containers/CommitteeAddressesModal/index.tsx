import React from 'react';

import ModalBottomSheetSwitcher from 'src/components/ModalBottomSheetSwitcher';
import {useGlobalModalContext} from 'src/context/globalModals';
import {FilteredAddressList} from 'src/components/FilteredAddressList';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {DaoMember} from 'src/utils/paths';
import {useNetwork} from 'src/context/network';
import {CHAIN_METADATA} from 'src/utils/constants';
import {MultisigWalletField} from 'src/components/MultisigWallets/row';

type CommitteeAddressesModalProps = {
  committee: MultisigWalletField[];
};

const CommitteeAddressesModal: React.FC<CommitteeAddressesModalProps> = ({
  committee, // committee is passed as parameter to show different lists on the new settings form
}) => {
  // const {getValues} = useFormContext();
  const {isOpen, close} = useGlobalModalContext('committeeMembers');
  // const [committee] = getValues(['committee']);

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
        wallets={committee}
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

export default CommitteeAddressesModal;
