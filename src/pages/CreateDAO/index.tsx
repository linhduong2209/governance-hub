import React, { useEffect, useMemo, useRef } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  //   useFormState,
  useWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { JsonRpcProvider } from "@ethersproject/providers";

import { TokenVotingWalletField } from "src/components/AddWallets/row";
// import { Step } from "../components/FullScreenStepper";
import { FullScreenStepper, Step } from "src/components/FullScreenStepper";
import { MultisigWalletField } from "src/components/MultisigWallets/row";
// import ConfigureCommunity from 'src/containers/configureCommunity';
import { OverviewDAOHeader, OverviewDAOStep } from "src/containers/DaoOverview";
import DefineMetadata from "src/containers/DefineMetadata";
// import GoLive, {GoLiveFooter, GoLiveHeader} from 'src/containers/goLive';
import SelectChain from "src/containers/SelectChainForm";
import SetupCommunity from "src/containers/SetupCommunity";
// import {CreateDaoProvider} from 'src/context/createDao';
import { useNetwork } from "src/context/network";
import { useProviders } from "src/context/providers";
import { useWallet } from "src/hooks/useWallet";
import { trackEvent } from "src/services/analytics";
import {
  CHAIN_METADATA,
  getSupportedNetworkByChainId,
} from "src/utils/constants";
import { htmlIn } from "src/utils/htmlIn";
// import {hasValue} from 'src/utils/library';
import { Landing } from "src/utils/paths";
import { CreateDaoFormData } from "src/utils/types";
// import {isFieldValid} from 'src/utils/validators';
// import DefineExecutionMultisig from 'src/containers/defineExecutionMultisig';

const defaultValues = {
  tokenName: "",
  tokenAddress: { address: "", ensName: "" },
  tokenSymbol: "",
  tokenDecimals: 18,
  tokenTotalSupply: 1,
  tokenTotalHolders: undefined,
  tokenType: undefined,
  links: [{ name: "", url: "" }],

  // Uncomment when DAO Treasury minting is supported
  // wallets: [{address: constants.AddressZero, amount: '0'}],
  earlyExecution: true,
  voteReplacement: false,
  //   membership: 'token' as CreateDaoFormData['membership'],
  //   eligibilityType: 'token' as CreateDaoFormData['eligibilityType'],
  eligibilityTokenAmount: 1,
  minimumTokenAmount: 1,
  isCustomToken: true,
  durationDays: "1",
  durationHours: "0",
  durationMinutes: "0",
  minimumParticipation: "15",
};

export const CreateDAO: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useWallet();
  const { api: provider } = useProviders();
  const { setNetwork, isL2Network } = useNetwork();

  const formMethods = useForm<CreateDaoFormData>({
    mode: "onChange",
    defaultValues,
  });

  const { update: updateMultisigFields } = useFieldArray({
    control: formMethods.control,
    name: "multisigWallets",
  });

  const { update: updateTokenFields } = useFieldArray({
    name: "wallets",
    control: formMethods.control,
  });

  const { update: updateCommittee } = useFieldArray({
    name: "committee",
    control: formMethods.control,
  });

  //   const {errors, dirtyFields} = useFormState({control: formMethods.control});

  const [
    formChain,
    daoName,
    daoEnsName,
    eligibilityType,
    isCustomToken,
    tokenAddress,
    tokenName,
    tokenSymbol,
    membership,
    multisigWallets,
    tokenWallets,
    tokenTotalSupply,
    tokenType,
    committee,
    votingType,
  ] = useWatch({
    control: formMethods.control,
    name: [
      "blockchain.id",
      "daoName",
      "daoEnsName",
      "eligibilityType",
      "isCustomToken",
      "tokenAddress",
      "tokenName",
      "tokenSymbol",
      "membership",
      "multisigWallets",
      "wallets",
      "tokenTotalSupply",
      "tokenType",
      "committee",
      "votingType",
    ],
  });
  const prevFormChain = useRef<number>(formChain);

  /*************************************************
   *                     Effects                   *
   *************************************************/
  // Note: The wallet network determines the expected network when entering
  // the flow so that the process is more convenient for already logged in
  // users and so that the process doesn't start with a warning. Afterwards,
  // the select blockchain form dictates the expected network
  useEffect(() => {
    const defaultNetwork = getSupportedNetworkByChainId(chainId) || "ethereum";

    setNetwork(defaultNetwork);

    formMethods.setValue("blockchain", {
      id: CHAIN_METADATA[defaultNetwork].id,
      label: CHAIN_METADATA[defaultNetwork].name,
      network: CHAIN_METADATA[defaultNetwork].isTestnet ? "test" : "main",
    });
  }, []);

  // useEffect(() => {
  //   const refetchWalletsENS = async () => {
  //     if (multisigWallets) {
  //       updateWalletsENS(multisigWallets, provider, updateMultisigFields);
  //     }

  //     if (tokenWallets) {
  //       updateWalletsENS(tokenWallets, provider, updateTokenFields);
  //     }

  //     if (committee) {
  //       updateWalletsENS(tokenWallets, provider, updateCommittee);
  //     }
  //   };

  //   if (prevFormChain.current !== formChain) {
  //     prevFormChain.current = formChain;
  //     refetchWalletsENS();
  //   }
  // }, [formChain]);

  /*************************************************
   *                    Callbacks                  *
   *************************************************/
  const handleNextButtonTracking = (
    next: () => void,
    stepName: string,
    properties: Record<string, unknown>
  ) => {
    trackEvent("daoCreation_continueBtn", {
      step: stepName,
      settings: properties,
    });
    next();
  };

  /**
   * Validates multisig community values.
   * - Ensures multisig includes at least one wallet.
   * - Checks all multisig wallets are valid.
   * - Verifies proposal creation eligibility type is set appropriately.
   *
   * @returns True if multisig values are valid, false otherwise.
   */
  //   const validateMultisigCommunity = () =>
  //     multisigWallets?.length > 0 &&
  //     isFieldValid(errors.multisigWallets) &&
  //     ['anyone', 'multisig'].includes(eligibilityType);

  /**
   * Validates custom token values for DAO community.
   * - Ensures tokens are minted to at least one wallet.
   * - Validates all token wallets.
   * - Checks if custom token values are filled and without errors.
   * - Ensures proposal creation eligibility type is set correctly.
   * - Validates token supply is greater than zero.
   *
   * @returns True if custom token values are valid, false otherwise.
   */
  //   const validateCustomTokenCommunity = () =>
  //     tokenWallets?.length > 0 &&
  //     isFieldValid(errors.wallets) &&
  //     hasValue(tokenName) &&
  //     isFieldValid(errors.tokenName) &&
  //     hasValue(tokenSymbol) &&
  //     isFieldValid(errors.tokenSymbol) &&
  //     ["anyone", "token"].includes(eligibilityType) &&
  //     isFieldValid(errors.eligibilityTokenAmount) &&
  //     tokenTotalSupply > 0;

  /**
   * Validates existing token values for DAO community.
   * - Ensures token address and name are valid.
   * - Validates the type of the existing token.
   * - Ensures token supply is greater than zero.
   *
   * @returns True if existing token values are valid, false otherwise.
   */
  //   const validateExistingTokenCommunity = () =>
  //     hasValue(tokenAddress?.address) &&
  //     isFieldValid(errors.tokenAddress?.address) &&
  //     hasValue(tokenName) &&
  //     isFieldValid(errors.tokenName) &&
  //     hasValue(tokenType) &&
  //     isFieldValid(errors.tokenType) &&
  //     tokenType !== "Unknown" &&
  //     tokenTotalSupply > 0;

  /*************************************************
   *             Step Validation States            *
   *************************************************/
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const daoMetadataIsValid = useMemo(() => {
  //     // required fields not dirty
  //     if (!isL2Network && !daoEnsName) return false;
  //     if (!daoName || !dirtyFields.daoSummary) return false;

  //     return errors.daoEnsName ||
  //       errors.daoName ||
  //       errors.links ||
  //       errors.daoSummary
  //       ? false
  //       : true;
  //   }, [
  //     daoEnsName,
  //     daoName,
  //     dirtyFields.daoSummary,
  //     errors.daoEnsName,
  //     errors.daoName,
  //     errors.daoSummary,
  //     errors.links,
  //     isL2Network,
  //   ]);

  let daoCommunitySetupIsValid = false;

  //   switch (membership) {
  //     case 'multisig':
  //       daoCommunitySetupIsValid = validateMultisigCommunity();
  //       break;
  //     case 'token':
  //       daoCommunitySetupIsValid = isCustomToken
  //         ? validateCustomTokenCommunity()
  //         : validateExistingTokenCommunity();
  //       break;
  //   }
  //   const defineCommitteeIsValid = useMemo(() => {
  //     if (
  //       !committee ||
  //       !committee.length ||
  //       errors.committee ||
  //       errors.committeeMinimumApproval ||
  //       errors.executionExpirationMinutes ||
  //       errors.executionExpirationHours ||
  //       errors.executionExpirationDays
  //     )
  //       return false;
  //     return true;
  //   }, [
  //     committee,
  //     errors.committee,
  //     errors.committeeMinimumApproval,
  //     errors.executionExpirationMinutes,
  //     errors.executionExpirationHours,
  //     errors.executionExpirationDays,
  //   ]);

  //   const daoCommunityConfigurationIsValid = useMemo(() => {
  //     if (
  //       errors.minimumApproval ||
  //       errors.minimumParticipation ||
  //       errors.support ||
  //       errors.durationDays ||
  //       errors.durationHours ||
  //       errors.durationMinutes ||
  //       errors.multisigMinimumApprovals ||
  //       errors.eligibilityTokenAmount
  //     )
  //       return false;
  //     return true;
  //   }, [
  //     errors.durationDays,
  //     errors.durationHours,
  //     errors.durationMinutes,
  //     errors.minimumApproval,
  //     errors.minimumParticipation,
  //     errors.support,
  //     errors.multisigMinimumApprovals,
  //     errors.eligibilityTokenAmount,
  //   ]);

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <FormProvider {...formMethods}>
      <FullScreenStepper
        wizardProcessName={t("createDAO.title")}
        navLabel={t("createDAO.title")}
        returnPath={Landing}
        processType="DaoCreation"
      >
        <Step
          fullWidth
          hideWizard
          customHeader={
            <OverviewDAOHeader
              navLabel={t("createDAO.title")}
              returnPath={Landing}
            />
          }
          customFooter={<></>}
        >
          <OverviewDAOStep />
        </Step>
        <Step
          wizardTitle={t("createDAO.step1.title")}
          wizardDescription={htmlIn(t)("createDAO.step1.description")}
          onNextButtonClicked={(next) =>
            handleNextButtonTracking(next, "1_select_blockchain", {
              network: formMethods.getValues("blockchain")?.network,
            })
          }
        >
          <SelectChain />
        </Step>
        <Step
          wizardTitle={t("createDAO.step2.title")}
          wizardDescription={htmlIn(t)("createDAO.step2.description")}
          isNextButtonDisabled={false}
          onNextButtonClicked={(next) =>
            handleNextButtonTracking(next, "2_define_metadata", {
              dao_name: "DAO",
              // formMethods.getValues("daoName"),
              links: "link",
              // formMethods.getValues("links"),
            })
          }
        >
          <DefineMetadata />
        </Step>
        {/* <Step
          wizardTitle={t("createDAO.step3.title")}
          wizardDescription={htmlIn(t)("createDAO.step3.description")}
          isNextButtonDisabled={!daoCommunitySetupIsValid}
          onNextButtonClicked={(next) =>
            handleNextButtonTracking(next, "3_setup_community", {
              governance_type: formMethods.getValues("membership"),
              voting_type: formMethods.getValues("votingType"),
              token_name: formMethods.getValues("tokenName"),
              symbol: formMethods.getValues("tokenSymbol"),
              token_address: formMethods.getValues("tokenAddress.address"),
              multisigWallets: formMethods.getValues("multisigWallets"),
            })
          }
        >
          <SetupCommunity />
        </Step> */}
      </FullScreenStepper>
    </FormProvider>
  );
};

type UpdateFunction = (
  index: number,
  value: Partial<MultisigWalletField> | Partial<TokenVotingWalletField>
) => void;

/**
 * Utility function to fetch ENS names for given wallets and
 * update them using the provided update function.
 *
 * @param wallets - List of wallets to fetch ENS names for
 * @param provider - Web3 provider
 * @param updateFunction - Function to update each wallet with its ENS name
 */
const updateWalletsENS = async (
  wallets: Array<MultisigWalletField | TokenVotingWalletField>,
  provider: JsonRpcProvider,
  updateFunction: UpdateFunction
) => {
  const ensNames = await Promise.all(
    wallets.map((w) => provider.lookupAddress(w.address))
  );

  wallets.forEach((wallet, index) => {
    updateFunction(index, {
      ...wallet,
      ensName: ensNames[index] ?? "",
    });
  });
};
