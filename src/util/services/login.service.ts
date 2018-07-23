import { ToastService } from './toast.service';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { SPService } from '../services/rest/sp.service';
import { USER_STATE } from '../q-state';
import { NativeApiService } from '../services/native-api.service'
import { IUserStatus } from '../../models/IUserStatus';
import { BranchSelectors, UserSelectors, ServicePointDispatchers, UserStatusDispatchers, QueueDispatchers } from 'src/store';
import { Subscription } from 'rxjs';
import { IBranch } from '../../models/IBranch';
import { IServicePoint } from '../../models/IServicePoint';
import { IAccount } from '../../models/IAccount';
import { Router } from '@angular/router';

@Injectable()
export class LoginService {
    private subscriptions: Subscription = new Subscription();
    private selectedBranch: IBranch;
    private selectedServicePoint: IServicePoint;
    private user: IAccount

    constructor(
        private spService: SPService,
        private translateService: TranslateService,
        private toastService: ToastService,
        private nativeApi: NativeApiService,
        private branchSelectors: BranchSelectors,
        private userSelectors: UserSelectors,
        private servicePointDispatchers: ServicePointDispatchers,
        private router: Router,
        private userStatusDispatcher: UserStatusDispatchers,
        private queueDispatchers: QueueDispatchers
    ) {
        const branchSubscription = this.branchSelectors.selectedBranch$.subscribe((branch) => this.selectedBranch = branch);
        this.subscriptions.add(branchSubscription);

        const userSubscription = this.userSelectors.user$.subscribe((user) => this.user = user);
        this.subscriptions.add(userSubscription);
    }

    login(servicePoint: IServicePoint) {
        this.selectedServicePoint = servicePoint;
        this.spService.fetchUserStatus().subscribe((status: IUserStatus) => {
            if(status !=  null){
                if(status.userState === USER_STATE.NO_STARTED_USER_SESSION || status.userState === USER_STATE.NO_STARTED_SERVICE_POINT_SESSION){
                    this.confirm();
                }
                else{
                    this.confirm();
                    // this.translateService.get('ongoing_session').subscribe(
                    //     (label) => {
                    //     this.toastService.infoToast(label);
                    //     }
                    // );
                }
            }
        })
    }

    // #147095379 - Remove work profile id when user login to concierge
    resetUserSession(){
        this.spService.removeWorkProfile(this.selectedBranch, this.user).subscribe((status: IUserStatus) => {
            this.userStatusDispatcher.setUserStatus(status);
        });
    }

    confirm(){
        this.spService.login(this.selectedBranch, this.selectedServicePoint, this.user).subscribe((status: IUserStatus) => {
            if(status){
                this.userStatusDispatcher.setUserStatus(status);
                if(status.workProfileId != null){
                    this.resetUserSession();
                }
                this.queueDispatchers.fetchQueueInfo(this.selectedBranch.id);
                this.servicePointDispatchers.setOpenServicePoint(this.selectedServicePoint);
                this.router.navigate(['home']);
            }
        })
    }
}