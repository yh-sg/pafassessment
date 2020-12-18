import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup

	errorMessage = 'Please enter valid username/password'

	constructor(private fb:FormBuilder, private athenticationSvc:AuthenticationService, private router:Router) { }

	ngOnInit(): void {
    this.form = this.fb.group({
      username: this.fb.control('',[Validators.required]),
      password: this.fb.control('', [Validators.required]),
    })
   }

   login(){
     console.log(this.form.value);
     let username = this.form.get("username").value;
     let password = this.form.get("password").value;
     this.athenticationSvc.getUser({username,password})
     .then(result => {
      console.log(result)
      this.router.navigate([`/main`])
    })
    .catch(error => {
       console.log(error)
       this.errorMessage = error.message
    })

   }

}
