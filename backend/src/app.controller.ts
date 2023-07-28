import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Api')
export class AppController {
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Backend OK!',
    schema: {
      example: {
        message: 'string',
      },
    },
  })
  getHello(): { message: string } {
    return {
      message: 'Backend OK!',
    };
  }
}
