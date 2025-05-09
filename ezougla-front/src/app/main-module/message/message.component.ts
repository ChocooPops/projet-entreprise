import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project/project.service';
import { ConversationService } from '../../services/conversation/conversation.service';
import { Subscription } from 'rxjs';
import { ConversationModel } from '../../model/conversation.interface';
import { MessageModel } from '../../model/message.interface';
import { NgClass } from '@angular/common';
import { UserService } from '../../services/user/user.service';
import { UserModel } from '../../model/user.interface';

@Component({
  selector: 'app-message',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {

  srcAddConversation: string = './add-conversation.png';
  srcSendMessage: string = './send-message.png';
  formGroupMessage!: FormGroup;
  subscriptionMain : Subscription = new Subscription();
  subscriptionConversation !: Subscription;
  conversations : ConversationModel[] = [];
  messages : MessageModel[] | undefined;
  currentProjectId !: string;
  currentConversationId !: string;
  currentUser : UserModel | undefined;

  constructor(private fb: FormBuilder,
    private projectService : ProjectService,
    private conversationService : ConversationService,
    private userService : UserService
  ) {

  }

  ngOnInit(): void {
    this.loadFormMessage();
    this.subscriptionMain.add(
      this.projectService.getPorjectClicked().subscribe((projectId : string) => {
        this.currentProjectId = projectId;
        this.conversationService.fetchAllConversation(this.currentProjectId).subscribe(() => {})
        this.subscriptionConversation = this.conversationService.getConversationsSubject().subscribe((conversations : ConversationModel[]) => {
          this.conversations = conversations.filter((conv) => conv.projectId === this.currentProjectId);
          this.messages = this.conversations.find((conv) => conv.id === this.currentConversationId)?.messages;
        })
      })
    )
    this.subscriptionMain.add(
      this.userService.getUserSubject().subscribe((user) => {
        this.currentUser = user;
      })
    )
  }

  ngOnDestroy() : void {
    this.subscriptionMain.unsubscribe();
    if(this.subscriptionConversation) {
      this.subscriptionConversation.unsubscribe();
    }
  }

  addNewConversation() : void {
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
    if (message && message.trim()) {
      this.conversationService.fetchSendNewMessage(this.currentConversationId, message).subscribe(() => {
        this.formGroupMessage.get('inputMessage')?.reset();
      })
    }
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  onClickChangeConversation(conversationId : string) {
    if(conversationId !== this.currentConversationId) {
      this.currentConversationId = conversationId;
      this.conversationService.fetchAllMessageByConversation(this.currentConversationId).subscribe((messages) => {
        this.messages = messages;
      });
    }
  }

}
