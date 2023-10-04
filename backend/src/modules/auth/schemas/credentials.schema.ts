import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';
import { CredentialsDto } from '../dto/credentials.dto';

export const validateSignIn = (body: CredentialsDto) => {
  const schema = z.object({
    email: z.string().trim().email().max(255),
    password: z.string().trim().max(255),
  });
  const validate = schema.safeParse(body);
  if (!validate['success'])
    throw new BadRequestException(validate['error'].issues);
};
