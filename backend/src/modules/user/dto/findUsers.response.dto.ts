import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class FindUsersResponseDto {
  @ApiProperty()
  users: User[];
  @ApiProperty()
  total: number;
  @ApiProperty()
  page: number;
  @ApiProperty()
  pages: number;
}
