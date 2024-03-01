import { useTranslation } from "react-i18next";
import { CheckboxListItem } from "src/@aragon/ods-old";
import { AlertInline } from "@aragon/ods";
import { useCensus3SupportedChains } from "src/hooks/useCensus3";
import { useFormContext } from "react-hook-form";

/**
 * Checkbox used on the DAO creation process.
 *
 * It has a logic to show a `Comming Soon` label when the chainId is not compatible with vocdoni census3 service.
 * @constructor
 */
const GaslessSelector = ({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) => {
  const { t } = useTranslation();
  const { getValues } = useFormContext();

  const { blockchain } = getValues();

  const isSupported = useCensus3SupportedChains(blockchain.id);

  return (
    <>
      <CheckboxListItem
        label={t("createDAO.step3.blockChainVoting.optionGaslessLabel")}
        helptext={t("createDAO.step3.blockChainVoting.optionGaslessDesc", {
          blockchainName: blockchain.label,
        })}
        onClick={() => {
          onChange("gasless");
        }}
        multiSelect={false}
        disabled={!isSupported}
        {...(value === "gasless" ? { type: "active" } : {})}
      />
      {!isSupported && (
        <AlertInline
          message={t("createDAO.step3.votingType.gasless.soon", {
            blockchainName: blockchain.label,
          })}
          variant="info"
        />
      )}
    </>
  );
};

export default GaslessSelector;
