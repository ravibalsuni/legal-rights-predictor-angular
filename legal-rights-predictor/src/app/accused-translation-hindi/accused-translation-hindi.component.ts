import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ACCUSED_PREDICT_HINDI_ENDPOINT, ACCUSED_PREDICT_MARATHI_ENDPOINT, ACCUSED_TRANSLATE_HINDI_ENDPOINT, ACCUSED_TRANSLATE_MARATHI_ENDPOINT, API_URL, PREDICT_MARATHI_ENDPOINT, SAVE_CHAT_ENDPOINT, TRANSLATE_MARATHI_ENDPOINT } from 'src/app/constants';


@Component({
  selector: 'app-accused-translation-hindi',
  templateUrl: './accused-translation-hindi.component.html',
  styleUrls: ['./accused-translation-hindi.component.css']
})
export class AccusedTranslationHindiComponent implements OnInit {

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
       this.http.post(`${API_URL}${ACCUSED_PREDICT_HINDI_ENDPOINT}`, { query: this.userInput })
       .subscribe((res: any) => {
         let response = res.response;
         response = response.replace(/<[^>]*>/g, '');
         let answers = response.split('Possible Answer');
         let formattedAnswers = '';
         let response_mr='';
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
           this.messages.push({ text: formattedAnswers, isUser: false });
           return;
         }
 
          // Call the backend API to get the mr response
          this.http.post(`${API_URL}${ACCUSED_TRANSLATE_HINDI_ENDPOINT}`, { query: formattedAnswers })
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
       const allMessages = this.messages.map(message => `${message.isUser ? 'User' : 'Bot'}: ${message.text}`).join('\n').replace(/^\s*\n/gm, '');
       fetch(`${API_URL}${SAVE_CHAT_ENDPOINT}`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ messages: allMessages })
       })
       .then(response => response.json())
       .then(data => {
         console.log('Messages saved successfully:', data);
         alert('Messages saved successfully');
       })
       .catch(error => {
         console.error('Error saving messages:', error);
       });
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
 
     navigateToAccusedTranslationMarathi(): void {
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
 
