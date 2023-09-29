import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { RefreshTokenService } from '../refreshToken/refreshToken.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenService, UserService],
})
export class AuthModule {}
