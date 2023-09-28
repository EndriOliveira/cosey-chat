import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ChatGateway } from './modules/chat/chat.gateway';
import { ChatModule } from './modules/chat/chat.module';
import { UserService } from './modules/user/user.service';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';
import { RefreshTokenModule } from './modules/refreshToken/refreshToken.module';
import { MessageService } from './modules/message/message.service';
import { FileModule } from './modules/file/file.module';
import { MessageModule } from './modules/message/message.module';
import { MessageController } from './modules/message/message.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonInterceptor } from './interceptors/winston.interceptor';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/wiston.config';
import { JwtStrategy } from './modules/auth/middleware/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    UserModule,
    RefreshTokenModule,
    MessageModule,
    FileModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    WinstonModule.forRoot(winstonConfig),
  ],
  controllers: [AppController, UserController, MessageController],
  providers: [
    ChatGateway,
    UserService,
    MessageService,
    JwtStrategy,
    { provide: APP_INTERCEPTOR, useClass: WinstonInterceptor },
  ],
})
export class AppModule {}
