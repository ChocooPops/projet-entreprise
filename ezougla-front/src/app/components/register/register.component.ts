import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterModel } from '../../model/register.interface';
import { UserService } from '../../services/user/user.service';
import { ProjectService } from '../../services/project/project.service';
import { MessageApiModel } from '../../model/message-api.interface';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  formGroup!: FormGroup;
  placeHolderEmail: string = 'email';
  placeHolderPassword: string = 'mot de passe';
  srcImageVisible: string = './visible.svg';
  srcImageNotVisible: string = './not-visible.svg';
  srcImagePassword: string = this.srcImageNotVisible;
  type: string = 'password';
  message: string = '';

  constructor(private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private projectService : ProjectService
  ) { }

  ngOnInit(): void {
    this.userService.resetUser();
    this.projectService.resetProjects();
    this.formGroup = this.fb.group({
      inputFirstName: ['', [Validators.required]],
      inputLastName: ['', [Validators.required]],
      inputEmail: ['', [Validators.required, Validators.email]],
      inputPassword: ['', [Validators.required, Validators.minLength(6)]],
      inputValidatePassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    const firstName = this.formGroup.get('inputFirstName')?.value;
    const lastName = this.formGroup.get('inputLastName')?.value;
    const email = this.formGroup.get('inputEmail')?.value;
    const password = this.formGroup.get('inputPassword')?.value;
    const validatePassword = this.formGroup.get('inputValidatePassword')?.value;

    if (this.formGroup.valid) {
      if (password !== validatePassword) {
        this.message = 'mots de passe invalide';
      } else {
        console.log('dddddd');
        this.message = '';
        const register: RegisterModel = {
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password
        }
        this.userService.fetchRegister(register).subscribe((data: MessageApiModel) => {
          this.message = data.message;
        })
      }
    } else {
      this.message = 'Formulaire invalide'
    }
  }

  onClickVisibilityPassword(): void {
    if (this.type === 'password') {
      this.type = 'text';
      this.srcImagePassword = this.srcImageVisible;
    } else {
      this.type = 'password';
      this.srcImagePassword = this.srcImageNotVisible;
    }
  }

  onClickLogin() {
    this.router.navigate(['login']);
  }
}
