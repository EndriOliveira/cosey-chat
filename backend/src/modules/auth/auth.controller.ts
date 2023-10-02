import { Body, Controller, Post, Get, UseGuards, Delete } from '@nestjs/common';
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
import { SignInResponseDto } from './dto/signIn.response.dto';
import { DeactivateAccountDto } from './dto/deactivateAccount.dto';
import { MessageResponseDto } from '../../shared/dto/message.response.dto';
import { DeleteAccountDto } from './dto/deleteAccount.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/me')
  @UseGuards(AuthGuard())
  @ApiSecurity('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'User Found Successfully',
    schema: {
      example: {
        id: 'string',
        active: 'boolean',
        name: 'string',
        cpf: 'string',
        phone: 'string',
        email: 'string',
        slug: 'string',
        createdAt: 'dateTime',
        updatedAt: 'dateTime',
      },
    },
  })
  @ApiUnauthorizedResponse(httpErrors.unauthorizedError)
  @ApiNotFoundResponse(httpErrors.notFoundError)
  async me(@GetUser() user: User): Promise<User> {
    return user;
  }

  @Post('/sign-up')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Registered successfully',
    schema: {
      example: {
        id: 'string',
        active: 'boolean',
        name: 'string',
        cpf: 'string',
        phone: 'string',
        email: 'string',
        slug: 'string',
        createdAt: 'dateTime',
        updatedAt: 'dateTime',
      },
    },
  })
  @ApiBadRequestResponse(httpErrors.badRequestError)
  @ApiConflictResponse(httpErrors.conflictError)
  @ApiInternalServerErrorResponse(httpErrors.internalServerError)
  async signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.authService.createUser(createUserDto);
  }

  @Post('/sign-in')
  @ApiBody({ type: CredentialsDto })
  @ApiResponse({
    status: 200,
    description: 'Logged in successfully',
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
  async signIn(
    @Body() credentialsDto: CredentialsDto,
  ): Promise<SignInResponseDto> {
    return await this.authService.signIn(credentialsDto);
  }

  @Delete('/deactivate')
  @UseGuards(AuthGuard())
  @ApiSecurity('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Deactivated successfully',
    schema: {
      example: {
        message: 'string',
      },
    },
  })
  @ApiBadRequestResponse(httpErrors.badRequestError)
  @ApiNotFoundResponse(httpErrors.notFoundError)
  @ApiUnauthorizedResponse(httpErrors.unauthorizedError)
  @ApiInternalServerErrorResponse(httpErrors.internalServerError)
  async deactivateAccount(
    @GetUser() user: User,
    @Body() deactivateAccountDto: DeactivateAccountDto,
  ): Promise<MessageResponseDto> {
    return await this.authService.deactivateAccount(
      user.id,
      deactivateAccountDto,
    );
  }

  @Delete('/delete')
  @UseGuards(AuthGuard())
  @ApiSecurity('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Deleted successfully',
    schema: {
      example: {
        message: 'string',
      },
    },
  })
  @ApiBadRequestResponse(httpErrors.badRequestError)
  @ApiNotFoundResponse(httpErrors.notFoundError)
  @ApiUnauthorizedResponse(httpErrors.unauthorizedError)
  @ApiInternalServerErrorResponse(httpErrors.internalServerError)
  async deleteAccount(
    @GetUser() user: User,
    @Body() deleteAccountDto: DeleteAccountDto,
  ): Promise<MessageResponseDto> {
    return await this.authService.deleteAccount(user.id, deleteAccountDto);
  }
}
