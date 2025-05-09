import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-message',
  imports: [ReactiveFormsModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {

  srcAddConversation: string = './add-conversation.png';
  srcSendMessage: string = './send-message.png';
  formGroupMessage!: FormGroup;

  constructor(private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.loadFormName();
  }

  loadFormName(): void {
    this.formGroupMessage = this.fb.group({
      inputMessage: [''],
    });
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

}
