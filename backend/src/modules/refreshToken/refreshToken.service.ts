import { Injectable, NotFoundException } from '@nestjs/common';
import { generateJwt, verifyJwt } from '../../utils/jwt';
import envConfig from '../../config/env.config';
import {
  createRefreshToken,
  updateManyRefreshToken,
} from './refreshToken.repository';
import { UserService } from '../user/user.service';
import { NewAccessTokenResponseDto } from './dto/newAccessToken.response.dto';
import { NewAccessTokenDto } from './dto/newAccessToken.dto';
import { validateCreateNewAccessToken } from './schemas/createNewAccessToken.schema';

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

    await updateManyRefreshToken(
      { userId: user.id, active: true },
      { active: false },
    );
    await createRefreshToken({ userId });
    return token;
  }

  async createNewAccessToken(
    newAccessTokenDto: NewAccessTokenDto,
  ): Promise<NewAccessTokenResponseDto> {
    validateCreateNewAccessToken(newAccessTokenDto);

    const { refreshToken } = newAccessTokenDto;
    const response = verifyJwt(envConfig.jwt.refreshSecret, refreshToken);

    const user = await this.userService.getUserById(response['id']);
    if (!user) throw new NotFoundException('User Not Found');

    return {
      accessToken: generateJwt(
        envConfig.jwt.refreshSecret,
        { id: user.id },
        envConfig.jwt.refreshExpirationDays,
      ),
    };
  }
}
