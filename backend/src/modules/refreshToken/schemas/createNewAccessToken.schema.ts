import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';
import { NewAccessTokenDto } from '../dto/newAccessToken.dto';

export const validateCreateNewAccessToken = (body: NewAccessTokenDto) => {
  const schema = z.object({
    refreshToken: z.string().trim(),
  });
  const validate = schema.safeParse(body);
  if (!validate['success'])
    throw new BadRequestException(validate['error'].issues);
};
