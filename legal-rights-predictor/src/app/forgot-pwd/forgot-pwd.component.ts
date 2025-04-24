import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-pwd',
  templateUrl: './forgot-pwd.component.html',
  styleUrls: ['./forgot-pwd.component.css']
})
export class ForgotPwdComponent implements OnInit {

  constructor(private router: Router,private http: HttpClient) { }

  ngOnInit(): void {
  }

  navigateToWelcome(){
    this.router.navigate(['/welcome'], { replaceUrl: true });
  }

  updatePwd(email: string, newpassword: string): void {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)){
      alert('email format invalid');
      return;
    }

    const userData = {
      email: email,
      new_pwd: newpassword
    };
  
    this.http.post('http://localhost:8081/update-pwd', userData)
      .subscribe(response => {
        console.log(response);
        alert('Password updated successfully');
        this.router.navigate(['/login'], { replaceUrl: true });
      }, error => {
        console.error(error);
        alert('Invalid email or password');
      });
  }

}
