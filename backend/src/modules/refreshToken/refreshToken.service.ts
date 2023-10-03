import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { generateJwt, verifyJwt } from '../../utils/jwt';
import envConfig from '../../config/env.config';
import {
  createRefreshToken,
  getOneRefreshToken,
  updateManyRefreshToken,
} from './refreshToken.repository';
import { UserService } from '../user/user.service';
import { NewAccessTokenResponseDto } from './dto/newAccessToken.response.dto';
import { NewAccessTokenDto } from './dto/newAccessToken.dto';
import { validateCreateNewAccessToken } from './schemas/createNewAccessToken.schema';
import { RefreshToken } from '@prisma/client';

@Injectable()
export class RefreshTokenService {
  constructor(private userService: UserService) {}

  async getRefreshTokenById(id: string): Promise<RefreshToken> {
    const refreshToken = await getOneRefreshToken({ id, active: true });
    if (!refreshToken) throw new NotFoundException('Refresh Token Not Found');

    return refreshToken;
  }

  async createRefreshToken(userId: string): Promise<string> {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new NotFoundException('User Not Found');

    await updateManyRefreshToken(
      { userId: user.id, active: true },
      { active: false },
    );
    const refreshToken = await createRefreshToken({ userId });

    const token = generateJwt(
      envConfig.jwt.refreshSecret,
      { id: refreshToken.id },
      envConfig.jwt.refreshExpirationDays,
    );
    return token;
  }

  async createNewAccessToken(
    newAccessTokenDto: NewAccessTokenDto,
  ): Promise<NewAccessTokenResponseDto> {
    validateCreateNewAccessToken(newAccessTokenDto);

    const { refreshToken } = newAccessTokenDto;
    const response = verifyJwt(envConfig.jwt.refreshSecret, refreshToken);

    const refreshTokenExists = await getOneRefreshToken({ id: response['id'] });
    if (!refreshTokenExists)
      throw new UnauthorizedException('Invalid Refresh Token');

    const user = await this.userService.getUserById(refreshTokenExists.userId);
    if (!user) throw new NotFoundException('User Not Found');

    if (refreshTokenExists && !refreshTokenExists.active) {
      await updateManyRefreshToken({ userId: user.id }, { active: false });
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    return {
      accessToken: generateJwt(
        envConfig.jwt.refreshSecret,
        { id: user.id },
        envConfig.jwt.refreshExpirationDays,
      ),
    };
  }
}
