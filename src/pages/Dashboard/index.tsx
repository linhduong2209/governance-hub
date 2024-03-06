import Carousel from "src/containers/Carousel";
import Navbar from "src/containers/Navbar";
import styled from "styled-components";
import { GridLayout } from "../../components/Layout";
import Hero from "../../containers/hero";

export const Dashboard: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <Hero />
        <GridLayout>
          <ContentWrapper>
            {/* <DaoExplorer /> */}
            <Carousel />
          </ContentWrapper>
        </GridLayout>
      </div>
    </>
  );
};

/* STYLES =================================================================== */

const ContentWrapper = styled.div.attrs({
  className:
    "col-span-full xl:col-start-2 xl:col-end-12 space-y-10 xl:space-y-[72px] mb-10 xl:mb-20 pb-10",
})``;
