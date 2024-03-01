import { Signer } from "@ethersproject/abstract-signer";
import { PropsWithChildren } from "react";
import { useWallet } from "./useWallet";
import { ClientProvider } from "@vocdoni/react-providers";
import { EnvOptions } from "@vocdoni/sdk";

export const VocdoniEnv: EnvOptions = import.meta.env.VITE_VOCDONI_ENV ?? "stg";

export const VocdoniClientProvider = ({ children }: PropsWithChildren) => {
  const { signer } = useWallet();
  return (
    <ClientProvider env={VocdoniEnv} signer={signer as Signer}>
      {children}
    </ClientProvider>
  );
};
