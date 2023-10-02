import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RefreshTokenService } from './refreshToken.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { NewAccessTokenDto } from './dto/newAccessToken.dto';
import { httpErrors } from '../../shared/errors/http-errors';
import { NewAccessTokenResponseDto } from './dto/newAccessToken.response.dto';

@Controller('refresh-token')
@ApiTags('Refresh Token')
export class RefreshTokenController {
  constructor(private refreshTokenService: RefreshTokenService) {}

  @Post('/new-access-token')
  @ApiBody({ type: NewAccessTokenDto })
  @ApiResponse({
    status: 201,
    description: 'New access token generated successfully',
    schema: {
      example: {
        accessToken: 'string',
      },
    },
  })
  @ApiBadRequestResponse(httpErrors.badRequestError)
  @ApiNotFoundResponse(httpErrors.notFoundError)
  @ApiUnauthorizedResponse(httpErrors.unauthorizedError)
  @ApiInternalServerErrorResponse(httpErrors.internalServerError)
  @HttpCode(HttpStatus.CREATED)
  async createNewAccessToken(
    @Body() newAccessTokenDto: NewAccessTokenDto,
  ): Promise<NewAccessTokenResponseDto> {
    return await this.refreshTokenService.createNewAccessToken(
      newAccessTokenDto,
    );
  }
}
