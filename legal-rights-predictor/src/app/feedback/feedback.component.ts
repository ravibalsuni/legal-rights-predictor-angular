import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl,Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {

  feedbackForm: FormGroup;

  constructor(private formBuilder: FormBuilder,private router: Router) {
    this.feedbackForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
   }

  ngOnInit(): void {
    this.feedbackForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', Validators.required)
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


  submitFeedback(): void {
    console.log("form data"+this.feedbackForm.value);
    // Add your feedback submission logic here
  }

  submitFeedbackForm(name: string, email: string, message: string): void {
    console.log("name - "+name);
    if(name == '' || email == '' || message == ''){
      alert("invalid form data");
      this.router.navigate(['/feedback']);
    }
    else{
      alert('data submitted!');
      this.router.navigate(['/welcome']);
    }
  }

}
