import { Component, Input } from '@angular/core';
import { TaskModel } from '../../model/task.interface';

@Component({
  selector: 'app-task',
  imports: [],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent {

  @Input() task !: TaskModel;

}
