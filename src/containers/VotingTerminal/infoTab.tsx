import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { abbreviateTokenAmount } from "src/utils/tokens";
import { VotingTerminalProps } from ".";
import { Tag } from "@aragon/ods";

const NumberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

type Props = Pick<
  VotingTerminalProps,
  | "strategy"
  | "supportThreshold"
  | "minParticipation"
  | "currentParticipation"
  | "missingParticipation"
  | "startDate"
  | "endDate"
  | "preciseEndDate"
  | "status"
> & {
  currentApprovals?: number;
  memberCount?: number;
  minApproval?: number;
  minimumReached?: boolean;
  missingApprovalOrParticipation: number;
  uniqueVoters?: number;
  voteOptions: string;
};

const InfoTab: React.FC<Props> = ({
  currentApprovals,
  currentParticipation,
  endDate,
  memberCount,
  minApproval,
  minimumReached,
  minParticipation,
  missingApprovalOrParticipation = 0,
  voteOptions,
  startDate,
  status,
  strategy,
  supportThreshold,
  uniqueVoters,
  preciseEndDate,
}) => {
  const { t } = useTranslation();
  const isMultisigProposal = minApproval != null && minApproval !== 0;

  return (
    <>
      <VStackSection>
        <SectionHeader>{t("votingTerminal.decision")}</SectionHeader>
        <InfoLine>
          <p>{t("votingTerminal.options")}</p>
          <Strong>{"Approve"}</Strong>
        </InfoLine>
        <InfoLine>
          <p>{t("votingTerminal.strategy")}</p>
          <Strong>{"1 Wallet -> 1 Vote"}</Strong>
        </InfoLine>

        {/* Support threshold */}
        {supportThreshold !== undefined && (
          <InfoLine>
            <p>{t("votingTerminal.supportThreshold")}</p>
            <Strong>{`> ${supportThreshold}%`}</Strong>
          </InfoLine>
        )}
        {/* Minimum part */}
        {minParticipation && (
          <InfoLine>
            <p>{t("votingTerminal.minParticipation")}</p>
            <Strong className="text-right">{`≥ ${minParticipation}`}</Strong>
          </InfoLine>
        )}

        {/* Min approval */}
        {minApproval !== undefined && (
          <InfoLine>
            <p>{t("labels.minimumApproval")}</p>
            <Strong>
              {t("votingTerminal.ofAddressCount", {
                value: minApproval,
                total: memberCount,
              })}
            </Strong>
          </InfoLine>
        )}
      </VStackSection>

      <VStackSection>
        <SectionHeader>{t("votingTerminal.activity")}</SectionHeader>

        {/* Token Voting Current Participation */}
        {currentParticipation && (
          <InfoLine>
            <p className="flex-1">{t("votingTerminal.currentParticipation")}</p>

            <CurrentParticipationWrapper>
              <Strong>{currentParticipation}</Strong>
              <div className="flex justify-end gap-x-2">
                {minimumReached && (
                  <Tag label={t("votingTerminal.reached")} variant="success" />
                )}
                <p className="text-right text-neutral-400 ft-text-sm">
                  {minimumReached
                    ? t("votingTerminal.noVotesMissing")
                    : t("votingTerminal.missingVotes", {
                        votes: abbreviateTokenAmount(
                          parseFloat(
                            missingApprovalOrParticipation.toFixed(2)
                          ).toString()
                        ),
                      })}
                </p>
              </div>
            </CurrentParticipationWrapper>
          </InfoLine>
        )}

        {/* Multisig current approvals */}
        {/* {currentApprovals !== undefined && minApproval && memberCount && ( */}
        <InfoLine>
          <p className="flex-1">{t("votingTerminal.currentApproval")}</p>

          <CurrentParticipationWrapper>
            <Strong>
              {`${t("votingTerminal.ofAddressCount", {
                value: 2,
                total: 2,
              })} (${NumberFormatter.format((2 / 2) * 100)}%)`}
            </Strong>
            <div className="flex justify-end gap-x-2">
              {/* {minimumReached && ( */}
              <Tag label={t("votingTerminal.reached")} variant="success" />
              {/* )} */}
              <p className="text-right text-neutral-400 ft-text-sm">
                {
                  // minimumReached
                  //   ?
                  t("votingTerminal.noApprovalsMissing")
                  // : t("votingTerminal.missingApprovals", {
                  //     approvals: missingApprovalOrParticipation,
                  //   })
                }
              </p>
            </div>
          </CurrentParticipationWrapper>
        </InfoLine>
        {/* )} */}
        {uniqueVoters !== undefined && (
          <InfoLine>
            <p>{t("votingTerminal.uniqueVoters")}</p>
            <Strong>{uniqueVoters}</Strong>
          </InfoLine>
        )}
      </VStackSection>
      <VStackSection isLast={status ? false : true}>
        <SectionHeader>{t("votingTerminal.duration")}</SectionHeader>
        <InfoLine>
          <p>{t("votingTerminal.startDate")}</p>
          <Strong>{"2024/03/07 05:14 AM UTC+7"}</Strong>
        </InfoLine>
        <InfoLine className="items-start gap-x-4">
          <p className="ft-text-base">{t("votingTerminal.endDate")}</p>
          <EndDateWrapper className="w-[213px]">
            <p className="text-right font-semibold text-neutral-800 ft-text-base">
              {t("votingTerminal.multisig.endDescription")}
            </p>
          </EndDateWrapper>
        </InfoLine>
      </VStackSection>
    </>
  );
};

export default InfoTab;

const EndDateWrapper = styled.div.attrs({
  className: "space-y-1 text-right",
})``;

const CurrentParticipationWrapper = styled.div.attrs({
  className: "space-y-1 text-right",
})``;

const VStackSection = styled.div.attrs<{ isLast?: boolean }>(({ isLast }) => ({
  className: `space-y-3 p-4 md:p-6 -mx-4 md:-mx-6 ${
    isLast ? "pb-0 border-b-0" : "border-b border-neutral-100"
  }`,
}))<{ isLast?: boolean }>``;

const InfoLine = styled.div.attrs({
  className: "flex justify-between text-neutral-600 ft-text-base",
})``;

const Strong = styled.p.attrs({
  className: "font-semibold text-neutral-800",
})``;

const SectionHeader = styled.p.attrs({
  className: "font-semibold text-neutral-800 ft-text-lg",
})``;
