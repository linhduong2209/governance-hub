import {Erc20TokenDetails, Erc20WrapperTokenDetails} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';

import {HookData} from 'src/utils/types';
import {
  isMultisigClient,
  PluginTypes,
  usePluginClient,
} from './usePluginClient';
import {useDaoDetailsQuery} from './useDaoDetails';

export function useDaoToken(
  pluginAddress?: string
): HookData<Erc20TokenDetails | Erc20WrapperTokenDetails | undefined> {
  const [data, setData] = useState<
    Erc20TokenDetails | Erc20WrapperTokenDetails
  >();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const {data: daoDetails} = useDaoDetailsQuery();
  const {id: pluginType} = daoDetails?.plugins[0] || {};

  const client = usePluginClient(pluginType as PluginTypes);

  useEffect(() => {
    async function getTokenMetadata(address: string) {
      if (client && isMultisigClient(client)) return;

      try {
        setIsLoading(true);

        const response = await client?.methods.getToken(address);

        if (response) {
          setData(response as Erc20TokenDetails | Erc20WrapperTokenDetails);
        }
      } catch (err) {
        console.error('Error fetching DAO token', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (pluginAddress) {
      getTokenMetadata(pluginAddress);
    }
  }, [pluginAddress, client]);

  return {data, error, isLoading};
}
