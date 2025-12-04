import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: (process.env.SECRET_KEY || 'default_secret').trim(),
      algorithms: [(process.env.ALGORITHM as any) || 'HS256'],
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
