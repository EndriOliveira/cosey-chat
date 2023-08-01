import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiConflictResponse,
  ApiSecurity,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CredentialsDto } from './dto/credentials.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { AuthService } from './auth.service';
import { httpErrors } from '../../shared/errors/http-errors';
import { GetUser } from './decorator/get-user.decorator';
import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Registered Successfully',
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
  @ApiBadRequestResponse(httpErrors.badRequestError)
  @ApiConflictResponse(httpErrors.conflictError)
  @ApiInternalServerErrorResponse(httpErrors.internalServerError)
  async signup(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
  }

  @Post('/signin')
  @ApiBody({ type: CredentialsDto })
  @ApiResponse({
    status: 200,
    description: 'Logged in Successfully',
    schema: {
      example: {
        accessToken: 'string',
        refreshToken: 'string',
      },
    },
  })
  @ApiBadRequestResponse(httpErrors.badRequestError)
  @ApiNotFoundResponse(httpErrors.notFoundError)
  @ApiUnauthorizedResponse(httpErrors.unauthorizedError)
  @ApiInternalServerErrorResponse(httpErrors.internalServerError)
  async signIn(@Body() credentialsDto: CredentialsDto) {
    return await this.authService.signIn(credentialsDto);
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  @ApiSecurity('JWT-auth')
  @ApiUnauthorizedResponse(httpErrors.unauthorizedError)
  @ApiNotFoundResponse(httpErrors.notFoundError)
  async me(@GetUser() user: User) {
    return user;
  }
}
