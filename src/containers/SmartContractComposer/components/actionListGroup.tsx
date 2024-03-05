import React from 'react';
import {ListItemAction} from '@aragon/ods-old';
import {Icon, IconType} from '@aragon/ods';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {SmartContract, SmartContractAction} from 'utils/types';

type ActionListGroupProps = Pick<SmartContract, 'actions'> & {
  onActionSelected?: () => void;
};

const ActionListGroup: React.FC<ActionListGroupProps> = ({
  actions,
  onActionSelected,
}) => {
  const {t} = useTranslation();
  const {setValue} = useFormContext();
  const [selectedAction]: [SmartContractAction] = useWatch({
    name: ['selectedAction'],
  });

  return (
    <ListGroup>
      <ContractNumberIndicator>
        {actions.length === 1
          ? t('scc.labels.singleActionAvailable')
          : actions.length === 0
          ? t('scc.writeContractEmptyState.desc')
          : t('scc.labels.nActionsAvailable', {
              numConnected: actions.length,
            })}
      </ContractNumberIndicator>
      {actions.map(a => (
        // TODO: replace with new listitem that takes image
        // or custom component
        <ListItemAction
          key={a.name}
          title={a.name}
          subtitle={a.name}
          iconRight={<Icon icon={IconType.CHEVRON_RIGHT} />}
          onClick={() => {
            setValue('selectedAction', a);
            onActionSelected?.();
          }}
          bgWhite={selectedAction === a ? false : true}
          mode={selectedAction === a ? 'selected' : 'default'}
          truncateText
        />
      ))}
    </ListGroup>
  );
};

export default ActionListGroup;

const ListGroup = styled.div.attrs({
  className: 'flex-1 pt-6 xl:pt-8 pb-4 space-y-2',
})``;

const ContractNumberIndicator = styled.div.attrs({
  className: 'ft-text-sm font-semibold text-neutral-400 hidden xl:block',
})``;
