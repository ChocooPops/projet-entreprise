import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environnments/environments';
import { AuthModel } from '../../model/auth.interface';
import { catchError, map } from 'rxjs';
import { TokenModel } from '../../model/token.interface';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  private readonly apiUrlLogin = `${environment.apiUrl}/${environment.apiUrlAuth}/${environment.apiUrlLogin}`;
  private readonly apiUrlRegister = `${environment.apiUrl}/${environment.apiUrlAuth}/${environment.apiUrlRegister}`;
  private nameStorageToken: string = 'acces_token'

  public fetchLogin(auth: AuthModel) {
    return this.http.get<any>('http://localhost:3000').pipe(
      map((data: any) => {
        console.log(data)
      }),
      catchError((error) => {
        throw error;
      })
    )
  }

  public fetchRegister(auth: AuthModel) {
    return this.http.put<any>(`${this.apiUrlRegister}`, auth).pipe(
      map((data: TokenModel) => {
        localStorage.setItem(this.nameStorageToken, data.access_token);
      }),
      catchError((error) => {
        throw error;
      })
    )
  }

  private jwtHelper = new JwtHelperService();

  getToken(): string | null {
    return localStorage.getItem(this.nameStorageToken);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token != null && !this.jwtHelper.isTokenExpired(token);
  }

  logout(): void {
    localStorage.removeItem(this.nameStorageToken);
  }

}
