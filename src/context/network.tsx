import { createConfig, getChainId, http } from "@wagmi/core";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import { useMatch, useNavigate } from "react-router-dom";
import {
  CHAIN_METADATA,
  L2_NETWORKS,
  SupportedNetworks,
  isSupportedChainId,
  toSupportedNetwork
} from "src/utils/constants";
import { NotFound } from "src/utils/paths";
import { useAccount } from "wagmi";
import { avalancheFuji } from "wagmi/chains";

/* CONTEXT PROVIDER ========================================================= */

type NetworkContext = {
  network: SupportedNetworks;
  setNetwork: (network: SupportedNetworks) => void;
  isL2Network: boolean;
  networkUrlSegment: string | undefined;
};

const NetworkContext = createContext<NetworkContext>({
  network: "ethereum",
  setNetwork: () => {},
  isL2Network: false,
  networkUrlSegment: undefined
});

type NetworkProviderProps = {
  children: React.ReactNode;
};

/**
 * Determine what the current network should be
 * @param networkUrlSegment url segment specifying network if present
 * @param chainId wallet chain id if connected
 * @param status wallet status
 * @returns network to use
 */
const determineNetwork = (
  networkUrlSegment: string | undefined,
  chainId: number,
  status: "disconnected" | "connecting" | "connected"
): SupportedNetworks | "unsupported" => {
  if (networkUrlSegment) {
    // NETWORK from url
    return toSupportedNetwork(networkUrlSegment);
  } else if (status === "connected") {
    if (isSupportedChainId(chainId)) {
      // NETWORK from wallet chain
      return Object.entries(CHAIN_METADATA).find(
        ([, v]) => v.id === chainId
      )?.[0] as SupportedNetworks;
    } else {
      console.log("*NETWORK UNSUPPORTED");
      return "unsupported";
    }
  }

  //NETWORK defaults to eth
  return "ethereum";
};

/**
 * Returns the network on which the app operates.
 *
 * Note that, in most cases, the network is determined by the URL. I.e., on any
 * page load, the URL is parsed and the network adapted to the network specified
 * in the URL. If no network is present, the app defaults to mainnet.
 *
 * There exist cases where the app is in a "neutral" state (for example, during
 * DAO creation). In these cases, the url does NOT contain network information.
 * The app therefore also defaults to ethereum mainnet. However, this context
 * exposes a setter that allows to change the network for
 *
 */
export function NetworkProvider({ children }: NetworkProviderProps) {
  const navigate = useNavigate();
  const urlNetwork = useMatch("daos/:network/*");
  const networkUrlSegment = urlNetwork?.params?.network;
  const chainId = getChainId(
    createConfig({
      chains: [avalancheFuji],
      transports: {
        [avalancheFuji.id]: http()
      }
    })
  );
  const { status: wagmiStatus } = useAccount();
  const status = wagmiStatus === "reconnecting" ? "connecting" : wagmiStatus;
  const [networkState, setNetworkState] = useState<
    SupportedNetworks | "unsupported"
  >(determineNetwork(networkUrlSegment, chainId, status));

  useEffect(() => {
    setNetworkState(determineNetwork(networkUrlSegment, chainId, status));
  }, [chainId, networkUrlSegment, status]);

  const isL2Network = L2_NETWORKS.includes(networkState);

  const changeNetwork = useCallback(
    (network: SupportedNetworks) => {
      if (networkUrlSegment) {
        console.error("Network may not be changed on this page");
      } else {
        setNetworkState(network);
      }
    },
    [networkUrlSegment]
  );

  useEffect(() => {
    // unsupported network based on the networkUrlSegment network
    if (networkState === "unsupported" && networkUrlSegment) {
      console.warn("network unsupported");
      navigate(NotFound, { replace: true });
    }
  }, [networkState, navigate, networkUrlSegment]);

  return (
    <NetworkContext.Provider
      value={{
        network: networkState,
        setNetwork: changeNetwork,
        isL2Network,
        networkUrlSegment
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

/* CONTEXT CONSUMER ========================================================= */

export function useNetwork(): NonNullable<NetworkContext> {
  return useContext(NetworkContext) as NetworkContext;
}
