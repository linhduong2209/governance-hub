import request, {gql} from 'graphql-request';
import {UseInfiniteQueryOptions, useInfiniteQuery} from '@tanstack/react-query';
import {aragonBackendQueryKeys} from '../query-keys';
import type {IFetchDaosParams} from '../aragon-backend-service.api';
import {IPaginatedResponse} from '../domain/paginated-response';
import {IDao} from '../domain/dao';
import {aragonGateway} from 'utils/aragonGateway';

const daosQueryDocument = gql`
  query Daos(
    $pluginNames: [String!]
    $orderBy: String
    $skip: Float
    $direction: OrderDirection
    $networks: [Network!]
    $take: Float
    $memberAddress: String
  ) {
    daos(
      pluginNames: $pluginNames
      direction: $direction
      orderBy: $orderBy
      networks: $networks
      take: $take
      skip: $skip
      memberAddress: $memberAddress
    ) {
      data {
        createdAt
        creatorAddress
        daoAddress
        description
        ens
        logo
        name
        network
        pluginName
        stats {
          members
          proposalsCreated
          proposalsExecuted
          tvl
          votes
          uniqueVoters
        }
      }
      skip
      total
      take
    }
  }
`;

const fetchDaos = async (
  params: IFetchDaosParams
): Promise<IPaginatedResponse<IDao>> => {
  const {daos} = await request<{daos: IPaginatedResponse<IDao>}>(
    aragonGateway.backendUrl,
    daosQueryDocument,
    params
  );

  return daos;
};

export const useDaos = (
  params: IFetchDaosParams,
  options: UseInfiniteQueryOptions<IPaginatedResponse<IDao>> = {}
) => {
  return useInfiniteQuery(
    aragonBackendQueryKeys.daos(params),
    ({pageParam}) => fetchDaos({...params, ...pageParam}),
    {
      ...options,
      getNextPageParam: (lastPage: IPaginatedResponse<IDao>) => {
        const {skip, total, take} = lastPage;
        const hasNextPage = skip + take < total;

        if (!hasNextPage) {
          return undefined;
        }

        return {...params, skip: skip + take};
      },
    }
  );
};
