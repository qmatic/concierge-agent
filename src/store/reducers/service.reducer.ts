import { IService } from '../../models/IService';
import * as ServiceActions from '../actions';
import { IServiceGroup } from '../../models/IServiceGroup';
import { IServiceConfiguration } from '../../models/IServiceConfiguration';

export interface IServiceState {
  services: IService[];
  servicesConfiguration: IServiceConfiguration[];
  serviceGroups: IServiceGroup[];
  selectedServices: IService[];
  searchText: string;
  loading: boolean;
  loaded: boolean;
  error: Object;
  serviceLoaded: boolean;
}

export const initialState: IServiceState = {
  services: [],
  servicesConfiguration: [],
  serviceGroups: [],
  selectedServices: [],
  searchText: '',
  loading: false,
  loaded: false,
  error: null,
  serviceLoaded: false
};

export function reducer (
  state: IServiceState = initialState,
  action: ServiceActions.AllServiceActions
): IServiceState {
  switch (action.type) {
    case ServiceActions.FETCH_SERVICES: {
      return {
        ...state,
        loading: true,
        error: null
      };
    }
    case ServiceActions.FETCH_SERVICES_SUCCESS: {
      return {
        ...state,
        services: sortServices(action.payload),
        loading: false,
        loaded: true,
        error: null,
        serviceLoaded: true
      };
    }
    case ServiceActions.FETCH_SERVICES_FAIL: {
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    }
    case ServiceActions.FETCH_SERVICE_CONFIGURATION: {
      return {
        ...state,
        loading: true,
        error: null
      };
    }
    case ServiceActions.FETCH_SERVICE_CONFIGURATION_SUCCESS: {
      return {
        ...state,
        servicesConfiguration: sortConfigServices(action.payload),
        loading: false,
        loaded: true,
        error: null
      };
    }
    case ServiceActions.FETCH_SERVICE_CONFIGURATION_FAIL: {
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    }
    case ServiceActions.SET_SELECTED_SERVICES: {
      return {
        ...state,
        selectedServices: action.payload
      };
    }
    case ServiceActions.REMOVE_FETCH_SERVICE_LIST: {
      return {
        ...state,
        services: [],
        servicesConfiguration: [],
        serviceLoaded: false
      };
    }
    default: {
        return state;
    }
  }
}

/**
 * Sort services alphabetically
 * @param serviceList Fetched serviceList
 */
function sortServices(serviceList: IService[]): IService[] {
  return serviceList.slice().sort(
    (service1: IService, service2: IService) => {
      if (service1.internalName.toLowerCase() < service2.internalName.toLowerCase() ) { return -1; }
      if (service1.internalName.toLowerCase() > service2.internalName.toLowerCase() ) { return 1; }
      return 0;
    }
  );
}

function sortConfigServices(serviceList: IServiceConfiguration[]): IServiceConfiguration[] {
  return serviceList.slice().sort(
    (service1: IServiceConfiguration, service2: IServiceConfiguration) => {
      if (service1.internalName.toLowerCase() < service2.internalName.toLowerCase() ) { return -1; }
      if (service1.internalName.toLowerCase() > service2.internalName.toLowerCase() ) { return 1; }
      return 0;
    }
  );
}

