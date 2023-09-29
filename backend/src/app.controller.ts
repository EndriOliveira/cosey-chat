import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessageResponseDto } from './shared/dto/message.response.dto';

@Controller()
@ApiTags('Api')
export class AppController {
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Hello, world!',
    schema: {
      example: {
        message: 'string',
      },
    },
  })
  getHello(): MessageResponseDto {
    return {
      message: 'Hello, world!',
    };
  }
}
