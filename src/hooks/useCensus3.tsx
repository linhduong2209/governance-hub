import {useClient} from '@vocdoni/react-providers';
import {useCallback, useEffect, useState} from 'react';
import {
  GaslessPluginName,
  PluginTypes,
  usePluginClient,
} from './usePluginClient';
import {ErrTokenAlreadyExists} from '@vocdoni/sdk';
import {useParams} from 'react-router-dom';
import {useProposal} from '../services/aragon-sdk/queries/use-proposal';
import {GaslessVotingProposal} from '@vocdoni/gasless-voting';
import {DaoMember, TokenDaoMember} from './useDaoMembers';
import {getCensus3VotingPower} from '../utils/tokens';

const CENSUS3_URL = 'https://census3-stg.vocdoni.net/api';

export const useCensus3Client = () => {
  const {census3} = useClient();
  census3.url = CENSUS3_URL;
  return census3;
};

/**
 * Hook to know if the actual wallet chain id is supported by the census3 vocdoni service
 */
export const useCensus3SupportedChains = (chainId: number) => {
  const census3 = useCensus3Client();
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    (async () => {
      if (chainId && census3) {
        const supported = (await census3.getSupportedChains())
          .map(chain => chain.chainID)
          .includes(chainId);
        setIsSupported(supported);
      }
    })();
  }, [census3, chainId]);

  return isSupported;
};

export const useCensus3CreateToken = ({chainId}: {chainId: number}) => {
  const client = usePluginClient(GaslessPluginName);
  const census3 = useCensus3Client();
  const isSupported = useCensus3SupportedChains(chainId);

  const createToken = useCallback(
    async (pluginAddress: string) => {
      if (!isSupported) throw Error('ChainId is not supported');
      // Check if the census is already sync
      try {
        const token = await client?.methods.getToken(pluginAddress);
        if (!token) throw Error('Cannot retrieve the token');
        await census3.createToken(token.address, 'erc20', chainId, undefined, [
          'aragon',
          'dao',
        ]);
      } catch (e) {
        if (!(e instanceof ErrTokenAlreadyExists)) {
          throw e;
        }
      }
    },
    [census3, chainId, client?.methods, isSupported]
  );

  return {createToken};
};

// Hook that return census3 census id if is gasless plugin
export const useGaslessCensusId = ({
  pluginType,
  enable = true,
}: {
  pluginType?: PluginTypes;
  enable?: boolean;
}) => {
  const {dao, id: proposalId} = useParams();

  const isGasless = pluginType === GaslessPluginName;
  const _enable: boolean = enable && !!dao && !!proposalId && isGasless;

  const {data: proposalData} = useProposal(
    {
      pluginType: pluginType,
      id: proposalId ?? '',
    },
    {
      enabled: _enable,
    }
  );

  let censusId: string | null = null;
  let censusSize: number | null = null;
  if (
    _enable &&
    proposalData &&
    (proposalData as GaslessVotingProposal).vochain
  ) {
    const census = (proposalData as GaslessVotingProposal).vochain.metadata
      .census;
    censusId = census.censusId;
    censusSize = census.size;
  }

  return {censusId, censusSize};
};

export const useNonWrappedDaoMemberBalance = ({
  isGovernanceEnabled,
  censusId,
  subgraphMembers,
}: {
  isGovernanceEnabled: boolean;
  censusId: string | null;
  subgraphMembers: TokenDaoMember[];
}) => {
  // State to store DaoMembers[]
  const [members, setMembers] = useState<DaoMember[]>(subgraphMembers);
  const {client: vocdoniClient} = useClient();

  // UseEffect to calculate the vocdoni client fetchProof function
  useEffect(() => {
    if (vocdoniClient && isGovernanceEnabled && censusId) {
      (async () => {
        const members = await Promise.all(
          subgraphMembers.map(async member => {
            const votingPower = await getCensus3VotingPower(
              member.address,
              censusId,
              vocdoniClient
            );
            member.balance = Number(votingPower);
            member.votingPower = Number(votingPower);
            return member;
          })
        );
        setMembers(members);
      })();
    }
  }, [censusId, isGovernanceEnabled, subgraphMembers, vocdoniClient]);

  return {members};
};
