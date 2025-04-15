import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccusedChatbotComponent } from './accused-chatbot.component';

describe('AccusedChatbotComponent', () => {
  let component: AccusedChatbotComponent;
  let fixture: ComponentFixture<AccusedChatbotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccusedChatbotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccusedChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
