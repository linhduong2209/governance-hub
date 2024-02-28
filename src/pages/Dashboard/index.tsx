import { useTranslation } from "react-i18next";

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      {t("navLinks.dashboard")}
      <button className="text-white px-4 sm:px-8 py-2 sm:py-3 bg-sky-700 hover:bg-sky-800">
        Create
      </button>
    </>
  );
};
