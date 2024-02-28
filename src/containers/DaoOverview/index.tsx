import { Breadcrumb, IlluObject } from "src/@aragon/ods-old";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Button, IconType } from "@aragon/ods";
import CardWithImage from "src/components/CardWithImage";
import { useFormStep } from "src/components/FullScreenStepper";
import useScreen from "src/hooks/useScreen";
import { trackEvent } from "src/services/analytics";

import { ActiveIndicator, Indicator, StyledCarousel } from "../Carousel";
import { i18n } from "../../../i18n.config";


type OverviewDAOHeaderProps = {
  navLabel: string;
  returnPath: string;
  onExitButtonClick?: () => void;
};

export const OverviewDAOHeader: React.FC<OverviewDAOHeaderProps> = ({
  navLabel,
  returnPath,
  onExitButtonClick,
}) => {
  const { t } = useTranslation();
  const { next } = useFormStep();

  const handleSetupClick = () => {
    trackEvent("daoCreation_setupDAO_clicked");
    next();
  };

  return (
    <div className="bg-neutral-0 p-4 md:rounded-xl md:p-12">
      <div className="mb-6 xl:hidden">
        <Breadcrumb
          crumbs={{
            label: navLabel,
            path: returnPath,
          }}
          onClick={onExitButtonClick}
        />
      </div>

      <div className="items-end md:flex md:space-x-12">
        <div className="w-full">
          <h1 className="font-semibold text-neutral-800 ft-text-3xl">
            {t("createDAO.overview.title")}
          </h1>
          <p className="mt-4 text-neutral-600 ft-text-lg">
            {t("createDAO.overview.description")}
          </p>
        </div>
        <div className="mt-4 flex space-x-4 md:mt-0">
          {/* <ButtonText
          size="large"
          mode="secondary"
          bgWhite
          className="whitespace-nowrap"
          label={'Continue Draft'}
        /> */}
          <Button
            size="lg"
            variant="primary"
            className="w-full whitespace-nowrap md:w-max"
            iconRight={IconType.CHEVRON_RIGHT}
            onClick={handleSetupClick}
          >
            {t("createDAO.overview.button")}
          </Button>
        </div>
      </div>
    </div>
  );
};

const OverviewCards = [
  <CardWithImage
    key="SelectBlockchain"
    imgSrc={<IlluObject object="chain" />}
    caption={i18n.t("createDAO.step1.label")}
    title={i18n.t("createDAO.step1.title")}
  />,
  <CardWithImage
    key="DefineMetadata"
    imgSrc={<IlluObject object="labels" />}
    caption={i18n.t("createDAO.step2.label")}
    title={i18n.t("createDAO.step2.title")}
  />,
  <CardWithImage
    key="SetupCommunity"
    imgSrc={<IlluObject object="users" />}
    caption={i18n.t("createDAO.step3.label")}
    title={i18n.t("createDAO.step3.title")}
  />,
  <CardWithImage
    key="ConfigureGovernance"
    imgSrc={<IlluObject object="settings" />}
    caption={i18n.t("createDAO.step4.label")}
    title={i18n.t("createDAO.step4.shortTitle")}
  />,
];

export const OverviewDAOStep: React.FC = () => {
  const { isDesktop } = useScreen();

  if (isDesktop) {
    return (
      <div className="space-y-6 md:flex md:space-x-6 md:space-y-0">
        {OverviewCards}
      </div>
    );
  }
  return (
    <MobileCTA>
      <StyledCarousel
        swipeable
        emulateTouch
        centerMode
        autoPlay
        preventMovementUntilSwipeScrollTolerance
        swipeScrollTolerance={100}
        interval={4000}
        showArrows={false}
        showStatus={false}
        transitionTime={300}
        centerSlidePercentage={92}
        showThumbs={false}
        infiniteLoop
        renderIndicator={(onClickHandler, isSelected, index, label) => {
          if (isSelected) {
            return (
              <ActiveIndicator
                aria-label={`Selected: ${label} ${index + 1}`}
                title={`Selected: ${label} ${index + 1}`}
              />
            );
          }
          return (
            <Indicator
              onClick={onClickHandler}
              onKeyDown={onClickHandler}
              value={index}
              key={index}
              role="button"
              tabIndex={0}
              title={`${label} ${index + 1}`}
              aria-label={`${label} ${index + 1}`}
            />
          );
        }}
      >
        {OverviewCards}
      </StyledCarousel>
    </MobileCTA>
  );
};

const MobileCTA = styled.div.attrs({
  className: "mb-10 -mx-4 md:-mx-6 xl:mx-0",
})``;
