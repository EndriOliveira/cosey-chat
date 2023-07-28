import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ChatGateway } from './modules/chat/chat.gateway';
import { ChatModule } from './modules/chat/chat.module';
import { UserService } from './modules/user/user.service';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';
import { RefreshTokenModule } from './modules/refresh-token/refresh-token.module';
import { MessageService } from './modules/message/message.service';
import { FileModule } from './modules/file/file.module';
import { MessageModule } from './modules/message/message.module';
import { MessageController } from './modules/message/message.controller';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    UserModule,
    RefreshTokenModule,
    MessageModule,
    FileModule,
  ],
  controllers: [AppController, UserController, MessageController],
  providers: [ChatGateway, UserService, MessageService],
})
export class AppModule {}
