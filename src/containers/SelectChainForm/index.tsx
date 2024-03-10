import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ListItemBlockchain } from "src/@aragon/ods-old";
import styled from "styled-components";

import { Toggle, ToggleGroup } from "@aragon/ods";
import { useNetwork } from "src/context/network";
import { CHAIN_METADATA, SupportedNetworks } from "src/utils/constants";
import { featureFlags } from "src/utils/featureFlags";

type NetworkType = "main" | "test";

const SelectChainForm: React.FC = () => {
  const { t } = useTranslation();
  const { setNetwork, network } = useNetwork();
  const { control, resetField } = useFormContext();

  const [networkType, setNetworkType] = useState<NetworkType>(
    CHAIN_METADATA[network].isTestnet ? "test" : "main"
  );

  const availableNetworks = networks[networkType]["popularity"].filter(
    n =>
      // uppercase SupportedNetwork name is used for the flag
      // also replace hyphens with underscores
      featureFlags.getValue(
        `VITE_FEATURE_FLAG_${n.replace(/-/g, "_").toUpperCase()}`
      ) !== "false"
  );

  const handleNetworkTypeChange = (newNetwork?: string) => {
    if (newNetwork) {
      setNetworkType(newNetwork as NetworkType);
    }
  };

  return (
    <>
      <Header>
        <NetworkTypeSwitcher>
          <ToggleGroup
            isMultiSelect={false}
            value={networkType}
            onChange={handleNetworkTypeChange}
          >
            <Toggle value="main" label={t("labels.mainNet")} />
            <Toggle value="test" label={t("labels.testNet")} />
          </ToggleGroup>
        </NetworkTypeSwitcher>
      </Header>
      <FormItem>
        {availableNetworks.map(selectedNetwork => (
          <Controller
            key={selectedNetwork}
            name="blockchain"
            rules={{ required: true }}
            control={control}
            render={({ field }) => (
              <ListItemBlockchain
                onClick={() => {
                  setNetwork(selectedNetwork);
                  field.onChange({
                    id: CHAIN_METADATA[selectedNetwork].id,
                    label: CHAIN_METADATA[selectedNetwork].name,
                    network: networkType
                  });
                  if (!CHAIN_METADATA[selectedNetwork].supportsEns) {
                    // reset daoEnsName if network changed to L2
                    resetField("daoEnsName");
                  }
                }}
                selected={CHAIN_METADATA[selectedNetwork].id === field.value.id}
                {...CHAIN_METADATA[selectedNetwork]}
              />
            )}
          />
        ))}
      </FormItem>
    </>
  );
};

export default SelectChainForm;

const Header = styled.div.attrs({ className: "flex justify-between" })``;

const NetworkTypeSwitcher = styled.div.attrs({
  className: "flex p-1 space-x-1"
})``;

const FormItem = styled.div.attrs({
  className: "space-y-3"
})``;

// Note: Default Network name in polygon network is different than Below list
type SelectableNetworks = Record<
  NetworkType,
  {
    cost: SupportedNetworks[];
    popularity: SupportedNetworks[];
    security: SupportedNetworks[];
  }
>;

const networks: SelectableNetworks = {
  main: {
    cost: ["polygon", "base", "arbitrum", "ethereum"],
    popularity: ["ethereum", "polygon", "arbitrum", "base"],
    security: ["ethereum", "base", "arbitrum", "polygon"]
  },
  test: {
    cost: ["fuji"],
    popularity: ["fuji"],
    security: ["fuji"]
  }
};
