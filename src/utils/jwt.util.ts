import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTokenUtil {
  constructor(private readonly jwtService: JwtService) {}

  createAccessToken(payload: any) {
    const mins = parseInt(
      process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '1440',
      10,
    );
    const algo = (process.env.ALGORITHM as any) || 'HS256';
    const secret = (process.env.SECRET_KEY || 'default_secret').trim();
    return this.jwtService.sign(payload, {
      expiresIn: `${mins}m`,
      algorithm: algo,
      secret,
    } as any);
  }
}
