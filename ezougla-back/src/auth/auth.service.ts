import { ConsoleLogger, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
        if (user && await bcrypt.compare(password, user.password)) {
            if (user.role !== 'NOT_ACTIVATE') {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        connectionCount: {
                            increment: 1,
                        },
                    },
                });
                return {
                    access_token: await this.generateJwt(user)
                };
            } else {
                throw new UnauthorizedException('Invalid credentials');
            }
        } else {
            throw new NotFoundException()
        }
    }

    async generateJwt(user: User) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return this.jwtService.signAsync(payload);
    }
}
