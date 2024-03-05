import React from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {trackEvent} from 'services/analytics';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import ModalHeader from 'components/modalHeader';
import {StateEmpty} from 'components/stateEmpty';
import {htmlIn} from 'utils/htmlIn';

type Props = {
  isOpen: boolean;
  onConnectNew: () => void;
  onClose: () => void;
  onBackButtonClicked: () => void;
};

// not exactly sure where opening will be happen or if
// these modals will be global modals. For now, keeping
// this as a "controlled" component
const EmptyState: React.FC<Props> = props => {
  const {t} = useTranslation();
  const {dao: daoAddressOrEns} = useParams();

  return (
    <ModalBottomSheetSwitcher isOpen={props.isOpen} onClose={props.onClose}>
      <ModalHeader
        title={t('scc.emptyState.modalTitle')}
        onClose={props.onClose}
        onBackButtonClicked={props.onBackButtonClicked}
      />
      <Content>
        <StateEmpty
          mode="inline"
          type="Object"
          object="smart_contract"
          title={t('scc.emptyState.title')}
          description={htmlIn(t)('scc.emptyState.description')}
          renderHtml
          primaryButton={{
            label: t('scc.emptyState.ctaLabel'),
            onClick: () => {
              trackEvent('newProposal_connectSmartContract_clicked', {
                dao_address: daoAddressOrEns,
              });
              props.onConnectNew();
            },
          }}
        />
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default EmptyState;

const Content = styled.div.attrs({className: 'px-4 md:px-6 pb-6'})``;
