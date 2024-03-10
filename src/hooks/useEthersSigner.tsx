import * as React from "react";
import { useWalletClient } from "wagmi";
import { providers } from "ethers";

function walletClientToSigner(walletClient: any) {
  const { account, chain, transport } = walletClient;
  const network = {
    // chainId: chain.id,
    // name: chain.name,
    // ensAddress: chain.contracts?.ensRegistry?.address,
    chainId: 43113,
    name: "Avalanche Fuji Testnet",
    ensAddress: "0xd004B975f1047f34Cbe7f578EF70FCe9A4BDB1C2",
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner(chainId?: number) {
  const { data: walletClient } = useWalletClient({ chainId });
  return React.useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient],
  );
}
