import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { AuthModel } from './dto/auth.interface';
import { TokenModel } from './dto/token.interface';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @Public()
    async login(@Body() body: AuthModel): Promise<TokenModel> {
        return await this.authService.signIn(body.email, body.password);
    }
}
