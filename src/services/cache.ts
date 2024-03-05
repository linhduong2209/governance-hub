// This file is a placeholder for the eventual emergence
// of a caching service provided by separate server
// For now most of these methods will be passed the reactive
// variables from Apollo-client
import {DaoDetails} from '@aragon/sdk-client';

import {
  NavigationDao,
  PendingDao,
  PendingDaoCreation,
} from 'src/context/apolloClient';

import {
  SupportedChainID,
  SupportedNetworks,
  VERIFIED_CONTRACTS_KEY,
  getSupportedNetworkByChainId,
} from 'src/utils/constants';
import {sleepFor} from 'src/utils/library';
import {SmartContract, VerifiedContracts} from 'src/utils/types';

export const FOLLOWED_DAOS_KEY = 'favoriteDaos';
export const PENDING_DAOS_KEY = 'pendingDaos';

export type FollowedDaosResultWithTotal = {
  data: NavigationDao[];
  total: number;
};

type GetFollowedDaosFromCacheOptions = {
  skip: number;
  limit?: number;
  networks?: SupportedNetworks[];
  pluginNames?: string[];
  includeTotal?: boolean;
};

/**
 * Fetch a list of followed DAOs
 * @param cache followed DAOs cache (to be replaced when migrating to server)
 * @param options query options
 * @returns list of followed DAOs based on given options
 */
// Overload signatures
export function getFollowedDaosFromCache(
  options: GetFollowedDaosFromCacheOptions & {includeTotal: true}
): Promise<FollowedDaosResultWithTotal>;

export function getFollowedDaosFromCache(
  options: GetFollowedDaosFromCacheOptions & {includeTotal?: false}
): Promise<NavigationDao[]>;

export async function getFollowedDaosFromCache(
  options: GetFollowedDaosFromCacheOptions
): Promise<FollowedDaosResultWithTotal | NavigationDao[]> {
  const {skip, limit, includeTotal, pluginNames, networks} = options;

  const favoriteDaos = JSON.parse(
    localStorage.getItem(FOLLOWED_DAOS_KEY) ?? '[]'
  ) as NavigationDao[];

  // sleeping for 600 ms because the immediate apparition of DAOS creates a flickering issue
  await sleepFor(600);
  const filtered = favoriteDaos.filter(dao => {
    const pluginId = dao.plugins[0].id;
    const daoNetwork = getSupportedNetworkByChainId(
      dao.chain
    ) as SupportedNetworks;

    return (
      (!pluginNames?.length || pluginNames?.includes(pluginId)) &&
      (!networks?.length || networks.includes(daoNetwork))
    );
  });

  const sliced = filtered.slice(skip, limit ? skip + limit : undefined);
  return includeTotal ? {data: sliced, total: filtered.length} : sliced;
}

/**
 * Fetch a followed DAO from the cache if available
 * @param daoAddress the address of the followed DAO to fetch
 * @param chain the chain of the followed DAO to fetch
 * @returns a followed DAO with the given address and chain or null
 * if not found
 */
export async function getFollowedDaoFromCache(
  daoAddress: string | undefined,
  chain: SupportedChainID
) {
  if (!daoAddress)
    return Promise.reject(new Error('daoAddressOrEns must be defined'));

  if (!chain) return Promise.reject(new Error('chain must be defined'));

  const daos = await getFollowedDaosFromCache({skip: 0});
  return (
    daos.find(dao => dao.address === daoAddress && dao.chain === chain) ?? null
  );
}

/**
 * Followed a DAO by adding it to the favorite DAOs cache
 * @param dao DAO being followed
 * @returns an error if the dao to favorite is not provided
 */
export async function addFollowedDaoToCache(dao: NavigationDao) {
  if (!dao) return Promise.reject(new Error('daoToFollowed must be defined'));

  const cache = await getFollowedDaosFromCache({skip: 0});
  const newCache = [...cache, dao];

  localStorage.setItem(FOLLOWED_DAOS_KEY, JSON.stringify(newCache));
}

/**
 * Removes a favorite DAO from the cache
 * @param dao DAO to unfavorite
 * @returns an error if no DAO is provided
 */
export async function removeFollowedDaoFromCache(dao: NavigationDao) {
  if (!dao) return Promise.reject(new Error('dao must be defined'));

  const cache = await getFollowedDaosFromCache({skip: 0});
  const newCache = cache.filter(
    fd =>
      fd.address.toLowerCase() !== dao.address.toLowerCase() ||
      fd.chain !== dao.chain
  );

  localStorage.setItem(FOLLOWED_DAOS_KEY, JSON.stringify(newCache));
}

/**
 * Update a DAO in the cache
 * @param dao updated DAO; note dao.address & dao.chain should never be changed
 * @returns an error if no DAO is provided
 */
export async function updateFollowedDaoInCache(dao: NavigationDao) {
  if (!dao) return Promise.reject(new Error('dao must be defined'));

  const cache = await getFollowedDaosFromCache({skip: 0});
  const daoFound = cache.findIndex(
    d => d.address === dao.address && d.chain === dao.chain
  );

  if (daoFound !== -1) {
    const newCache = [...cache];
    newCache[daoFound] = {...dao};

    localStorage.setItem(FOLLOWED_DAOS_KEY, JSON.stringify(newCache));
  }
}

/**
 * Fetch the details of a pending DAO from the cache, if available
 * @param cache cache object that holds the pending DAOs (remove when migrating to server)
 * @param network network in which the DAO is being created.
 * @param daoAddressOrEns the address or ens domain of the DAO
 * @returns
 */
export async function getPendingDaoFromCache(
  network: SupportedNetworks | undefined,
  daoAddressOrEns: string | undefined
): Promise<DaoDetails | null> {
  if (!daoAddressOrEns)
    return Promise.reject(new Error('daoAddressOrEns must be defined'));

  if (!network) return Promise.reject(new Error('network must be defined'));

  const pendingDaos = JSON.parse(
    localStorage.getItem(PENDING_DAOS_KEY) || '{}'
  ) as PendingDaoCreation;

  const foundDao = pendingDaos?.[network]?.[daoAddressOrEns.toLowerCase()];

  if (!foundDao) return null;

  return {
    address: daoAddressOrEns,
    ensDomain: foundDao.ensSubdomain ?? '',
    metadata: foundDao.metadata,
    plugins: [],
    creationDate: foundDao.creationDate,
  };
}

/**
 * Get the cached DAOs
 * @returns Pending Daos cache
 */
async function getPendingDaosFromCache(): Promise<PendingDaoCreation | null> {
  const pendingDaos = localStorage.getItem(PENDING_DAOS_KEY) || '{}';

  return pendingDaos === '{}'
    ? Promise.resolve(null)
    : Promise.resolve(JSON.parse(pendingDaos) as PendingDaoCreation);
}

/**
 * Add a pending DAO to the cache
 * @param daoAddress address of pending DAO
 * @param network network of the pending DAO
 * @param daoDetails details of the pending DAO
 */
export async function addPendingDaoToCache(
  daoAddress: string,
  network: SupportedNetworks,
  daoDetails: PendingDao
) {
  if (!daoAddress)
    return Promise.reject(new Error('daoAddress must be defined'));

  if (!daoDetails)
    return Promise.reject(new Error('daoDetails must be defined'));

  if (!network) return Promise.reject(new Error('network must be defined'));

  const cache = (await getPendingDaosFromCache()) || {};
  const newCache = {
    ...cache,
    [network]: {
      ...cache[network],
      [daoAddress.toLowerCase()]: {...daoDetails},
    },
  };

  localStorage.setItem(PENDING_DAOS_KEY, JSON.stringify(newCache));
}

/**
 * Remove a pending DAO from the cache
 * @param network network of the pending DAO to be removed
 * @param daoAddress address of the pending DAO to be removed
 * @returns an error if no address or network is given
 */
export async function removePendingDaoFromCache(
  network: SupportedNetworks | undefined,
  daoAddress: string | undefined
) {
  if (!daoAddress)
    return Promise.reject(new Error('daoAddress must be defined'));

  if (!network) return Promise.reject(new Error('network must be defined'));

  const cache = await getPendingDaosFromCache();
  const newCache = {...cache};
  delete newCache?.[network]?.[daoAddress.toLowerCase()];

  localStorage.setItem(PENDING_DAOS_KEY, JSON.stringify(newCache));
}

/**
 * Get verified smart contracts from caching service for the specified wallet address and optional chain ID.
 * If the chain ID is not provided, the function returns all smart contracts across all chains.
 *
 * @param walletAddress wallet address for which to fetch the verified smart contracts.
 * @param chainId (Optional) chain ID to filter the verified smart contracts by.
 * @throws Will throw an error if the walletAddress parameter is not defined.
 */
export function getVerifiedSmartContracts(
  walletAddress: string | null,
  chainId?: SupportedChainID
): SmartContract[] {
  // Ensure the daoAddress parameter is defined
  if (!walletAddress) {
    throw new Error('daoAddress must be defined');
  }

  let verifiedContracts = {} as VerifiedContracts;
  try {
    verifiedContracts = JSON.parse(
      localStorage.getItem(VERIFIED_CONTRACTS_KEY) || '{}'
    );
  } catch (error) {
    console.error('Error parsing verified contracts from localStorage:', error);
  }

  // Get the contracts for the given DAO address
  const walletContracts = verifiedContracts[walletAddress] || {};

  // If a chainId is provided, return the contracts for that specific chain
  if (chainId) {
    return walletContracts[chainId] || [];
  }

  // If no chainId is provided, return all contracts across all chains for the specified wallet address
  return Object.values(walletContracts).flatMap(contracts => contracts);
}

export function addVerifiedSmartContract(
  contract: SmartContract,
  walletAddress: string | null,
  chainId: SupportedChainID
): void {
  // Ensure the contract, daoAddress, and chainId parameters are defined
  if (!contract || !walletAddress || !chainId) {
    throw new Error('Contract, daoAddress, and chainId must be defined');
  }

  // get the contracts from local storage
  let verifiedContracts = {} as VerifiedContracts;
  try {
    verifiedContracts = JSON.parse(
      localStorage.getItem(VERIFIED_CONTRACTS_KEY) || '{}'
    );

    // add the newly verified contract into the list
    const updatedContracts = {
      ...verifiedContracts,
      [walletAddress]: {
        ...verifiedContracts[walletAddress],
        [chainId]: [
          ...(verifiedContracts[walletAddress]?.[chainId] || []),
          contract,
        ],
      },
    };

    // add the new contracts into storage
    localStorage.setItem(
      VERIFIED_CONTRACTS_KEY,
      JSON.stringify(updatedContracts)
    );
  } catch (error) {
    console.error('Error parsing verified contracts from localStorage:', error);
  }
}

export function removeVerifiedSmartContract(
  contractAddress: string,
  walletAddress: string | null,
  chainId: SupportedChainID
): void {
  // Ensure the contract, daoAddress, and chainId parameters are defined
  if (!contractAddress || !walletAddress || !chainId) {
    throw new Error('Contract, daoAddress, and chainId must be defined');
  }

  // get the contracts from local storage
  let verifiedContracts = {} as VerifiedContracts;
  try {
    verifiedContracts = JSON.parse(
      localStorage.getItem(VERIFIED_CONTRACTS_KEY) || '{}'
    );

    // remove the contract from the list
    const walletChainContracts = verifiedContracts[walletAddress]?.[chainId];
    if (!walletChainContracts) return;

    const idxContract = walletChainContracts.findIndex(
      c => c.address === contractAddress
    );
    if (idxContract >= 0) walletChainContracts.splice(idxContract, 1);

    // add the new contracts into storage
    localStorage.setItem(
      VERIFIED_CONTRACTS_KEY,
      JSON.stringify(verifiedContracts)
    );
  } catch (error) {
    console.error('Error parsing verified contracts from localStorage:', error);
  }
}
