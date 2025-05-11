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
import { MessagesComponent } from '../messages/messages.component';
import { EventEmitter } from 'node:stream';

@Component({
  selector: 'app-conversations',
  imports: [ReactiveFormsModule, NgClass, FileComponent, MessagesComponent],
  templateUrl: './conversations.component.html',
  styleUrl: './conversations.component.css'
})
export class ConversationsComponent {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('inputMessage') inputMessageRef!: ElementRef<HTMLInputElement>;

  public setScrollingBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

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
  srcIaMessage: string = './ia-message.png';
  srcTextMessage: string = './send-message.png';
  srcInputFile: string = './attached.png';
  srcConversationsMistral: string = './chat-bot.png';
  addedFile: CreateFileModel[] = [];
  modeActivate: boolean = true;

  loadingResponseApiMistral: boolean = false;
  loadingForm: boolean = false;
  messageLoading: MessageModel[] = [];

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
        this.loadingForm = false;
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

  setStateForm(state: boolean): void {
    this.loadingForm = state;
    if (this.loadingForm) {
      this.formGroupMessage.disable();
    } else {
      this.formGroupMessage.enable();
      this.focusOnInputMessage();
    }
  }

  sendMessage(event: Event) {
    event.preventDefault();
    const message = this.formGroupMessage.get('inputMessage')?.value;
    if (!this.loadingForm && this.currentConversationId) {
      if (this.modeActivate) {
        if (message && message.trim()) {
          this.setStateForm(true)
          this.conversationService.fetchSendNewMessage(this.currentConversationId, message).subscribe(() => {
            this.formGroupMessage.get('inputMessage')?.reset();
            this.autoResize(event);
            this.setScrollingBottom();
            if (this.addedFile.length <= 0) {
              this.setStateForm(false);
            }
          })
        } else {
          this.setStateForm(false)
        }
        if (this.addedFile.length > 0) {
          this.setStateForm(true)
          this.conversationService.fetchSendNewFileMessage(this.currentConversationId, this.addedFile).subscribe(() => {
            this.addedFile = [];
            this.setScrollingBottom();
            if (!this.formGroupMessage.get('inputMessage')?.value || this.formGroupMessage.get('inputMessage')?.value === '') {
              this.setStateForm(false);
            }
          })
        } else {
          this.setStateForm(false)
        }
      } else {
        if (this.modeApiMistralActivate) {
          this.sendSimpleMessageAndFileToMistral(message, event)
        } else {
          this.sendAllConversationToMistral(message, event);
        }
      }
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
        this.setScrollingBottom();
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
      this.focusOnInputMessage();
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

  focusOnInputMessage(): void {
    if (this.inputMessageRef) {
      this.inputMessageRef.nativeElement.focus();
    }
  }

  modeApiMistralActivate: boolean = true;
  displayOtherModeApi: boolean = false;

  onMouseEnter(): void {
    this.displayOtherModeApi = true;
  }
  onMouseLeave(): void {
    this.displayOtherModeApi = false;
  }

  onClickedApiMistralConv(): void {
    this.modeActivate = false;
    this.modeApiMistralActivate = false;
    this.displayOtherModeApi = false;
  }

  onClickModeApiMistral(): void {
    this.modeActivate = false;
    this.modeApiMistralActivate = true;
    this.displayOtherModeApi = false;
  }
  onClickModeNormalUser(): void {
    this.modeActivate = true;
  }

  sendSimpleMessageAndFileToMistral(message: string, event: Event): void {
    if (this.currentConversationId) {
      let messageApi = '';
      const filesApi: CreateFileModel[] = [];
      if (message) {
        messageApi = message.trim();
      }
      if (this.currentUser) {
        if (messageApi !== '') {
          this.messageLoading.push({
            id: '0',
            content: message,
            conversationId: this.currentConversationId,
            type: 'TEXT_USER_TO_AI',
            author: this.currentUser
          })
        }
        this.addedFile.forEach((file) => {
          filesApi.push(file);
          if (this.currentUser && this.currentConversationId) {
            this.messageLoading.push({
              id: this.getIdFile(),
              content: '',
              conversationId: this.currentConversationId,
              type: 'FILE',
              author: this.currentUser,
              file: {
                id: this.getIdFile(),
                name: file.name,
                url: 'vide',
                type: file.name.split('.')[1]
              }
            })
          }
        })
        this.messageLoading.push({
          id: '1',
          content: 'Chargement ...',
          conversationId: this.currentConversationId,
          type: 'TEXT_AI_SIMPLE_ANSWER',
          author: this.currentUser
        })
      }
      this.setScrollingBottom();
      this.formGroupMessage.get('inputMessage')?.reset();
      this.addedFile = [];
      if (messageApi !== '' || filesApi.length > 0) {
        this.setStateForm(true)
        this.loadingResponseApiMistral = true;
        this.conversationService.fetchSendMessageToMistralAI(this.currentConversationId, messageApi, filesApi).subscribe(() => {
          this.formGroupMessage.get('inputMessage')?.reset();
          this.addedFile = [];
          this.messageLoading = [];
          this.autoResize(event);
          this.loadingResponseApiMistral = false;
          this.setScrollingBottom();
          this.setStateForm(false)
        });
      } else {
        this.messageLoading = [];
      }
    }
  }

  sendAllConversationToMistral(message: string, event: Event): void {
    if (this.currentConversationId) {
      let messageApi = '';
      const filesApi: CreateFileModel[] = [];
      if (message) {
        messageApi = message.trim();
      }
      if (this.currentUser) {
        if (messageApi !== '') {
          this.messageLoading.push({
            id: '0',
            content: message,
            conversationId: this.currentConversationId,
            type: 'ASK_ANALYSE_CONV',
            author: this.currentUser
          })
        }
        this.addedFile.forEach((file) => {
          filesApi.push(file);
          if (this.currentUser && this.currentConversationId) {
            this.messageLoading.push({
              id: this.getIdFile(),
              content: '',
              conversationId: this.currentConversationId,
              type: 'FILE',
              author: this.currentUser,
              file: {
                id: this.getIdFile(),
                name: file.name,
                url: 'vide',
                type: file.name.split('.')[1]
              }
            })
          }
        })
        this.messageLoading.push({
          id: '1',
          content: 'Chargement ...',
          conversationId: this.currentConversationId,
          type: 'TEXT_AI_ANALYSIS_CONV',
          author: this.currentUser
        })
      }
      this.setScrollingBottom();
      this.formGroupMessage.get('inputMessage')?.reset();
      this.addedFile = [];
      if (messageApi !== '' || filesApi.length > 0) {
        this.setStateForm(true)
        this.loadingResponseApiMistral = true;
        this.conversationService.fetchAnalyseConvByMistral(this.currentConversationId, messageApi, filesApi).subscribe(() => {
          this.formGroupMessage.get('inputMessage')?.reset();
          this.addedFile = [];
          this.messageLoading = [];
          this.autoResize(event);
          this.loadingResponseApiMistral = false;
          this.setScrollingBottom();
          this.setStateForm(false)
        });
      } else {
        this.messageLoading = [];
      }
    }
  }

}
