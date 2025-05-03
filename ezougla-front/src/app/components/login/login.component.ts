import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { AuthModel } from '../../model/auth.interface';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  formGroup!: FormGroup;
  placeHolderEmail: string = 'email';
  placeHolderPassword: string = 'mot de passe';
  srcImageVisible: string = './visible.svg';
  srcImageNotVisible: string = './not-visible.svg';
  srcImagePassword: string = this.srcImageNotVisible;
  type: string = 'password';
  returnUrl: string = '/';
  returnUrlRegister: string = '/';

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      inputEmail: ['', [Validators.required, Validators.email]],
      inputPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.returnUrl = this.route.snapshot.queryParams['home'] || '/';
    this.returnUrlRegister = this.route.snapshot.queryParams['register'] || '/';
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      const email = this.formGroup.get('inputEmail')?.value;
      const password = this.formGroup.get('inputPassword')?.value;
      const auth: AuthModel = {
        email: email,
        password: password
      }
      this.authService.fetchLogin(auth).subscribe({
        next: () => {
          this.router.navigateByUrl(this.returnUrl);
        },
        error: err => {
          console.error('Erreur de connexion', err);
        }
      })
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
    this.router.navigateByUrl(this.returnUrlRegister);
  }
}
