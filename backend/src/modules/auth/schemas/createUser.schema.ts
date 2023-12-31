import { z } from 'zod';
import { CreateUserDto } from '../dto/createUser.dto';
import { BadRequestException } from '@nestjs/common';

export const validateCreateUser = (body: CreateUserDto) => {
  const schema = z.object({
    name: z.string().trim().min(2).max(255),
    cpf: z.string().trim().min(11).max(255),
    phone: z.string().trim().min(9).max(255),
    email: z.string().trim().email().max(255),
    password: z
      .string()
      .trim()
      .min(6)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        'Password must have minimum 6 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
      )
      .max(255),
    passwordConfirmation: z.string().trim().max(255),
  });
  const validate = schema.safeParse(body);
  if (!validate['success'])
    throw new BadRequestException(validate['error'].issues);
};
