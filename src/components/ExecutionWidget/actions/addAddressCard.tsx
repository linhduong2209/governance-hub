import { ListItemAddress } from "src/@aragon/ods-old";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { AccordionMethod } from "src/components/AccordionMethod";
import AccordionSummary from "src/containers/ActionBuilder/addAddresses/accordionSummary";
import { useNetwork } from "src/context/network";
import { useProviders } from "src/context/providers";
import { CHAIN_METADATA } from "src/utils/constants";
import { Web3Address } from "src/utils/library";
import { ActionAddAddress } from "src/utils/types";
import { useDaoDetailsQuery } from "src/hooks/useDaoDetails";

export const AddAddressCard: React.FC<{
  action: ActionAddAddress;
}> = ({ action: { inputs } }) => {
  const { t } = useTranslation();
  const { network } = useNetwork();
  const { api: provider } = useProviders();
  const { data: daoDetails } = useDaoDetailsQuery();

  const [addresses, setAddresses] = useState<Web3Address[]>([]);

  /*************************************************
   *                    Effects                    *
   *************************************************/
  useEffect(() => {
    async function mapToWeb3Addresses() {
      try {
        const response = await Promise.all(
          inputs.memberWallets.map(
            async ({ address, ensName }) =>
              await Web3Address.create(provider, { address, ensName })
          )
        );

        setAddresses(response);
      } catch (error) {
        console.error("Error creating Web3Addresses", error);
      }
    }

    if (inputs.memberWallets) mapToWeb3Addresses();
  }, [inputs.memberWallets, network, provider]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleAddressClick = useCallback(
    (addressOrEns: string | null) =>
      window.open(
        `${CHAIN_METADATA[network].explorer}address/${addressOrEns}`,
        "_blank"
      ),
    [network]
  );

  /*************************************************
   *                    Render                    *
   *************************************************/
  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t("labels.addWallets")}
      smartContractName={`Multisig `}
      smartContractAddress={daoDetails?.plugins[0].instanceAddress}
      blockExplorerLink={
        daoDetails?.plugins[0].instanceAddress
          ? `${CHAIN_METADATA[network].explorer}address/${daoDetails?.plugins[0].instanceAddress}`
          : undefined
      }
      verified
      methodDescription={t("labels.addWalletsDescription")}
    >
      <Container>
        {inputs.memberWallets.map(({ address, ensName }, index) => {
          const label = ensName || addresses[index]?.ensName || address;

          return (
            <ListItemAddress
              label={label}
              src={addresses[index]?.avatar || address}
              key={address}
              onClick={() => handleAddressClick(label)}
            />
          );
        })}
      </Container>
      <AccordionSummary type="execution-widget" total={1} />
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className: "bg-neutral-50 border border-t-0 border-neutral-100 space-y-2 p-4",
})``;
