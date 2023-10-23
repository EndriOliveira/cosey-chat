import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { UserService } from './modules/user/user.service';
import { UserModule } from './modules/user/user.module';
import { RefreshTokenModule } from './modules/refreshToken/refreshToken.module';
import { FileModule } from './modules/file/file.module';
import { MessageModule } from './modules/message/message.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonInterceptor } from './interceptors/winston.interceptor';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config';
import { JwtStrategy } from './modules/auth/middleware/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { SendGridModule } from './modules/sendGrid/sendGrid.module';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    UserModule,
    RefreshTokenModule,
    MessageModule,
    FileModule,
    SendGridModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    WinstonModule.forRoot(winstonConfig),
  ],
  controllers: [AppController],
  providers: [
    UserService,
    JwtStrategy,
    { provide: APP_INTERCEPTOR, useClass: WinstonInterceptor },
  ],
})
export class AppModule {}
