import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environnments/environments';
import { RegisterModel } from '../../model/register.interface';
import { catchError, map, Observable, of } from 'rxjs';
import { MessageModel } from '../../model/message.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  private readonly apiUrlRegister: string = `${environment.apiUrl}/${environment.apiUrlUser}/${environment.apiUrlRegister}`;

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

}
