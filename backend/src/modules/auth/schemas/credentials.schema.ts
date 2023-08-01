import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';
import { CredentialsDto } from '../dto/credentials.dto';

export const validateSignin = (body: CredentialsDto) => {
  const User = z.object({
    email: z.string().trim().email(),
    password: z.string().trim().max(255),
  });
  const validate = User.safeParse(body);
  if (!validate['success'])
    throw new BadRequestException(validate['error'].issues);
};
