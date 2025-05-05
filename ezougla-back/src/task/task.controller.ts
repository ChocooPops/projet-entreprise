import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Get('tasks-by-project/:id')
  findAll(@Param('id') id: string) {
    return this.taskService.getTaskByProjectId(id);
  }

}
