import { QmFlowPanelContentComponent } from './../qm-flow-panel-content/qm-flow-panel-content.component';
import { QmFlowPanelHeaderComponent } from './../qm-flow-panel-header/qm-flow-panel-header.component';
import { QmPageHeaderComponent } from './../qm-page-header/qm-page-header.component';
import { Component, OnInit, Input } from '@angular/core';
import { ContentChild } from '@angular/core';
import { QmFlowPanelResult } from 'src/app/components/containers/qm-flow-panel-header/qm-flow-panel-result.directive';
import { Observable } from 'rxjs';
import { UserSelectors } from '../../../../store';

let _uniqueIdCounter = 0;

@Component({
  selector: 'qm-flow-panel',
  templateUrl: './qm-flow-panel.component.html',
  styleUrls: ['./qm-flow-panel.component.scss']
})
export class QmFlowPanelComponent implements OnInit {

  @ContentChild(QmFlowPanelHeaderComponent) header: QmFlowPanelHeaderComponent;
  @ContentChild(QmFlowPanelContentComponent) content: QmFlowPanelContentComponent;
  @ContentChild(QmFlowPanelResult) resultContainer: QmFlowPanelResult;

  index: number = _uniqueIdCounter++;
  id: string = `qm-flow-panel-${this.index}`;
  userDirection$: Observable<string>;

  constructor(  private userSelectors: UserSelectors) { }

  @Input()
  headerVisibilityOverridden : boolean;

  @Input()
  title: string;

  @Input()
  isPanelExpanded: boolean;

  @Input()
  isContentVisible: boolean;

  @Input()
  isHeaderVisible: boolean;

  @Input()
  result: string;

  @Input()
  get isShowExitFlow(): boolean {
    return this._isShowExitFlow;
  }

  set isShowExitFlow(isShow: boolean) {
    this._isShowExitFlow = isShow;
    if(this.header) {
      this.header.isShowExitFlow = isShow;
    }
  }

  private _isActive: boolean;
  private _isShowExitFlow: boolean;


  get isActive(): boolean {
    return this._isActive;
  }
  
  @Input()
  set isActive(isActive: boolean) {
    this._isActive = isActive;
    if(this.header) {
      this.header.isActive = isActive;
    }
  }

  hasResult() {
    return this.resultContainer 
           && this.resultContainer.result 
           && this.resultContainer.result.length > 0;
  }

  ngOnInit() {
    this.userDirection$ = this.userSelectors.userDirection$;   
  }
}
