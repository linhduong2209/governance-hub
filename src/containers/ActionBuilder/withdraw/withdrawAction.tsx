import {ListItemAction} from 'src/@aragon/ods-old';
import React from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {AccordionMethod} from 'src/components/AccordionMethod';
import ConfigureWithdrawForm from 'src/containers/ConfigureWithdraw';
import {useActionsContext} from 'src/context/actions';
import {ActionIndex} from 'src/utils/types';
import {FormItem} from '../addAddresses';
import {useAlertContext} from 'src/context/alert';
import {CHAIN_METADATA} from 'src/utils/constants';
import {useNetwork} from 'src/context/network';

type WithdrawActionProps = ActionIndex & {allowRemove?: boolean};

const WithdrawAction: React.FC<WithdrawActionProps> = ({
  actionIndex,
  allowRemove = true,
}) => {
  const {t} = useTranslation();
  const {removeAction, duplicateAction} = useActionsContext();
  const {setValue, clearErrors, resetField, control} = useFormContext();
  const {alert} = useAlertContext();
  const {network} = useNetwork();
  const [tokenAddress, tokenSymbol] = useWatch({
    name: [
      `actions.${actionIndex}.tokenAddress`,
      `actions.${actionIndex}.tokenSymbol`,
    ],
    control,
  });

  const resetWithdrawFields = () => {
    clearErrors(`actions.${actionIndex}`);
    resetField(`actions.${actionIndex}`);
    setValue(`actions.${actionIndex}`, {
      to: {address: '', ensName: ''},
      amount: '',
      tokenAddress: '',
      tokenSymbol: '',
    });
    alert(t('alert.chip.resetAction'));
  };

  const removeWithdrawFields = (actionIndex: number) => {
    removeAction(actionIndex);
  };

  const methodActions = (() => {
    const result = [
      {
        component: (
          <ListItemAction title={t('labels.duplicateAction')} bgWhite />
        ),
        callback: () => {
          duplicateAction(actionIndex);
          alert(t('alert.chip.duplicateAction'));
        },
      },
      {
        component: <ListItemAction title={t('labels.resetAction')} bgWhite />,
        callback: resetWithdrawFields,
      },
    ];

    if (allowRemove) {
      result.push({
        component: (
          <ListItemAction title={t('labels.removeEntireAction')} bgWhite />
        ),
        callback: () => {
          removeWithdrawFields(actionIndex);
          alert(t('alert.chip.removedAction'));
        },
      });
    }

    return result;
  })();

  return (
    <AccordionMethod
      verified
      type="action-builder"
      methodName={t('TransferModal.item2Title')}
      dropdownItems={methodActions}
      smartContractName={tokenSymbol ? tokenSymbol : undefined}
      smartContractAddress={tokenAddress}
      blockExplorerLink={
        tokenAddress
          ? `${CHAIN_METADATA[network].explorer}token/${tokenAddress}`
          : undefined
      }
      methodDescription={t('AddActionModal.withdrawAssetsActionSubtitle')}
    >
      <FormItem className="space-y-6 rounded-b-xl py-6">
        <ConfigureWithdrawForm actionIndex={actionIndex} />
      </FormItem>
    </AccordionMethod>
  );
};

export default WithdrawAction;
