import { ApiProperty } from '@nestjs/swagger';

export class CreateRefreshTokenDto {
  @ApiProperty()
  token: string;
  @ApiProperty()
  userId: string;
}
