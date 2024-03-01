import {useMemo} from 'react';
import {clearWagmiCache} from 'src/utils/library';
import {JsonRpcSigner, Web3Provider} from '@ethersproject/providers';
import {
  useAccount,
  useDisconnect,
  useBalance,
  useEnsName,
  useEnsAvatar,
  useNetwork as useWagmiNetwork,
} from 'wagmi';

import {useWeb3Modal} from '@web3modal/react';

import {useNetwork} from 'src/context/network';
import {CHAIN_METADATA} from 'src/utils/constants';
import {useEthersSigner} from './useEthersSigner';
import {BigNumber} from 'ethers';
import {aragonGateway} from 'src/utils/aragonGateway';

export interface IUseWallet {
  connectorName: string;
  balance: BigNumber | null;
  ensAvatarUrl: string;
  ensName: string;
  isConnected: boolean;
  isModalOpen: boolean;
  /**
   * Returns true iff the wallet is connected and it is on the wrong network
   * (i.e., the chainId returned by the useSigner context does not agree with
   * the network name returned by the useNetwork context).
   */
  isOnWrongNetwork: boolean;
  network: string;
  provider: Web3Provider | null;
  signer: JsonRpcSigner | null;
  status: 'connecting' | 'reconnecting' | 'connected' | 'disconnected';
  address: string | null;
  chainId: number;
  methods: {
    selectWallet: (
      cacheProvider?: boolean,
      networkId?: string
    ) => Promise<void>;
    disconnect: () => Promise<void>;
  };
}

export const useWallet = (): IUseWallet => {
  const {network} = useNetwork();

  const {chain} = useWagmiNetwork();
  const {address, status: wagmiStatus, isConnected, connector} = useAccount();
  const {disconnect} = useDisconnect();
  const {open: openWeb3Modal, isOpen} = useWeb3Modal();
  const chainId = chain?.id || 0;
  const signer = useEthersSigner(chainId);

  const provider = useMemo(
    () =>
      ['mumbai', 'polygon'].includes(network)
        ? aragonGateway.getRpcProvider(network)
        : signer?.provider,
    [network, signer?.provider]
  );

  const {data: wagmiBalance} = useBalance({
    address,
  });

  const {data: ensName} = useEnsName({
    address,
  });

  const {data: ensAvatarUrl} = useEnsAvatar({
    name: ensName,
  });

  const balance: bigint | null = wagmiBalance?.value || null;
  const isOnWrongNetwork: boolean =
    isConnected && CHAIN_METADATA[network].id !== chainId;

  const methods = {
    selectWallet: async (cacheProvider?: boolean, networkId?: string) => {
      await new Promise(resolve => {
        clearWagmiCache();
        openWeb3Modal();
        resolve({
          networkId,
          cacheProvider,
        });
      });
    },
    disconnect: async () => {
      await new Promise(resolve => {
        disconnect();
        resolve(true);
      });
    },
  };

  return {
    connectorName: connector?.name || '',
    provider: provider as Web3Provider,
    signer: signer as JsonRpcSigner,
    status: wagmiStatus,
    address: address as string,
    chainId,
    balance: BigNumber.from(balance || 0n),
    ensAvatarUrl: ensAvatarUrl as string,
    ensName: ensName as string,
    isConnected,
    isModalOpen: isOpen,
    isOnWrongNetwork,
    methods,
    network,
  };
};
