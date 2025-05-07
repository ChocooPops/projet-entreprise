import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUser } from './dto/create-user.interface';
import { Public } from 'src/auth/public.decorator';
import { MessageModel } from 'src/common/model/message.interface';
import { CurrentUser } from 'src/auth/current-user.guard';
import { CreateFileModel } from 'src/file/dto/create-file.interface';
import { Role } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('register')
  @Public()
  create(@Body() createUserDto: RegisterUser): Promise<MessageModel> {
    return this.userService.registerUser(createUserDto);
  }

  @Get('find-user')
  findAll(@CurrentUser('sub') userId: string) {
    return this.userService.findUserById(userId);
  }

  @Get('get-all-users')
  findAllUsers() {
    return this.userService.getAllUsers();
  }

  @Put('change-pp')
  changeProfilPhoto(@CurrentUser('sub') userId: string, @Body('url') url: any) {
    return this.userService.changeProfilPhoto(userId, url);
  }

  @Put('change-pp-by-perso-picture')
  changeProfilPhotoByPersoPicture(@Body() createFileDto: CreateFileModel, @CurrentUser('sub') userId: string) {
    return this.userService.createNewProfilPhoto(createFileDto, userId);
  }

  @Put('modify-role/:id')
  async modiyRoleByUserId(@CurrentUser('role') role: Role, @Param('id') id: string, @Body('role') newRole: Role) {
    return await this.userService.modifyRoleUser(role, id, newRole);
  }

  @Put('enable-user/:id')
  async enableUserById(@CurrentUser('role') role: Role, @Param('id') id: string) {
    return await this.userService.enableUser(role, id);
  }

  @Put('disable-user/:id')
  async disableUserById(@CurrentUser('role') role: Role, @Param('id') id: string) {
    return await this.userService.disableUser(role, id);
  }

}
