import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CheckboxListItem, Label } from "src/@aragon/ods-old";
import styled from "styled-components";

import { MultisigWallets } from "src/components/MultisigWallets";
import { CreateDaoFormData } from "src/utils/types";

const SetupCommunityForm: React.FC = () => {
  const { t } = useTranslation();

  const { control, resetField, setValue, getValues } =
    useFormContext<CreateDaoFormData>();
  const [membership, isCustomToken] = useWatch({
    control,
    name: ["membership", "isCustomToken"]
  });

  const { blockchain } = getValues();

  const existingTokenItems = [
    // No mean It's a custom Token so It should be true
    {
      label: t("labels.no"),
      selectValue: true
    },
    // Yes mean It's not a custom Token should be false
    { label: t("labels.yes"), selectValue: false }
  ];

  const resetTokenFields = () => {
    resetField("tokenName");
    resetField("tokenSymbol");
    resetField("tokenAddress");
    resetField("tokenTotalSupply");
    resetField("wallets");
  };

  const resetMultisigFields = () => {
    resetField("multisigWallets");
  };

  const handleCheckBoxSelected = (
    membership: CreateDaoFormData["membership"],
    onChange: (...event: unknown[]) => void
  ) => {
    // reset opposite fields and set default eligibility for
    // proposal creation
    if (membership === "token") {
      resetMultisigFields();
      setValue("eligibilityType", "token");
    } else {
      resetTokenFields();
      setValue("eligibilityType", "multisig");
    }
    onChange(membership);
  };
  console.log("membership", membership);

  return (
    <>
      {/* Eligibility */}
      <FormItem>
        <Label label={t("createDAO.step3.membership") as string} />
        <Controller
          name="membership"
          rules={{ required: "Validate" }}
          control={control}
          defaultValue="multisig"
          render={({ field: { onChange, value } }) => (
            <CheckboxListItem
              label={t("createDAO.step3.multisigMembership")}
              helptext={t("createDAO.step3.multisigMembershipSubtitle")}
              onClick={() => handleCheckBoxSelected("multisig", onChange)}
              multiSelect={false}
              {...(value === "multisig" ? { type: "active" } : {})}
            />
          )}
        />
      </FormItem>

      <FormItem>
        <MultisigWallets />
      </FormItem>
    </>
  );
};

export default SetupCommunityForm;

const FormItem = styled.div.attrs({
  className: "space-y-3"
})``;
