import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileModel } from './dto/create-file.interface';
import { CurrentUser } from 'src/auth/current-user.guard';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Post('create-file-in-project')
  create(@Body() createFileDto: CreateFileModel, @CurrentUser('sub') idUser: string) {
    return this.fileService.createFileInProject(createFileDto, idUser);
  }

  @Get('files-by-project/:id')
  findAll(@Param('id') id: string) {
    return this.fileService.getFilesByProjectId(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileService.deleteFile(id);
  }

}
