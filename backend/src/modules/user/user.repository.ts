import { Prisma, User } from '@prisma/client';
import client from '../../database/client';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/createUser.dto';
import { v4 as uuidV4 } from 'uuid';
import { encryptPassword, verifyPassword } from '../../utils/encryption';
import { removeNonNumbersCharacters } from '../../utils/removeNonNumbersCharacters';
import { CredentialsDto } from '../auth/dto/credentials.dto';
import { generateJwt } from '../../utils/jwt';
import {
  createRefreshToken,
  updateManyRefreshToken,
} from '../refresh-token/refresh-token.repository';
import { FindUsersQueryDto } from './dto/findUsersQuery.dto';

export const getUserById = async (id: string): Promise<User> => {
  const userById = await client.user.findUnique({
    where: { id },
  });
  if (!userById) throw new NotFoundException('User Not Found');
  delete userById.password;
  return userById;
};

export const getOneUser = async <Key extends keyof User>(
  where: Prisma.UserWhereInput,
  keys: Key[] = [
    'id',
    'active',
    'name',
    'cpf',
    'email',
    'password',
    'createdAt',
    'updatedAt',
  ] as Key[],
): Promise<User> => {
  try {
    return (await client.user.findFirst({
      where,
      select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    })) as User;
  } catch (error) {
    throw new InternalServerErrorException('Internal Server Error');
  }
};

export const createUser = async (
  createUserDto: CreateUserDto,
): Promise<User> => {
  const { name, phone, cpf, email, password } = createUserDto;

  const userExists = await getOneUser({
    OR: [
      { active: true, cpf: removeNonNumbersCharacters(cpf) },
      { active: true, email },
    ],
  });
  if (userExists) throw new ConflictException('User Already Exists');

  try {
    const user = await client.user.create({
      data: {
        id: uuidV4(),
        name,
        phone: removeNonNumbersCharacters(phone),
        cpf: removeNonNumbersCharacters(cpf),
        email,
        password: await encryptPassword(password),
      },
    });
    delete user.password;
    return user;
  } catch (error) {
    throw new InternalServerErrorException('Internal Server Error');
  }
};

export const signIn = async (
  credentialsDto: CredentialsDto,
): Promise<{ accessToken: string; refreshToken: string }> => {
  const { email, password } = credentialsDto;
  const user = await getOneUser({ email, active: true }, ['id', 'password']);
  if (!user) throw new UnauthorizedException('Invalid Credentials');
  const passwordMatch = await verifyPassword(password, user.password);
  if (!passwordMatch) throw new UnauthorizedException('Invalid Credentials');

  try {
    const accessToken = generateJwt(
      process.env.JWT_ACCESS_TOKEN_SECRET,
      { id: user.id },
      process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    );
    const refreshToken = generateJwt(
      process.env.JWT_REFRESH_TOKEN_SECRET,
      { id: user.id },
      process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    );

    await updateManyRefreshToken(
      user.id,
      { userId: user.id, active: true },
      { active: false },
    );
    await createRefreshToken(refreshToken, user.id);

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new InternalServerErrorException('Internal Server Error');
  }
};

export const getUsers = async (query: FindUsersQueryDto) => {
  let { limit, page, active } = query;
  const { sortBy, sortType, cpf, email, name, phone } = query;
  limit = limit || 10;
  page = page || 1;
  if (active) active = `${active}`.toLowerCase() === 'true' ? true : false;

  try {
    return await client.user.findMany({
      where: {
        AND: [
          { active },
          {
            cpf: cpf
              ? { contains: removeNonNumbersCharacters(cpf) }
              : undefined,
          },
          {
            email: email ? { contains: email, mode: 'insensitive' } : undefined,
          },
          { name: name ? { contains: name, mode: 'insensitive' } : undefined },
          {
            phone: phone
              ? {
                  contains: removeNonNumbersCharacters(phone),
                  mode: 'insensitive',
                }
              : undefined,
          },
        ],
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: sortBy ? { [sortBy]: sortType } : undefined,
    });
  } catch (error) {
    throw new InternalServerErrorException('Internal Server Error');
  }
};
