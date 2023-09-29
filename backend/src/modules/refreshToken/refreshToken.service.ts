import { Injectable, NotFoundException } from '@nestjs/common';
import { generateJwt } from '../../utils/jwt';
import envConfig from '../../config/env.config';
import {
  createRefreshToken,
  updateManyRefreshToken,
} from './refreshToken.repository';
import { UserService } from '../user/user.service';

@Injectable()
export class RefreshTokenService {
  constructor(private userService: UserService) {}

  async createRefreshToken(userId: string): Promise<string> {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new NotFoundException('User Not Found');

    const token = generateJwt(
      envConfig.jwt.refreshSecret,
      { id: user.id },
      envConfig.jwt.refreshExpirationDays,
    );

    await createRefreshToken({ token, userId });
    await updateManyRefreshToken(
      { userId: user.id, active: true },
      { active: false },
    );
    return token;
  }
}
