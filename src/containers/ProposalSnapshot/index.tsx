import React from "react";
import {
  CardProposal,
  CardProposalProps,
  ListItemHeader,
} from "src/@aragon/ods-old";
import { Button, Icon, IconType } from "@aragon/ods";
import { useTranslation } from "react-i18next";
import { generatePath, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { proposal2CardProps } from "src/components/ProposalList";
import { StateEmpty } from "src/components/StateEmpty";
import { Loading } from "src/components/Temporary";
import { useNetwork } from "src/context/network";
import { useDaoMembers } from "src/hooks/useDaoMembers";
import { PluginTypes } from "src/hooks/usePluginClient";
// import { useWallet } from "src/hooks/useWallet";
import {
  PROPOSALS_PER_PAGE,
  useProposals,
} from "src/services/aragon-sdk/queries/use-proposals";
import { featureFlags } from "src/utils/featureFlags";
import { htmlIn } from "src/utils/htmlIn";
import { Governance, NewProposal } from "src/utils/paths";
import { ProposalTypes } from "src/utils/types";
import { useIsUpdateProposal } from "src/hooks/useIsUpdateProposal";
import { useTotalProposalCount } from "src/services/aragon-subgraph/queries/use-total-proposal-count";

type Props = {
  daoAddressOrEns: string;
  pluginAddress: string;
  pluginType: PluginTypes;
};

type ProposalItemProps =
  // CardProposalProps &
  {
    proposalId: string;
  };

const Item = {
  title: "string",
  description: "string",
  onClick: () => {},
  process: "executed" as CardProposalProps["process"],
  voteTitle: "string",
  publishLabel: "string",
  publisherDisplayName: "string",
  stateLabel: ["string"],
};

const ProposalItem: React.FC<ProposalItemProps> = ({
  proposalId,
  // ...props
}) => {
  const { t } = useTranslation();
  // const [{ data: isPluginUpdate }, { data: isOSUpdate }] =
  //   useIsUpdateProposal(proposalId);

  return (
    <CardProposal
      {...Item}
      title="Add Member"
      description="Add New Signatory Members"
      onClick={() => {}}
      process={"executed"}
      voteTitle="Add wallet"
      publishLabel="Published by"
      publisherDisplayName={"0xC97DB9086e854F727dB2b2c1462401EAF1Eb9028"}
      stateLabel={["0x7ad…6f56", "0x7ad…6f56", "0x7ad…6f56", "Executed"]}
      bannerContent={
        // (isPluginUpdate || isOSUpdate) &&
        // featureFlags.getValue("VITE_FEATURE_FLAG_OSX_UPDATES") === "true"
        //   ?
        //  t("update.proposal.bannerTitle")
        // :
        ""
      }
    />
  );
};

const ProposalSnapshot: React.FC<Props> = ({
  daoAddressOrEns,
  pluginAddress,
  pluginType,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // const { address } = useWallet();
  const { network } = useNetwork();
  const address = "0xC97DB9086e854F727dB2b2c1462401EAF1Eb9028";

  const { data, isLoading: proposalsAreLoading } = useProposals({
    daoAddressOrEns,
    pluginType,
    pluginAddress,
  });

  // const {
  //   data: proposalCount,
  //   error: proposalCountError,
  //   isLoading: proposalCountIsLoading,
  //   isFetched: proposalCountIsFetched,
  // } = useTotalProposalCount({
  //   pluginAddress,
  //   pluginType,
  // });

  let proposalCount = 1;

  // const { data: members } = useDaoMembers(pluginAddress, pluginType, {
  //   countOnly: true,
  // });

  const mappedProposals = [];
  // data?.pages
  //   .flat()
  //   .slice(0, PROPOSALS_PER_PAGE)
  //   .map((p) => {
  //     return proposal2CardProps(
  //       p,
  //       members.memberCount,
  //       network,
  //       navigate,
  //       t,
  //       daoAddressOrEns,
  //       address
  //     );
  //   });

  // if (proposalsAreLoading || proposalCountIsLoading) {
  //   return <Loading />;
  // }

  if (
    //  proposalCountIsFetched && (
    proposalCount === 0
    //   || proposalCountError)
  ) {
    return (
      <StateEmpty
        type="Human"
        mode="card"
        body={"voting"}
        expression={"smile"}
        hair={"middle"}
        accessory={"earrings_rhombus"}
        sunglass={"big_rounded"}
        title={t("governance.emptyState.title")}
        description={htmlIn(t)("governance.emptyState.description")}
        primaryButton={{
          label: t("TransactionModal.createProposal"),
          onClick: () =>
            navigate(
              generatePath(NewProposal, {
                type: ProposalTypes.Default,
                network,
                dao: daoAddressOrEns,
              })
            ),
        }}
        renderHtml
      />
    );
  }

  // gasless plugin does not have a proposal count yet; use the length
  // of the page
  const displayedCount = proposalCount ?? data?.pages.flat().length;

  return (
    <Container>
      <ListItemHeader
        icon={<Icon icon={IconType.APP_PROPOSALS} />}
        value={displayedCount?.toString() ?? "0"}
        label={t("dashboard.proposalsTitle")}
        buttonText={t("newProposal.title")}
        orientation="horizontal"
        onClick={() =>
          navigate(
            generatePath(NewProposal, {
              type: ProposalTypes.Default,
              network,
              dao: daoAddressOrEns,
            })
          )
        }
      />

      {/* {mappedProposals?.map(({ id, ...p }) => (
        <ProposalItem {...p} proposalId={id} key={id} type="list" />
      ))} */}

      <ProposalItem proposalId={"1"} key={1} />

      <Button
        variant="tertiary"
        size="lg"
        iconRight={IconType.CHEVRON_RIGHT}
        onClick={() =>
          navigate(generatePath(Governance, { network, dao: daoAddressOrEns }))
        }
      >
        {t("labels.seeAll")}
      </Button>
    </Container>
  );
};

export default ProposalSnapshot;

const Container = styled.div.attrs({
  className: "space-y-3 xl:space-y-4 w-full",
})``;
