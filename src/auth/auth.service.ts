// src/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entity/user.entity';
import { Otp } from './entity/otp.entity';
import { JwtTokenUtil } from 'src/utils/jwt.util';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Otp) private readonly otpRepository: Repository<Otp>,
    private readonly jwtUtil: JwtTokenUtil,
    private readonly mailService: MailService,
  ) {}

  private normalizeEmail(email?: string) {
    if (!email || !email.trim()) throw new BadRequestException('Email is required');
    return email.trim().toLowerCase();
  }

  private normalizeUsername(username?: string) {
    if (!username || !username.trim()) throw new BadRequestException('Username is required');
    return username.trim().toLowerCase();
  }

  private generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async signup(username: string, email: string, password: string, role: UserRole) {
    const u = this.normalizeUsername(username);
    const e = this.normalizeEmail(email);
    if (!password) throw new BadRequestException('Password is required');
    const existing = await this.userRepository.findOne({ where: [{ username: u }, { email: e }] });
    if (existing) {
      if (existing.username === u) throw new BadRequestException('Username already exists');
      throw new BadRequestException('Email already exists');
    }
    const rounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
    const hashed = await bcrypt.hash(password, rounds);
    const user = this.userRepository.create({ username: u, email: e, password: hashed, role });
    await this.userRepository.save(user);
    const token = this.jwtUtil.createAccessToken({ sub: user.id, role: user.role });
    return {
      message: 'User created successfully',
      accessToken: token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, isVerified: user.isVerified },
    };
  }

  async signin(usernameOrEmail: string, password: string, role: UserRole) {
    if (!usernameOrEmail || !password) throw new BadRequestException('Missing fields');
    const lookup = usernameOrEmail.trim().toLowerCase();
    let user = await this.userRepository.findOne({
      where: { username: lookup, role },
      select: ['id', 'username', 'email', 'password', 'role', 'isVerified'],
    });
    if (!user) {
      user = await this.userRepository.findOne({
        where: { email: lookup, role },
        select: ['id', 'username', 'email', 'password', 'role', 'isVerified'],
      });
    }
    if (!user) throw new UnauthorizedException('Invalid username/email or password');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid username/email or password');
    const token = this.jwtUtil.createAccessToken({ sub: user.id, role: user.role });
    delete (user as any).password;
    return { message: 'Login successful', accessToken: token, user };
  }

  async sendOtp(email: string) {
    const e = this.normalizeEmail(email);
    const user = await this.userRepository.findOne({ where: { email: e } });
    if (!user) throw new NotFoundException('Email not found');
    const otpValue = this.generateOtpCode();
    const minutes = parseInt(process.env.OTP_EXPIRE_MINUTES || '5', 10);
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    try {
      await this.otpRepository.delete({ email: e });
    } catch (err) {
      this.logger.debug('OTP delete error');
    }
    const otp = this.otpRepository.create({ email: e, otp: otpValue, expiresAt });
    await this.otpRepository.save(otp);
    await this.mailService.sendMail(e, 'Your OTP code', `Your OTP is ${otpValue}. It will expire in ${minutes} minutes.`);
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(email: string, code: string) {
    const e = this.normalizeEmail(email);
    const otp = await this.otpRepository.findOne({ where: { email: e, otp: code }, order: { id: 'DESC' } });
    if (!otp) throw new BadRequestException('Invalid OTP');
    if (otp.expiresAt < new Date()) {
      await this.otpRepository.delete({ id: otp.id });
      throw new BadRequestException('OTP expired');
    }
    const user = await this.userRepository.findOne({ where: { email: e } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.isVerified) {
      user.isVerified = true;
      await this.userRepository.save(user);
    }
    await this.otpRepository.delete({ id: otp.id });
    const token = this.jwtUtil.createAccessToken({ sub: user.id, role: user.role });
    return { message: 'OTP verified', accessToken: token, user: { id: user.id, username: user.username, email: user.email, role: user.role, isVerified: user.isVerified } };
  }

  async resetPassword(newPassword: string, userFromToken: any) {
    if (!userFromToken || !userFromToken.sub) throw new UnauthorizedException('Invalid token');
    const userId = userFromToken.sub as number;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const rounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
    user.password = await bcrypt.hash(newPassword, rounds);
    await this.userRepository.save(user);
    return { message: 'Password updated successfully' };
  }
}
