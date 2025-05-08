import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { TaskService } from './task.service';
import { CurrentUser } from 'src/auth/current-user.guard';
import { TaskStatus } from '@prisma/client';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Get('tasks-by-project/:id')
  async findAll(@Param('id') id: string) {
    return await this.taskService.getTaskByProjectId(id);
  }

  @Post('create-task/:projectId')
  async createNewTask(@CurrentUser('sub') userId: string, @Param('projectId') projectId: string) {
    return await this.taskService.createEmptyTask(projectId, userId);
  }

  @Put('update-title/:taskId')
  async updateTitle(@Param('taskId') taskId: string, @Body('title') title: string) {
    return await this.taskService.updateTaskTitle(taskId, title);
  }

  @Put('update-description/:taskId')
  async updateDescription(@Param('taskId') taskId: string, @Body('description') description: string) {
    return await this.taskService.updateTaskDescription(taskId, description);
  }

  @Put('update-status/:taskId')
  async updateStatus(@Param('taskId') taskId: string, @Body('status') status: TaskStatus) {
    return await this.taskService.updateTaskStatus(taskId, status);
  }

  @Put('add-user-to-task/:taskId/:userId')
  async assignedUserToTask(@Param('taskId') taskId: string, @Param('userId') userId: string) {
    return await this.taskService.addUserToTask(taskId, userId);
  }

  @Put('remove-user-to-task/:taskId/:userId')
  async unassignedUserToTask(@Param('taskId') taskId: string, @Param('userId') userId: string) {
    return await this.taskService.removeUserFromTask(taskId, userId);
  }

  @Delete(':taskId')
  async deleteTaskById(@Param('taskId') taskId) {
    return await this.taskService.deleteTask(taskId);
  }

}
