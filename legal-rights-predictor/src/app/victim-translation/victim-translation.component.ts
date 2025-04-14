import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { API_URL, PREDICT_MARATHI_ENDPOINT, TRANSLATE_MARATHI_ENDPOINT } from 'src/app/constants';

@Component({
  selector: 'app-victim-translation',
  templateUrl: './victim-translation.component.html',
  styleUrls: ['./victim-translation.component.css']
})
export class VictimTranslationComponent implements OnInit {

  @ViewChild('messageContainer') messageContainer?: ElementRef;
  
  userInput: string = '';
  messages: { text: any, isUser: boolean }[] = [];

  constructor(private http: HttpClient, private router: Router,private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) { }

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
      this.http.post(`${API_URL}${PREDICT_MARATHI_ENDPOINT}`, { query: this.userInput })
      .subscribe((res: any) => {
        let response = res.response;
        response = response.replace(/<[^>]*>/g, '');
        let answers = response.split('Possible Answer');
        let formattedAnswers = '';
        let response_mr='';
        if (answers.length > 1) {
          for (let i = 1; i < answers.length; i++) {
            let answer = answers[i].trim();
            answer = answer.replace(/According to BNS Section/g, '<br><b>According to BNS Section</b>');
            answer = answer.replace(/Title:/g, '<br><b>Title:</b>');
            answer = answer.replace(/Description:/g, '<br><b>Description:</b>');
            answer = answer.replace(/Punishment:/g, '<br><b>Punishment:</b>');
            formattedAnswers += '<br><br><b>Possible Answer </b>' + answer;
          }
        }else{
          formattedAnswers=response;
          this.messages.push({ text: formattedAnswers, isUser: false });
          return;
        }

         // Call the backend API to get the mr response
         this.http.post(`${API_URL}${TRANSLATE_MARATHI_ENDPOINT}`, { query: formattedAnswers })
         .subscribe((res: any) => {
          response_mr = res.response;
          this.messages.push({ text: this.sanitizer.bypassSecurityTrustHtml(response_mr), isUser: false });
          this.cdr.detectChanges();
          this.scrollToBottom();
         }, (error) => {
          console.error(error);
          this.messages.push({ text: 'Error: Unable to get response from the bot.', isUser: false });
          this.cdr.detectChanges();
          this.scrollToBottom();
        });

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

    navigateToVictimTranslation(): void {
      this.router.navigate(['/victim-translation'], { replaceUrl: true });
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
