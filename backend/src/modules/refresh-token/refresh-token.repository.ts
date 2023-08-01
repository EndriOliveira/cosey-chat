import { Prisma, RefreshToken } from '@prisma/client';
import client from '../../database/client';
import { v4 as uuidV4 } from 'uuid';
import { getUserById } from '../user/user.repository';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

export const createRefreshToken = async (
  token: string,
  userId: string,
): Promise<RefreshToken> => {
  const user = await getUserById(userId);
  if (!user) throw new NotFoundException('User Not Found');

  try {
    return await client.refreshToken.create({
      data: {
        id: uuidV4(),
        token,
        userId,
      },
    });
  } catch (error) {
    throw new InternalServerErrorException('Internal Server Error');
  }
};

export const updateManyRefreshToken = async (
  userId: string,
  where: Prisma.RefreshTokenWhereInput,
  updateBody: Prisma.RefreshTokenUpdateInput,
): Promise<number> => {
  const user = await getUserById(userId);
  if (!user) throw new NotFoundException('User Not Found');

  try {
    const result = await client.refreshToken.updateMany({
      where,
      data: updateBody,
    });
    return result.count;
  } catch (error) {
    throw new InternalServerErrorException('Internal Server Error');
  }
};
