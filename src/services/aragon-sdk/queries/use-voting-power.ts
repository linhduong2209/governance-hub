import {UseQueryOptions, useQuery, useQueryClient} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchVotingPowerParams} from '../aragon-sdk-service.api';
import {getVotingPower} from 'src/utils/tokens';
import {useProviders} from 'src/context/providers';
import {BigNumber} from 'ethers';
import {useCallback} from 'react';

export const useVotingPower = (
  params: IFetchVotingPowerParams,
  options?: UseQueryOptions<BigNumber>
) => {
  const {api: provider} = useProviders();

  return useQuery(
    aragonSdkQueryKeys.votingPower(params),
    () => getVotingPower(params.tokenAddress, params.address, provider),
    options
  );
};

export const useVotingPowerAsync = () => {
  const queryClient = useQueryClient();
  const {api: provider} = useProviders();

  const fetchVotingPowerAsync = useCallback(
    (params: IFetchVotingPowerParams) =>
      queryClient.fetchQuery({
        queryKey: aragonSdkQueryKeys.votingPower(params),
        queryFn: () =>
          getVotingPower(params.tokenAddress, params.address, provider),
      }),
    [queryClient, provider]
  );

  return fetchVotingPowerAsync;
};
