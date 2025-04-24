import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccusedTranslationHindiComponent } from './accused-translation-hindi.component';

describe('AccusedTranslationHindiComponent', () => {
  let component: AccusedTranslationHindiComponent;
  let fixture: ComponentFixture<AccusedTranslationHindiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccusedTranslationHindiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccusedTranslationHindiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
