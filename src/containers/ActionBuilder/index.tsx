import React from "react";
import { useFormContext } from "react-hook-form";

import { MultisigVotingSettings } from "@aragon/sdk-client";
import { TemporarySection } from "src/components/Temporary";
import SCC from "src/containers/SmartContractComposer";
import TokenMenu from "src/containers/TokenMenu";
import WalletConnect from "src/containers/WalletConnect";
import { useActionsContext } from "src/context/actions";
import { useNetwork } from "src/context/network";
import { useDaoBalances } from "src/hooks/useDaoBalances";
import { useDaoDetailsQuery } from "src/hooks/useDaoDetails";
import { useDaoMembers } from "src/hooks/useDaoMembers";
import { PluginTypes } from "src/hooks/usePluginClient";
import { useVotingSettings } from "src/services/aragon-sdk/queries/use-voting-settings";
import { formatUnits } from "src/utils/library";
import {
  ActionIndex,
  ActionItem,
  ActionsTypes,
  BaseTokenInfo,
} from "src/utils/types";
import AddAddresses from "./addAddresses";
import MintTokens from "./mintTokens";
import RemoveAddresses from "./removeAddresses";
import SCCAction from "./scc";
import UpdateMinimumApproval from "./updateMinimumApproval";
import WalletConnectAction from "./walletConnect";
import WithdrawAction from "./withdraw/withdrawAction";
import { useTokenAsync } from "src/services/token/queries/use-token";

/**
 * This Component is responsible for generating all actions that append to pipeline context (actions)
 * In future we can add more action template like: mint token Component
 * or custom action component (for smart contracts methods)
 * @returns List of actions
 */

type ActionsComponentProps = {
  name: ActionsTypes;
  allowRemove?: boolean;
} & ActionIndex;

const Action: React.FC<ActionsComponentProps> = ({
  name,
  actionIndex,
  allowRemove = true,
}) => {
  // dao data
  const { data: daoDetails } = useDaoDetailsQuery();
  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;

  // plugin data
  const { data: votingSettings } = useVotingSettings({
    pluginAddress,
    pluginType,
  });

  // will only be enabled for multisig
  const { data: daoMembers } = useDaoMembers(pluginAddress, pluginType, {
    enabled: ["add_address", "remove_address"].includes(name),
    page: 0,
  });

  const multisigDAOSettings = votingSettings as MultisigVotingSettings;

  switch (name) {
    case "withdraw_assets":
      return <WithdrawAction {...{ actionIndex, allowRemove }} />;
    case "mint_tokens":
      return <MintTokens {...{ actionIndex, allowRemove }} />;
    case "external_contract_modal":
      return <SCC actionIndex={actionIndex} />;
    case "external_contract_action":
      return <SCCAction actionIndex={actionIndex} allowRemove={allowRemove} />;
    case "modify_token_voting_settings":
      return (
        <TemporarySection purpose="It serves as a placeholder for not yet implemented external contract interaction component" />
      );
    case "add_address":
      return (
        <AddAddresses
          actionIndex={actionIndex}
          currentDaoMembers={daoMembers?.members}
          allowRemove={allowRemove}
        />
      );
    case "remove_address":
      return (
        <RemoveAddresses
          actionIndex={actionIndex}
          currentDaoMembers={daoMembers?.members}
          allowRemove={allowRemove}
        />
      );
    case "modify_multisig_voting_settings":
      return (
        <UpdateMinimumApproval
          actionIndex={actionIndex}
          currentDaoMembers={daoMembers?.members}
          currentMinimumApproval={multisigDAOSettings?.minApprovals}
        />
      );
    case "wallet_connect_modal":
      return <WalletConnect actionIndex={actionIndex} />;
    case "wallet_connect_action":
      return (
        <WalletConnectAction
          actionIndex={actionIndex}
          allowRemove={allowRemove}
        />
      );
    default:
      throw Error("Action not found");
  }
};

interface ActionBuilderProps {
  allowEmpty?: boolean;
}

const ActionBuilder: React.FC<ActionBuilderProps> = ({ allowEmpty = true }) => {
  const { data: daoDetails } = useDaoDetailsQuery();
  const { network } = useNetwork();
  const { selectedActionIndex: index, actions } = useActionsContext();
  const { data: tokens } = useDaoBalances(daoDetails?.address ?? "");
  const { setValue, resetField, clearErrors } = useFormContext();
  const fetchToken = useTokenAsync();

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/

  const handleTokenSelect = (token: BaseTokenInfo) => {
    setValue(`actions.${index}.tokenSymbol`, token.symbol);

    if (token.address === "") {
      setValue(`actions.${index}.isCustomToken`, true);
      resetField(`actions.${index}.tokenName`);
      resetField(`actions.${index}.tokenImgUrl`);
      resetField(`actions.${index}.tokenAddress`);
      resetField(`actions.${index}.tokenBalance`);
      clearErrors(`actions.${index}.amount`);
      return;
    }

    clearErrors([
      `actions.${index}.tokenAddress`,
      `actions.${index}.tokenSymbol`,
    ]);
    setValue(`actions.${index}.isCustomToken`, false);
    setValue(`actions.${index}.tokenName`, token.name);
    setValue(`actions.${index}.tokenImgUrl`, token.imgUrl);
    setValue(`actions.${index}.tokenAddress`, token.address);
    setValue(`actions.${index}.tokenDecimals`, token.decimals);

    setValue(
      `actions.${index}.tokenBalance`,
      formatUnits(token.count, token.decimals)
    );

    fetchToken({ address: token.address, network, symbol: token.symbol }).then(
      (token) => {
        setValue(`actions.${index}.tokenPrice`, token?.price);
      }
    );
  };

  return (
    <>
      {actions?.map((action: ActionItem, index: number) => (
        <Action
          key={index}
          name={action?.name}
          actionIndex={index}
          allowRemove={actions.length <= 1 ? allowEmpty : true}
        />
      ))}

      <TokenMenu
        isWallet={false}
        onTokenSelect={handleTokenSelect}
        tokenBalances={tokens || []}
      />
    </>
  );
};

export default ActionBuilder;
