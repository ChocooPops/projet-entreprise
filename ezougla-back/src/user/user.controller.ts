import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUser } from './dto/create-user.interface';
import { Public } from 'src/auth/public.decorator';
import { MessageModel } from 'src/common/model/message.interface';
import { CurrentUser } from 'src/auth/current-user.guard';

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

}
