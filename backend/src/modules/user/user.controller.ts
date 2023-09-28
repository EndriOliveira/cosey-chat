import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { httpErrors } from '../../shared/errors/http-errors';
import { UserService } from './user.service';
import { FindUsersQueryDto } from './dto/findUsersQuery.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/updateUserDto';
import { FindUsersResponseDto } from './dto/findUsers.response.dto';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  @ApiResponse({
    status: 200,
    description: 'Users Found Successfully',
    schema: {
      example: {
        users: [
          {
            id: 'string',
            active: 'boolean',
            name: 'string',
            cpf: 'string',
            phone: 'string',
            email: 'string',
            createdAt: 'dateTime',
            updatedAt: 'dateTime',
          },
        ],
        total: 'number',
        page: 'number',
        pages: 'number',
      },
    },
  })
  @ApiInternalServerErrorResponse(httpErrors.internalServerError)
  async getUsers(
    @Query() query: FindUsersQueryDto,
  ): Promise<FindUsersResponseDto> {
    return await this.userService.getUsers(query);
  }

  @Get('/:id')
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
        createdAt: 'dateTime',
        updatedAt: 'dateTime',
      },
    },
  })
  @ApiNotFoundResponse(httpErrors.notFoundError)
  async getUserById(@Param('id') id: string): Promise<User> {
    return await this.userService.getUserById(id);
  }

  @Put('/')
  @UseGuards(AuthGuard())
  @ApiSecurity('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Users Found Successfully',
    schema: {
      example: {
        id: 'string',
        active: 'boolean',
        name: 'string',
        cpf: 'string',
        phone: 'string',
        email: 'string',
        createdAt: 'dateTime',
        updatedAt: 'dateTime',
      },
    },
  })
  @ApiUnauthorizedResponse(httpErrors.unauthorizedError)
  @ApiNotFoundResponse(httpErrors.notFoundError)
  @ApiConflictResponse(httpErrors.conflictError)
  @ApiInternalServerErrorResponse(httpErrors.internalServerError)
  async editUser(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.editUser(user, updateUserDto);
  }
}
