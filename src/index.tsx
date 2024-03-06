import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { GlobalModalsProvider } from "./context/globalModals";
import { NetworkProvider } from "./context/network";
import { ProvidersContextProvider } from "./context/providers";
import { WalletMenuProvider } from "./context/walletMenu";
import { UseCacheProvider } from "./hooks/useCache";
import { UseClientProvider } from "./hooks/useClient";
import { VocdoniClientProvider } from "./hooks/useVocdoniSdk";
import { ContextProvider } from "./services/web3modal";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <ContextProvider>
      <HashRouter>
        <NetworkProvider>
          <UseClientProvider>
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
          </UseClientProvider>
        </NetworkProvider>
      </HashRouter>
    </ContextProvider>
  </React.StrictMode>
);
