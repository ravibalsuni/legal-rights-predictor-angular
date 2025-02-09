import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  showAlert(): void {
    alert('This is the future scope of the project');
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem('username') != null && sessionStorage.getItem('password') != null;
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