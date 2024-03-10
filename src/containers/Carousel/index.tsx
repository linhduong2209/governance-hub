import React, { useCallback, useMemo } from "react";
import { Carousel as ReactResponsiveCarousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import CTACard from "src/components/CTACard";
import { CTACards } from "src/components/CTACard/data";
import useScreen from "src/hooks/useScreen";
// import { useWallet } from "src/hooks/useWallet";
import { trackEvent } from "src/services/analytics";

const Carousel: React.FC = () => {
  const { isDesktop } = useScreen();
  const navigate = useNavigate();
  // const { methods, isConnected } = useWallet();

  // TODO
  // this prevents the user from entering the creation
  // flow without a wallet, but this should be updated
  // when the rest of CTAs are enabled
  const handleCTAClick = useCallback(
    (path: string) => {
      if (path === "/create") {
        trackEvent("landing_createDaoBtn_clicked");
      }

      if (path.startsWith("http")) {
        window.open(path, "_blank");
        return;
      }

      navigate(path);
    },
    [navigate]
  );

  const ctaList = useMemo(
    () =>
      CTACards.map(card => (
        <CTACard
          key={card.title}
          {...card}
          className="flex-1"
          onClick={handleCTAClick}
        />
      )),
    [handleCTAClick]
  );

  if (isDesktop) {
    return <DesktopCTA>{ctaList}</DesktopCTA>;
  } else {
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
          {ctaList}
        </StyledCarousel>
      </MobileCTA>
    );
  }
};

const DesktopCTA = styled.div.attrs({
  className:
    "relative flex xl:flex-row flex-col mb-8 space-x-6 max-w-fit -mt-32"
})``;

const MobileCTA = styled.div.attrs({
  className: "relative -mt-[104px] mb-10 -mx-4 md:-mx-6 xl:mx-0"
})``;

export const ActiveIndicator = styled.li.attrs({
  className: "inline-block bg-primary-500 h-1.5 w-12 ml-2 rounded-xl"
})``;

export const Indicator = styled.li.attrs({
  className: "inline-block bg-neutral-200 h-1.5 w-4 ml-2 rounded-xl"
})``;

export const StyledCarousel = styled(ReactResponsiveCarousel).attrs({})`
  & > .carousel-slider > ul {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0px;
  }
`;

export default Carousel;
