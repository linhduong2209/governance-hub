import React from "react";
import { ListItemHeader } from "src/@aragon/ods-old";
import { Button, Icon, IconType } from "@aragon/ods";
import { useTranslation } from "react-i18next";
import { generatePath, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { MembersList } from "src/components/MembersList";
import { Loading } from "src/components/Temporary";
import { useNetwork } from "src/context/network";
import { useDaoMembers } from "src/hooks/useDaoMembers";
import { PluginTypes } from "src/hooks/usePluginClient";
import useScreen from "src/hooks/useScreen";
import {
  Community,
  ManageMembersProposal,
  MintTokensProposal,
} from "src/utils/paths";
import { useDaoDetailsQuery } from "src/hooks/useDaoDetails";
import { useExistingToken } from "src/hooks/useExistingToken";
// import { useGovTokensWrapping } from "src/context/govTokensWrapping";

type Props = {
  daoAddressOrEns: string;
  pluginType: PluginTypes;
  pluginAddress: string;
  horizontal?: boolean;
};

export const MembershipSnapshot: React.FC<Props> = ({
  daoAddressOrEns,
  pluginType,
  pluginAddress,
  horizontal,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { network } = useNetwork(); // TODO ensure this is the dao network
  const { isDesktop } = useScreen();

  const members = [
    { address: "0xC97DB9086e854F727dB2b2c1462401EAF1Eb9028" },
    { address: "0xEC8b5DdE1b47a820e3e682a03607c5D81916168c" },
    { address: "0x341582A961C9CEBBc5Bdc97C847Bd1DeC1d25E00" },
  ];
  const totalMemberCount = members.length;

  // const {handleOpenModal} = useGovTokensWrapping();

  // const {
  //   data: { members, daoToken, memberCount: totalMemberCount },
  //   isLoading,
  // } = useDaoMembers(pluginAddress, pluginType, { page: 0 });

  const { data: daoDetails } = useDaoDetailsQuery();

  // const { isDAOTokenWrapped, isTokenMintable } = useExistingToken({
  //   daoToken,
  //   daoDetails,
  // });

  const walletBased = pluginType === "multisig.plugin.dao.eth";

  const headerButtonHandler = () => {
    // walletBased
    //   ? navigate(
    //       generatePath(ManageMembersProposal, {network, dao: daoAddressOrEns})
    //     )
    //   : isDAOTokenWrapped
    //   ? handleOpenModal()
    //   : isTokenMintable
    //   ? navigate(
    //       generatePath(MintTokensProposal, {network, dao: daoAddressOrEns})
    //     )
    //   : navigate(generatePath(Community, {network, dao: daoAddressOrEns}));
  };

  // if (isLoading) return <Loading />;

  if (members.length === 0) return null;

  const displayedMembers = members.slice(0, 3);

  if (horizontal && isDesktop) {
    return (
      <div className="flex space-x-6">
        <div className="w-1/3">
          <ListItemHeader
            icon={<Icon icon={IconType.APP_MEMBERS} />}
            value={`${totalMemberCount} ${t("labels.members")}`}
            label={
              // walletBased
              //   ?
              "Wallet-based"
              // t("explore.explorer.walletBased")
              // : t("explore.explorer.tokenBased")
            }
            buttonText={
              // walletBased
              //   ?
              t("labels.manageMember")
              // : isDAOTokenWrapped
              // ? t("community.ctaMain.wrappedLabel")
              // : isTokenMintable
              // ? t("labels.addMember")
              // : t("labels.seeCommunity")
            }
            orientation="vertical"
            onClick={headerButtonHandler}
          />
        </div>
        <div className="w-2/3 space-y-4">
          <ListItemGrid>
            <MembersList members={displayedMembers} />
          </ListItemGrid>
          <Button
            variant="tertiary"
            size="lg"
            iconRight={IconType.CHEVRON_RIGHT}
            onClick={() =>
              navigate(
                generatePath(Community, { network, dao: daoAddressOrEns })
              )
            }
          >
            {t("labels.seeAll")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <VerticalContainer>
      <ListItemHeader
        icon={<Icon icon={IconType.APP_MEMBERS} />}
        value={`${totalMemberCount} ${t("labels.members")}`}
        label={
          walletBased
            ? t("explore.explorer.walletBased")
            : t("explore.explorer.tokenBased")
        }
        buttonText={
          // walletBased
          //   ?
          t("labels.manageMember")
          // : isDAOTokenWrapped
          // ? t("community.ctaMain.wrappedLabel")
          // : isTokenMintable
          // ? t("labels.addMember")
          // : t("labels.seeCommunity")
        }
        orientation="vertical"
        onClick={headerButtonHandler}
      />
      <MembersList members={displayedMembers} isCompactMode={true} />
      <Button
        variant="tertiary"
        size="lg"
        iconRight={IconType.CHEVRON_RIGHT}
        onClick={() =>
          navigate(generatePath(Community, { network, dao: daoAddressOrEns }))
        }
      >
        {t("labels.seeAll")}
      </Button>
    </VerticalContainer>
  );
};

const VerticalContainer = styled.div.attrs({
  className: "space-y-3 xl:space-y-4",
})``;

const ListItemGrid = styled.div.attrs({
  className: "xl:grid xl:grid-cols-1 xl:grid-flow-row xl:gap-4",
})``;
