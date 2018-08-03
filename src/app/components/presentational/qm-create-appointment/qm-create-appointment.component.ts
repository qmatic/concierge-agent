import { Subscription } from 'rxjs';
import { BranchSelectors } from './../../../../store/services/branch/branch.selectors';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IBranch } from 'src/models/IBranch';
import { FLOW_TYPE } from '../../../../util/flow-state';

@Component({
  selector: 'qm-qm-create-appointment',
  templateUrl: './qm-create-appointment.component.html',
  styleUrls: ['./qm-create-appointment.component.scss']
})
export class QmCreateAppointmentComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();
  selectedBranch: IBranch = new IBranch();
  flowType = FLOW_TYPE.CREATE_APPOINTMENT;

  constructor(private branchSelectors: BranchSelectors) {

    const selectedBranchSub = this.branchSelectors.selectedBranch$.subscribe((sb) => {
      this.selectedBranch = sb;
    });

    this.subscriptions.add(selectedBranchSub);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}