import { Module } from '@nestjs/common';
import { RefreshTokenController } from './refreshToken.controller';
import { RefreshTokenService } from './refreshToken.service';
import { UserService } from '../user/user.service';

@Module({
  controllers: [RefreshTokenController],
  providers: [RefreshTokenService, UserService],
})
export class RefreshTokenModule {}
