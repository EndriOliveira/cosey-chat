import { Injectable, NotFoundException } from '@nestjs/common';
import { generateJwt } from '../../utils/jwt';
import { getUserById } from '../user/user.repository';
import envConfig from '../../config/env.config';
import {
  createRefreshToken,
  updateManyRefreshToken,
} from './refreshToken.repository';

@Injectable()
export class RefreshTokenService {
  async createRefreshToken(userId: string): Promise<string> {
    const user = await getUserById(userId);
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
