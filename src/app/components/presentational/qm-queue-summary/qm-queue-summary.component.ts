import { QueueSelectors } from 'src/store';
import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'qm-queue-summary',
  templateUrl: './qm-queue-summary.component.html',
  styleUrls: ['./qm-queue-summary.component.scss']
})
export class QmQueueSummaryComponent implements OnInit {

  private subscriptions: Subscription = new Subscription();
  isQuickServeEnable: boolean;

  public queueSummary: any;

  constructor(
    private queueSelectors: QueueSelectors
  ) {
    const queueSubscription = this.queueSelectors.queueSummary$.subscribe((qs) => {
      this.queueSummary = qs;
    });

    this.subscriptions.add(queueSubscription);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
