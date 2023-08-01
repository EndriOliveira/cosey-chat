import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseQueryParametersDto {
  @ApiProperty({
    required: true,
    description: 'Flag that indicates whether the entity is active or not',
    default: true,
  })
  active: boolean;
  @ApiProperty({
    required: true,
    description: 'The page number for pagination',
    default: 1,
  })
  page: number;
  @ApiProperty({
    required: true,
    description: 'Limit of items to be returned in a request',
    default: 10,
  })
  limit: number;
  @ApiProperty({ required: false, description: 'Field to be ordered by' })
  sortBy: string;
  @ApiProperty({
    required: false,
    enum: ['asc', 'desc'],
    description: 'Order type',
    default: 'desc',
  })
  sortType: string;
}
