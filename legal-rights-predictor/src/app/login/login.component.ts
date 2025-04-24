import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router,private http: HttpClient) { }

  ngOnInit(): void {
    const username = sessionStorage.getItem('username');
    const token = sessionStorage.getItem('token');
  }

  login(username: string, password: string): void {

    if (sessionStorage.getItem('username') != null && sessionStorage.getItem('password') != null) {
      alert('Already logged in, going to home page.');
      this.router.navigate(['/welcome']);
    } else{
      const userData = {
        username: username,
        password: password
      };
      this.http.post('http://localhost:8081/login', userData)
      .subscribe(response => {
        console.log(response);
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('password', password);
        this.router.navigate(['/welcome']);
      }, error => {
        console.error(error);
        alert('Invalid email or password');
      });
      
    }
  }

  navigateToWelcome(){
    this.router.navigate(['/welcome'], { replaceUrl: true });
  }

}
