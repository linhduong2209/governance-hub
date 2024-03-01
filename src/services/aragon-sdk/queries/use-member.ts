import request, {gql} from 'graphql-request';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchMemberParams} from '../aragon-sdk-service.api';
import {usePluginClient} from 'src/hooks/usePluginClient';
import {TokenVotingClient, TokenVotingMember} from '@aragon/sdk-client';
import {invariant} from 'src/utils/invariant';
import {SubgraphTokenVotingMember} from '@aragon/sdk-client/dist/tokenVoting/internal/types';
import {MemberDAOsType, SubgraphMembers} from 'src/utils/types';
import {useNetwork} from 'src/context/network';
import {useWallet} from 'src/hooks/useWallet';
import {SUBGRAPH_API_URL, SupportedNetworks} from 'src/utils/constants';

function toTokenVotingMember(
  member: SubgraphTokenVotingMember
): TokenVotingMember {
  return {
    address: member.address,
    votingPower: BigInt(member.votingPower),
    balance: BigInt(member.balance),
    delegatee:
      member.delegatee?.address === member.address || !member.delegatee
        ? null
        : member.delegatee.address,
    delegators: member.delegators
      .filter(delegator => delegator.address !== member.address)
      .map(delegator => {
        return {
          address: delegator.address,
          balance: BigInt(delegator.balance),
        };
      }),
  };
}

function toMemberDAOs(members: SubgraphMembers[]): MemberDAOsType {
  return members
    .sort(
      (a, b) => Number(b.plugin.dao.createdAt) - Number(a.plugin.dao.createdAt)
    )
    .map(member => ({
      address: member.plugin.dao.id,
      pluginAddress: member.plugin.pluginAddress,
      metadata: member.plugin.dao.metadata,
      subdomain: member.plugin.dao.subdomain,
      network: member.network as string,
    }));
}

// TODO: remove GraphQL query when utility is implemented on the SDK
// (see: https://aragonassociation.atlassian.net/browse/OS-814)
export const tokenMemberQuery = gql`
  query TokenVotingMembers(
    $where: TokenVotingMember_filter!
    $block: Block_height
  ) {
    tokenVotingMembers(where: $where, block: $block) {
      address
      balance
      votingPower
      delegatee {
        address
      }
      delegators {
        address
        balance
      }
    }
  }
`;

export const tokenMemberDAOsQuery = gql`
  query TokenVotingMembers(
    $where: TokenVotingMember_filter!
    $block: Block_height
  ) {
    tokenVotingMembers(where: $where, block: $block) {
      address
      plugin {
        dao {
          id
        }
      }
    }
  }
`;

export const membersDAOsQuery = gql`
  query MultisigApprovers(
    $where: TokenVotingMember_filter!
    $block: Block_height
  ) {
    multisigApprovers(where: $where, block: $block) {
      address
      plugin {
        pluginAddress
        dao {
          createdAt
          id
          subdomain
          metadata
        }
      }
    }
    tokenVotingMembers(where: $where, block: $block) {
      address
      plugin {
        pluginAddress
        dao {
          createdAt
          id
          subdomain
          metadata
        }
      }
    }
  }
`;

const fetchMember = async (
  {pluginAddress, blockNumber, address}: IFetchMemberParams,
  client?: TokenVotingClient
): Promise<TokenVotingMember | null> => {
  invariant(client != null, 'fetchMember: client is not defined');
  const params = {
    where: {
      plugin: pluginAddress!.toLowerCase(),
      address: address.toLowerCase(),
    },
    block: blockNumber ? {number: blockNumber} : null,
  };

  type TResult = {tokenVotingMembers: SubgraphTokenVotingMember[]};
  const {tokenVotingMembers} = await client.graphql.request<TResult>({
    query: tokenMemberQuery,
    params,
  });

  if (tokenVotingMembers.length === 0) {
    return null;
  }

  return toTokenVotingMember(tokenVotingMembers[0]);
};

const fetchMemberDAOs = async (
  {blockNumber, address, daoAddress}: IFetchMemberParams,
  client?: TokenVotingClient
): Promise<MemberDAOsType> => {
  invariant(client != null, 'fetchMember: client is not defined');
  const params = {
    where: {
      address: address.toLowerCase(),
    },
    block: blockNumber ? {number: blockNumber} : null,
  };

  const promisesResult = Object.entries(SUBGRAPH_API_URL).map(async ([key]) => {
    if (key !== 'unsupported') {
      const reponse = await request(
        SUBGRAPH_API_URL[key as SupportedNetworks] as string,
        membersDAOsQuery,
        params
      );
      return {
        ...reponse,
        network: key as SupportedNetworks,
      };
    }
  });

  type TResult = {
    tokenVotingMembers: SubgraphMembers[];
    multisigApprovers: SubgraphMembers[];
    network: string;
  };

  const response: TResult[] = await Promise.all(promisesResult);
  const filteredResponse: SubgraphMembers[] = [];

  response.map(networkDaos => {
    if (networkDaos)
      (networkDaos.tokenVotingMembers ?? [])
        .concat(networkDaos.multisigApprovers)
        .map(dao => {
          if (dao.plugin.dao.id !== daoAddress)
            filteredResponse.push({
              ...dao,
              network: networkDaos.network,
            });
        });
  });

  return toMemberDAOs(filteredResponse);
};

export const useMember = (
  params: IFetchMemberParams,
  options: UseQueryOptions<TokenVotingMember | null> = {}
) => {
  const client = usePluginClient('token-voting.plugin.dao.eth');
  const {network} = useNetwork();

  const baseParams = {
    network: network,
  };

  if (client == null) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.getMember(baseParams, params),
    () => fetchMember(params, client),
    options
  );
};

export const useMemberDAOs = (
  params: IFetchMemberParams,
  options: UseQueryOptions<MemberDAOsType> = {}
) => {
  const client = usePluginClient('token-voting.plugin.dao.eth');
  const {network} = useWallet();
  const baseParams = {
    address: params.address as string,
    network: network as SupportedNetworks,
  };

  if (client == null || network == null) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.getMemberDAOs(baseParams),
    () => fetchMemberDAOs(params, client),
    options
  );
};
