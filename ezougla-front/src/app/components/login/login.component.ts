import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { AuthModel } from '../../model/auth.interface';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { ProjectService } from '../../services/project/project.service';

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
    private router: Router,
    private userService: UserService,
    private projectService: ProjectService
  ) { }

  ngOnInit(): void {
    this.userService.resetUser();
    this.projectService.resetProjects();
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
          this.router.navigate(['main']);
        },
        error: err => {
          if (err.status === 401) {
            this.message = "Votre compte n'est pas activé ou a été désactivé";
          } else if (err.status === 404) {
            this.message = 'Identifiant ou mot de passe incorrect.';
          } else {
            this.message = 'Une erreur est survenue. Veuillez réessayer plus tard.';
          }
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
