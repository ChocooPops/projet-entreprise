import { Controller, Get, Post, Body, Param, Delete, Req } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CurrentUser } from 'src/auth/current-user.guard';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Post('create')
  create() {
    return this.projectService.createHollowNewProject();
  }

  @Get()
  findOne(@CurrentUser('sub') userId: string, @Req() req: Request) {
    console.log('Headers reçus :', req.headers);
    console.log('id : ' + userId)
    return this.projectService.getAllProjectByUser(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.deleteProjectById(id);
  }
}
