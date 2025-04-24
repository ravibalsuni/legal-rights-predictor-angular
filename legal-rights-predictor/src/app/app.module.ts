import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { LoginComponent } from './login/login.component';
import { DocumentsComponent } from './documents/documents.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HelpComponent } from './help/help.component';
import { VictimChatbotComponent } from './victim-chatbot/victim-chatbot.component';
import { VictimTranslationComponent } from './victim-translation/victim-translation.component';
import { AccusedChatbotComponent } from './accused-chatbot/accused-chatbot.component';
import { AccusedTranslationComponent } from './accused-translation/accused-translation.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPwdComponent } from './forgot-pwd/forgot-pwd.component';
import { AccusedTranslationHindiComponent } from './accused-translation-hindi/accused-translation-hindi.component';
import { VictimTranslationHindiComponent } from './victim-translation-hindi/victim-translation-hindi.component';

const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'documents', component: DocumentsComponent },
  { path: 'feedback', component: FeedbackComponent },
  { path: 'help', component: HelpComponent },
  { path: 'victim-chatbot', component: VictimChatbotComponent },
  { path: 'victim-translation', component: VictimTranslationComponent },
  { path: 'accused-chatbot', component: AccusedChatbotComponent },
  { path: 'accused-translation', component: AccusedTranslationComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPwdComponent },
  { path: 'accused-translation-hindi', component: AccusedTranslationHindiComponent },
  { path: 'victim-translation-hindi', component: VictimTranslationHindiComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    LoginComponent,
    DocumentsComponent,
    FeedbackComponent,
    HelpComponent,
    VictimChatbotComponent,
    VictimTranslationComponent,
    AccusedChatbotComponent,
    AccusedTranslationComponent,
    SignupComponent,
    ForgotPwdComponent,
    AccusedTranslationHindiComponent,
    VictimTranslationHindiComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }