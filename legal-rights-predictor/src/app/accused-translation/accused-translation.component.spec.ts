import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccusedTranslationComponent } from './accused-translation.component';

describe('AccusedTranslationComponent', () => {
  let component: AccusedTranslationComponent;
  let fixture: ComponentFixture<AccusedTranslationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccusedTranslationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccusedTranslationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
