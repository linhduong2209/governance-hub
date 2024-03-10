import React from "react";
import { useTranslation } from "react-i18next";

import { AccordionMethod } from "src/components/AccordionMethod";
import {
  ActionCardDlContainer,
  Dd,
  Dl,
  Dt,
} from "src/components/DescriptionList";
import { ActionUpdateMultisigPluginSettings } from "src/utils/types";
import { useDaoDetailsQuery } from "src/hooks/useDaoDetails";
import { useNetwork } from "src/context/network";
import { CHAIN_METADATA } from "src/utils/constants";

export const ModifyMultisigSettingsCard: React.FC<{
  action: ActionUpdateMultisigPluginSettings;
}> = ({ action: { inputs } }) => {
  const { t } = useTranslation();
  const { network } = useNetwork();
  const { data: daoDetails } = useDaoDetailsQuery();

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t("labels.updateGovernanceAction")}
      smartContractName={`Multisig v${daoDetails?.plugins[0].release}.${daoDetails?.plugins[0].build}`}
      smartContractAddress={daoDetails?.plugins[0].instanceAddress}
      blockExplorerLink={
        daoDetails?.plugins[0].instanceAddress
          ? `${CHAIN_METADATA[network].explorer}address/${daoDetails?.plugins[0].instanceAddress}`
          : undefined
      }
      methodDescription={t("labels.updateGovernanceActionDescription")}
      verified
    >
      <ActionCardDlContainer>
        <Dl>
          <Dt>{t("labels.minimumApproval")}</Dt>
          <Dd>{inputs.minApprovals}</Dd>
        </Dl>
        <Dl>
          <Dt>{t("labels.proposalCreation")}</Dt>
          <Dd>
            {inputs.onlyListed
              ? t("createDAO.step3.multisigMembers")
              : t("createDAO.step3.eligibility.anyWallet.title")}
          </Dd>
        </Dl>
      </ActionCardDlContainer>
    </AccordionMethod>
  );
};
