import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  HeaderDao,
  IlluObject,
  IllustrationHuman,
  Label,
} from "src/@aragon/ods-old";
import { Button, Icon, IconType } from "@aragon/ods";

import { useTranslation } from "react-i18next";
import { generatePath, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { Loading } from "src/components/Temporary";
import { MembershipSnapshot } from "src/containers/MembershipSnapshot";
import {
  EmptyStateContainer,
  EmptyStateHeading,
} from "src/containers/PageEmptyState";
import ProposalSnapshot from "src/containers/ProposalSnapshot";
import TreasurySnapshot from "src/containers/TreasurySnapshot";
import { useAlertContext } from "src/context/alert";
import { NavigationDao } from "src/context/apolloClient";
import { useGlobalModalContext } from "src/context/globalModals";
import { useNetwork } from "src/context/network";
import { useDaoQuery } from "src/hooks/useDaoDetails";
import { useDaoVault } from "src/hooks/useDaoVault";
import {
  useAddFollowedDaoMutation,
  useFollowedDaosQuery,
  useRemoveFollowedDaoMutation,
} from "src/hooks/useFollowedDaos";
import {
  usePendingDao,
  useRemovePendingDaoMutation,
} from "src/hooks/usePendingDao";
import { PluginTypes } from "src/hooks/usePluginClient";
import useScreen from "src/hooks/useScreen";
import { useProposals } from "src/services/aragon-sdk/queries/use-proposals";
import { CHAIN_METADATA } from "src/utils/constants";
import { formatDate } from "src/utils/date";
import { toDisplayEns } from "src/utils/library";
import { Dashboard as DashboardPath, NotFound } from "src/utils/paths";

enum DaoCreationState {
  ASSEMBLING_DAO,
  DAO_READY,
  OPEN_DAO,
}

export const DAODetail: React.FC = () => {
  const { t } = useTranslation();
  const { alert } = useAlertContext();
  const { isDesktop, isMobile } = useScreen();

  const navigate = useNavigate();
  const { network } = useNetwork();
  const { dao: urlAddressOrEns } = useParams();
  const { open } = useGlobalModalContext();

  const [pollInterval, setPollInterval] = useState(0);
  const [daoCreationState, setDaoCreationState] = useState<DaoCreationState>(
    DaoCreationState.ASSEMBLING_DAO
  );

  // following DAOS
  const addFollowedDaoMutation = useAddFollowedDaoMutation({
    onMutate: () => {
      alert(t("alert.chip.favorited"));
    },
  });

  const removeFollowedDaoMutation = useRemoveFollowedDaoMutation({
    onMutate: () => {
      alert(t("alert.chip.unfavorite"), <Icon icon={IconType.CLOSE} />);
    },
  });

  const {
    data: fallowedDaos,
    isLoading: followedDaosLoading,
    isFetching: followedDaosFetching,
  } = useFollowedDaosQuery();

  const enableFollowing =
    !followedDaosFetching &&
    !addFollowedDaoMutation.isLoading &&
    !removeFollowedDaoMutation.isLoading;

  // live DAO
  const {
    data: liveDao,
    isLoading: liveDaoLoading,
    isSuccess,
  } = useDaoQuery(urlAddressOrEns, pollInterval);
  // const liveAddressOrEns = toDisplayEns(liveDao?.ensDomain) || liveDao?.address;
  const liveAddressOrEns =
    toDisplayEns("https://devolvedai.com/") || liveDao?.address;

  // pending DAO
  const { data: pendingDao, isLoading: pendingDaoLoading } =
    usePendingDao(urlAddressOrEns);

  const removePendingDaoMutation = useRemovePendingDaoMutation(() => {
    navigate(
      generatePath(DashboardPath, {
        network,
        dao: liveAddressOrEns,
      })
    );
    // Temporary restriction to Eth mainnet only as spamming was happening on Polygon
    //const networkInfo = CHAIN_METADATA[network];
    if (network === "ethereum") {
      // (!networkInfo.isTestnet) {
      open("poapClaim");
    }
  });

  const followedDaoMatchPredicate = useCallback(
    (followedDao: NavigationDao) => {
      return (
        followedDao.address.toLowerCase() === liveDao?.address.toLowerCase() &&
        followedDao.chain === CHAIN_METADATA[network].id
      );
    },
    [liveDao?.address, network]
  );

  const isFollowedDao = useMemo(() => {
    if (liveDao?.address && fallowedDaos)
      return Boolean(fallowedDaos.some(followedDaoMatchPredicate));
    else return false;
  }, [followedDaoMatchPredicate, fallowedDaos, liveDao?.address]);

  /*************************************************
   *                    Hooks                      *
   *************************************************/
  useEffect(() => {
    // poll for the newly created DAO while waiting to be indexed
    if (pendingDao && isSuccess && !liveDao) {
      setPollInterval(1000);
    }
  }, [isSuccess, liveDao, pendingDao]);

  useEffect(() => {
    if (
      pendingDao &&
      liveDao &&
      daoCreationState === DaoCreationState.ASSEMBLING_DAO
    ) {
      setPollInterval(0);
      setDaoCreationState(DaoCreationState.DAO_READY);
      setTimeout(() => setDaoCreationState(DaoCreationState.OPEN_DAO), 2000);
    }
  }, [liveDao, daoCreationState, pendingDao]);

  /*************************************************
   *                    Handlers                   *
   *************************************************/
  const handleOpenYourDaoClick = useCallback(async () => {
    if (daoCreationState === DaoCreationState.OPEN_DAO) {
      try {
        await removePendingDaoMutation.mutateAsync({
          network,
          daoAddress: pendingDao?.address,
        });
      } catch (error) {
        console.error(
          `Error removing pending dao:${pendingDao?.address}`,
          error
        );
      }
    }
  }, [
    daoCreationState,
    network,
    pendingDao?.address,
    removePendingDaoMutation,
  ]);

  const onCopy = useCallback(
    async (copyContent: string) => {
      await navigator.clipboard.writeText(copyContent);
      alert(t("alert.chip.inputCopied"));
    },
    [alert, t]
  );

  const handleFollowedClick = useCallback(
    async (dao: NavigationDao) => {
      if (enableFollowing) {
        try {
          if (isFollowedDao) {
            await removeFollowedDaoMutation.mutateAsync({ dao });
          } else {
            await addFollowedDaoMutation.mutateAsync({ dao });
          }
        } catch (error) {
          const action = isFollowedDao
            ? "removing DAO from list of followed DAOs"
            : "adding DAO to list of followed DAOs";

          console.error(`Error ${action}`, error);
        }
      }
    },
    [
      enableFollowing,
      isFollowedDao,
      removeFollowedDaoMutation,
      addFollowedDaoMutation,
    ]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  //   if (pendingDaoLoading || liveDaoLoading || followedDaosLoading) {
  //     return <Loading />;
  //   }

  if (pendingDao) {
    const buttonLabel = {
      [DaoCreationState.ASSEMBLING_DAO]: t("dashboard.emptyState.buildingDAO"),
      [DaoCreationState.DAO_READY]: t("dashboard.emptyState.daoReady"),
      [DaoCreationState.OPEN_DAO]: t("dashboard.emptyState.openDao"),
    };

    const buttonIcon = {
      [DaoCreationState.ASSEMBLING_DAO]: undefined,
      [DaoCreationState.DAO_READY]: IconType.CHECKMARK,
      [DaoCreationState.OPEN_DAO]: undefined,
    };

    return (
      <Container>
        <EmptyStateContainer>
          <IllustrationHuman
            body="blocks"
            expression="casual"
            sunglass="big_rounded"
            hair="short"
            {...(isMobile
              ? { height: 165, width: 295 }
              : { height: 225, width: 400 })}
          />
          <div className="absolute -translate-x-2/3">
            <IlluObject
              object="build"
              {...(isMobile
                ? { height: 120, width: 120 }
                : { height: 160, width: 160 })}
            />
          </div>

          <EmptyStateHeading>
            {t("dashboard.emptyState.title")}
          </EmptyStateHeading>
          <p className="mt-3 text-center text-base leading-normal">
            {t("dashboard.emptyState.subtitle")}
          </p>
          <Button
            size="lg"
            variant="primary"
            // state={
            //   daoCreationState === DaoCreationState.ASSEMBLING_DAO
            //     ? "loading"
            //     : undefined
            // }
            iconLeft={buttonIcon[daoCreationState]}
            className={`mt-8 ${daoCreationState === 0 && "bg-primary-800"}`}
            onClick={handleOpenYourDaoClick}
          >
            {buttonLabel[daoCreationState]}
          </Button>
        </EmptyStateContainer>
      </Container>
    );
  }

  //   if (liveDao && liveAddressOrEns) {
  //     const daoType =
  //       (liveDao?.plugins[0]?.id as PluginTypes) === "multisig.plugin.dao.eth"
  //         ? t("explore.explorer.walletBased")
  //         : t("explore.explorer.tokenBased");

  //     const links =
  //       liveDao.metadata?.links
  //         ?.filter((link) => link.name !== "" && link.url !== "")
  //         .map((link) => ({
  //           label: link.name,
  //           href: link.url,
  //         })) ?? [];

  return (
    <>
      <HeaderWrapper>
        <HeaderDao
          // daoName={liveDao.metadata.name}
          // daoEnsName={toDisplayEns(liveDao.ensDomain)}
          // daoAddress={liveDao.address}
          // daoAvatar={liveDao?.metadata?.avatar}
          // daoUrl={`app.aragon.org/#/daos/${network}/${liveAddressOrEns}`}
          // description={liveDao.metadata.description}
          // created_at={formatDate(
          //   liveDao.creationDate.getTime() / 1000,
          //   "MMMM yyyy"
          // ).toString()}
          // daoChain={CHAIN_METADATA[network].name}
          // daoType={daoType}
          // following={isFollowedDao}
          daoName={"Devolved AI Treasury DAO"}
          daoEnsName={toDisplayEns("https://devolvedai.com/")}
          daoAddress={"0x68fa609716a1901b51e22c88baf660ca1d8dec0b"}
          daoAvatar={
            "blob:https://app.aragon.org/604a2bff-4af4-4440-969e-de808b00f420"
          }
          daoUrl={`app.aragon.org/#/daos/${network}/${liveAddressOrEns}`}
          description={
            "This is the Devolved AI DAO that holds DAO treasury funds."
          }
          created_at={formatDate(
            new Date().getTime() / 1000,
            "MMMM yyyy"
          ).toString()}
          daoChain={"Fuji"}
          daoType={"Wallet-based"}
          following={isFollowedDao}
          onCopy={onCopy}
          onFollowClick={
            () => {}
            //     handleFollowedClick({
            //       address: liveDao.address.toLowerCase(),
            //       chain: CHAIN_METADATA[network].id,
            //       ensDomain: liveDao.ensDomain,
            //       plugins: liveDao.plugins,
            //       metadata: {
            //         name: liveDao.metadata.name,
            //         avatar: liveDao?.metadata?.avatar,
            //         description: liveDao.metadata.description,
            //       },
            //     });
            //   }
          }
          links={undefined}
          translation={{
            follow: t("dao.follow.false"),
            following: t("dao.follow.true"),
          }}
        />
      </HeaderWrapper>

      {isDesktop ? (
        <DashboardContent
          // daoAddressOrEns={liveAddressOrEns}
          // pluginType={liveDao.plugins[0].id as PluginTypes}
          // pluginAddress={liveDao.plugins[0].instanceAddress ?? ""}
          daoAddressOrEns={"0x68fa609716a1901b51e22c88baf660ca1d8dec0b"}
          pluginType={"token-voting.plugin.dao.eth"}
          pluginAddress={"0x68fa609716a1901b51e22c88baf660ca1d8dec0b"}
        />
      ) : (
        <MobileDashboardContent
          // daoAddressOrEns={liveAddressOrEns}
          // pluginType={liveDao.plugins[0].id as PluginTypes}
          // pluginAddress={liveDao.plugins[0].instanceAddress ?? ""}
          daoAddressOrEns={"0x68fa609716a1901b51e22c88baf660ca1d8dec0b"}
          pluginType={"token-voting.plugin.dao.eth"}
          pluginAddress={"0x68fa609716a1901b51e22c88baf660ca1d8dec0b"}
        />
      )}
    </>
  );
  //   } else if (!pendingDao && !liveDao) {
  //     // if DAO isn't loading and there is no pending or live DAO, then
  //     // navigate to notFound
  //     navigate(NotFound, {
  //       replace: true,
  //       state: { incorrectDao: urlAddressOrEns },
  //     });
  //   }

  // return null;
};

const HeaderWrapper = styled.div.attrs({
  className:
    "w-screen -mx-4 md:col-span-full md:w-full md:mx-0 xl:col-start-2 xl:col-span-10 md:mt-6",
})``;

/* DESKTOP DASHBOARD ======================================================== */

type DashboardContentProps = {
  daoAddressOrEns: string;
  pluginType: PluginTypes;
  pluginAddress: string;
};

const DashboardContent: React.FC<DashboardContentProps> = ({
  daoAddressOrEns,
  pluginType,
  pluginAddress,
}) => {
  const { transfers, totalAssetValue, isTokensLoading } = useDaoVault();

  const { data, isLoading } = useProposals({
    daoAddressOrEns,
    pluginType,
    pluginAddress,
  });
  const proposals = data?.pages.flat() ?? [];

  // const proposalCount = proposals.length;
  // const transactionCount = transfers.length;

  const proposalCount = 10;
  const transactionCount = 10;

  // if (isTokensLoading || isLoading) {
  //   return <Loading />;
  // }

  if (!proposalCount) {
    return (
      <>
        {!transactionCount ? (
          <EqualDivide>
            <ProposalSnapshot
              daoAddressOrEns={daoAddressOrEns}
              pluginAddress={pluginAddress}
              pluginType={pluginType}
            />
            <TreasurySnapshot
              daoAddressOrEns={daoAddressOrEns}
              transfers={transfers}
              totalAssetValue={totalAssetValue}
            />
          </EqualDivide>
        ) : (
          <>
            <LeftWideContent>
              <ProposalSnapshot
                daoAddressOrEns={daoAddressOrEns}
                pluginAddress={pluginAddress}
                pluginType={pluginType}
              />
            </LeftWideContent>
            <RightNarrowContent>
              <TreasurySnapshot
                daoAddressOrEns={daoAddressOrEns}
                transfers={transfers}
                totalAssetValue={totalAssetValue}
              />
            </RightNarrowContent>
          </>
        )}
        <MembersWrapper>
          <MembershipSnapshot
            daoAddressOrEns={daoAddressOrEns}
            pluginType={pluginType}
            pluginAddress={pluginAddress}
            horizontal
          />
        </MembersWrapper>
      </>
    );
  }

  return (
    <>
      <LeftWideContent>
        <ProposalSnapshot
          daoAddressOrEns={daoAddressOrEns}
          pluginAddress={pluginAddress}
          pluginType={pluginType}
        />
      </LeftWideContent>
      <RightNarrowContent>
        <TreasurySnapshot
          daoAddressOrEns={daoAddressOrEns}
          transfers={transfers}
          totalAssetValue={totalAssetValue}
        />
        <MembershipSnapshot
          daoAddressOrEns={daoAddressOrEns}
          pluginType={pluginType}
          pluginAddress={pluginAddress}
        />
      </RightNarrowContent>
    </>
  );
};

// NOTE: These Containers are built SPECIFICALLY FOR >= DESKTOP SCREENS. Since
// the mobile layout is much simpler, it has it's own component.

const LeftWideContent = styled.div.attrs({
  className: "xl:space-y-10 xl:col-start-2 xl:col-span-6",
})``;

const RightNarrowContent = styled.div.attrs({
  className: "xl:col-start-8 xl:col-span-4 xl:space-y-6",
})``;

const EqualDivide = styled.div.attrs({
  className: "xl:col-start-2 xl:col-span-10 xl:flex xl:space-x-6",
})``;

const MembersWrapper = styled.div.attrs({
  className: "xl:col-start-2 xl:col-span-10",
})``;

/* MOBILE DASHBOARD CONTENT ================================================= */

const MobileDashboardContent: React.FC<DashboardContentProps> = ({
  daoAddressOrEns,
  pluginType,
  pluginAddress,
}) => {
  const { transfers, totalAssetValue, isTokensLoading } = useDaoVault();

  // if (isTokensLoading) {
  //   return <Loading />;
  // }

  return (
    <MobileLayout>
      <ProposalSnapshot
        daoAddressOrEns={daoAddressOrEns}
        pluginAddress={pluginAddress}
        pluginType={pluginType}
      />
      <TreasurySnapshot
        daoAddressOrEns={daoAddressOrEns}
        transfers={transfers}
        totalAssetValue={totalAssetValue}
      />
      <MembershipSnapshot
        daoAddressOrEns={daoAddressOrEns}
        pluginType={pluginType}
        pluginAddress={pluginAddress}
      />
    </MobileLayout>
  );
};

const Container = styled.div.attrs({
  className: "col-span-full xl:col-start-3 xl:col-end-11",
})``;

const MobileLayout = styled.div.attrs({
  className: "col-span-full space-y-10",
})``;
