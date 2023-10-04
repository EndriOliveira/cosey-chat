import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';
import { SendDeleteAccountEmailDto } from '../dto/sendDeleteAccountEmail.dto';

export const validateSendDeleteAccountEmail = (
  body: SendDeleteAccountEmailDto,
) => {
  const schema = z.object({
    email: z.string().trim().email().max(255),
    password: z.string().trim().max(255),
    passwordConfirmation: z.string().trim().max(255),
  });
  const validate = schema.safeParse(body);
  if (!validate['success'])
    throw new BadRequestException(validate['error'].issues);
};
