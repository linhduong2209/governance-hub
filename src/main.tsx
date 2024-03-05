import React from "react";
import ReactDOM from "react-dom/client";
import "@aragon/ods/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import {
  arbitrum,
  arbitrumGoerli,
  base,
  baseGoerli,
  goerli,
  mainnet,
  polygon,
  polygonMumbai,
  sepolia,
} from "wagmi/chains";
import { w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import { walletConnectProjectID } from "src/utils/constants";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { aragonGateway } from "src/utils/aragonGateway";
import { ProvidersContextProvider } from "src/context/providers";
import { AlertProvider } from "src/context/alert";
import { GlobalModalsProvider } from "src/context/globalModals";
import { VocdoniClientProvider } from "./hooks/useVocdoniSdk";
import { PrivacyContextProvider } from "src/context/privacyContext";
import { UseCacheProvider } from "src/hooks/useCache";
import { WalletMenuProvider } from "src/context/walletMenu";

import App from "./App.tsx";

const chains = [
  base,
  baseGoerli,
  goerli,
  mainnet,
  polygon,
  polygonMumbai,
  arbitrum,
  arbitrumGoerli,
  sepolia,
];

const { publicClient } = configureChains(chains, [
  w3mProvider({ projectId: walletConnectProjectID }),
  jsonRpcProvider({
    rpc: (chain) => ({ http: aragonGateway.buildRpcUrl(chain.id) ?? "" }),
  }),
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    ...w3mConnectors({
      projectId: walletConnectProjectID,
      //   version: 2,
      chains,
    }),
  ],

  publicClient,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 5, // 5min
      staleTime: 1000 * 60 * 2, // 2min
      retry: 0,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <PrivacyContextProvider>
        <AlertProvider>
          <WagmiConfig config={wagmiConfig}>
            <UseCacheProvider>
              <ProvidersContextProvider>
                <WalletMenuProvider>
                  <GlobalModalsProvider>
                    <VocdoniClientProvider>
                      <App />
                    </VocdoniClientProvider>
                  </GlobalModalsProvider>
                </WalletMenuProvider>
              </ProvidersContextProvider>
            </UseCacheProvider>
          </WagmiConfig>
        </AlertProvider>
      </PrivacyContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
