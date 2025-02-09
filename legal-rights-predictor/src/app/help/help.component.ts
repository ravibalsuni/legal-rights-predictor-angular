import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
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
