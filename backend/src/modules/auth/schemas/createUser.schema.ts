import { z } from 'zod';
import { CreateUserDto } from '../dto/createUser.dto';
import { BadRequestException } from '@nestjs/common';

export const validateCreateUser = (body: CreateUserDto) => {
  const User = z.object({
    name: z.string().trim().min(2).max(255),
    cpf: z.string().trim().min(11).max(255),
    phone: z.string().trim().min(9).max(255),
    email: z.string().trim().email(),
    password: z
      .string()
      .trim()
      .min(6)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        'Password must have minimum six characters, at least one uppercase letter, one lowercase letter, one number and one special character',
      )
      .max(255),
    passwordConfirmation: z.string().trim().max(255),
  });
  const validate = User.safeParse(body);
  if (!validate['success'])
    throw new BadRequestException(validate['error'].issues);
};
