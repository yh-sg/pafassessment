import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import {CameraService} from '../camera.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

	form: FormGroup
	uploadedImg;

	imagePath = '/assets/cactus.png'

	constructor(private router:Router ,private cameraSvc: CameraService, private fb:FormBuilder, private athenticationSvc:AuthenticationService) { }

	ngOnInit(): void {
	  if (this.cameraSvc.hasImage()) {
		  const img = this.cameraSvc.getImage()
		  this.imagePath = img.imageAsDataUrl
	  }

	  this.form = this.fb.group({
		title: this.fb.control('',[Validators.required]),
		comments: this.fb.control('', [Validators.required]),
	  })
	
	}

	share(){
		const formData = new FormData();

		let data = this.athenticationSvc.getUserAndPassword()
		let username = data[0]
		let password = data[1]
		console.log(username);

		formData.set('username', username);
		formData.set('password', password);
		formData.set('title', this.form.get('title').value);
		formData.set('comments', this.form.get('comments').value);
		formData.set('tempimg', this.cameraSvc.image.imageData);

		this.athenticationSvc.upload(formData)
		.then(result => {
			console.log(result)
			this.form.reset();
			this.imagePath = '/assets/cactus.png'
			this.uploadedImg = this.cameraSvc.getImage().imageAsDataUrl
		  })
		  .catch(error => {
			 console.log(error)
			 this.router.navigate([`/`])
		  })
	  }

	clear() {
		this.imagePath = '/assets/cactus.png'
	}
}
