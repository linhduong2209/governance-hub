import { useTranslation } from "react-i18next";

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  return <>{t("navLinks.dashboard")}</>;
};
