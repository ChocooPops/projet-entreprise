import { Controller, Get, Post, Param, Delete, Body, Put } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CurrentUser } from 'src/auth/current-user.guard';
import { Role } from '@prisma/client';
import { CreateFileModel } from 'src/file/dto/create-file.interface';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Get('find-many-projects')
  async findOne(@CurrentUser('sub') userId: string) {
    return await this.projectService.getAllProjectByUser(userId);
  }

  @Post('create')
  async create(@CurrentUser('role') role: Role, @CurrentUser('sub') userId: string) {
    return await this.projectService.createHollowNewProject(role, userId);
  }

  @Put('update-name/:id')
  async updateName(@CurrentUser('role') role: Role, @Param('id') id: string, @Body('name') name: string) {
    return await this.projectService.updateNameProjectById(id, name, role);
  }

  @Put('update-description/:id')
  async updateDescription(@CurrentUser('role') role: Role, @Param('id') id: string, @Body('description') description: string) {
    return await this.projectService.updateDescriptionProjectById(id, description, role);
  }

  @Put('change-back/:id')
  async updateBack(@CurrentUser('role') role: Role, @Param('id') id: string, @Body('url') url: string) {
    return await this.projectService.updateBackgroundImage(id, role, url);
  }

  @Put('change-back-perso')
  async updateBackPersonalized(@CurrentUser('role') role: Role, @Body() file: CreateFileModel) {
    return await this.projectService.updateBackgroundImagePersonalize(role, file);
  }

  @Put('add-user-from-project/:idUser/:idProject')
  async assignedUserIntoProjectById(@CurrentUser('role') role: Role, @Param('idUser') idUser: string, @Param('idProject') idProject: string) {
    return await this.projectService.addUserToProject(role, idUser, idProject);
  }

  @Put('remove-user-from-project/:idUser/:idProject')
  async unassignedUserIntoProjectById(@CurrentUser('role') role: Role, @Param('idUser') idUser: string, @Param('idProject') idProject: string) {
    return await this.projectService.removeUserToProject(role, idUser, idProject);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser('role') role: Role) {
    return await this.projectService.deleteProjectById(id, role);
  }
}
