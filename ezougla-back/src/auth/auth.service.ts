import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenModel } from './dto/token.interface';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) { }

    async signIn(email: string, password: string): Promise<TokenModel> {
        const user: User = await this.prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (user && user.role !== 'NOT_VALIDATE' && await bcrypt.compare(password, user.password)) {
            return {
                access_token: await this.generateJwt(user)
            };
        } else {
            throw new UnauthorizedException('Invalid credentials');
        }
    }

    async generateJwt(user: User) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return this.jwtService.sign(payload);
    }
}
