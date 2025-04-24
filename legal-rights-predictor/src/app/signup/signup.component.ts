import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  constructor(private router: Router,private http: HttpClient) { }

  ngOnInit(): void {
  }

  signup(firstname: string, lastname: string, gender:string, email:string, pwd:string, rpwd:string): void {
    if (pwd !== rpwd) {
      alert('Passwords do not match');
      return;
    }  
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)){
      alert('email format invalid');
      return;
    }
    const userData = {
      firstName: firstname,
      lastName: lastname,
      email: email,
      pwd: pwd,
      gender: gender
    };

    this.http.post('http://localhost:8081/signup', userData)
    .subscribe(response => {
      console.log(response);
      alert('User created successfully');
      sessionStorage.setItem('username', email);
      sessionStorage.setItem('password', pwd);
      this.navigateToWelcome();
    }, error => {
      console.error(error);
      alert('Error creating user '+error.error.message);
    });
  }

  navigateToWelcome(){
    this.router.navigate(['/welcome'], { replaceUrl: true });
  }

}