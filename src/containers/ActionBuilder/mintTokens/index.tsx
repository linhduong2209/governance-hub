import {ListItemAction, Label as FormLabel} from 'src/@aragon/ods-old';
import Big from 'big.js';
import {BigNumber} from '@ethersproject/bignumber';
import {isAddress} from 'ethers/lib/utils';
import React, {useCallback, useEffect, useState} from 'react';
import {
  FieldError,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod} from 'src/components/AccordionMethod';
import {useActionsContext} from 'src/context/actions';
import {useAlertContext} from 'src/context/alert';
import {useNetwork} from 'src/context/network';
import {useProviders} from 'src/context/providers';
import {useDaoDetailsQuery} from 'src/hooks/useDaoDetails';
import {useDaoMembers} from 'src/hooks/useDaoMembers';
import {useDaoToken} from 'src/hooks/useDaoToken';
import {PluginTypes} from 'src/hooks/usePluginClient';
import useScreen from 'src/hooks/useScreen';
import {CHAIN_METADATA} from 'src/utils/constants';
import {formatUnits, toDisplayEns} from 'src/utils/library';
import {fetchBalance, getTokenInfo} from 'src/utils/tokens';
import {ActionIndex} from 'src/utils/types';
import {AddressAndTokenRow} from './addressTokenRow';
import MintTokensToTreasuryMenu from 'src/containers/MintTokensToTreasuryMenu';
import {Button} from '@aragon/ods';

type MintTokensProps = ActionIndex & {allowRemove?: boolean};

type MintInfo = {
  address: string;
  amount: string;
};

type AddressBalance = {
  address: string;
  balance: BigNumber;
};

const MintTokens: React.FC<MintTokensProps> = ({
  actionIndex,
  allowRemove = true,
}) => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {network} = useNetwork();
  const {data: daoDetails} = useDaoDetailsQuery();
  const {data: daoToken} = useDaoToken(
    daoDetails?.plugins[0].instanceAddress as string
  );

  const {removeAction} = useActionsContext();
  const {setValue, clearErrors, resetField} = useFormContext();

  const handleReset = () => {
    clearErrors(`actions.${actionIndex}`);
    resetField(`actions.${actionIndex}`);
    setValue(`actions.${actionIndex}.inputs.mintTokensToWallets`, []);
    alert(t('alert.chip.resetAction'));
  };

  const methodActions = (() => {
    const result = [
      {
        component: <ListItemAction title={t('labels.resetAction')} bgWhite />,
        callback: handleReset,
      },
    ];

    if (allowRemove) {
      result.push({
        component: (
          <ListItemAction title={t('labels.removeEntireAction')} bgWhite />
        ),
        callback: () => {
          removeAction(actionIndex);
          alert(t('alert.chip.removedAction'));
        },
      });
    }

    return result;
  })();

  return (
    <AccordionMethod
      type="action-builder"
      methodName={t('labels.mintTokens')}
      smartContractName="GovernanceERC20"
      smartContractAddress={daoToken?.address}
      blockExplorerLink={
        daoToken?.address
          ? `${CHAIN_METADATA[network].explorer}token/${daoToken?.address}`
          : undefined
      }
      verified
      methodDescription={t('newProposal.mintTokens.methodDescription')}
      additionalInfo={t('newProposal.mintTokens.additionalInfo')}
      dropdownItems={methodActions}
    >
      <MintTokenForm actionIndex={actionIndex} />
    </AccordionMethod>
  );
};

export default MintTokens;

type MintTokenFormProps = {
  standAlone?: boolean;
} & ActionIndex;

type MappedError = {
  address?: FieldError;
};

export const MintTokenForm: React.FC<MintTokenFormProps> = ({
  actionIndex,
  standAlone = false,
}) => {
  const {t} = useTranslation();
  const {isDesktop} = useScreen();
  const {network} = useNetwork();
  const {api: infura} = useProviders();
  const {alert} = useAlertContext();
  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  const {data: daoDetails} = useDaoDetailsQuery();
  const {data: daoToken, isLoading: daoTokenLoading} = useDaoToken(
    daoDetails?.plugins[0].instanceAddress || ''
  );

  const {
    data: {memberCount},
    isLoading: isMembersLoading,
  } = useDaoMembers(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes,
    {countOnly: true}
  );

  const {setValue, trigger, formState, control, resetField} = useFormContext();
  const {fields, append, replace, remove, update} = useFieldArray({
    name: `actions.${actionIndex}.inputs.mintTokensToWallets`,
  });

  // NOTE: DO NOT MERGE THESE. Apparently, when returned as a tuple, the
  // useEffects that depend on `mints` do not recognize changes to the `mints`
  // array...
  const mints: MintInfo[] = useWatch({
    name: `actions.${actionIndex}.inputs.mintTokensToWallets`,
  });
  const actionName = useWatch({
    name: `actions.${actionIndex}.name`,
    control,
  });

  const [newTokens, setNewTokens] = useState<Big>(Big(0));
  const [tokenSupply, setTokenSupply] = useState(0);
  const [checkedAddresses, setCheckedAddresses] = useState(
    () => new Set<string>()
  );
  const [newTokenHolders, setNewTokenHolders] = useState(
    () => new Set<string>()
  );
  const [newHoldersCount, setNewHoldersCount] = useState(0);
  const [mintTokensToTreasuryModal, setMintTokensToTreasuryModal] = useState<{
    status: boolean;
    index?: number;
  }>({
    status: false,
  });

  const isModalOpened = mintTokensToTreasuryModal.index !== undefined;
  const treasuryKey = `actions.${actionIndex}.inputs.mintTokensToWallets.${mintTokensToTreasuryModal.index}.web3Address`;

  /*************************************************
   *                    Effects                    *
   *************************************************/

  useEffect(() => {
    // Setup form on first load/reset using replace to avoid calling append multiple times
    if (fields.length === 0) {
      replace({web3Address: {address: '', ensName: ''}, amount: '0'});
    }

    if (!actionName) {
      setValue(`actions.${actionIndex}.name`, 'mint_tokens');
    }
  }, [actionIndex, actionName, replace, fields.length, setValue]);

  useEffect(() => {
    // check for empty address fields on blur.
    if (!mints) return;

    const actionErrors =
      formState.errors?.actions?.[`${actionIndex}`]?.inputs
        ?.mintTokensToWallets;

    actionErrors?.forEach((error: MappedError) => {
      if (error?.address) trigger(error.address.ref?.name);
    });
  }, [actionIndex, formState.errors?.actions, trigger, mints]);

  useEffect(() => {
    // Fetching necessary info about the token.
    if (daoToken?.address && !isMembersLoading) {
      getTokenInfo(daoToken.address, infura, nativeCurrency)
        .then((r: Awaited<ReturnType<typeof getTokenInfo>>) => {
          const formattedNumber = parseFloat(
            formatUnits(r.totalSupply, r.decimals)
          );
          setTokenSupply(formattedNumber);
          setValue(
            `actions.${actionIndex}.summary.tokenSupply`,
            formattedNumber
          );
          setValue(
            `actions.${actionIndex}.summary.daoTokenSymbol`,
            daoToken.symbol
          );
          setValue(
            `actions.${actionIndex}.summary.daoTokenAddress`,
            daoToken.address
          );

          setValue(`actions.${actionIndex}.summary.totalMembers`, memberCount);
        })
        .catch(e =>
          console.error('Error happened when fetching token infos: ', e)
        );
    }
  }, [
    daoToken?.address,
    nativeCurrency,
    infura,
    setValue,
    actionIndex,
    daoToken?.symbol,
    memberCount,
    isMembersLoading,
  ]);

  // Count number of addresses that don't yet own token
  useEffect(() => {
    if (mints && daoToken?.address) {
      // only check rows where form input holds address
      const validInputs = mints.filter(
        m => m.address !== '' && isAddress(m.address)
      );

      // only check addresses that have not previously been checked
      const uncheckedAddresses = validInputs.filter(
        m => !checkedAddresses.has(m.address)
      );

      if (validInputs.length === 0) {
        // user did not input any valid addresses
        setNewHoldersCount(0);
        setValue(`actions.${actionIndex}.summary.newHoldersCount`, 0);
      } else if (uncheckedAddresses.length === 0) {
        // No unchecked address. Simply compare inputs with cached addresses
        const count = validInputs.filter(m =>
          newTokenHolders.has(m.address)
        ).length;
        setNewHoldersCount(count);
        setValue(`actions.${actionIndex}.summary.newHoldersCount`, count);
      } else {
        // Unchecked address. Fetch balance info for those. Update caches and
        // set number of new holder
        const promises: Promise<AddressBalance>[] = uncheckedAddresses.map(
          (m: MintInfo) =>
            fetchBalance(
              daoToken.address,
              m.address,
              infura,
              nativeCurrency,
              false
            ).then(b => {
              //add address to promise to keep track later
              return {address: m.address, balance: b};
            })
        );
        Promise.all(promises)
          .then((abs: AddressBalance[]) => {
            // new holders are addresses that have 0 balance for token
            const holderAddresses = abs.filter((ab: AddressBalance) =>
              ab.balance.isZero()
            );
            setNewTokenHolders(prev => {
              const temp = new Set(prev);
              holderAddresses.forEach(ha => temp.add(ha.address));
              return temp;
            });
            setCheckedAddresses(prev => {
              const temp = new Set(prev);
              uncheckedAddresses.forEach(ua => temp.add(ua.address));
              return temp;
            });
            // Do not compare addresses with newTokenHolders. Since effects
            // batch state updates, this might not yet reflect the updates done
            // a couple of lines ago.
            const count = mints.filter(m =>
              holderAddresses.some(ab => ab.address === m.address)
            ).length;
            setNewHoldersCount(count);
            setValue(`actions.${actionIndex}.summary.newHoldersCount`, count);
          })
          .catch(e =>
            console.error('Error happened when fetching balances: ', e)
          );
      }
    }
  }, [
    mints,
    daoToken?.address,
    actionIndex,
    checkedAddresses,
    infura,
    nativeCurrency,
    newTokenHolders,
    setValue,
  ]);

  useEffect(() => {
    // Collecting token amounts that are to be minted
    if (mints) {
      let newTokensCount: Big = Big(0);
      mints.forEach(m => {
        // NOTE: If `m.amount` is not a valid input for `Big` to parse, an error
        // will be thrown. Since Big.js doesn't provide the means to check this
        // beforehand, the try/catch block is necessary.
        try {
          newTokensCount = newTokensCount.plus(Big(m.amount));
        } catch {
          // NOTE: If an input contains an invalid amount, it is simply ignored.
          console.warn(
            'An input contains an invalid amount of tokens to be minted.'
          );
        }
      });

      if (!newTokensCount.eq(newTokens)) {
        setNewTokens(newTokensCount);
        setValue(
          `actions.${actionIndex}.summary.newTokens`,
          newTokensCount.toNumber()
        );
      }
    }
  }, [actionIndex, mints, newTokens, setValue]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleAddWallet = () => {
    append({web3Address: {address: '', ensName: ''}, amount: '0'});
  };

  const handleClearWallet = (index: number) => {
    update(index, {
      web3Address: {address: '', ensName: ''},
      amount: mints[index].amount,
    });
  };

  const handleDeleteWallet = (index: number) => {
    remove(index);
    setTimeout(() => {
      trigger(`actions.${actionIndex}.inputs.mintTokensToWallets`);
    }, 450);
  };

  const openMintTreasuryModal = (index: number) => {
    setMintTokensToTreasuryModal({
      status: true,
      index,
    });
  };

  const handleCancelTreasuryMinting = useCallback(() => {
    // undefined index means that the modal was closed without confirming the contract address
    setMintTokensToTreasuryModal({status: false});

    resetField(treasuryKey, {defaultValue: {address: '', ensName: ''}});

    alert(t('modal.mintTokensToTreasury.alertChipSuccess'));
  }, [alert, resetField, t, treasuryKey]);

  const handleMintToTreasury = useCallback(() => {
    setMintTokensToTreasuryModal({
      ...mintTokensToTreasuryModal,
      status: false,
    });

    setValue(treasuryKey, {
      address: daoDetails?.address,
      ensName: toDisplayEns(daoDetails?.ensDomain),
    });

    setTimeout(() => trigger(treasuryKey), 50);
    alert(t('modal.mintTokensToTreasury.alertChipCritical'));
  }, [
    alert,
    daoDetails?.address,
    daoDetails?.ensDomain,
    mintTokensToTreasuryModal,
    setValue,
    t,
    treasuryKey,
    trigger,
  ]);

  /*************************************************
   *                    Render                    *
   *************************************************/
  return (
    <>
      <Container standAlone={standAlone}>
        {isDesktop && (
          <div className="flex items-center space-x-4 p-4 md:p-6 ">
            <div className="flex-1">
              <FormLabel label={t('labels.whitelistWallets.address')} />
            </div>
            <div className="w-[184px]">
              <FormLabel label={t('finance.tokens')} />
            </div>
            <div className="w-24">
              <FormLabel label={t('finance.allocation')} />
            </div>
            <div className="w-12" />
          </div>
        )}

        {fields.map((field, index) => {
          return (
            <AddressAndTokenRow
              key={field.id}
              actionIndex={actionIndex}
              fieldIndex={index}
              onClear={handleClearWallet}
              onDelete={handleDeleteWallet}
              newTokenSupply={newTokens.plus(Big(tokenSupply))}
              onEnterDaoAddress={openMintTreasuryModal}
              //isModalOpened indicated whether the modal is opened or not
              isModalOpened={isModalOpened}
              daoAddress={daoDetails?.address}
              ensName={toDisplayEns(daoDetails?.ensDomain)}
            />
          );
        })}

        <ButtonContainer>
          <Button
            variant="tertiary"
            size="lg"
            className="flex-1 md:flex-initial"
            onClick={handleAddWallet}
          >
            {t('labels.addWallet')}
          </Button>

          {/* eslint-disable-next-line tailwindcss/classnames-order */}
          {/* <label className="flex-1 md:flex-initial py-3 px-4 space-x-3 h-12 font-semibold rounded-xl cursor-pointer hover:text-primary-500 bg-neutral-0 ft-text-base">
          {t('labels.whitelistWallets.uploadCSV')}
          <input
            type="file"
            name="uploadCSV"
            accept=".csv, .txt"
            onChange={handleCSVUpload}
            hidden
          />
        </label> */}
        </ButtonContainer>
        {!daoTokenLoading && (
          <SummaryContainer>
            <p className="font-semibold text-neutral-800">
              {t('labels.summary')}
            </p>
            <HStack>
              <Label>{t('labels.newTokens')}</Label>
              <p>
                +{'' + newTokens} {daoToken?.symbol}
              </p>
            </HStack>
            <HStack>
              <Label>{t('labels.newHolders')}</Label>
              <p>+{newHoldersCount}</p>
            </HStack>
            <HStack>
              <Label>{t('labels.totalTokens')}</Label>
              {tokenSupply ? (
                <p>
                  {'' + newTokens.plus(Big(tokenSupply))} {daoToken?.symbol}
                </p>
              ) : (
                <p>...</p>
              )}
            </HStack>
            <HStack>
              <Label>{t('labels.totalHolders')}</Label>
              <p>{newHoldersCount + memberCount}</p>
            </HStack>
            {/* TODO add total amount of token holders here. */}
          </SummaryContainer>
        )}
      </Container>
      <MintTokensToTreasuryMenu
        isOpen={mintTokensToTreasuryModal.status}
        onClose={handleMintToTreasury}
        onCloseReset={handleCancelTreasuryMinting}
        daoAddress={{
          address: daoDetails?.address,
          ensName: toDisplayEns(daoDetails?.ensDomain),
        }}
      />
    </>
  );
};

const Container = styled.div.attrs<{standAlone: boolean}>(({standAlone}) => ({
  className: `bg-neutral-0 border divide-y border-neutral-100 divide-neutral-100 ${
    standAlone ? 'rounded-xl' : 'rounded-b-xl border-t-0'
  }`,
}))<{standAlone: boolean}>``;

const ButtonContainer = styled.div.attrs({
  className: 'flex justify-between md:justify-start p-4 md:p-6 space-x-4',
})``;

const SummaryContainer = styled.div.attrs({
  className: 'p-4 md:p-6 space-y-3 font-semibold text-neutral-800',
})``;

const HStack = styled.div.attrs({
  className: 'flex justify-between',
})``;

const Label = styled.p.attrs({
  className: 'font-normal text-neutral-500',
})``;
