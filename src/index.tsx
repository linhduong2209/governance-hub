import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GlobalModalsProvider } from "./context/globalModals";
import { ProvidersContextProvider } from "./context/providers";
import { WalletMenuProvider } from "./context/walletMenu";
import { UseCacheProvider } from "./hooks/useCache";
import { UseClientProvider } from "./hooks/useClient";
import { VocdoniClientProvider } from "./hooks/useVocdoniSdk";
import { ContextProvider } from "./services/web3modal";
import { AlertProvider } from "./context/alert";
import "@aragon/ods/index.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <ContextProvider>
      <AlertProvider>
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
      </AlertProvider>
    </ContextProvider>
  </React.StrictMode>,
);
