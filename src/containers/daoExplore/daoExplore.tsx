import { IconType, Spinner } from "@aragon/ods";
import { useTranslation } from "react-i18next";
import { StateEmpty } from "src/components/StateEmpty";
import { DaoCard } from "src/components/daoCard";
import styled from "styled-components";

const daoList = [
  {
    id: 1,
    name: "Devolved AI Treasury DAO",
    ens: "swiss-shield",
    description: "This is the Devolved AI DAO that holds DAO treasury funds.",
    network: "fuji",
  },
  {
    id: 2,
    name: "Swiss Shield DAO",
    ens: "swiss-shield",
    description:
      "The Swiss Shield DAO is a neutral organisation supporting DAOs purposes and mission statements.",
    network: "fuji",
  },
];

export const DaoExplorer = () => {
  const { t } = useTranslation();

  // const totalDaos = newDaosResult.data?.pages[0].total ?? 0;
  // const noDaosFound = isLoading === false && totalDaos === 0;

  return (
    <Container>
      <MainContainer>
        <Title>{t("explore.explorer.title")}</Title>

        {/* {noDaosFound ? (
          <StateEmpty
            type="Object"
            mode="card"
            object="magnifying_glass"
            title={t("explore.emptyStateSearch.title")}
            description={t("explore.emptyStateSearch.description")}
            contentWrapperClassName="lg:w-[560px]"
            secondaryButton={{
              label: t("explore.emptyStateSearch.ctaLabel"),
              iconLeft: IconType.RELOAD,
              // onClick: handleClearFilters,
              className: "w-full"
            }}
          />
        ) : (
          <CardsWrapper>
            {filteredDaoList?.map((dao: any, index: number) => (
              <DaoCard key={index} dao={dao} />
            ))}
            {isLoading && <Spinner size="xl" variant="primary" />}
          </CardsWrapper>
        )} */}

        {/* TODO: Remove later */}
        <CardsWrapper>
          {daoList?.map((dao: any, index: number) => (
            <DaoCard key={index} dao={dao} />
          ))}
        </CardsWrapper>
      </MainContainer>
    </Container>
  );
};

const Container = styled.div.attrs({
  className: "flex flex-col space-y-3",
})``;

const MainContainer = styled.div.attrs({
  className: "flex flex-col space-y-4 xl:space-y-6",
})``;

const Title = styled.p.attrs({
  className: "font-semibold ft-text-xl text-neutral-800",
})``;

const CardsWrapper = styled.div.attrs({
  className: "grid grid-cols-1 gap-3 xl:grid-cols-2 xl:gap-6",
})``;
