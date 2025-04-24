import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VictimTranslationHindiComponent } from './victim-translation-hindi.component';

describe('VictimTranslationHindiComponent', () => {
  let component: VictimTranslationHindiComponent;
  let fixture: ComponentFixture<VictimTranslationHindiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VictimTranslationHindiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VictimTranslationHindiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
