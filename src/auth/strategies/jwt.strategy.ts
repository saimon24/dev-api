import { JwtPayload } from './../interfaces/jwt-payload.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request, jwtToken, done) => {
        done(null, configService.get('JWT_SECRET'));
      },
    });
  }

  async validate(payload: JwtPayload) {
    console.log('validate: ', payload);

    const user = await this.usersService.findOne(payload.sub);
    console.log(
      '🚀 ~ file: jwt.strategy.ts ~ line 29 ~ JwtStrategy ~ validate ~ user',
      user,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user._id.toString(),
      email: user.email,
    };
  }
}
