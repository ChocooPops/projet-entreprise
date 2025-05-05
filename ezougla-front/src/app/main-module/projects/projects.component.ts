import { Component } from '@angular/core';
import { ProjectService } from '../../services/project/project.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { ProjectModel } from '../../model/project.interface';

@Component({
  selector: 'app-projects',
  imports: [],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {
  
  subscription !: Subscription;
  project !: ProjectModel | undefined;

  constructor(private projectService : ProjectService, 
    private route : ActivatedRoute
  ) {

  }

  ngOnInit() : void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.subscription = this.projectService.getAllProjectsByUser().subscribe((projects : ProjectModel[]) => {
        this.project = projects.find((pro) => pro.id === id);
        console.log(this.project);
      })
    });
  }

  ngOnDestroy() : void {
    this.subscription.unsubscribe();
  }

}
