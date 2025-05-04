import { Component } from '@angular/core';
import { ProjectsComponent } from '../projects/projects.component';

@Component({
  selector: 'app-home',
  imports: [ProjectsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
