/**
 * This file contains helpers for mapping a proposal
 * to voting terminal properties. Doesn't exactly belong
 * here, but couldn't leave in the Proposal Details page,
 * so open to suggestions.
 */

import {ModeType, ProgressStatusProps, VoterType} from 'src/@aragon/ods-old';
import {
  Client,
  CreateMajorityVotingProposalParams,
  DaoMetadata,
  Erc20TokenDetails,
  MajorityVotingSettings,
  MultisigProposal,
  MultisigVotingSettings,
  TokenVotingProposal,
  TokenVotingProposalResult,
  VoteValues,
  VotingMode,
  VotingSettings,
} from '@aragon/sdk-client';
import {
  LIVE_CONTRACTS,
  ProposalMetadata,
  ProposalStatus,
  SupportedNetworksArray,
  SupportedVersion,
} from '@aragon/sdk-client-common';
import {
  GaslessPluginVotingSettings,
  GaslessVotingProposal,
} from '@vocdoni/gasless-voting';
import Big from 'big.js';
import {Locale, format, formatDistanceToNow} from 'date-fns';
import * as Locales from 'date-fns/locale';
import {TFunction} from 'i18next';

import {ProposalVoteResults} from 'src/containers/VotingTerminal';
import {MultisigDaoMember} from 'src/hooks/useDaoMembers';
import {PluginTypes} from 'src/hooks/usePluginClient';
import {
  isGaslessVotingSettings,
  isMultisigVotingSettings,
  isTokenVotingSettings,
} from 'src/services/aragon-sdk/queries/use-voting-settings';
import {i18n} from '../../i18n.config';
import {KNOWN_FORMATS, getFormattedUtcOffset} from './date';
import {
  decodeApplyUpdateAction,
  decodeOSUpdateActions,
  decodeUpgradeToAndCallAction,
  formatUnits,
  readFile,
  translateToNetworkishName,
} from './library';
import {abbreviateTokenAmount} from './tokens';
import {
  Action,
  ActionOSUpdate,
  ActionPluginUpdate,
  ActionSCC,
  CreateProposalFormData,
  DetailedProposal,
  ProposalListItem,
  StrictlyExclude,
  SupportedProposals,
  SupportedVotingSettings,
} from './types';

import {ethers} from 'ethers';
import {SupportedNetworks} from './constants';
import {FieldValues, UseFormGetValues} from 'react-hook-form';
import {isGaslessActionChangingSettings} from './committeeVoting';

export type TokenVotingOptions = StrictlyExclude<
  VoterType['option'],
  'approved' | 'none'
>;

const MappedVotes: {
  [key in VoteValues]: TokenVotingOptions;
} = {
  1: 'abstain',
  2: 'yes',
  3: 'no',
};

const formatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0, // Minimum number of decimal places
  maximumFractionDigits: 2, // Maximum number of decimal places
});

// this type guard will need to evolve when there are more types
export function isTokenBasedProposal(
  proposal: SupportedProposals | undefined | null
): proposal is TokenVotingProposal {
  if (!proposal) return false;
  return 'token' in proposal;
}

function isErc20Token(
  token: TokenVotingProposal['token'] | undefined
): token is Erc20TokenDetails {
  if (!token) return false;
  return 'decimals' in token;
}

export function isErc20VotingProposal(
  proposal: SupportedProposals | undefined
): proposal is TokenVotingProposal & {token: Erc20TokenDetails} {
  return isTokenBasedProposal(proposal) && isErc20Token(proposal.token);
}

export function isMultisigProposal(
  proposal: SupportedProposals | undefined | null
): proposal is MultisigProposal {
  if (!proposal) return false;
  return 'approvals' in proposal;
}

export function isGaslessProposal(
  proposal: SupportedProposals | undefined | null
): proposal is GaslessVotingProposal {
  if (!proposal) return false;
  return 'settings' in proposal && 'minTallyApprovals' in proposal.settings;
}

/**
 * Get formatted minimum participation for an ERC20 proposal
 * @param minParticipation minimum number of tokens needed to participate in vote
 * @param totalVotingWeight total number of tokens able to vote
 * @param tokenDecimals proposal token decimals
 * @returns
 */
export function getErc20MinParticipation(
  minParticipation: number,
  totalVotingWeight: bigint,
  tokenDecimals: number
) {
  return abbreviateTokenAmount(
    parseFloat(
      Big(formatUnits(totalVotingWeight, tokenDecimals))
        .mul(minParticipation)
        .toFixed(2)
    ).toString()
  );
}

export function getErc20VotingParticipation(
  minParticipation: number,
  usedVotingWeight: bigint,
  totalVotingWeight: bigint,
  tokenDecimals: number
) {
  // calculate participation summary
  const totalWeight = abbreviateTokenAmount(
    parseFloat(
      Number(formatUnits(totalVotingWeight, tokenDecimals)).toFixed(2)
    ).toString()
  );

  // current participation
  const currentPart = abbreviateTokenAmount(
    parseFloat(
      Number(formatUnits(usedVotingWeight, tokenDecimals)).toFixed(2)
    ).toString()
  );

  const currentPercentage = parseFloat(
    Big(usedVotingWeight.toString())
      .mul(100)
      .div(totalVotingWeight.toString())
      .toFixed(2)
  );

  // minimum participation
  const minPart = getErc20MinParticipation(
    minParticipation,
    totalVotingWeight,
    tokenDecimals
  );

  // missing participation
  const missingRaw = Big(formatUnits(usedVotingWeight, tokenDecimals))
    .minus(
      Big(formatUnits(totalVotingWeight, tokenDecimals)).mul(minParticipation)
    )
    .toNumber();

  let missingPart;

  if (Math.sign(missingRaw) === 1) {
    // number of votes greater than required minimum participation
    missingPart = 0;
  } else missingPart = Math.abs(missingRaw);
  // const missingPart = Math.sign(Number(missingRaw)) === 1 ? Math.abs(Number(missingRaw));

  return {currentPart, currentPercentage, minPart, missingPart, totalWeight};
}

/**
 * Get mapped voters for ERC20 Voting proposal
 * @param votes list of votes on proposal
 * @param totalVotingWeight number of eligible voting tokens at proposal creation snapshot
 * @param tokenDecimals proposal token decimal
 * @param tokenSymbol proposal token symbol
 * @returns mapped voters
 */
function getErc20Voters(
  votes: TokenVotingProposal['votes'],
  totalVotingWeight: bigint,
  tokenDecimals: number,
  tokenSymbol: string
): Array<VoterType> {
  let votingPower;
  let tokenAmount;
  // map to voters structure
  return votes.flatMap(vote => {
    if (vote.vote === undefined) return [];

    votingPower =
      parseFloat(
        Big(Number(vote.weight))
          .div(Number(totalVotingWeight))
          .mul(100)
          .toNumber()
          .toFixed(2)
      ).toString() + '%';

    tokenAmount = `${abbreviateTokenAmount(
      parseFloat(
        Number(formatUnits(vote.weight, tokenDecimals)).toFixed(2)
      ).toString()
    )} ${tokenSymbol}`;

    return {
      src: vote.address,
      wallet: vote.address,
      option: MappedVotes[vote.vote],
      votingPower,
      tokenAmount,
      voteReplaced: vote.voteReplaced,
    };
  });
}

/**
 * Get the mapped result of ERC20 voting proposal vote
 * @param result result of votes on proposal
 * @param tokenDecimals number of decimals in token
 * @returns mapped voting result
 */
export function getErc20Results(
  result: TokenVotingProposalResult,
  tokenDecimals: number
): ProposalVoteResults {
  const {yes, no, abstain} = result;

  const totalYesNo = Big(yes.toString()).plus(no.toString());

  // TODO: Format with new ODS formatter
  return {
    yes: {
      value: parseFloat(
        Number(formatUnits(yes, tokenDecimals)).toFixed(2)
      ).toString(),
      percentage: getVotePercentage(yes, totalYesNo),
    },
    no: {
      value: parseFloat(
        Number(formatUnits(no, tokenDecimals)).toFixed(2)
      ).toString(),
      percentage: getVotePercentage(no, totalYesNo),
    },
    abstain: {
      value: parseFloat(
        Number(formatUnits(abstain, tokenDecimals)).toFixed(2)
      ).toString(),
      percentage: getVotePercentage(abstain, totalYesNo),
    },
  };
}

function getVotePercentage(value: bigint, totalYesNo: Big): number {
  const vote = Big(value.toString());

  // no yes + no votes
  if (totalYesNo.eq(0)) {
    if (vote.gt(0)) {
      // vote before yes + no votes have been casted
      return 100;
    } else {
      // no votes casted yet/divide by zero
      return 0;
    }
  }

  return Number(formatter.format(vote.mul(100).div(totalYesNo).toNumber()));
}

/**
 * Get proposal status steps
 * @param status proposal status
 * @param endDate proposal voting end date
 * @param creationDate proposal creation date
 * @param publishedBlock block number
 * @param executionDate proposal execution date
 * @returns list of status steps based on proposal status
 */
export function getProposalStatusSteps(
  t: TFunction,
  status: ProposalStatus,
  pluginType: PluginTypes,
  startDate: Date,
  endDate: Date,
  creationDate: Date,
  publishedBlock: string,
  executionFailed: boolean,
  isSuccessfulMultisigSignalingProposal: boolean,
  executionBlock?: string,
  executionDate?: Date
): Array<ProgressStatusProps> {
  switch (status) {
    case ProposalStatus.ACTIVE:
      return [
        {...getPublishedProposalStep(t, creationDate, publishedBlock)},
        {...getActiveProposalStep(t, startDate, 'active')},
      ];
    case ProposalStatus.DEFEATED:
      return [
        {...getPublishedProposalStep(t, creationDate, publishedBlock)},
        {...getActiveProposalStep(t, startDate, 'done')},
        {
          label:
            pluginType === 'token-voting.plugin.dao.eth'
              ? t('governance.statusWidget.defeated')
              : t('governance.statusWidget.expired'),
          mode: 'failed',
          date: `${format(
            endDate,
            KNOWN_FORMATS.proposals
          )}  ${getFormattedUtcOffset()}`,
        },
      ];
    case ProposalStatus.SUCCEEDED: {
      if (executionFailed) {
        return [
          ...getEndedProposalSteps(
            t,
            creationDate,
            startDate,
            endDate,
            publishedBlock,
            false
          ),
          {
            label: t('governance.statusWidget.failed'),
            mode: 'failed',
            date: `${format(
              new Date(),
              KNOWN_FORMATS.proposals
            )}  ${getFormattedUtcOffset()}`,
          },
        ];
      } else {
        const steps = [
          ...getEndedProposalSteps(
            t,
            creationDate,
            startDate,
            endDate,
            publishedBlock,
            isSuccessfulMultisigSignalingProposal
          ),
        ];

        if (!isSuccessfulMultisigSignalingProposal) {
          steps.push({
            label: t('governance.statusWidget.executed'),
            mode: 'upcoming',
          });
        }
        return steps;
      }
    }
    case ProposalStatus.EXECUTED:
      if (executionDate)
        return [
          ...getEndedProposalSteps(
            t,
            creationDate,
            startDate,
            endDate,
            publishedBlock,
            isSuccessfulMultisigSignalingProposal,
            executionDate || new Date()
          ),
          {
            label: t('governance.statusWidget.executed'),
            mode: 'succeeded',
            date: `${format(
              executionDate,
              KNOWN_FORMATS.proposals
            )}  ${getFormattedUtcOffset()}`,
            block: executionBlock,
          },
        ];
      else
        return [
          ...getEndedProposalSteps(
            t,
            creationDate,
            startDate,
            endDate,
            publishedBlock,
            isSuccessfulMultisigSignalingProposal
          ),
          {label: t('governance.statusWidget.failed'), mode: 'failed'},
        ];

    // Pending by default
    default:
      return [{...getPublishedProposalStep(t, creationDate, publishedBlock)}];
  }
}

function getEndedProposalSteps(
  t: TFunction,
  creationDate: Date,
  startDate: Date,
  endDate: Date,
  block: string,
  isSuccessfulMultisigSignalingProposal: boolean,
  executionDate?: Date
): Array<ProgressStatusProps> {
  let label = t('governance.statusWidget.succeeded');
  let mode: ModeType = 'done';

  if (isSuccessfulMultisigSignalingProposal) {
    label = t('votingTerminal.status.approved');
    mode = 'succeeded';
  }

  return [
    {...getPublishedProposalStep(t, creationDate, block)},
    {...getActiveProposalStep(t, startDate, 'done')},
    {
      label,
      mode,
      date: `${format(
        executionDate! < endDate ? executionDate! : endDate,
        KNOWN_FORMATS.proposals
      )}  ${getFormattedUtcOffset()}`,
    },
  ];
}

function getPublishedProposalStep(
  t: TFunction,
  creationDate: Date,
  block: string | undefined
): ProgressStatusProps {
  return {
    label: t('governance.statusWidget.published'),
    date: `${format(
      creationDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`,
    mode: 'done',
    ...(block && {block}),
  };
}

function getActiveProposalStep(t: TFunction, startDate: Date, mode: ModeType) {
  return {
    label: t('governance.statusWidget.active'),
    mode,
    date: `${format(
      startDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`,
  };
}

/**
 * get transformed data for terminal
 * @param proposal
 * @returns transformed data for terminal
 */
export function getLiveProposalTerminalProps(
  t: TFunction,
  proposal: DetailedProposal,
  voter: string | null,
  votingSettings: SupportedVotingSettings,
  members?: MultisigDaoMember[]
) {
  let token;
  let voters: Array<VoterType>;
  let currentParticipation;
  let minParticipation;
  let missingParticipation;
  let results;
  let supportThreshold;
  let strategy;

  if (isGaslessProposal(proposal) && isGaslessVotingSettings(votingSettings)) {
    // token
    token = {
      name: proposal.token.name,
      symbol: proposal.token.symbol,
    };

    // voters
    voters =
      proposal.voters?.map(voter => {
        return {wallet: voter, src: voter, option: 'none'} as VoterType;
      }) ?? [];

    // results
    const results: ProposalVoteResults = getErc20Results(
      proposal.vochain.tally.parsed,
      proposal.token.decimals
    );
    // calculate participation
    const {currentPart, currentPercentage, minPart, missingPart, totalWeight} =
      getErc20VotingParticipation(
        proposal.settings.minParticipation,
        proposal.totalUsedWeight,
        proposal.totalVotingWeight,
        proposal.token.decimals
      );

    minParticipation = t('votingTerminal.participationErc20', {
      participation: minPart,
      totalWeight,
      tokenSymbol: token.symbol,
      percentage: Math.round(proposal.settings.minParticipation * 100),
    });

    currentParticipation = t('votingTerminal.participationErc20', {
      participation: currentPart,
      totalWeight,
      tokenSymbol: token.symbol,
      percentage: currentPercentage,
    });

    missingParticipation = missingPart;

    // support threshold
    supportThreshold = Math.round(proposal.settings.supportThreshold * 100);

    // strategy
    strategy = t('votingTerminal.tokenVoting');
    return {
      token,
      voters,
      results,
      strategy,
      supportThreshold,
      minParticipation,
      currentParticipation,
      missingParticipation,
      voteOptions: t('votingTerminal.yes+no'),
      startDate: `${format(
        proposal.startDate,
        KNOWN_FORMATS.proposals
      )}  ${getFormattedUtcOffset()}`,

      endDate: `${format(
        proposal.endDate,
        KNOWN_FORMATS.proposals
      )}  ${getFormattedUtcOffset()}`,
    };
  } else if (isErc20VotingProposal(proposal)) {
    // token
    token = {
      name: proposal.token.name,
      symbol: proposal.token.symbol,
    };

    // voters
    voters = getErc20Voters(
      proposal.votes,
      proposal.totalVotingWeight,
      proposal.token.decimals,
      proposal.token.symbol
    ).sort((a, b) => {
      const x = Number(a.votingPower?.slice(0, a.votingPower.length - 1));
      const y = Number(b.votingPower?.slice(0, b.votingPower.length - 1));

      return x > y ? -1 : 1;
    });

    // results
    results = getErc20Results(proposal.result, proposal.token.decimals);

    // calculate participation
    const {currentPart, currentPercentage, minPart, missingPart, totalWeight} =
      getErc20VotingParticipation(
        proposal.settings.minParticipation,
        proposal.usedVotingWeight,
        proposal.totalVotingWeight,
        proposal.token.decimals
      );

    minParticipation = t('votingTerminal.participationErc20', {
      participation: minPart,
      totalWeight,
      tokenSymbol: token.symbol,
      percentage: Math.round(proposal.settings.minParticipation * 100),
    });

    currentParticipation = t('votingTerminal.participationErc20', {
      participation: currentPart,
      totalWeight,
      tokenSymbol: token.symbol,
      percentage: currentPercentage,
    });

    missingParticipation = missingPart;

    // support threshold
    supportThreshold = Math.round(proposal.settings.supportThreshold * 100);

    // strategy
    strategy = t('votingTerminal.tokenVoting');
    return {
      token,
      voters,
      results,
      strategy,
      supportThreshold,
      minParticipation,
      currentParticipation,
      missingParticipation,
      voteOptions: t('votingTerminal.yes+no'),
      startDate: `${format(
        proposal.startDate,
        KNOWN_FORMATS.proposals
      )}  ${getFormattedUtcOffset()}`,

      endDate: `${format(
        proposal.endDate,
        KNOWN_FORMATS.proposals
      )}  ${getFormattedUtcOffset()}`,
    };
  }
  // This method's return needs to be typed properly
  else if (
    isMultisigProposal(proposal) &&
    isMultisigVotingSettings(votingSettings)
  ) {
    // add members to Map of VoterType
    const mappedMembers = new Map(
      // map multisig members to voterType
      members?.map(member => [
        member.address,
        {wallet: member.address, option: 'none'} as VoterType,
      ])
    );

    // loop through approvals and update vote option to approved;
    let approvalAddress;
    proposal.approvals.forEach(address => {
      approvalAddress = stripPlgnAdrFromProposalId(address).toLowerCase();

      // considering only members can approve, no need to check if Map has the key
      mappedMembers.set(approvalAddress, {
        wallet: approvalAddress,
        src: approvalAddress,
        option: 'approved',
      });
    });

    return {
      approvals: proposal.approvals,
      minApproval: proposal.settings.minApprovals,
      voters: [...mappedMembers.values()],
      strategy: t('votingTerminal.multisig.strategy'),
      voteOptions: t('votingTerminal.approve'),
      startDate: `${format(
        proposal.startDate,
        KNOWN_FORMATS.proposals
      )}  ${getFormattedUtcOffset()}`,

      endDate: `${format(
        proposal.endDate,
        KNOWN_FORMATS.proposals
      )}  ${getFormattedUtcOffset()}`,
    };
  }
}

export type CacheProposalParams = {
  creatorAddress: string;
  daoAddress: string;
  daoName: string;
  metadata: ProposalMetadata;
  proposalParams: CreateMajorityVotingProposalParams;
  id: string;
  status: ProposalStatus;

  // Multisig props
  minApprovals?: number;
  onlyListed?: boolean;

  // TokenVoting props
  daoToken?: Erc20TokenDetails;
  pluginSettings?: VotingSettings;
  totalVotingWeight?: bigint;
};

/**
 * Strips proposal id of plugin address
 * @param proposalId id with following format:  *0x4206cdbc...a675cae35_0x0*
 * @returns proposal id without the pluginAddress
 * or the given proposal id if already stripped of the plugin address: *0x3*
 */
export function stripPlgnAdrFromProposalId(proposalId: string) {
  // return the "pure" contract proposal id or consider given proposal already stripped
  return proposalId?.split('_')[1] || proposalId;
}

export function getVoteStatus(proposal: DetailedProposal, t: TFunction) {
  let label = '';

  switch (proposal.status) {
    case ProposalStatus.PENDING:
      {
        const locale = (Locales as Record<string, Locale>)[i18n.language];
        const timeUntilNow = formatDistanceToNow(proposal.startDate, {
          includeSeconds: true,
          locale,
        });

        label = t('votingTerminal.status.pending', {timeUntilNow});
      }
      break;
    case ProposalStatus.ACTIVE:
      {
        const locale = (Locales as Record<string, Locale>)[i18n.language];
        const timeUntilEnd = formatDistanceToNow(proposal.endDate, {
          includeSeconds: true,
          locale,
        });

        if (isGaslessProposal(proposal) && proposal.endDate < new Date()) {
          label = t('votingTerminal.status.succeeded');
          break;
        }

        label = t('votingTerminal.status.active', {timeUntilEnd});
      }
      break;
    case ProposalStatus.SUCCEEDED:
      label = t('votingTerminal.status.succeeded');

      break;
    case ProposalStatus.EXECUTED:
      label = t('votingTerminal.status.executed');

      break;
    case ProposalStatus.DEFEATED:
      label = isMultisigProposal(proposal)
        ? t('votingTerminal.status.expired')
        : t('votingTerminal.status.defeated');
  }
  return label;
}

export function getVoteButtonLabel(
  proposal: DetailedProposal,
  voteSettings:
    | MajorityVotingSettings
    | MultisigVotingSettings
    | GaslessPluginVotingSettings,
  votedOrApproved: boolean,
  executableWithNextApproval: boolean,
  t: TFunction
): string {
  if (isMultisigProposal(proposal)) {
    return getMultisigLabel(
      proposal,
      votedOrApproved,
      executableWithNextApproval,
      t
    );
  }

  if (isGaslessProposal(proposal) && isGaslessVotingSettings(voteSettings)) {
    return getTokenBasedLabel(proposal, voteSettings, votedOrApproved, t);
  }

  if (isTokenBasedProposal(proposal) && isTokenVotingSettings(voteSettings)) {
    return getTokenBasedLabel(proposal, voteSettings, votedOrApproved, t);
  }

  return '';
}

function getMultisigLabel(
  proposal: MultisigProposal,
  votedOrApproved: boolean,
  executableWithNextApproval: boolean,
  t: TFunction
): string {
  if (
    proposal.status === ProposalStatus.PENDING ||
    (proposal.status === ProposalStatus.ACTIVE && !votedOrApproved)
  ) {
    return executableWithNextApproval
      ? t('votingTerminal.approveOnly')
      : t('votingTerminal.approve');
  }

  return votedOrApproved
    ? t('votingTerminal.status.approved')
    : t('votingTerminal.concluded');
}

function getTokenBasedLabel(
  proposal: TokenVotingProposal | GaslessVotingProposal,
  voteSettings: MajorityVotingSettings | GaslessPluginVotingSettings,
  voted: boolean,
  t: TFunction
): string {
  if (proposal.status === ProposalStatus.PENDING) {
    return t('votingTerminal.voteNow');
  }
  if (voted) {
    // voted on plugin with voteReplacement
    if (
      isTokenBasedProposal(proposal) &&
      isTokenVotingSettings(voteSettings) &&
      proposal.status === ProposalStatus.ACTIVE &&
      voteSettings.votingMode === VotingMode.VOTE_REPLACEMENT
    ) {
      return t('votingTerminal.status.revote');
    }

    return t('votingTerminal.status.voteSubmitted');
  }

  // have not voted
  return proposal.status === ProposalStatus.ACTIVE
    ? t('votingTerminal.voteNow')
    : t('votingTerminal.voteOver');
}

export function isEarlyExecutable(
  missingParticipation: number | undefined,
  proposal: DetailedProposal | undefined,
  results: ProposalVoteResults | undefined,
  votingMode: VotingMode | undefined
): boolean {
  if (
    missingParticipation === undefined ||
    votingMode !== VotingMode.EARLY_EXECUTION || // early execution disabled
    !isErc20VotingProposal(proposal) || // proposal is not token-based
    !results // no mapped data
  ) {
    return false;
  }

  // check if proposal can be executed early
  const votes: Record<keyof ProposalVoteResults, Big> = {
    yes: Big(0),
    no: Big(0),
    abstain: Big(0),
  };

  for (const voteType in results) {
    votes[voteType as keyof ProposalVoteResults] = Big(
      results[voteType as keyof ProposalVoteResults].value.toString()
    );
  }

  // renaming for clarity, should be renamed in later versions of sdk
  const supportThreshold = proposal.settings.supportThreshold;

  // those who didn't vote (this is NOT voting abstain)
  const absentee = formatUnits(
    proposal.totalVotingWeight - proposal.usedVotingWeight,
    proposal.token.decimals
  );

  if (votes.yes.eq(Big(0))) return false;

  return (
    // participation reached
    missingParticipation === 0 &&
    // support threshold met even if absentees show up and all vote against, still cannot change outcome
    votes.yes.div(votes.yes.add(votes.no).add(absentee)).gt(supportThreshold)
  );
}

export function getProposalExecutionStatus(
  proposalStatus: ProposalStatus | undefined,
  canExecuteEarly: boolean,
  executionFailed: boolean,
  isGaselessProposalExecutable?: boolean // Additional checks for gasless proposals. Undefined for others
) {
  switch (proposalStatus) {
    case 'Succeeded':
      if (executionFailed) {
        return 'executable-failed';
      }
      // Condition will be false if undefined
      if (isGaselessProposalExecutable === false) {
        return 'default';
      }
      return 'executable';
    case 'Executed':
      return 'executed';
    case 'Defeated':
      return 'defeated';
    case 'Active':
      return canExecuteEarly ? 'executable' : 'default';
    case 'Pending':
    default:
      return 'default';
  }
}

/**
 * Filter out all empty add/remove address and minimum approval actions
 * @param actions supported actions
 * @returns list of non empty address
 */
export function getNonEmptyActions(
  actions: Array<Action>,
  msVoteSettings?: MultisigVotingSettings,
  gaslessVoteSettings?: GaslessPluginVotingSettings
): Action[] {
  return actions.flatMap(action => {
    if (action == null) return [];

    if (action.name === 'modify_gasless_voting_settings') {
      return isGaslessActionChangingSettings(
        action.inputs,
        gaslessVoteSettings!
      )
        ? action
        : [];
    } else if (action.name === 'modify_multisig_voting_settings') {
      // minimum approval or onlyListed changed: return action or don't include
      return action.inputs.minApprovals !== msVoteSettings?.minApprovals ||
        action.inputs.onlyListed !== msVoteSettings.onlyListed
        ? action
        : [];
    } else if (action.name === 'add_address') {
      // strip empty inputs off

      const finalAction = {
        ...action,
        inputs: {
          memberWallets: action.inputs.memberWallets.filter(
            item => !!item.address
          ),
        },
      };

      return finalAction.inputs.memberWallets.length > 0 ? finalAction : [];
    } else if (action.name === 'remove_address') {
      // address removed from the list: return action or don't include
      return action.inputs.memberWallets.length > 0 ? action : [];
    } else {
      // all other actions can go through
      return action;
    }
  });
}

/**
 * For a list of actions, it takes the add/remove wallet actions and calculates which are added or removed
 * from a list of old wallets. The actions must to be stored on a react hook form
 * @param actions list of actions that can include add/remove wallet actions
 * @param oldMultisig the old wallet list which is going to be updated
 * @param getValues react form getValues function, used to get the memberwallets from the actions
 */
export function getNewMultisigMembers(
  actions: Array<Action>,
  oldMultisig: string[],
  getValues: UseFormGetValues<FieldValues>
): string[] {
  const addActionIndex = actions
    .map(action => action.name)
    .indexOf('add_address');

  const removeActionIndex = actions
    .map(action => action.name)
    .indexOf('remove_address');

  const [newAddedWallet, newRemovedWallet] = getValues([
    `actions.${addActionIndex}.inputs.memberWallets`,
    `actions.${removeActionIndex}.inputs.memberWallets`,
  ]);
  let newCommitteeMembers: string[] = oldMultisig;
  // Delete the removed wallets from the current committee
  if (newRemovedWallet !== undefined) {
    newCommitteeMembers = newCommitteeMembers.filter(address => {
      return !(newRemovedWallet as MultisigDaoMember[])
        .map(wallet => wallet.address)
        .includes(address);
    });
  }
  if (newAddedWallet !== undefined) {
    // Add new wallets
    newCommitteeMembers = newCommitteeMembers.concat(
      (newAddedWallet as MultisigDaoMember[])
        .filter(wallet => wallet.address !== '')
        .map(wallet => {
          return wallet.address;
        })
    );
  }
  return newCommitteeMembers;
}

/**
 * Recalculates the status of a proposal.
 * @template T - A type that extends DetailedProposal or ProposalListItem
 * @param proposal - The proposal to recalculate the status of
 * @returns The proposal with recalculated status,
 * or null/undefined if the input was null/undefined
 */
export function recalculateProposalStatus<
  T extends DetailedProposal | ProposalListItem,
>(proposal: T | null | undefined): T | null | undefined {
  if (proposal?.status === ProposalStatus.SUCCEEDED) {
    const endTime = proposal.endDate.getTime();
    // prioritize active state over succeeded one if end time has yet
    // to be met
    if (endTime >= Date.now())
      return {...proposal, status: ProposalStatus.ACTIVE};

    // for an inactive multisig proposal, make sure a vote has actually been cast
    // or that the end time isn't in the past
    if (isMultisigProposal(proposal)) {
      if (proposal.approvals.length === 0)
        return {...proposal, status: ProposalStatus.DEFEATED};
    }
  }
  return proposal;
}

/**
 * Encodes an OS update action for a DAO on a specified network.
 * @param currentVersion - The current version of the OS in the format [major, minor, patch].
 * @param selectedVersion - The selected version of the OS to update to.
 * @param network - The network on which the DAO operates.
 * @param daoAddress - The address of the DAO.
 * @param client - An instance of the `Client` class for encoding the update action.
 * @returns A encoded action for updating the OS of the DAO.
 */
export async function encodeOsUpdateAction(
  currentVersion: [number, number, number] | undefined,
  selectedVersion: SupportedVersion,
  network: SupportedNetworks | undefined,
  daoAddress: string | undefined,
  client: Client | undefined
) {
  const translatedNetwork = translateToNetworkishName(network ?? 'unsupported');
  if (
    translatedNetwork !== 'unsupported' &&
    SupportedNetworksArray.includes(translatedNetwork) &&
    currentVersion &&
    daoAddress &&
    client
  ) {
    try {
      const encodedAction = await client.encoding.daoUpdateAction(daoAddress, {
        previousVersion: currentVersion,
        daoFactoryAddress:
          LIVE_CONTRACTS[selectedVersion][translatedNetwork].daoFactoryAddress,
      });
      return encodedAction;
    } catch (error) {
      console.error('Error encoding OSxUpdate Action', error);
    }
  }
}

/**
 * Retrieves and decodes update actions for a DAO based on specified criteria.
 * @param daoAddress - The address of the DAO.
 * @param actions - An array of actions to process for updates.
 * @param updateFramework - Information about the update framework.
 * @param currentProtocolVersion - The current version of the protocol.
 * @param client - An instance of the Aragon SDK client.
 * @param network - The network on which the DAO operates.
 * @param provider - Ethers provider
 * @param t - Translation function.
 * @returns An array of decoded update actions for the DAO.
 */
export async function getDecodedUpdateActions(
  daoAddress: string,
  actions: Array<Action>,
  updateFramework: CreateProposalFormData['updateFramework'],
  currentProtocolVersion: [number, number, number] | undefined,
  client: Client | undefined,
  network: SupportedNetworks | undefined,
  provider: ethers.providers.Provider,
  t: TFunction
) {
  const decodedActions: ActionSCC[] = [];

  if (!client || !network) return decodedActions;

  // encode the osUpdateAction so that it can be
  // decoded and passed to the generic SCC external action card
  const processOsUpdateAction = async () => {
    const osAction: ActionOSUpdate | undefined = actions.find(
      action => action.name === 'os_update'
    ) as ActionOSUpdate | undefined;

    if (osAction && updateFramework?.os) {
      const encodedOsAction = await encodeOsUpdateAction(
        currentProtocolVersion,
        osAction.inputs.version,
        network,
        daoAddress,
        client
      );

      if (encodedOsAction) {
        return decodeUpgradeToAndCallAction(encodedOsAction, client);
      }
    }
  };

  // encode the plugin update actions so it can be decoded
  // and passed to the generic SCC external action card
  const processPluginUpdateActions = async () => {
    const pluginAction: ActionPluginUpdate | undefined = actions.find(
      action => action.name === 'plugin_update'
    ) as ActionPluginUpdate | undefined;

    if (pluginAction && updateFramework?.plugin) {
      const encodedPluginActions =
        client.encoding.applyUpdateAndPermissionsActionBlock(
          daoAddress,
          pluginAction.inputs
        );

      const decodedPluginActions = [];
      for (const [
        index,
        pluginUpdateAction,
      ] of encodedPluginActions.entries()) {
        let decoded: Action | undefined;

        // decode the applyUpdate action with the custom decoder as
        // the decoding fails when using the generic decoder;
        // Note: the applyUpdateAction will always be the second action
        // in the list (grant, applyUpdate, revoke)
        if (index === 1) {
          decoded = decodeApplyUpdateAction(pluginUpdateAction, client);
        } else {
          decoded = await decodeOSUpdateActions(
            daoAddress,
            t,
            pluginUpdateAction,
            network!,
            provider
          );
        }

        if (decoded) {
          decodedPluginActions.push({
            ...decoded,
            name: 'external_contract_action',
          } as ActionSCC);
        }
      }

      return decodedPluginActions;
    }
    return [];
  };

  const osUpdateAction = await processOsUpdateAction();
  const pluginUpdateActions = (await processPluginUpdateActions()) ?? [];

  // the osUpdateAction must come before the plugin updates
  if (osUpdateAction) {
    decodedActions.push(osUpdateAction);
  }

  decodedActions.push(...pluginUpdateActions);
  return decodedActions;
}

/**
 * Pin a DAO's avatar to IPFS and return the IPFS URI
 * @param avatar
 * @param client
 */
export const pinAvatar = async (avatar: Blob, client: Client) => {
  try {
    const daoLogoBuffer = await readFile(avatar);

    const logoCID = await client.ipfs.add(new Uint8Array(daoLogoBuffer));
    await client.ipfs.pin(logoCID);
    return `ipfs://${logoCID}`;
  } catch (e) {
    return undefined;
  }
};

/**
 * Get the modify metadata action for a DAO.
 * It pins the avatar to IPFS and returns if needed
 * @param preparedAction
 * @param daoAddress
 * @param client
 */
export const getModifyMetadataAction = async (
  preparedAction: {name: 'modify_metadata'; inputs: DaoMetadata},
  daoAddress: string,
  client: Client
) => {
  if (preparedAction.inputs?.links)
    preparedAction.inputs.links = preparedAction.inputs?.links.filter(
      link => link.name !== '' && link.url !== ''
    );

  if (
    preparedAction.inputs.avatar &&
    typeof preparedAction.inputs.avatar !== 'string'
  ) {
    preparedAction.inputs.avatar = await pinAvatar(
      preparedAction.inputs.avatar as unknown as Blob,
      client
    );
  }
  try {
    const ipfsUri = await client.methods.pinMetadata(preparedAction.inputs);

    return client.encoding.updateDaoMetadataAction(daoAddress, ipfsUri);
  } catch (error) {
    throw Error('Could not pin metadata on IPFS');
  }
};
