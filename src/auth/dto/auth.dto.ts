import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from '../entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @MinLength(6)
  @ApiProperty()
  password: string;

  @IsEnum(UserRole)
  @ApiProperty()
  role: UserRole;
}

export class SigninDto {
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsEnum(UserRole)
  @ApiProperty()
  role: UserRole;
}

export class SendOtpDto {
  @IsEmail()
  @ApiProperty()
  email: string;
}

export class VerifyOtpDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  otp: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @ApiProperty()
  newPassword: string;
}
