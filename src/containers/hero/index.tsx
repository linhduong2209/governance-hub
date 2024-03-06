import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import { ButtonWallet } from "src/@aragon/ods-old";
import { useAccount } from "wagmi";
import Green from "../../../public/assets/images/circleGreenGradient.svg";
import Logo from "../../../public/assets/images/coloredLogo.svg";
import Purple from "../../../public/assets/images/purpleGradient.svg";
import { GridLayout } from "../../components/layout";
import { HeaderContainer } from "../../components/layout/header";

function Hero() {
  const { t } = useTranslation();
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();

  return (
    <Container>
      <GridLayout>
        <Wrapper>
          <ContentWrapper>
            <Title>{t("explore.hero.title")}</Title>
            <Subtitle>{t("explore.hero.subtitle1")}</Subtitle>
          </ContentWrapper>
          <ImageWrapper>
            <StyledImage src={Logo} />
          </ImageWrapper>
          <GradientContainer>
            <GradientWrapper>
              <GradientGreen src={Green} />
              <GradientPurple src={Purple} />
            </GradientWrapper>
          </GradientContainer>
        </Wrapper>
        <HeaderContainer data-testid="navbar">
          <Menu>
            <ButtonWallet
              src={""}
              onClick={() => open()}
              isConnected={isConnected}
              label={
                isConnected ? address ?? "" : t("navButtons.connectWallet")
              }
            />
          </Menu>
        </HeaderContainer>
      </GridLayout>
    </Container>
  );
}

const Container = styled.div.attrs({
  className:
    "bg-primary-400 h-[448px] -mt-20 pt-20  xl:h-[536px] xl:pt-24 xl:-mt-24 overflow-hidden"
})``;

const Wrapper = styled.div.attrs({
  className:
    "flex justify-center xl:justify-between col-span-full xl:col-start-2 xl:col-end-12 relative"
})``;

const ContentWrapper = styled.div.attrs({
  className: "xl:space-y-1.5 space-y-2 max-w-lg pt-9 xl:pt-20"
})``;

const Title = styled.h1.attrs({
  className:
    "text-neutral-0 font-semibold ft-text-5xl xl:text-left text-center xl:leading-[60px] leading-[38px]"
})`
  font-family: Syne;
  letter-spacing: -0.03em;
`;

const Subtitle = styled.h3.attrs({
  className:
    "text-neutral-0 ft-text-lg font-normal text-center xl:text-left leading-[24px] xl:leading-[30px]"
})``;

const ImageWrapper = styled.div.attrs({
  className: "h-full"
})``;

const StyledImage = styled.img.attrs({
  className: "w-[568px] hidden xl:block"
})``;

const GradientContainer = styled.div.attrs({
  className: "absolute top-64 xl:top-40 right-0 w-[568px]"
})``;

const GradientWrapper = styled.div.attrs({
  className: "relative w-full h-full"
})``;

const GradientGreen = styled.img.attrs({
  className: "h-80 absolute xl:-left-28 xl:-top-40 -top-[152px] left-28"
})``;

const GradientPurple = styled.img.attrs({
  className: "xl:h-80 h-60 absolute xl:-right-40 xl:top-10 -right-10 -top-12"
})``;

const Menu = styled.nav.attrs({
  className: "py-4 xl:py-6"
})`
  background: linear-gradient(180deg, #3164fa 0%, rgba(49, 100, 250, 0) 100%);
`;

export default Hero;
