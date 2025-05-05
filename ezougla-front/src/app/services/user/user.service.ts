import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environnments/environments';
import { RegisterModel } from '../../model/register.interface';
import { catchError, map, Observable, of } from 'rxjs';
import { MessageModel } from '../../model/message.interface';
import { UserModel } from '../../model/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  private readonly apiUrlRegister: string = `${environment.apiUrl}/${environment.apiUrlUser}/${environment.apiUrlRegister}`;
  private readonly apiUrlGetUser : string = `${environment.apiUrl}/${environment.apiUrlUser}/${environment.apiUrlFindUser}`;
  
  private user : UserModel | undefined;


  public fetchRegister(register: RegisterModel): Observable<MessageModel> {
    return this.http.post<any>(`${this.apiUrlRegister}`, register).pipe(
      map((data: MessageModel) => {
        return data
      }),
      catchError((error) => {
        return of(
          { message: 'Connection impossible avec le serveur' }
        )
      })
    )
  }

  public fetchGetUserConnected() : Observable<UserModel> {
    if(!this.user) {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem(environment.access_token)}`
      };
      return this.http.get<any>(this.apiUrlGetUser, { headers}).pipe(
        map((data : any) => {
            this.user = {
              id : data.id, 
              firstName : data.firstName,
              lastName : data.lastName,
              email : data.email,
              role : data.role,
              creationDate : data.createdAt
            }
            return this.user;
        })
      )
    } else {
      return of(this.user);
    }
  }

}
