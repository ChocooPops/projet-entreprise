import { Controller, Get, Post, Param, Delete, Body, Put } from '@nestjs/common';
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

  @Put('update-name/:id')
  async updateName(@CurrentUser('role') role: Role, @Param('id') id: string, @Body('name') name: string) {
    return await this.projectService.updateNameProjectById(id, name, role);
  }

  @Put('update-description/:id')
  async updateDescription(@CurrentUser('role') role: Role, @Param('id') id: string, @Body('description') description: string) {
    return await this.projectService.updateDescriptionProjectById(id, description, role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('role') role: Role) {
    return this.projectService.deleteProjectById(id, role);
  }
}
