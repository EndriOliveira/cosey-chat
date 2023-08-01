import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { httpErrors } from '../../shared/errors/http-errors';
import { UserService } from './user.service';
import { FindUsersQueryDto } from './dto/findUsersQuery.dto';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  @ApiResponse({
    status: 200,
    description: 'Users Found Successfully',
    schema: {
      example: [
        {
          id: 'string',
          name: 'string',
          phone: 'string',
          cpf: 'string',
          email: 'string',
          createdAt: '2000-01-01T00:00:00.000Z',
          updatedAt: '2000-01-01T00:00:00.000Z',
          active: true,
        },
      ],
    },
  })
  @ApiInternalServerErrorResponse(httpErrors.internalServerError)
  async getUsers(@Query() query: FindUsersQueryDto) {
    return await this.userService.getUsers(query);
  }

  @Get('/:id')
  @ApiResponse({
    status: 200,
    description: 'User Found Successfully',
    schema: {
      example: {
        id: 'string',
        name: 'string',
        phone: 'string',
        cpf: 'string',
        email: 'string',
        createdAt: '2000-01-01T00:00:00.000Z',
        updatedAt: '2000-01-01T00:00:00.000Z',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse(httpErrors.notFoundError)
  async getUserById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }
}
