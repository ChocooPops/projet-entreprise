import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project/project.service';
import { ConversationService } from '../../services/conversation/conversation.service';
import { Subscription } from 'rxjs';
import { ConversationModel } from '../../model/conversation.interface';
import { MessageModel } from '../../model/message.interface';
import { NgClass } from '@angular/common';
import { UserService } from '../../services/user/user.service';
import { UserModel } from '../../model/user.interface';
import { CreateFileModel } from '../../model/create-file.interface';
import { FileComponent } from '../file/file.component';

@Component({
  selector: 'app-message',
  imports: [ReactiveFormsModule, NgClass, FileComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  srcAddConversation: string = './add-conversation.png';
  srcSendMessage: string = './send-message.png';
  formGroupMessage!: FormGroup;
  subscriptionMain: Subscription = new Subscription();
  conversations: ConversationModel[] = [];
  messages: MessageModel[] | undefined;
  currentProjectId !: string;
  currentConversationId: string | undefined;
  currentUser: UserModel | undefined;
  srcRemoveConc: string = './remove-conv.png';
  srcAnyConv: string = './any-conv.svg';
  srcStartConv: string = './start-conv.svg';
  srcIaMessage: string = './ia-message.png';
  srcTextMessage: string = './send-message.png';
  srcInputFile: string = './attached.png';
  addedFile: CreateFileModel[] = [];


  constructor(private fb: FormBuilder,
    private projectService: ProjectService,
    private conversationService: ConversationService,
    private userService: UserService
  ) {

  }

  ngOnInit(): void {
    this.loadFormMessage();
    this.subscriptionMain.add(
      this.projectService.getPorjectClicked().subscribe((projectId: string) => {
        this.currentProjectId = projectId;
        this.currentConversationId = undefined;
        this.addedFile = [];
        this.conversationService.fetchAllConversation(this.currentProjectId).subscribe(() => { })
        this.conversationService.getConversationsSubject().subscribe((conversations: ConversationModel[]) => {
          this.conversations = conversations.filter((conv) => conv.projectId === this.currentProjectId);
          this.messages = this.conversations.find((conv) => conv.id === this.currentConversationId)?.messages;
          this.userService.getUserTab().subscribe((users) => {
            this.messages?.forEach((message) => {
              const user: UserModel | undefined = users.find((item) => item.id === message.author.id);
              if (user) {
                message.author.profilePhoto = user.profilePhoto;
              }
            })
          })
        })
      })
    )
    this.subscriptionMain.add(
      this.userService.getUserSubject().subscribe((user) => {
        this.currentUser = user;
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptionMain.unsubscribe();
  }

  addNewConversation(): void {
    this.conversationService.fetchCreateNewConversation(this.currentProjectId).subscribe(() => { })
  }

  loadFormMessage(): void {
    this.formGroupMessage = this.fb.group({
      inputMessage: [''],
    });
  }

  sendMessage(event: Event) {
    event.preventDefault();
    const message = this.formGroupMessage.get('inputMessage')?.value;
    if (message && message.trim() && this.currentConversationId) {
      this.conversationService.fetchSendNewMessage(this.currentConversationId, message).subscribe(() => {
        this.formGroupMessage.get('inputMessage')?.reset();
        this.autoResize(event);
        setTimeout(() => {
          if (this.messagesContainer) {
            this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
          }
        }, 10);
      })
    }
    if (this.addedFile.length > 0 && this.currentConversationId) {
      this.conversationService.fetchSendNewFileMessage(this.currentConversationId, this.addedFile).subscribe(() => {
        this.addedFile = [];
        setTimeout(() => {
          if (this.messagesContainer) {
            this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
          }
        }, 100);
      })
    }
  }

  onClickDeleteConv(conversationId: string): void {
    this.conversationService.fetchDeleteConversation(conversationId).subscribe(() => {
      this.currentConversationId = undefined;
      this.addedFile = [];
    })
  }

  onBlurConversation(conversationId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.conversationService.fetchUpdateTitleConversation(conversationId, value).subscribe(() => { })
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  onClickChangeConversation(conversationId: string) {
    if (conversationId !== this.currentConversationId) {
      this.currentConversationId = conversationId;
      this.conversationService.fetchAllMessageByConversation(this.currentConversationId).subscribe((messages) => {
        this.messages = messages
      });
    }
  }


  isDragging: boolean = false;
  fileId: number = 0;

  getIdFile(): string {
    this.fileId++;
    return String(this.fileId);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (this.currentConversationId) {
        this.addedFile.push(
          {
            idProjects: this.getIdFile(),
            file: base64,
            name: file.name
          }
        )
      }
    }
    reader.onerror = (error) => {
      console.error('Erreur de lecture du fichier :', error);
    };
    reader.readAsDataURL(file);
  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
    this.isDragging = false;
  }

  deleteFileBeforeSending(id: string): void {
    this.addedFile = this.addedFile.filter((file) => file.idProjects !== id);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    this.isDragging = false;
  }

}
