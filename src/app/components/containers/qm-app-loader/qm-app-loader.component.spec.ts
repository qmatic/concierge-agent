import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QmAppLoaderComponent } from './qm-app-loader.component';

describe('QmAppLoaderComponent', () => {
  let component: QmAppLoaderComponent;
  let fixture: ComponentFixture<QmAppLoaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QmAppLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QmAppLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
