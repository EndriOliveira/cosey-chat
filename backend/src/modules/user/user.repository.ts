import { Prisma, User } from '@prisma/client';
import client from '../../database/client';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/createUser.dto';
import { v4 as uuidV4 } from 'uuid';
import { removeNonNumbersCharacters } from '../../utils/removeNonNumbersCharacters';
import { FindUsersQueryDto } from './dto/findUsersQuery.dto';
import { totalPages } from '../../utils/totalPages';
import { FindUsersResponseDto } from './dto/findUsers.response.dto';
import slugify from 'slugify';

export const getOneUser = async <Key extends keyof User>(
  where: Prisma.UserWhereInput,
  keys: Key[] = [
    'id',
    'active',
    'name',
    'cpf',
    'phone',
    'email',
    'slug',
    'password',
    'createdAt',
    'updatedAt',
  ] as Key[],
): Promise<Pick<User, Key>> => {
  try {
    return (await client.user.findFirst({
      where,
      select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    })) as Pick<User, Key>;
  } catch (error) {
    throw new InternalServerErrorException('Internal Server Error');
  }
};

export const createUser = async (
  createUserDto: CreateUserDto,
): Promise<User> => {
  const { name, phone, cpf, email, password, slug } = createUserDto;

  try {
    return (await client.user.create({
      data: {
        id: uuidV4(),
        name,
        phone: removeNonNumbersCharacters(phone),
        cpf: removeNonNumbersCharacters(cpf),
        email,
        slug,
        password,
      },
      select: {
        id: true,
        active: true,
        name: true,
        cpf: true,
        phone: true,
        email: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    })) as User;
  } catch (error) {
    throw new InternalServerErrorException('Internal Server Error');
  }
};

export const getUsers = async (
  query: FindUsersQueryDto,
): Promise<FindUsersResponseDto> => {
  let { limit, page, active } = query;
  const { sortBy, sortType, cpf, email, name, phone } = query;
  limit = limit || 10;
  page = page || 1;

  if (active != undefined) {
    if (/^(true)$/gim.test(`${active}`.replace(' ', ''))) active = true;
    else if (/^(false)$/gim.test(`${active}`.replace(' ', ''))) active = false;
    else active = null;
  }

  try {
    const where: Prisma.UserWhereInput = {
      AND: [
        { active: active != null ? active : undefined },
        { email: email ? { contains: email, mode: 'insensitive' } : undefined },
        { name: name ? { contains: name, mode: 'insensitive' } : undefined },
        {
          slug: name
            ? {
                contains: slugify(name, {
                  lower: true,
                  replacement: '-',
                  trim: true,
                }),
              }
            : undefined,
        },
        {
          cpf: cpf ? { contains: removeNonNumbersCharacters(cpf) } : undefined,
        },
        {
          phone: phone
            ? { contains: removeNonNumbersCharacters(phone) }
            : undefined,
        },
      ],
    } as Prisma.UserWhereInput;

    const [users, count] = await client.$transaction([
      client.user.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true,
          active: true,
          name: true,
          cpf: true,
          phone: true,
          email: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: sortBy && sortType ? { [sortBy]: sortType } : undefined,
      }),
      client.user.count({ where }),
    ]);

    return {
      users: users as User[],
      total: Number(count),
      page: Number(page),
      pages: Number(totalPages(count, limit)),
    };
  } catch (error) {
    throw new InternalServerErrorException('Internal Server Error');
  }
};

export const updateUser = async (
  userId: string,
  updateUserArgs: Prisma.UserUpdateInput,
): Promise<User> => {
  try {
    return (await client.user.update({
      where: { id: userId },
      data: updateUserArgs,
      select: {
        id: true,
        active: true,
        name: true,
        cpf: true,
        phone: true,
        email: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    })) as User;
  } catch (error) {
    throw new InternalServerErrorException('Internal Server Error');
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await client.user.delete({
      where: { id: userId },
    });
  } catch (error) {
    throw new InternalServerErrorException('Internal Server Error');
  }
};
