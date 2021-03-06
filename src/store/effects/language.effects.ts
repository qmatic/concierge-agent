import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Action } from '@ngrx/store/src/models';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';

import * as LanguageActions from './../actions';
import { GlobalErrorHandler } from '../../util/services/global-error-handler.service';
import { LanguageDataService } from '../services/language/language-data.service';

const toAction = LanguageActions.toAction();

@Injectable()
export class LanguageEffects {
    constructor(
      private actions$: Actions,
      private languageDataService: LanguageDataService,
      private globalErrorHandler: GlobalErrorHandler
    ) {}

    @Effect()
    getLanguages$: Observable<Action> = this.actions$
       .pipe(
        ofType(LanguageActions.FETCH_LANGUAGES),
        switchMap((action: LanguageActions.FetchLanguages) => {
            return toAction(
               this.languageDataService.getLanguage(),
               LanguageActions.FetchLanguagesSuccess,
               LanguageActions.FetchLanguagesFail
            );
           }
         )
      );

    }