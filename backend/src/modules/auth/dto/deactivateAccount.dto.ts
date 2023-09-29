import { ApiProperty } from '@nestjs/swagger';

export class DeactivateAccountDto {
  @ApiProperty()
  password: string;
  @ApiProperty()
  passwordConfirmation: string;
}
