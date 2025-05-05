import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Post()
  create(@Body() createFileDto: CreateFileDto) {
    return this.fileService.create(createFileDto);
  }

  @Get('files-by-project/:id')
  findAll(@Param('id') id: string) {
    return this.fileService.getFilesByProjectId(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
  }

}
