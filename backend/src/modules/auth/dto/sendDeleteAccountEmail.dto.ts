import { ApiProperty } from '@nestjs/swagger';

export class SendDeleteAccountEmailDto {
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  passwordConfirmation: string;
}
