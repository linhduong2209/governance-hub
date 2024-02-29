import styled from "styled-components";
import { GridLayout } from "../../components/layout";
import Hero from "../../containers/hero";

export const Dashboard: React.FC = () => {
  return (
    <>
      <Hero />
      <GridLayout>
        <ContentWrapper>
          {/* <Carousel />
          <DaoExplorer /> */}
        </ContentWrapper>
      </GridLayout>
    </>
  );
};

/* STYLES =================================================================== */

const ContentWrapper = styled.div.attrs({
  className:
    "col-span-full xl:col-start-2 xl:col-end-12 space-y-10 xl:space-y-[72px] mb-10 xl:mb-20 pb-10"
})``;
