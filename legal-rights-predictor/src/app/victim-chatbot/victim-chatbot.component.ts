import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-victim-chatbot',
  templateUrl: './victim-chatbot.component.html',
  styleUrls: ['./victim-chatbot.component.css']
})
export class VictimChatbotComponent implements OnInit {

  @ViewChild('messageContainer') messageContainer?: ElementRef;
  
  userInput: string = '';
  messages: { text: string, isUser: boolean }[] = [];

  constructor(private http: HttpClient, private router: Router,private cdr: ChangeDetectorRef) { }

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
      // Here you will call the backend API to get the response
      this.messages.push({ text: 'This is a dummy response from the bot.', isUser: false });
      this.userInput = '';
      this.cdr.detectChanges();
      this.scrollToBottom();
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

