import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';
import { DeleteAccountDto } from '../dto/deleteAccount.dto';

export const validateDeleteAccount = (body: DeleteAccountDto) => {
  const schema = z.object({
    email: z.string().trim().email(),
    password: z.string().trim().max(255),
    passwordConfirmation: z.string().trim().max(255),
  });
  const validate = schema.safeParse(body);
  if (!validate['success'])
    throw new BadRequestException(validate['error'].issues);
};
