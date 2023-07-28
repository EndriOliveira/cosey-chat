import { Prisma, User } from '@prisma/client';
import client from '../../database/client';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/createUser.dto';
import { v4 as uuidV4 } from 'uuid';
import { encryptPassword } from '../../utils/encryption';
import { formatPhone } from '../../utils/formatPhone';
import { removeSpecialCharacters } from '../../utils/removeSpecialCharacters';

export const getUserById = async (id: string): Promise<User> => {
  const userById = await client.user.findUnique({
    where: { id },
    include: { phone: true },
  });
  if (!userById) throw new NotFoundException('User Not Found');
  return userById;
};

export const getOneUser = async (
  where: Prisma.UserWhereInput,
): Promise<User> => {
  return await client.user.findFirst({
    where,
  });
};

export const createUser = async (createUserDto: CreateUserDto) => {
  const { name, phone, cpf, email, password } = createUserDto;

  const userExists = await getOneUser({
    OR: [
      { active: true, cpf: removeSpecialCharacters(cpf) },
      { active: true, email },
    ],
  });
  if (userExists) throw new ConflictException('User Already Exists');

  try {
    const user = await client.user.create({
      data: {
        id: uuidV4(),
        name,
        cpf: removeSpecialCharacters(cpf),
        email,
        password: await encryptPassword(password),
        phone: {
          create: {
            id: uuidV4(),
            ...formatPhone(removeSpecialCharacters(phone)),
          },
        },
      },
      include: { phone: true },
    });
    delete user.password;
    delete user.phoneId;
    return user;
  } catch (error) {
    throw new InternalServerErrorException('Internal Server Error');
  }
};
