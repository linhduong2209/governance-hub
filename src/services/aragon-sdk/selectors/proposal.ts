import {
  MultisigProposal,
  MultisigProposalListItem,
  TokenVotingProposal,
  TokenVotingProposalListItem,
  TokenVotingProposalVote,
  VoteValues,
} from '@aragon/sdk-client';
import {ensure0x, ProposalStatus} from '@aragon/sdk-client-common';
import {InfiniteData} from '@tanstack/react-query';
import {
  GaslessVotingProposal,
  GaslessVotingProposalListItem,
} from '@vocdoni/gasless-voting';

import {SupportedChainID} from 'src/utils/constants';
import {executionStorage, voteStorage} from 'src/utils/localStorage';
import {proposalStorage} from 'src/utils/localStorage/proposalStorage';
import {
  isGaslessProposal,
  isMultisigProposal,
  isTokenBasedProposal,
  recalculateProposalStatus,
} from 'src/utils/proposals';

/**
 * Transforms proposals within an `InfiniteData` structure.
 *
 * @template T - Type of the proposals list, either `MultisigProposalListItem` array or `TokenVotingProposalListItem` array.
 * @param chainId - The ID of the supported chain.
 * @param data - The data containing pages of proposals to transform.
 *
 * @returns - Transformed data with proposals processed based on the chainId.
 */
export function transformInfiniteProposals<
  T extends
    | Array<MultisigProposalListItem>
    | Array<TokenVotingProposalListItem>
    | Array<GaslessVotingProposalListItem>,
>(chainId: SupportedChainID, data: InfiniteData<T>): InfiniteData<T> {
  return {
    ...data,
    pages: data.pages.map(
      page => page?.map(proposal => transformProposal(chainId, proposal)) as T
    ),
  };
}

/**
 * Transforms the input data by adding cached votes and execution info, and recalculating its status.
 *
 * The function performs a series of enhancements on the proposal:
 * 1. Appends cached votes from local storage.
 * 2. Adds execution details from local storage.
 * 3. Recalculates the status of the proposal.
 *
 * If the input data is `null`, it is returned as-is.
 *
 * @template T - Type that extends either `MultisigProposal` or `TokenVotingProposal` or can be null.
 * @param chainId - The chain ID associated with the data.
 * @param data - The data to transform.
 *
 * @returns The transformed data.
 */
export function transformProposal<
  T extends
    | MultisigProposal
    | TokenVotingProposal
    | MultisigProposalListItem
    | TokenVotingProposalListItem
    | GaslessVotingProposal
    | GaslessVotingProposalListItem
    | null,
>(chainId: SupportedChainID, data: T): T {
  if (data == null) {
    return data;
  }

  const proposal = {...data};

  syncApprovalsOrVotes(chainId, proposal);
  syncExecutionInfo(chainId, proposal);

  // todo(kon): Quickfix for gasless proposals bug where the creator address is not prefixed with 0x
  proposal.creatorAddress = ensure0x(proposal.creatorAddress);

  return recalculateProposalStatus(proposal) as T;
}

export function syncProposalData<
  T extends
    | MultisigProposal
    | TokenVotingProposal
    | GaslessVotingProposal
    | MultisigProposalListItem
    | TokenVotingProposalListItem
    | GaslessVotingProposalListItem,
>(chainId: SupportedChainID, proposalId: string, serverData: T | null) {
  if (serverData) {
    proposalStorage.removeProposal(chainId, serverData.id);
    return serverData;
  } else {
    return proposalStorage.getProposal(chainId, proposalId);
  }
}

/**
 * Update the proposal with its execution details or remove execution details if they exist.
 *
 * If the proposal has an executionTxHash, it means the execution detail has been handled and
 * should be removed from the execution storage. Otherwise, the execution detail is fetched
 * from the storage and merged into the proposal.
 *
 * @param chainId - The chain ID associated with the proposal.
 * @param proposal - The proposal to update with execution details.
 */
function syncExecutionInfo(
  chainId: SupportedChainID,
  proposal:
    | MultisigProposal
    | TokenVotingProposal
    | GaslessVotingProposal
    | MultisigProposalListItem
    | TokenVotingProposalListItem
    | GaslessVotingProposalListItem
): void {
  if (proposal.status === ProposalStatus.EXECUTED) {
    // If the proposal is already executed, remove its detail from storage.
    executionStorage.removeExecutionDetail(chainId, proposal.id);
  } else {
    // Otherwise, get the execution detail from storage and merge into the proposal.
    const executionDetail = executionStorage.getExecutionDetail(
      chainId,
      proposal.id
    );

    if (executionDetail) {
      Object.assign(proposal, executionDetail);
      proposal.status = ProposalStatus.EXECUTED;
    }
  }
}

/**
 * Enhances and appends cached votes to the provided proposal/proposal list item.
 *
 * @param chainId - The chain ID for which votes or approvals are associated.
 * @param proposal - The input proposal data.
 */
function syncApprovalsOrVotes(
  chainId: SupportedChainID,
  proposal:
    | MultisigProposal
    | TokenVotingProposal
    | GaslessVotingProposal
    | MultisigProposalListItem
    | TokenVotingProposalListItem
    | GaslessVotingProposalListItem
): void {
  if (isMultisigProposal(proposal)) {
    proposal.approvals = syncMultisigVotes(chainId, proposal);
  } else if (isGaslessProposal(proposal)) {
    const {gaslessVoters, approvers} = syncGaslessVotesOrApproves(
      chainId,
      proposal
    );
    proposal.approvers = approvers;
    proposal.voters = gaslessVoters.map(({address}) => address);
  } else if (isTokenBasedProposal(proposal)) {
    proposal.votes = syncTokenBasedVotes(chainId, proposal);
  }
}

/**
 * Retrieves and filters cached votes for a multisig proposal, removing votes
 * already indexed by the server and storing unique cached votes.
 *
 * @param chainId - The chain ID for which votes are associated.
 * @param proposal - The input proposal data.
 * @param voteStorage - Instance of VoteStorage to manage cached votes.
 * @returns A list of unique cached votes.
 */
function syncMultisigVotes(
  chainId: SupportedChainID,
  proposal: MultisigProposal | MultisigProposalListItem
): string[] {
  const serverApprovals = new Set(proposal.approvals);
  const allCachedApprovals = voteStorage.getVotes<string>(chainId, proposal.id);

  const uniqueCachedApprovals = allCachedApprovals.filter(cachedVote => {
    // remove, from the cache, votes that are returned by the query as well
    if (serverApprovals.has(cachedVote.toLowerCase())) {
      voteStorage.removeVoteForProposal(chainId, proposal.id, cachedVote);
      return false;
    } else {
      return true;
    }
  });

  return [...uniqueCachedApprovals, ...Array.from(serverApprovals)];
}

/**
 * Handles the votes for a token based proposal by checking if the cached vote
 * needs to replace or supplement the server's votes.
 *
 * @param chainId - The chain ID for which votes are associated.
 * @param proposal - The input proposal data.
 * @param voteStorage - Instance of VoteStorage to manage cached votes.
 * @returns An updated list of votes.
 */
function syncTokenBasedVotes(
  chainId: SupportedChainID,
  proposal: TokenVotingProposal | TokenVotingProposalListItem
): TokenVotingProposalVote[] {
  const serverVotes = new Map(
    proposal.votes?.map(vote => [vote.address, vote])
  );
  const uniqueCachedVotes: Array<TokenVotingProposalVote> = [];

  // all cached votes
  const allCachedVotes = voteStorage.getVotes<TokenVotingProposalVote>(
    chainId,
    proposal.id
  );

  for (const cachedVote of allCachedVotes) {
    const serverVote = serverVotes.get(cachedVote.address.toLowerCase());
    const sameVoter = !!serverVote;

    // unique voter, keep cache and server votes
    if (!sameVoter) {
      uniqueCachedVotes.push(cachedVote);
      continue;
    }

    const sameVoteReplacementStatus =
      !!serverVote.voteReplaced === cachedVote.voteReplaced;

    if (sameVoteReplacementStatus) {
      // same vote replacement status, remove cached vote
      voteStorage.removeVoteForProposal(
        chainId,
        proposal.id,
        cachedVote.address
      );
    } else if (cachedVote.voteReplaced) {
      // cachedVote is a replacement: cache ahead, keep cached version
      serverVotes.set(cachedVote.address, cachedVote);
    } else {
      // serverVote is a replacement: cache is behind, remove cached version
      // - NOTE: shouldn't be possible really unless someone is replacing their vote
      //   using a different device
      voteStorage.removeVoteForProposal(
        chainId,
        proposal.id,
        cachedVote.address
      );
    }
  }

  return [...uniqueCachedVotes, ...Array.from(serverVotes.values())];
}

type ApprovalVote = string;
type GaslessVote = {
  address: string;
  vote: VoteValues;
  weight: BigInt;
};

export type GaslessVoteOrApprovalVote =
  | {
      type: 'gaslessVote';
      vote: GaslessVote;
    }
  | {
      type: 'approval';
      vote: ApprovalVote;
    };

function syncGaslessVotesOrApproves(
  chainId: SupportedChainID,
  proposal: GaslessVotingProposal
) {
  const approversCache: ApprovalVote[] = [];
  const gaslessVotersCache: GaslessVote[] = [];

  // all cached votes
  const allCachedVotes = voteStorage.getVotes<GaslessVoteOrApprovalVote>(
    chainId,
    proposal.id
  );

  const serverApprovals = new Set(
    proposal.approvers?.map(approver => approver.toLowerCase())
  );
  const serverGaslessVoters = new Set(
    proposal.voters?.map(voter => voter.toLowerCase())
  );

  allCachedVotes.forEach(cachedVote => {
    // remove, from the cache, votes that are returned by the query as well
    if (
      cachedVote.type === 'approval' &&
      serverApprovals.has(cachedVote.vote.toLowerCase())
    ) {
      voteStorage.removeVoteForProposal(chainId, proposal.id, cachedVote.vote);
    } else if (
      cachedVote.type === 'gaslessVote' &&
      serverGaslessVoters.has(cachedVote.vote.address.toLowerCase())
    ) {
      voteStorage.removeVoteForProposal(
        chainId,
        proposal.id,
        cachedVote.vote.address
      );
    } else {
      // If the vote is not in the server, add it to the list
      cachedVote.type === 'approval'
        ? approversCache.push(cachedVote.vote)
        : gaslessVotersCache.push(cachedVote.vote);
    }
  });

  // This is needed until the voters list is fixed from the backend
  const mappedVoters = Array.from(serverGaslessVoters).map(address => ({
    address,
    vote: null,
    weight: null,
  }));

  return {
    approvers: [...approversCache, ...serverApprovals],
    gaslessVoters: [...gaslessVotersCache, ...mappedVoters],
  };
}
