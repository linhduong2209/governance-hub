import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import StepperModal, { BtnLabels } from "src/context/stepperModal";
import { StepStatus } from "src/hooks/useFunctionStepper";
import useGaslessVoting, {
  GaslessVotingStepId,
} from "src/context/useGaslessVoting";
import { StepperLabels } from "src/components/StepperProgress";
import { VoteProposalParams, VoteValues } from "@aragon/sdk-client";
import { useWallet } from "src/hooks/useWallet";

type GaslessVotingModalProps = {
  vote: VoteProposalParams | undefined;
  showVoteModal: boolean;
  setShowVoteModal: (showModal: boolean) => void;
  setVoteSubmitted: (voteSubmitted: boolean) => void;
  onVoteSubmitted: (
    proposalId: string,
    vote: VoteValues,
    isApproval?: boolean
  ) => Promise<void>;
  invalidateProposalQueries: () => void;
};

const GaslessVotingModal: React.FC<GaslessVotingModalProps> = ({
  vote,
  showVoteModal,
  setShowVoteModal,
  setVoteSubmitted,
  onVoteSubmitted,
  invalidateProposalQueries,
}): // props: OffChainVotingModalProps<X>
JSX.Element => {
  const { t } = useTranslation();
  const { isConnected } = useWallet();

  const {
    vote: submitGaslessVote,
    steps: gaslessSteps,
    globalState: gaslessGlobalState,
  } = useGaslessVoting();

  const btnLabel: BtnLabels = {
    [StepStatus.WAITING]: t("modalTransaction.vocdoni.submitVote.ctaLabel"),
    [StepStatus.LOADING]: undefined,
    [StepStatus.SUCCESS]: t("modalTransaction.vocdoni.submitVote.ctaSeeVote"),
    [StepStatus.ERROR]: t("modal.transaction.multisig.ctaLabel.tryAgain"),
  };

  const labels: StepperLabels<GaslessVotingStepId> = {
    [GaslessVotingStepId.CREATE_VOTE_ID]: {
      title: t("modalTransaction.vocdoni.submitVote.createOffchain"),
    },
    [GaslessVotingStepId.PUBLISH_VOTE]: {
      title: t("modalTransaction.vocdoni.submitVote.publishVote"),
    },
  };

  const handleCloseVoteModal = useCallback(() => {
    switch (gaslessGlobalState) {
      case StepStatus.LOADING:
        break;
      case StepStatus.SUCCESS:
        setShowVoteModal(false);
        invalidateProposalQueries();
        break;
      default: {
        setShowVoteModal(false);
      }
    }
  }, [gaslessGlobalState, invalidateProposalQueries, setShowVoteModal]);

  const handleVoteExecution = useCallback(async () => {
    if (gaslessGlobalState === StepStatus.SUCCESS) {
      handleCloseVoteModal();
      return;
    }
    if (!isConnected) {
      open("wallet");
      return;
    }

    if (vote) {
      // clear up previous submission state
      setVoteSubmitted(false);

      await submitGaslessVote(vote);

      await onVoteSubmitted(vote.proposalId, vote.vote, false);
    }
  }, [
    handleCloseVoteModal,
    isConnected,
    gaslessGlobalState,
    onVoteSubmitted,
    setVoteSubmitted,
    submitGaslessVote,
    vote,
  ]);

  return (
    <StepperModal
      buttonLabels={btnLabel}
      stepLabels={labels}
      steps={gaslessSteps}
      globalState={gaslessGlobalState}
      isOpen={showVoteModal}
      onClose={handleCloseVoteModal}
      callback={handleVoteExecution}
      closeOnDrag={gaslessGlobalState !== StepStatus.LOADING}
      maxFee={BigInt(0)}
      averageFee={BigInt(0)}
      gasEstimationError={undefined}
      tokenPrice={0}
      title={t("modalTransaction.vocdoni.submitVote.title")}
      subtitle={t("modalTransaction.vocdoni.submitVote.desc", {
        votingBlockchain: "Vocdoni",
      })}
    />
  );
};

export default GaslessVotingModal;
