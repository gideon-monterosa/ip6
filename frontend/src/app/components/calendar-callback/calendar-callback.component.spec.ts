import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarCallbackComponent } from './calendar-callback.component';

describe('CalendarCallbackComponent', () => {
  let component: CalendarCallbackComponent;
  let fixture: ComponentFixture<CalendarCallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarCallbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
