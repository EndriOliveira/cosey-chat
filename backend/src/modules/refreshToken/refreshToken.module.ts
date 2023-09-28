import { Module } from '@nestjs/common';
import { RefreshTokenController } from './refreshToken.controller';
import { RefreshTokenService } from './refreshToken.service';

@Module({
  controllers: [RefreshTokenController],
  providers: [RefreshTokenService],
})
export class RefreshTokenModule {}
