import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QmVisitCustomerCreateComponent } from './qm-visit-customer-create.component';

describe('QmVisitCustomerCreateComponent', () => {
  let component: QmVisitCustomerCreateComponent;
  let fixture: ComponentFixture<QmVisitCustomerCreateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QmVisitCustomerCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QmVisitCustomerCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
