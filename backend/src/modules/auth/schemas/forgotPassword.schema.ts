import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';
import { ForgotPasswordDto } from '../dto/forgotPassword.dto';

export const validateForgotPassword = (body: ForgotPasswordDto) => {
  const schema = z.object({
    email: z.string().trim().email(),
  });
  const validate = schema.safeParse(body);
  if (!validate['success'])
    throw new BadRequestException(validate['error'].issues);
};
