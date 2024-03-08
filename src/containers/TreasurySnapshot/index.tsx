import React from "react";
import { ListItemHeader, TransferListItem } from "src/@aragon/ods-old";
import { Button, Icon, IconType } from "@aragon/ods";

import { useTranslation } from "react-i18next";
import { generatePath, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { StateEmpty } from "src/components/StateEmpty";
import { useGlobalModalContext } from "src/context/globalModals";
import { useNetwork } from "src/context/network";
// import { useTransactionDetailContext } from "src/context/transactionDetail";
import { AllTransfers } from "src/utils/paths";
import {
  abbreviateTokenAmount,
  shortenLongTokenSymbol,
} from "src/utils/tokens";
import { Transfer } from "src/utils/types";
import { htmlIn } from "src/utils/htmlIn";

type Props = {
  daoAddressOrEns: string;
  transfers: Transfer[];
  totalAssetValue: number;
};

const TreasurySnapshot: React.FC<Props> = ({
  daoAddressOrEns,
  transfers,
  totalAssetValue,
}) => {
  const { t } = useTranslation();
  const { open } = useGlobalModalContext();
  const navigate = useNavigate();
  const { network } = useNetwork();
  //  const { handleTransferClicked } = useTransactionDetailContext();

  if (transfers.length === 0) {
    return (
      <StateEmpty
        type="both"
        mode="card"
        body={"chart"}
        expression={"excited"}
        hair={"bun"}
        object={"wallet"}
        title={t("finance.emptyState.title")}
        description={htmlIn(t)("finance.emptyState.description")}
        secondaryButton={{
          label: t("finance.emptyState.buttonLabel"),
          onClick: () => open("deposit"),
        }}
        renderHtml
      />
    );
  }

  return (
    <Container>
      <ListItemHeader
        icon={<Icon icon={IconType.APP_ASSETS} />}
        value={new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(totalAssetValue)}
        label={t("labels.treasuryValue")}
        buttonText={t("allTransfer.newTransfer")}
        orientation="vertical"
        onClick={() => open("transfer")}
      />
      {transfers.slice(0, 3).map(({ tokenAmount, tokenSymbol, ...rest }) => (
        <TransferListItem
          key={rest.id}
          tokenAmount={abbreviateTokenAmount(tokenAmount)}
          tokenSymbol={shortenLongTokenSymbol(tokenSymbol)}
          {...rest}
          onClick={
            () => {}
            //  handleTransferClicked({tokenAmount, tokenSymbol, ...rest})
          }
        />
      ))}
      <Button
        variant="tertiary"
        size="lg"
        iconRight={IconType.CHEVRON_RIGHT}
        onClick={() =>
          navigate(
            generatePath(AllTransfers, { network, dao: daoAddressOrEns })
          )
        }
      >
        {t("labels.seeAll")}
      </Button>
    </Container>
  );
};

export default TreasurySnapshot;

const Container = styled.div.attrs({
  className: "space-y-3 xl:space-y-4",
})``;
