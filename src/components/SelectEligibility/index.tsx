import { useEffect } from "react";
import { AlertInline } from "@aragon/ods";
import { CheckboxListItem, Label, NumberInput } from "src/@aragon/ods-old";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

export type TokenVotingProposalEligibility = "token" | "anyone";

export const SelectEligibility = () => {
  const { control, getValues, resetField, setValue } = useFormContext();
  const { t } = useTranslation();
  const { tokenTotalSupply } = getValues();
  const [eligibilityType, minimumTokenAmount] = useWatch({
    name: ["eligibilityType", "minimumTokenAmount"],
    control,
  });

  const anyoneIsEligible = eligibilityType === "anyone";

  function eligibilityValidator(value: string) {
    if (value === "") return t("errors.required.amount");
    /**
     * Prevent user from entering 0 because It will makes any wallet eligible
     */
    if (Number(value) === 0) return t("errors.requiredTokenAddressZero");
    /**
     * Prevent user from entering values more than total supply
     */
    if (tokenTotalSupply)
      if (Number(value) > tokenTotalSupply)
        return t("errors.biggerThanTotalSupply");
    return true;
  }

  useEffect(() => {
    if (eligibilityType === "token") {
      setValue(
        "eligibilityTokenAmount",
        minimumTokenAmount < 1 ? minimumTokenAmount : 1
      );
    } else {
      setValue("eligibilityTokenAmount", 0);
    }
  }, [eligibilityType, minimumTokenAmount, setValue]);

  /**
   * Current Types like token or anyone are dummies and may refactor later
   * according to SDK method requirements
   */

  return (
    <>
      <DescriptionContainer>
        <Label
          label={t("labels.proposalCreation")}
          helpText={t("createDAO.step3.proposalCreationHelpertext")}
        />
      </DescriptionContainer>
      <Container>
        <Controller
          name="eligibilityType"
          control={control}
          defaultValue={"token"}
          render={({ field: { onChange, value } }) => (
            <OptionsContainers>
              <OptionsTitle>
                {t("createDAO.step3.eligibility.optionTitle")}
              </OptionsTitle>
              <CheckboxListItem
                label={t("createDAO.step3.eligibility.tokenHolders.title")}
                helptext={t(
                  "createDAO.step3.eligibility.tokenHolders.description"
                )}
                multiSelect={false}
                onClick={() => {
                  onChange("token");
                  setValue("eligibilityTokenAmount", minimumTokenAmount);
                }}
                {...(value === "token" ? { type: "active" } : {})}
              />
              <CheckboxListItem
                label={t("createDAO.step3.eligibility.anyWallet.title")}
                helptext={t(
                  "createDAO.step3.eligibility.anyWallet.description"
                )}
                onClick={() => {
                  onChange("anyone");
                  resetField("eligibilityTokenAmount");
                }}
                multiSelect={false}
                {...(value === "anyone" ? { type: "active" } : {})}
              />
            </OptionsContainers>
          )}
        />
        <Controller
          name="eligibilityTokenAmount"
          control={control}
          rules={{
            validate: (value) =>
              anyoneIsEligible ? true : eligibilityValidator(value),
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <OptionsContainers>
              <OptionsTitle>
                {t("createDAO.step3.eligibility.inputTitle")}
              </OptionsTitle>
              <NumberInput
                value={value}
                view={anyoneIsEligible ? "default" : "bigger"}
                onChange={onChange}
                includeDecimal
                max={tokenTotalSupply}
                disabled={anyoneIsEligible}
              />
              {error?.message && (
                <AlertInline message={error.message} variant="critical" />
              )}
            </OptionsContainers>
          )}
        />
      </Container>
      {anyoneIsEligible && (
        <AlertInline
          message={t("createDAO.step3.eligibility.anyone.warning")}
          variant="warning"
        />
      )}
    </>
  );
};

const Container = styled.div.attrs({
  className:
    "md:flex p-4 md:p-6 space-y-2 md:space-y-0 rounded-xl bg-neutral-0 md:space-x-6 space-x-0",
})``;

const OptionsContainers = styled.div.attrs({
  className: "space-y-2 md:w-1/2",
})``;

const OptionsTitle = styled.h2.attrs({
  className: "ft-text-base font-semibold text-neutral-800",
})``;

const DescriptionContainer = styled.div.attrs({
  className: "space-y-1 mb-3",
})``;
