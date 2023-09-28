import { Prisma, RefreshToken } from '@prisma/client';
import client from '../../database/client';
import { v4 as uuidV4 } from 'uuid';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateRefreshTokenDto } from './dto/createRefreshToken.dto';

export const createRefreshToken = async (
  createRefreshTokenDto: CreateRefreshTokenDto,
): Promise<RefreshToken> => {
  const { token, userId } = createRefreshTokenDto;

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
  where: Prisma.RefreshTokenWhereInput,
  updateBody: Prisma.RefreshTokenUpdateInput,
): Promise<number> => {
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
