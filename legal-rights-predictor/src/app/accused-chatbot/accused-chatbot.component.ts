import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ACCUSED_PREDICT_ENDPOINT, API_URL, PREDICT_ENDPOINT } from 'src/app/constants';

@Component({
  selector: 'app-accused-chatbot',
  templateUrl: './accused-chatbot.component.html',
  styleUrls: ['./accused-chatbot.component.css']
})
export class AccusedChatbotComponent implements OnInit {

  @ViewChild('messageContainer') messageContainer?: ElementRef;
  
  userInput: string = '';
  messages: { text: any, isUser: boolean }[] = [];

  constructor(private http: HttpClient, private router: Router,private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer ) { }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.messageContainer) {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    }
  }


  ngOnInit(): void {
    if (sessionStorage.getItem('username') === null && sessionStorage.getItem('password') === null) {
      alert('Already logged out, please login first');
      this.router.navigate(['/login']);
    } 
  }

  sendMessage() {
    if (this.userInput.trim()) {
      this.messages.push({ text: this.userInput, isUser: true });
     // Call the backend API to get the response
    this.http.post(`${API_URL}${ACCUSED_PREDICT_ENDPOINT}`, { query: this.userInput })
    .subscribe((res: any) => {
      let response = res.response;
      response = response.replace(/<[^>]*>/g, '');
      let answers = response.split('Possible Answer');
      let formattedAnswers = '';
      if (answers.length > 1) {
        for (let i = 1; i < answers.length; i++) {
          let answer = answers[i].trim();
          answer = answer.replace(/Case Name/g, '<br><b>Case Name</b>');
          answer = answer.replace(/Crime Description:/g, '<br><b>Crime Description:</b>');
          answer = answer.replace(/Initial Punishment:/g, '<br><b>Initial Punishment:</b>');
          answer = answer.replace(/Reduced Punishment:/g, '<br><b>Reduced Punishment:</b>');
          answer = answer.replace(/Explanation:/g, '<br><b>Explanation:</b>');
          formattedAnswers += '<br><br><b>Possible Answer </b>' + answer;
        }
      }else{
        formattedAnswers=response;
      }
      this.messages.push({
        text: this.sanitizer.bypassSecurityTrustHtml(formattedAnswers),
        isUser: false
      });
      this.cdr.detectChanges();
      this.scrollToBottom();
    }, (error) => {
      console.error(error);
      this.messages.push({ text: 'Error: Unable to get response from the bot.', isUser: false });
      this.cdr.detectChanges();
      this.scrollToBottom();
    });
  
  this.userInput = '';

    }
  }

  saveMessages() {
    // Here you will call the backend API to send the request
   alert('save api triggered');
  }

  copyMessage(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Message copied to clipboard');
      alert('Message copied to clipboard');
    }).catch((err) => {
      console.error('Error copying message to clipboard:', err);
    });
  }

  copyAllMessages() {
    const allMessages = this.messages.map(message => `${message.isUser ? 'User' : 'Bot'}: ${message.text}`).join('\n').replace(/^\s*\n/gm, '');
  navigator.clipboard.writeText(allMessages).then(() => {
    console.log('All messages copied to clipboard');
    alert('All messages copied to clipboard');
  }).catch((err) => {
    console.error('Error copying messages to clipboard:', err);
  });
  }

    navigateToWelcome(): void {
      this.router.navigate(['/welcome'], { replaceUrl: true });
    }  

    navigateToAccusedTranslation(): void {
      this.router.navigate(['/accused-translation'], { replaceUrl: true });
    }  
  
    logout(): void {
      if (sessionStorage.getItem('username') === null && sessionStorage.getItem('password') === null) {
        alert('Already logged out');
        return;
      } 
      console.log("username - "+sessionStorage.getItem('username'));
      console.log("pwd - "+sessionStorage.getItem('token'));
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('password');
      console.log("username - "+sessionStorage.getItem('username'));
      console.log("pwd - "+sessionStorage.getItem('token'));
      this.router.navigate(['/welcome']);
    }
    
  }