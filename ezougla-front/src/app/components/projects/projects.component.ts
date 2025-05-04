import { Component } from '@angular/core';
import { ProjectService } from '../../services/project/project.service';

@Component({
  selector: 'app-projects',
  imports: [],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {
    this.projectService.fetchAllProjectByUser().subscribe((data) => {

    })
  }
}
