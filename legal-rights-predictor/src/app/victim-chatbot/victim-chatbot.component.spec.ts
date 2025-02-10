import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VictimChatbotComponent } from './victim-chatbot.component';

describe('VictimChatbotComponent', () => {
  let component: VictimChatbotComponent;
  let fixture: ComponentFixture<VictimChatbotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VictimChatbotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VictimChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
