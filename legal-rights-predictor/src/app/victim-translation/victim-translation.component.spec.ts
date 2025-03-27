import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VictimTranslationComponent } from './victim-translation.component';

describe('VictimTranslationComponent', () => {
  let component: VictimTranslationComponent;
  let fixture: ComponentFixture<VictimTranslationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VictimTranslationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VictimTranslationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
