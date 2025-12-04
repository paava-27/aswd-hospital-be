import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as dotenv from 'dotenv';
dotenv.config();

import { User } from './entity/user.entity';
import { Otp } from './entity/otp.entity';

import { AuthService } from './auth.service';
import { MailService } from 'src/mail/mail.service';
import { JwtTokenUtil } from 'src/utils/jwt.util';
import { AuthController } from './auth.controller';
import { JwtStrategy } from 'src/strategy/jwt.strategy'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Otp]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.SECRET_KEY || 'default_secret',
      signOptions: {
        expiresIn: `${process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '1440'}m`,
        algorithm: (process.env.ALGORITHM as any) || 'HS256',
      } as any,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, JwtTokenUtil, JwtStrategy],
  exports: [AuthService, JwtTokenUtil, JwtModule],
})
export class AuthModule {}
