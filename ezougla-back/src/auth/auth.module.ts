import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { jwtConstants } from './constants';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '1d' },
        }),
        UserModule,
    ],
    providers: [AuthService, PrismaService],
    exports: [AuthService],
    controllers: [AuthController]
})
export class AuthModule { }
