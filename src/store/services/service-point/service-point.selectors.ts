import { IServicePointState } from './../../reducers/service-point.reducer';
import { Injectable } from '@angular/core';
import { Store, createSelector, createFeatureSelector } from '@ngrx/store';

import { IAppState } from '../../reducers';
import { IServiceState } from '../../reducers/service.reducer';
import { IService } from '../../../models/IService';
import { IServiceGroup } from '../../../models/IServiceGroup';
import { IServiceGroupList } from '../../../models/IServiceGroupList';
import { IServicePoint } from '../../../models/IServicePoint';

// selectors
const getServicePointState = createFeatureSelector<IServicePointState>('servicePoints');

const getAllServicePoints = createSelector(
  getServicePointState,
  (state: IServicePointState) => state.servicePoints
);

const getOpenServicePoint = createSelector(
  getServicePointState,
  (state: IServicePointState) => state.openServicePoint
);

const getPreviousServicePoint = createSelector(
  getServicePointState,
  (state: IServicePointState) => state.previousServicePoint
);

const getUttParameters = createSelector(
  getOpenServicePoint,
  (state: IServicePoint) => {
    if(state === null){
      return null
    }
    return state.parameters
  }
);

@Injectable()
export class ServicePointSelectors {
  constructor(private store: Store<IAppState>) {}
  // selectors$
  previousServicePoint$ = this.store.select(getPreviousServicePoint)
  servicePoints$ = this.store.select(getAllServicePoints); 
  openServicePoint$ = this.store.select(getOpenServicePoint);  
  uttParameters$ = this.store.select(getUttParameters);
}
