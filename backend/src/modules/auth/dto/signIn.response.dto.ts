import { ApiProperty } from '@nestjs/swagger';

export class SignInResponseDto {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
}
