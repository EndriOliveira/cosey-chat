import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/createUser.dto';
import { AuthService } from './auth.service';
import { httpErrors } from '../../shared/errors/http-errors';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Registered Succesfully',
    schema: {
      example: {
        id: 'string',
        name: 'string',
        cpf: 'string',
        email: 'string',
        createdAt: '2000-01-01T00:00:00.000Z',
        updatedAt: '2000-01-01T00:00:00.000Z',
        active: true,
        phone: {
          id: 'string',
          ddi: 'string',
          ddd: 'string',
          number: 'string',
          createdAt: '2000-01-01T00:00:00.000Z',
          updatedAt: '2000-01-01T00:00:00.000Z',
          active: true,
        },
      },
    },
  })
  @ApiResponse(httpErrors.badRequestError)
  @ApiResponse(httpErrors.conflictError)
  @ApiResponse(httpErrors.internalServerError)
  async signup(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
  }
}
