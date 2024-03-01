import {Client} from '@aragon/sdk-client';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';

import {useNetwork} from 'src/context/network';
import {useClient} from 'src/hooks/useClient';
import {invariant} from 'src/utils/invariant';
import {getPluginRepoAddress} from 'src/utils/library';
import {IFetchPluginVersionsParams} from '../aragon-sdk-service.api';
import {aragonSdkQueryKeys} from '../query-keys';
import {useProtocolVersion} from './use-protocol-version';

export type PluginVersions = {
  address: string;
  current: {
    build: {
      number: number;
    };
    release: {
      number: number;
    };
  };
  releases: {
    release: number;
    builds: {
      build: number;
    }[];
  }[];
};

async function fetchPluginVersions(
  client: Client | undefined,
  pluginRepoAddress: string | undefined
): Promise<PluginVersions> {
  invariant(client != null, 'fetchAvailablePlugins: client is not defined');
  invariant(
    pluginRepoAddress != null,
    'fetchAvailablePlugins: client is not defined'
  );

  const data = await client.methods.getPlugin(pluginRepoAddress);
  return data;
}

export const usePluginVersions = (
  params: IFetchPluginVersionsParams,
  options: UseQueryOptions<PluginVersions> = {}
) => {
  const {client} = useClient();
  const {network} = useNetwork();

  const {data: protocolVersion} = useProtocolVersion(params.daoAddress);

  let pluginRepoAddress: string | undefined;

  if (params.pluginType && protocolVersion) {
    pluginRepoAddress = getPluginRepoAddress(
      network,
      params.pluginType,
      protocolVersion
    );
  }

  if (!pluginRepoAddress || !client) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.pluginVersions(
      {network},
      {daoAddress: params.daoAddress}
    ),
    () => fetchPluginVersions(client, pluginRepoAddress),
    options
  );
};
