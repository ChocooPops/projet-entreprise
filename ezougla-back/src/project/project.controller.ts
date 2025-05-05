import { Controller, Get, Post, Param, Delete } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CurrentUser } from 'src/auth/current-user.guard';
import { Role } from '@prisma/client';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Get('find-many-projects')
  async findOne(@CurrentUser('sub') userId: string) {
    return await this.projectService.getAllProjectByUser(userId);
  }

  @Post('create')
  async create(@CurrentUser('role') role: Role) {
    return await this.projectService.createHollowNewProject(role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('role') role: Role) {
    return this.projectService.deleteProjectById(id, role);
  }
}
