import {SupportedNetworks} from 'src/utils/constants';
import {QuickFilterValue, OrderByValue} from './data';

export type DaoFilterState = {
  pluginNames?: Array<string>;
  networks?: Array<SupportedNetworks>;
  quickFilter: QuickFilterValue;
  showTestnets: boolean;
  order: OrderByValue;
};

export enum FilterActionTypes {
  SET_PLUGIN_NAMES = 'SET_PLUGIN_NAMES',
  SET_QUICK_FILTER = 'SET_QUICK_FILTER',
  SET_NETWORKS = 'SET_NETWORKS',
  SET_ORDER = 'SET_ORDER',
  TOGGLE_TESTNETS = 'TOGGLE_TESTNETS',
  RESET = 'RESET',
}

export type DaoFilterAction =
  | {
      type: FilterActionTypes.SET_PLUGIN_NAMES;
      payload: DaoFilterState['pluginNames'];
    }
  | {
      type: FilterActionTypes.SET_QUICK_FILTER;
      payload: DaoFilterState['quickFilter'];
    }
  | {
      type: FilterActionTypes.SET_NETWORKS;
      payload: DaoFilterState['networks'];
    }
  | {
      type: FilterActionTypes.SET_ORDER;
      payload: DaoFilterState['order'];
    }
  | {type: FilterActionTypes.RESET; payload: DaoFilterState}
  | {type: FilterActionTypes.TOGGLE_TESTNETS; payload: boolean};

export const daoFiltersReducer = (
  state: DaoFilterState,
  action: DaoFilterAction
): DaoFilterState => {
  switch (action.type) {
    case FilterActionTypes.SET_PLUGIN_NAMES:
      return {...state, pluginNames: action.payload};
    case FilterActionTypes.SET_QUICK_FILTER:
      return {...state, quickFilter: action.payload};
    case FilterActionTypes.SET_NETWORKS:
      return {...state, networks: action.payload};
    case FilterActionTypes.RESET:
      return {...action.payload};
    case FilterActionTypes.TOGGLE_TESTNETS:
      return {...state, showTestnets: action.payload};
    case FilterActionTypes.SET_ORDER:
      return {...state, order: action.payload};
    default:
      return state;
  }
};
