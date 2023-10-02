import { ApiProperty } from '@nestjs/swagger';

export class DeleteAccountDto {
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  passwordConfirmation: string;
}
