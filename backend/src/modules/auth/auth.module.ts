import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { RefreshTokenService } from '../refreshToken/refreshToken.service';
import { UserService } from '../user/user.service';
import { CodeService } from '../code/code.service';
import { SendGridService } from '../sendGrid/sendGrid.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokenService,
    UserService,
    CodeService,
    SendGridService,
  ],
})
export class AuthModule {}
