import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    const username = sessionStorage.getItem('username');
    const token = sessionStorage.getItem('token');
  }

  login(username: string, password: string): void {

    if (sessionStorage.getItem('username') != null && sessionStorage.getItem('password') != null) {
      alert('Already logged in, going to home page.');
      this.router.navigate(['/welcome']);
    } 
  
    if (username === 'demo' && password === 'demo') {
      sessionStorage.setItem('username', username);
      sessionStorage.setItem('password', password);
      this.router.navigate(['/welcome']);
    } else {
      alert('Invalid username or password');
    }
  }

  onSubmit(): void {
    
  }

}
