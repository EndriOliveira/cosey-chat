import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';
import { DeactivateAccountDto } from '../dto/deactivateAccount.dto';

export const validateDeactivateAccount = (body: DeactivateAccountDto) => {
  const schema = z.object({
    passwordConfirmation: z.string().trim().max(255),
    password: z.string().trim().max(255),
  });
  const validate = schema.safeParse(body);
  if (!validate['success'])
    throw new BadRequestException(validate['error'].issues);
};
