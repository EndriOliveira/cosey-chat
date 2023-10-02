import { ApiProperty } from '@nestjs/swagger';

export class NewAccessTokenDto {
  @ApiProperty()
  refreshToken: string;
}
