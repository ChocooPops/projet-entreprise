import { Controller, Get, Post, Body, Param, Delete, Req } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Public } from 'src/auth/public.decorator';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Post('create')
  create() {
    return this.projectService.createHollowNewProject();
  }

  @Get(':userId')
  @Public()
  findOne(@Param('userId') userId: string, @Req() req: Request) {
    console.log('Headers reçus :', req.headers);
    return this.projectService.getAllProjectByUser(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.deleteProjectById(id);
  }
}
