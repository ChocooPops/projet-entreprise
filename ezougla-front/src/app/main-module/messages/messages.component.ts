import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { MessageModel } from '../../model/message.interface';
import { FileComponent } from '../file/file.component';
import { NgClass } from '@angular/common';
import { UserModel } from '../../model/user.interface';

@Component({
  selector: 'app-messages',
  imports: [FileComponent, NgClass],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent {

  @Input() messages: MessageModel[] | undefined = undefined;
  @Input() currentUser: UserModel | undefined = undefined;

  srcPpMistral: string = './mistral.png';
  srcAnyConv: string = './any-conv.svg';
  srcStartConv: string = './start-conv.svg';

}
