import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environnments/environments';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { ConversationModel } from '../../model/conversation.interface';
import { MessageModel } from '../../model/message.interface';
import { CreateFileModel } from '../../model/create-file.interface';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

  constructor(private http: HttpClient) { }

  private apiUrlMessage: string = `${environment.apiUrl}/${environment.apiUrlMessage}`;
  private apiUrlGetAllConversation: string = `${environment.apiUrl}/${environment.apiUrlMessage}/${environment.apiUrlGeAllConversationByProject}`;
  private apiUrlGetAllMessage: string = `${environment.apiUrl}/${environment.apiUrlMessage}/${environment.apiUrlGetAllMessagesByConversation}`;
  private apiUrlCreateConversation: string = `${environment.apiUrl}/${environment.apiUrlMessage}/${environment.apiUrlCreateEmptyConversation}`;
  private apiUrlUpdateName: string = `${environment.apiUrl}/${environment.apiUrlMessage}/${environment.apiUrlUpdateNameConversation}`;
  private apiUrlSendMessage: string = `${environment.apiUrl}/${environment.apiUrlMessage}/${environment.apiUrlAddMessage}`;
  private apiUrlSendFileMessage: string = `${environment.apiUrl}/${environment.apiUrlMessage}/${environment.apiUrlAddFileMessage}`;
  private apiUrlSendMessageToMistral: string = `${environment.apiUrl}/${environment.apiUrlMessage}/${environment.apiUrlSendMessageToMistralAI}`;
  private apiUrlAnalyseConversationByMistral: string = `${environment.apiUrl}/${environment.apiUrlMessage}/${environment.apiUrlAnalyseConversationByMistral}`;

  private conversationsSubject: BehaviorSubject<ConversationModel[]> = new BehaviorSubject<ConversationModel[]>([]);
  private conversations$: Observable<ConversationModel[]> = this.conversationsSubject.asObservable();

  public getConversationsSubject(): Observable<ConversationModel[]> {
    return this.conversations$;
  }

  fetchAllConversation(projectId: string): Observable<any> {
    const conversations: ConversationModel[] = this.conversationsSubject.value.filter((item) => item.projectId === projectId);
    if (conversations.length <= 0) {
      return this.http.get<any[]>(`${this.apiUrlGetAllConversation}/${projectId}`).pipe(
        map((data: any[]) => {
          const conv: ConversationModel[] = this.conversationsSubject.value;
          data.forEach((conversation) => {
            conv.push(conversation);
          })
          this.conversationsSubject.next(conv);
        })
      )
    } else {
      return of()
    }
  }

  fetchAllMessageByConversation(conversationId: string): Observable<MessageModel[]> {
    const conversation: ConversationModel | undefined = this.conversationsSubject.value.find((item) => item.id === conversationId);
    if (!conversation || !conversation.messages || conversation.messages.length <= 0) {
      return this.http.get<any[]>(`${this.apiUrlGetAllMessage}/${conversationId}`).pipe(
        map((data: MessageModel[]) => {
          const conversations: ConversationModel[] = this.conversationsSubject.value;
          const index: number = conversations.findIndex((item) => item.id === conversationId);
          conversations[index].messages = [];
          data.forEach((message) => {
            conversations[index].messages.push(message);
          })
          this.conversationsSubject.next(conversations);
          return conversations[index].messages;
        })
      )
    } else {
      return of(conversation.messages)
    }
  }

  fetchCreateNewConversation(projectId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrlCreateConversation}/${projectId}`, {}).pipe(
      map((data: ConversationModel) => {
        const conversations: ConversationModel[] = this.conversationsSubject.value;
        conversations.push(data);
        this.conversationsSubject.next(conversations);
      })
    )
  }

  fetchUpdateTitleConversation(conversationId: string, title: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrlUpdateName}/${conversationId}`, { title }).pipe(
      map((data: ConversationModel) => {
        const conversations: ConversationModel[] = this.conversationsSubject.value;
        const index: number = conversations.findIndex((item) => item.id === data.id);
        if (index >= 0) {
          conversations[index].title = data.title;
          this.conversationsSubject.next(conversations);
        }
      })
    )
  }

  fetchSendNewMessage(conversationId: string, content: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrlSendMessage}/${conversationId}`, { content }).pipe(
      map((data: MessageModel) => {
        const conversations: ConversationModel[] = this.conversationsSubject.value;
        const index: number = conversations.findIndex((item) => item.id === data.conversationId);
        if (index >= 0) {
          conversations[index].messages.push(data);
          this.conversationsSubject.next(conversations);
        }
      }),
      catchError((error) => {
        return of();
      })
    )
  }

  fetchSendMessageToMistralAI(conversationId: string, content: string, files: CreateFileModel[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrlSendMessageToMistral}/${conversationId}`, { content, files }).pipe(
      map((data: MessageModel[]) => {
        const conversations: ConversationModel[] = this.conversationsSubject.value;
        const index: number = conversations.findIndex((item) => item.id === conversationId);
        if (index >= 0) {
          data.forEach((message) => {
            conversations[index].messages.push(message);
          })
        }
        this.conversationsSubject.next(conversations);
      }),
      catchError((error) => {
        return of();
      })
    )
  }

  fetchSendNewFileMessage(conversationId: string, files: CreateFileModel[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrlSendFileMessage}/${conversationId}`, { files }).pipe(
      map((data: MessageModel[]) => {
        const conversations: ConversationModel[] = this.conversationsSubject.value;
        const index: number = conversations.findIndex((item) => item.id === conversationId);
        if (index >= 0) {
          data.forEach((message) => {
            conversations[index].messages.push(message);
          })
        }
        this.conversationsSubject.next(conversations);
      }),
      catchError((error) => {
        return of();
      })
    )
  }

  fetchAnalyseConvByMistral(conversationId: string, content: string, files: CreateFileModel[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrlAnalyseConversationByMistral}/${conversationId}`, { content, files }).pipe(
      map((data: MessageModel[]) => {
        const conversations: ConversationModel[] = this.conversationsSubject.value;
        const index: number = conversations.findIndex((item) => item.id === conversationId);
        if (index >= 0) {
          data.forEach((message) => {
            conversations[index].messages.push(message);
          })
        }
        this.conversationsSubject.next(conversations);
      }),
      catchError((error) => {
        return of();
      })
    )
  }

  fetchDeleteConversation(conversationId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlMessage}/${conversationId}`).pipe(
      map((data: ConversationModel) => {
        const conversations: ConversationModel[] = this.conversationsSubject.value.filter((item) => item.id !== data.id);
        this.conversationsSubject.next(conversations);
      })
    )
  }

  deleteMessagesByFileId(fileIdToDelete: string): void {
    const updatedConversations = this.conversationsSubject.value.map(convo => {
      const filteredMessages = convo.messages.filter(msg => msg.file?.id !== fileIdToDelete);
      return { ...convo, messages: filteredMessages };
    });

    this.conversationsSubject.next(updatedConversations);
  }

}
