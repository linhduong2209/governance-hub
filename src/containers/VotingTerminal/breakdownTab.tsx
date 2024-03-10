import React from "react";
import { useTranslation } from "react-i18next";
import { Progress } from "@aragon/ods";
import styled from "styled-components";

import { TokenVotingOptions } from "src/utils/proposals";
import { ProposalVoteResults, VotingTerminalProps } from ".";
import { abbreviateTokenAmount } from "src/utils/tokens";

type BreakdownProps = {
  approvals?: string[];
  memberCount?: number;
  results?: ProposalVoteResults;
  token?: VotingTerminalProps["daoToken"];
};

const BreakdownTab: React.FC<BreakdownProps> = ({
  approvals = [
    { address: "0xC97DB9086e854F727dB2b2c1462401EAF1Eb9028" },
    { address: "0xEC8b5DdE1b47a820e3e682a03607c5D81916168c" },
  ],
  memberCount = 2,
  token,
  results = [],
}) => {
  const { t } = useTranslation();
  const count = 2;

  if (approvals) {
    return (
      <VStackRelaxed>
        <VStackNormal>
          <HStack>
            <VoteOption>{t("votingTerminal.approvedBy")}</VoteOption>
            <span className="flex flex-1">
              <ResultValueMultisig>{approvals.length}</ResultValueMultisig>
              <PercentageMultisig>
                &nbsp;
                {t("votingTerminal.ofMemberCount", {
                  memberCount: count,
                })}
              </PercentageMultisig>
            </span>
          </HStack>
          <Progress value={100} />
        </VStackNormal>
      </VStackRelaxed>
    );
  }

  if (token) {
    return (
      <VStackRelaxed>
        {Object.entries(results).map(([key, result]) => (
          <ResultRow
            key={key}
            option={key as TokenVotingOptions}
            percentage={result.percentage}
            value={`${abbreviateTokenAmount(result.value.toString())} ${
              token.symbol
            }`}
          />
        ))}
      </VStackRelaxed>
    );
  }

  return null;
};

export default BreakdownTab;

// Proposal result row
const ResultRow: React.FC<{
  option: TokenVotingOptions;
  value: string | number;
  percentage: string | number;
}> = ({ option, value, percentage }) => {
  const { t } = useTranslation();

  const options: { [k in TokenVotingOptions]: string } = {
    yes: t("votingTerminal.yes"),
    no: t("votingTerminal.no"),
    abstain: t("votingTerminal.abstain"),
  };

  return (
    <VStackNormal>
      <HStack>
        <VoteOption>{options[option]}</VoteOption>
        <ResultValue>{value}</ResultValue>
        <VotePercentage>{percentage}%</VotePercentage>
      </HStack>
      <Progress value={Number(percentage)} />
    </VStackNormal>
  );
};

const VotePercentage = styled.p.attrs({
  className: "w-16 font-semibold text-right text-primary-500 " as string,
})``;

const ResultValue = styled.p.attrs({
  className: "flex-1 text-right text-neutral-600",
})``;

const ResultValueMultisig = styled.p.attrs({
  className: "flex-1 text-right text-primary-500 font-semibold",
})``;

const PercentageMultisig = styled.p.attrs({
  className: "font-semibold text-right text-neutral-600",
})``;

const VoteOption = styled.p.attrs({
  className: "font-semibold text-primary-500",
})``;

const VStackRelaxed = styled.div.attrs({
  className: "space-y-6 mt-10",
})``;

const VStackNormal = styled.div.attrs({
  className: "space-y-3",
})``;

const HStack = styled.div.attrs({
  className: "flex space-x-3",
})``;
