import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';
import { FindUsersQueryDto } from '../dto/findUsersQuery.dto';

export const validateGetUsers = (body: FindUsersQueryDto) => {
  const schema = z.object({
    active: z.string().optional(),
    limit: z.string().min(1).max(100),
    page: z.string().min(1),
    sortBy: z
      .enum(['cpf', 'email', 'name', 'createdAt', 'updatedAt'])
      .optional(),
    sortType: z.enum(['asc', 'desc']).optional(),
    cpf: z.string().optional(),
    email: z.string().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
  });
  const validate = schema.safeParse(body);
  if (!validate['success'])
    throw new BadRequestException(validate['error'].issues);
};
