import { Client, Context as SdkContext } from "@aragon/sdk-client";

import React, { ReactNode, createContext, useContext, useState } from "react";
import { useNetwork } from "src/context/network";

import { SupportedNetworks } from "src/utils/constants";
import { translateToAppNetwork } from "src/utils/library";
import { useWallet } from "./useWallet";

interface ClientContext {
  client?: Client;
  context?: SdkContext;
  network?: SupportedNetworks;
}

const UseClientContext = createContext<ClientContext>({} as ClientContext);

export const useClient = () => {
  const client = useContext(UseClientContext);
  if (client === null) {
    throw new Error(
      "useClient() can only be used on the descendants of <UseClientProvider />"
    );
  }
  if (client.context) {
    client.network = translateToAppNetwork(client.context.network);
  }
  return client;
};

export const UseClientProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const { signer } = useWallet();
  const [client, setClient] = useState<Client>();
  const { network } = useNetwork();
  const [context, setContext] = useState<SdkContext>();

  // useEffect(() => {
  //   const translatedNetwork = translateToNetworkishName(network);

  //   // when network not supported by the SDK, don't set network
  //   if (
  //     translatedNetwork === "unsupported" ||
  //     !SupportedNetworksArray.includes(translatedNetwork)
  //   ) {
  //     return;
  //   }

  //   const ipfsNodes = [
  //     {
  //       url: aragonGateway.buildIpfsUrl(network)!,
  //       headers: { "X-API-KEY": import.meta.env.VITE_GATEWAY_IPFS_API_KEY }
  //     }
  //   ];
  //   console.log("22222", ipfsNodes);

  //   const contextParams: ContextParams = {
  //     // daoFactoryAddress:
  //     //   LIVE_CONTRACTS[SupportedVersion.LATEST][translatedNetwork]
  //     //     .daoFactoryAddress,
  //     network: translatedNetwork,
  //     signer: signer ?? undefined,
  //     web3Providers: aragonGateway.buildRpcUrl(network)!,
  //     ipfsNodes,
  //     graphqlNodes: [{ url: SUBGRAPH_API_URL[network]! }]
  //   };

  //   const sdkContext = new SdkContext(contextParams);

  //   setClient(new Client(sdkContext));
  //   setContext(sdkContext);
  // }, [network, signer]);

  const value: ClientContext = {
    client,
    context
  };

  return (
    <UseClientContext.Provider value={value}>
      {children}
    </UseClientContext.Provider>
  );
};
