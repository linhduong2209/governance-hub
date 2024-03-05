import {MajorityVotingSettings} from '@aragon/sdk-client';
import {useQuery, UseQueryOptions} from '@tanstack/react-query';
import {GaslessVotingClient} from '@vocdoni/gasless-voting';
import {useCallback} from 'react';

import {useNetwork} from 'src/context/network';
import {useProviders} from 'src/context/providers';
import {TokenDaoMember, useDaoMembers} from 'src/hooks/useDaoMembers';
import {
  GaslessPluginName,
  PluginTypes,
  usePluginClient,
} from 'src/hooks/usePluginClient';
import {CHAIN_METADATA} from 'src/utils/constants';
import {invariant} from 'src/utils/invariant';
import {formatUnits} from 'src/utils/library';
import {fetchBalance} from 'src/utils/tokens';
import {IFetchIsMemberParams} from '../aragon-sdk-service.api';
import {aragonSdkQueryKeys} from '../query-keys';
import {useVotingPowerAsync} from './use-voting-power';
import {useVotingSettings} from './use-voting-settings';

interface IUseIsMemberParams extends IFetchIsMemberParams {
  pluginType: PluginTypes;
}

/**
 * Custom hook that checks if a given address is a member of a DAO plugin.
 *
 * @param params - The parameters for the query.
 * @param options - The options for the query.
 * @returns The result of the query, indicating whether the address is a member or not.
 */
export const useIsMember = (
  params: IUseIsMemberParams,
  options: UseQueryOptions<boolean | undefined> = {}
) => {
  const {network} = useNetwork();
  const client = usePluginClient(params.pluginType);
  const {api: provider} = useProviders();
  const fetchVotingPower = useVotingPowerAsync();

  const isTokenVoting = params.pluginType === 'token-voting.plugin.dao.eth';
  const isGaslessVoting = params.pluginType === GaslessPluginName;

  // fetch voting settings
  const {data: votingSettings, isLoading: settingsAreLoading} =
    useVotingSettings(
      {
        pluginAddress: params.pluginAddress,
        pluginType: params.pluginType,
      },
      {enabled: isTokenVoting}
    );

  // fetch dao members
  const {
    data: {daoToken, filteredMembers},
    isLoading: membersAreLoading,
  } = useDaoMembers(params.pluginAddress, params.pluginType, {
    searchTerm: params.address,
    page: 0,
    enabled: isTokenVoting,
  });

  if (
    client == null ||
    !params.address ||
    !params.pluginAddress ||
    isGaslessVoting || // Temporarily turn off for Vocdoni gasless plugin
    (isTokenVoting &&
      (daoToken == null || membersAreLoading || settingsAreLoading))
  ) {
    options.enabled = false;
  }

  const fetchIsMemberTokenBased = useCallback(async () => {
    const connectedDaoMember = filteredMembers[0] as TokenDaoMember | undefined;
    let balance = connectedDaoMember?.balance ?? 0;
    let votingPower = connectedDaoMember?.votingPower ?? 0;

    // Fallback to fetching connected user balance and voting power from smart
    // contract when user is not found on DAO members list
    if (connectedDaoMember == null) {
      const userBalance = await fetchBalance(
        daoToken!.address,
        params.address,
        provider,
        CHAIN_METADATA[network].nativeCurrency
      );
      balance = Number(userBalance);

      const userVotingPower = await fetchVotingPower({
        address: params.address,
        tokenAddress: daoToken!.address,
      });
      votingPower = Number(formatUnits(userVotingPower, daoToken!.decimals));
    }

    const minProposalThreshold = Number(
      formatUnits(
        (votingSettings as MajorityVotingSettings)?.minProposerVotingPower ?? 0,
        daoToken!.decimals
      )
    );

    const isMember =
      minProposalThreshold === 0 ||
      balance >= minProposalThreshold ||
      votingPower >= minProposalThreshold;

    return isMember;
  }, [
    daoToken,
    fetchVotingPower,
    filteredMembers,
    network,
    params.address,
    provider,
    votingSettings,
  ]);

  const fetchIsMember = async () => {
    invariant(client != null, 'fetchIsMember: client is not defined');

    if (isGaslessVoting || client instanceof GaslessVotingClient) {
      console.warn(
        'fetchIsMember: unable to determine membership using GaslessVotingClient'
      );
      return;
    }

    const data = isTokenVoting
      ? await fetchIsMemberTokenBased()
      : await client.methods.isMember({
          address: params.address,
          pluginAddress: params.pluginAddress,
        });

    return data;
  };

  const queryParams: IFetchIsMemberParams = {
    pluginAddress: params.pluginAddress,
    address: params.address,
  };

  return useQuery(
    aragonSdkQueryKeys.isMember(
      {
        network,
        address: params.address,
      },
      queryParams
    ),
    () => fetchIsMember(),
    options
  );
};
