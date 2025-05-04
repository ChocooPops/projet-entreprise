import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { AuthModel } from '../../model/auth.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  formGroup!: FormGroup;
  placeHolderEmail: string = 'email';
  placeHolderPassword: string = 'mot de passe';
  srcImageVisible: string = './visible.svg';
  srcImageNotVisible: string = './not-visible.svg';
  srcImagePassword: string = this.srcImageNotVisible;
  type: string = 'password';
  message: string = '';

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      inputEmail: ['', [Validators.required, Validators.email]],
      inputPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      const email = this.formGroup.get('inputEmail')?.value;
      const password = this.formGroup.get('inputPassword')?.value;
      const auth: AuthModel = {
        email: email,
        password: password
      }
      this.message = '';
      this.authService.fetchLogin(auth).subscribe({
        next: () => {
          this.router.navigate(['home']);
        },
        error: err => {
          this.message = 'Identifiant ou mots de passe invalide';
        }
      })
    } else {
      this.message = 'Formulaire invalide';
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

  onClickRegister() {
    this.router.navigate(['register']);
  }
}
