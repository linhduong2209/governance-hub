import {
  Button,
  Icon,
  IconType,
  Spinner,
  Toggle,
  ToggleGroup,
} from "@aragon/ods";
import { useMemo, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { DaoCard } from "src/components/daoCard";
import styled from "styled-components";
import {
  FilterActionTypes,
  daoFiltersReducer,
} from "../DaoFilterModal/reducer";
import { DEFAULT_FILTERS } from "../DaoFilterModal";
import {
  OrderByValue,
  QuickFilterValue,
  quickFilters,
} from "../DaoFilterModal/data";
import { Dropdown } from "src/@aragon/ods-old";

const daoList = [
  {
    id: 1,
    name: "Governance DAO",
    ens: "",
    description: "Make everything easier.",
    network: "fuji",
    logo: "data:image/jpeg;base64,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",
  },
  {
    id: 2,
    name: "Devolved AI Treasury DAO",
    ens: "",
    description: "This is the Devolved AI DAO that holds DAO treasury funds.",
    network: "fuji",
    logo: "https://wallpapercave.com/wp/wp4471382.jpg",
  },
  {
    id: 3,
    name: "Swiss Shield DAO",
    ens: "",
    description:
      "The Swiss Shield DAO is a neutral organisation supporting DAOs purposes and mission statements.",
    network: "fuji",
    logo: "https://wallpapercave.com/wp/wp4471413.jpg",
  },
  {
    id: 4,
    name: "Lang DAO",
    ens: "",
    description:
      "Lang DAO, a non-profit organisation, to further the utilisation of linguistic data and growth of multilingual communication",
    network: "fuji",
    logo: "https://wallpaperaccess.com/full/860740.jpg",
  },
  {
    id: 5,
    name: "Wolf Works DAO",
    ens: "",
    description:
      "Designed to provide community-led governance, Wolf Works DAO is a decentralized autonomous organization that puts the power directly in the hands of its stakeholders. At the heart of Wolf Works DAO is the $WWD governance token. By holding the $WWD token, holders have voting rights and can participate in decision-making for all aspects of the DAO's operations.",
    network: "fuji",
    logo: "https://wallpaperaccess.com/full/1138983.jpg",
  },
  {
    id: 6,
    name: "Ekeko DAO",
    ens: "",
    description:
      "Ekeko DAO is a whitelisted investment DAO operated as an investment club, under Ekeko DAO, LLC, a Delaware limited liability company. Ekeko DAO is not an investment company as defined in the Investment Company Act of 1940.",
    network: "fuji",
    logo: "data:image/jpeg;base64,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",
  },
];

export const DaoExplorer = () => {
  const { t } = useTranslation();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(false);

  const [filters, dispatch] = useReducer(daoFiltersReducer, DEFAULT_FILTERS);

  const filtersCount = useMemo(() => {
    let count = 0;

    if (!filters) return "";

    if (filters.quickFilter !== DEFAULT_FILTERS.quickFilter) count++;

    // plugin Name filter
    if (filters.pluginNames?.length !== 0) count++;

    // network filter
    if (filters.networks?.length !== 0) count++;

    return count !== 0 ? count.toString() : "";
  }, [filters]);
  // const totalDaos = newDaosResult.data?.pages[0].total ?? 0;
  // const noDaosFound = isLoading === false && totalDaos === 0;
  const toggleQuickFilters = (value?: string | string[]) => {
    if (value && !Array.isArray(value)) {
      dispatch({
        type: FilterActionTypes.SET_QUICK_FILTER,
        payload: value as QuickFilterValue,
      });
    }
  };

  const toggleOrderby = (value?: string) => {
    if (value)
      dispatch({
        type: FilterActionTypes.SET_ORDER,
        payload: value as OrderByValue,
      });
  };

  return (
    <Container>
      <MainContainer>
        <Title>{t("explore.explorer.title")}</Title>
        <FilterGroupContainer>
          <ToggleGroup
            isMultiSelect={false}
            value={filters.quickFilter}
            onChange={toggleQuickFilters}
          >
            {quickFilters.map(f => {
              return (
                <Toggle
                  key={f.value}
                  label={t(f.label)}
                  value={f.value}
                  disabled={f.value === "memberOf" || f.value === "following"}
                />
              );
            })}
          </ToggleGroup>
          <ButtonGroupContainer>
            <Button
              size="md"
              className="!min-w-fit"
              responsiveSize={{ lg: "lg" }}
              iconLeft={IconType.FILTER}
              onClick={() => setShowAdvancedFilters(true)}
            >
              {filtersCount}
            </Button>
            {filters.quickFilter !== "following" && (
              <Dropdown
                side="bottom"
                align="end"
                sideOffset={4}
                trigger={
                  <Button
                    variant={activeDropdown ? "secondary" : "tertiary"}
                    size="md"
                    responsiveSize={{ lg: "lg" }}
                    iconLeft={IconType.SORT_DESC}
                  />
                }
                onOpenChange={e => {
                  setActiveDropdown(e);
                }}
                listItems={[
                  {
                    component: (
                      <CredentialsDropdownItem
                        isActive={filters.order === "tvl"}
                      >
                        {t("explore.sortBy.largestTreasury")}
                        {filters.order === "tvl" && (
                          <Icon icon={IconType.CHECKMARK} />
                        )}
                      </CredentialsDropdownItem>
                    ),
                    callback: () => toggleOrderby("tvl"),
                  },
                  {
                    component: (
                      <CredentialsDropdownItem
                        isActive={filters.order === "proposals"}
                      >
                        {t("explore.sortBy.mostProposals")}
                        {filters.order === "proposals" && (
                          <Icon icon={IconType.CHECKMARK} />
                        )}
                      </CredentialsDropdownItem>
                    ),
                    callback: () => toggleOrderby("proposals"),
                  },
                  {
                    component: (
                      <CredentialsDropdownItem
                        isActive={filters.order === "members"}
                      >
                        {t("explore.sortBy.largestCommunity")}
                        {filters.order === "members" && (
                          <Icon icon={IconType.CHECKMARK} />
                        )}
                      </CredentialsDropdownItem>
                    ),
                    callback: () => toggleOrderby("members"),
                  },
                  {
                    component: (
                      <CredentialsDropdownItem
                        isActive={filters.order === "createdAt"}
                      >
                        {t("explore.sortBy.recentlyCreated")}
                        {filters.order === "createdAt" && (
                          <Icon icon={IconType.CHECKMARK} />
                        )}
                      </CredentialsDropdownItem>
                    ),
                    callback: () => toggleOrderby("createdAt"),
                  },
                ]}
              />
            )}
          </ButtonGroupContainer>
        </FilterGroupContainer>
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

      <div className="flex items-center lg:gap-x-6">
        <span className="ml-auto font-semibold text-neutral-800 ft-text-base lg:ml-0">
          {t("explore.pagination.label.amountOf DAOs", {
            amount: 6,
            total: 6,
          })}
        </span>
      </div>
    </Container>
  );
};

type CredentialsDropdownItemPropType = {
  isActive: boolean;
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

const FilterGroupContainer = styled.div.attrs({
  className: "flex justify-between space-x-3",
})``;

const ButtonGroupContainer = styled.div.attrs({
  className: "flex space-x-3 items-start",
})``;

const CredentialsDropdownItem = styled.div.attrs<CredentialsDropdownItemPropType>(
  ({ isActive }) => ({
    className: `flex text-neutral-600 items-center justify-between gap-3 py-3 font-semibold ft-text-base hover:bg-primary-50 px-4 rounded-xl hover:text-primary-400 ${
      isActive ? "text-primary-400 bg-primary-50 cursor-auto" : "cursor-pointer"
    }`,
  }),
)``;
